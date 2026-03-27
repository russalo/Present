import json
import uuid

from django.http import (
    HttpResponseNotAllowed,
    JsonResponse,
    StreamingHttpResponse,
)
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .dm_ai import (
    apply_world_update,
    build_messages,
    build_world_context,
    extract_narrative,
    generate_world_intro,
    get_openai_client,
    parse_world_update,
    save_turn,
)
from .models import (
    Character,
    Faction,
    Item,
    Location,
    Session,
    Turn,
    WorldState,
)
from django.conf import settings


# ─── Health ────────────────────────────────────────────────────────────────────

def healthz(request):
    return JsonResponse({"status": "ok"})


# ─── Session ───────────────────────────────────────────────────────────────────

@csrf_exempt
def session(request):
    if request.method == "GET":
        return _get_session(request)
    elif request.method == "POST":
        return session_turn(request)
    return HttpResponseNotAllowed(["GET", "POST"])


def _get_session(request):
    session = Session.objects.filter(active=True).order_by("-started_at").first()
    if not session:
        return JsonResponse({
            "sessionId": "",
            "turns": [],
            "startedAt": "",
            "worldName": "No active session",
        })

    turns = list(
        Turn.objects.filter(session=session)
        .order_by("turn_number")
        .values("id", "session_id", "turn_number", "player_action", "narrative", "world_updates", "created_at")
    )
    return JsonResponse({
        "sessionId": str(session.id),
        "turns": [_serialize_turn(t) for t in turns],
        "startedAt": session.started_at.isoformat(),
        "worldName": session.world_name,
    })


@csrf_exempt
def new_session(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    body = json.loads(request.body or b"{}")
    world_name = body.get("worldName", "The Shattered Realm")
    player_name = body.get("playerCharacterName", "Traveler")
    player_class = body.get("playerCharacterClass", "Adventurer")
    world_seed = body.get("worldSeed")

    # Deactivate existing sessions
    Session.objects.filter(active=True).update(active=False)

    session_id = uuid.uuid4()
    session = Session.objects.create(
        id=session_id,
        world_name=world_name,
        active=True,
    )

    # Upsert world_state singleton
    state = WorldState.objects.first()
    if state:
        state.world_name = world_name
        state.current_era = "The Age of Fracture"
        state.current_location = "The Crossroads Tavern"
        state.weather = "Overcast, a chill in the air"
        state.time_of_day = "Dusk"
        state.tension = 3
        state.save()
    else:
        WorldState.objects.create(
            world_name=world_name,
            current_era="The Age of Fracture",
            current_location="The Crossroads Tavern",
            weather="Overcast, a chill in the air",
            time_of_day="Dusk",
            tension=3,
        )

    narrative, world_update = generate_world_intro(world_name, player_name, player_class, world_seed)
    apply_world_update(world_update)

    Turn.objects.create(
        session=session,
        turn_number=0,
        player_action=f"[Session Start] {player_name} the {player_class} begins their journey in {world_name}.",
        narrative=narrative,
        world_updates=world_update,
    )

    turns = list(
        Turn.objects.filter(session=session)
        .order_by("turn_number")
        .values("id", "session_id", "turn_number", "player_action", "narrative", "world_updates", "created_at")
    )
    return JsonResponse({
        "sessionId": str(session_id),
        "turns": [_serialize_turn(t) for t in turns],
        "startedAt": session.started_at.isoformat(),
        "worldName": world_name,
    })


def session_turn(request):
    """POST /api/session — blocking (non-streaming) turn processing. Called by session() dispatcher."""

    body = json.loads(request.body or b"{}")
    action = body.get("action")
    session_id = body.get("sessionId")

    if not action or not session_id:
        return JsonResponse({"error": "action and sessionId are required"}, status=400)

    session = Session.objects.filter(id=session_id, active=True).first()
    if not session:
        return JsonResponse({"error": "Session not found or inactive"}, status=400)

    world_context = build_world_context(session_id)
    messages = build_messages(world_context, action)

    response = get_openai_client().chat.completions.create(
        model=settings.DM_MODEL,
        messages=messages,
        max_completion_tokens=2000,
    )
    raw = response.choices[0].message.content or ""
    narrative = extract_narrative(raw)
    world_update = parse_world_update(raw)

    apply_world_update(world_update)
    turn = save_turn(session_id, action, narrative, world_update)

    return JsonResponse({
        "turn": {
            "id": turn.id,
            "sessionId": str(turn.session_id),
            "turnNumber": turn.turn_number,
            "playerAction": turn.player_action,
            "narrative": turn.narrative,
            "worldUpdates": turn.world_updates or {},
            "createdAt": turn.created_at.isoformat(),
        },
        "worldUpdates": world_update,
    })


# ─── SSE streaming turn ────────────────────────────────────────────────────────

@csrf_exempt
def dm_stream(request):
    """POST /api/stream — SSE streaming DM turn."""
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = json.loads(request.body or b"{}")
    action = body.get("action")
    session_id = body.get("sessionId")

    if not action or not session_id:
        return JsonResponse({"error": "action and sessionId are required"}, status=400)

    session = Session.objects.filter(id=session_id, active=True).first()
    if not session:
        return JsonResponse({"error": "Session not found or inactive"}, status=400)

    world_context = build_world_context(session_id)
    messages = build_messages(world_context, action)

    # Use a mutable container to accumulate text across the generator
    full_text_ref = [""]

    def generate_stream():
        try:
            stream = get_openai_client().chat.completions.create(
                model=settings.DM_MODEL,
                messages=messages,
                stream=True,
                max_completion_tokens=2000,
            )
            for chunk in stream:
                token = (chunk.choices[0].delta.content or "") if chunk.choices else ""
                if token:
                    full_text_ref[0] += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            yield "data: [DONE]\n\n"
            return

        raw = full_text_ref[0]
        world_update = parse_world_update(raw)
        narrative = extract_narrative(raw)

        apply_world_update(world_update)
        save_turn(session_id, action, narrative, world_update)

        yield f"data: {json.dumps({'type': 'world_update', 'data': world_update})}\n\n"
        yield "data: [DONE]\n\n"

    response = StreamingHttpResponse(generate_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


# ─── World state ───────────────────────────────────────────────────────────────

@require_GET
def get_world(request):
    state = WorldState.objects.first()
    if not state:
        return JsonResponse({"error": "No world state found"}, status=404)
    return JsonResponse({
        "worldName": state.world_name,
        "currentEra": state.current_era,
        "currentLocation": state.current_location,
        "weather": state.weather,
        "timeOfDay": state.time_of_day,
        "tension": state.tension,
        "updatedAt": state.updated_at.isoformat(),
    })


# ─── Entity lists ──────────────────────────────────────────────────────────────

@require_GET
def get_characters(request):
    chars = list(Character.objects.values(
        "id", "name", "role", "class_name", "race", "level",
        "health", "max_health", "current_location", "description",
        "traits", "status",
    ))
    return JsonResponse({"characters": [_serialize_character(c) for c in chars]})


@require_GET
def get_locations(request):
    locs = list(Location.objects.values(
        "id", "name", "type", "description", "region",
        "discovered", "danger", "notable_features",
    ))
    return JsonResponse({"locations": [_serialize_location(l) for l in locs]})


@require_GET
def get_factions(request):
    facs = list(Faction.objects.values(
        "id", "name", "description", "alignment",
        "power", "player_relation", "goals",
    ))
    return JsonResponse({"factions": [_serialize_faction(f) for f in facs]})


@require_GET
def get_items(request):
    items = list(Item.objects.values(
        "id", "name", "type", "description", "rarity",
        "owned_by", "location", "magical",
    ))
    return JsonResponse({"items": [_serialize_item(i) for i in items]})


# ─── Serialization helpers ─────────────────────────────────────────────────────

def _serialize_turn(t: dict) -> dict:
    return {
        "id": t["id"],
        "sessionId": str(t["session_id"]),
        "turnNumber": t["turn_number"],
        "playerAction": t["player_action"],
        "narrative": t["narrative"],
        "worldUpdates": t["world_updates"] or {},
        "createdAt": t["created_at"].isoformat() if hasattr(t["created_at"], "isoformat") else str(t["created_at"]),
    }


def _serialize_character(c: dict) -> dict:
    return {
        "id": c["id"],
        "name": c["name"],
        "role": c["role"],
        "class": c["class_name"],
        "race": c["race"],
        "level": c["level"],
        "health": c["health"],
        "maxHealth": c["max_health"],
        "currentLocation": c["current_location"],
        "description": c["description"],
        "traits": c["traits"] or [],
        "status": c["status"],
    }


def _serialize_location(l: dict) -> dict:
    return {
        "id": l["id"],
        "name": l["name"],
        "type": l["type"],
        "description": l["description"],
        "region": l["region"],
        "discovered": l["discovered"],
        "danger": l["danger"],
        "notableFeatures": l["notable_features"] or [],
    }


def _serialize_faction(f: dict) -> dict:
    return {
        "id": f["id"],
        "name": f["name"],
        "description": f["description"],
        "alignment": f["alignment"],
        "power": f["power"],
        "playerRelation": f["player_relation"],
        "goals": f["goals"] or [],
    }


def _serialize_item(i: dict) -> dict:
    return {
        "id": i["id"],
        "name": i["name"],
        "type": i["type"],
        "description": i["description"],
        "rarity": i["rarity"],
        "ownedBy": i["owned_by"],
        "location": i["location"],
        "magical": i["magical"],
    }
