"""
DM AI logic — port of artifacts/api-server/src/lib/dm-ai.ts
                  and artifacts/api-server/src/lib/world-updater.ts

Provides:
  build_world_context(session_id)  -> dict
  build_messages(world_context, player_action) -> list[dict]
  parse_world_update(raw_text) -> dict
  extract_narrative(raw_text) -> str
  apply_world_update(world_update) -> list[str]
  save_turn(session_id, action, narrative, world_update) -> Turn
  generate_world_intro(world_name, player_name, player_class, world_seed) -> (narrative, world_update)
"""

import json
import re
import uuid

from django.conf import settings
from django.db import connection
from openai import OpenAI

from .models import (
    Character,
    Faction,
    Item,
    Location,
    Session,
    Turn,
    WorldState,
)


# ─── OpenAI client ────────────────────────────────────────────────────────────

_openai_client = None


def get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        kwargs = {"api_key": settings.OPENAI_API_KEY}
        if settings.OPENAI_BASE_URL:
            kwargs["base_url"] = settings.OPENAI_BASE_URL
        _openai_client = OpenAI(**kwargs)
    return _openai_client


# ─── System prompt ─────────────────────────────────────────────────────────────

DM_SYSTEM_PROMPT = """You are the Dungeon Master (DM) of a persistent, living RPG world. Your role is to:

1. Narrate the world vividly and immersively in response to the player's actions
2. Keep track of the world state and emit structured updates
3. Be creative, atmospheric, and reactive to player choices
4. Maintain consistency with established world facts

After each narrative response, you MUST emit a <world_update> block in JSON format.

RULES:
- Speak directly to the player using "you" (second person)
- Keep narratives 2-4 paragraphs — vivid but not exhaustive
- Always end with an implicit or explicit choice/question for the player
- The world_update block captures ONLY things that actually changed

FORMAT (always end your response with this exact block):

<world_update>
{
  "world": {
    "currentLocation": "location name if player moved",
    "weather": "weather if it changed",
    "timeOfDay": "time if it changed",
    "tension": 0-10
  },
  "characters": [
    {
      "name": "character name",
      "action": "upsert",
      "health": 100,
      "status": "alive|dead|unknown|missing",
      "currentLocation": "where they are",
      "description": "brief description",
      "traits": ["trait1", "trait2"],
      "role": "player|npc|enemy|ally",
      "class": "class if known",
      "race": "race if known",
      "level": 1
    }
  ],
  "locations": [
    {
      "name": "location name",
      "action": "upsert",
      "type": "tavern|dungeon|city|wilderness|castle|temple|cave|ruins|port|village",
      "description": "description",
      "region": "region name",
      "discovered": true,
      "danger": 0-10,
      "notableFeatures": ["feature1"]
    }
  ],
  "factions": [
    {
      "name": "faction name",
      "action": "upsert",
      "description": "description",
      "alignment": "lawful good|neutral|chaotic evil etc",
      "power": 0-10,
      "playerRelation": -10,
      "goals": ["goal1"]
    }
  ],
  "items": [
    {
      "name": "item name",
      "action": "upsert",
      "type": "weapon|armor|potion|artifact|misc|key",
      "description": "description",
      "rarity": "common|uncommon|rare|legendary|artifact",
      "ownedBy": "character name or null",
      "location": "location name or null",
      "magical": false
    }
  ]
}
</world_update>

Only include arrays/objects that actually have changes. Empty arrays are fine if nothing changed in that category."""


# ─── World context ─────────────────────────────────────────────────────────────

def build_world_context(session_id: str) -> dict:
    """Load world state + recent turns from DB and return a context dict."""
    world_states = list(WorldState.objects.all()[:1])
    state = world_states[0] if world_states else None

    characters = list(Character.objects.values("name", "status", "current_location", "role"))
    locations = list(Location.objects.values("name", "type", "discovered"))
    factions = list(Faction.objects.values("name", "player_relation"))
    items = list(Item.objects.values("name", "owned_by", "type"))

    recent_turns = list(
        Turn.objects.filter(session_id=session_id)
        .order_by("-turn_number")[:5]
        .values("player_action", "narrative")
    )
    recent_turns.reverse()

    return {
        "worldName": state.world_name if state else "Unknown Realm",
        "currentEra": state.current_era if state else "Unknown Age",
        "currentLocation": state.current_location if state else "Nowhere",
        "weather": state.weather if state else "Calm",
        "timeOfDay": state.time_of_day if state else "Day",
        "tension": state.tension if state else 0,
        "characters": [
            {
                "name": c["name"],
                "status": c["status"],
                "currentLocation": c["current_location"],
                "role": c["role"],
            }
            for c in characters
        ],
        "locations": [
            {"name": l["name"], "type": l["type"], "discovered": l["discovered"]}
            for l in locations
        ],
        "factions": [
            {"name": f["name"], "playerRelation": f["player_relation"]}
            for f in factions
        ],
        "items": [
            {"name": i["name"], "ownedBy": i["owned_by"], "type": i["type"]}
            for i in items
        ],
        "recentTurns": [
            {"playerAction": t["player_action"], "narrative": t["narrative"]}
            for t in recent_turns
        ],
    }


# ─── Message builder ───────────────────────────────────────────────────────────

def build_messages(world_context: dict, player_action: str) -> list:
    chars = ", ".join(
        f"{c['name']} ({c['role']}, {c['status']})"
        for c in world_context["characters"]
    ) or "None yet"

    locs = ", ".join(l["name"] for l in world_context["locations"]) or "None yet"

    facs = ", ".join(
        f"{f['name']} (relation: {f['playerRelation']})"
        for f in world_context["factions"]
    ) or "None yet"

    item_list = ", ".join(
        f"{i['name']}{f\" (owned by {i['ownedBy']})\" if i['ownedBy'] else ''}"
        for i in world_context["items"]
    ) or "None yet"

    recent = "\n\n".join(
        f"Player: {t['playerAction']}\nDM: {t['narrative']}"
        for t in world_context["recentTurns"][-3:]
    ) or "This is the beginning of the session."

    context_block = f"""
CURRENT WORLD STATE:
- World: {world_context['worldName']} ({world_context['currentEra']})
- Location: {world_context['currentLocation']}
- Time: {world_context['timeOfDay']}, Weather: {world_context['weather']}
- Tension: {world_context['tension']}/10

KNOWN CHARACTERS: {chars}
KNOWN LOCATIONS: {locs}
KNOWN FACTIONS: {facs}
ITEMS IN PLAY: {item_list}

RECENT TURNS:
{recent}
"""
    return [
        {"role": "system", "content": DM_SYSTEM_PROMPT},
        {"role": "user", "content": context_block + "\n\nPLAYER ACTION: " + player_action},
    ]


# ─── Response parsing ──────────────────────────────────────────────────────────

def parse_world_update(raw: str) -> dict:
    try:
        match = re.search(r"<world_update>([\s\S]*?)</world_update>", raw)
        if not match:
            return {}
        return json.loads(match.group(1).strip())
    except Exception:
        return {}


def extract_narrative(raw: str) -> str:
    return re.sub(r"<world_update>[\s\S]*?</world_update>", "", raw).strip()


# ─── World update application ──────────────────────────────────────────────────

def apply_world_update(world_update: dict) -> list:
    """Apply a world_update dict to the DB. Returns list of updated entity descriptions."""
    updated = []

    if world_update.get("world"):
        w = world_update["world"]
        state = WorldState.objects.first()
        if state:
            if w.get("currentLocation"):
                state.current_location = w["currentLocation"]
            if w.get("weather"):
                state.weather = w["weather"]
            if w.get("timeOfDay"):
                state.time_of_day = w["timeOfDay"]
            if w.get("tension") is not None:
                state.tension = w["tension"]
            state.save()
        updated.append("world state")

    for char in world_update.get("characters", []):
        existing = Character.objects.filter(name__iexact=char["name"]).first()
        if char.get("action") == "remove":
            if existing:
                existing.delete()
        elif existing:
            if char.get("health") is not None:
                existing.health = char["health"]
            if char.get("maxHealth") is not None:
                existing.max_health = char["maxHealth"]
            if char.get("status"):
                existing.status = char["status"]
            if char.get("currentLocation") is not None:
                existing.current_location = char["currentLocation"]
            if char.get("description"):
                existing.description = char["description"]
            if char.get("traits"):
                existing.traits = char["traits"]
            if char.get("role"):
                existing.role = char["role"]
            if char.get("class"):
                existing.class_name = char["class"]
            if char.get("race"):
                existing.race = char["race"]
            if char.get("level") is not None:
                existing.level = char["level"]
            existing.save()
        else:
            Character.objects.create(
                unique_id=uuid.uuid4(),
                name=char["name"],
                role=char.get("role", "npc"),
                class_name=char.get("class"),
                race=char.get("race"),
                level=char.get("level", 1),
                health=char.get("health", 100),
                max_health=char.get("maxHealth", 100),
                current_location=char.get("currentLocation"),
                description=char.get("description"),
                traits=char.get("traits", []),
                status=char.get("status", "alive"),
            )
        updated.append(f"character: {char['name']}")

    for loc in world_update.get("locations", []):
        existing = Location.objects.filter(name__iexact=loc["name"]).first()
        if loc.get("action") == "remove":
            if existing:
                existing.delete()
        elif existing:
            if loc.get("type"):
                existing.type = loc["type"]
            if loc.get("description"):
                existing.description = loc["description"]
            if loc.get("region") is not None:
                existing.region = loc["region"]
            if loc.get("discovered") is not None:
                existing.discovered = loc["discovered"]
            if loc.get("danger") is not None:
                existing.danger = loc["danger"]
            if loc.get("notableFeatures"):
                existing.notable_features = loc["notableFeatures"]
            existing.save()
        else:
            Location.objects.create(
                unique_id=uuid.uuid4(),
                name=loc["name"],
                type=loc.get("type", "area"),
                description=loc.get("description", "An undiscovered location."),
                region=loc.get("region"),
                discovered=loc.get("discovered", True),
                danger=loc.get("danger", 0),
                notable_features=loc.get("notableFeatures", []),
            )
        updated.append(f"location: {loc['name']}")

    for fac in world_update.get("factions", []):
        existing = Faction.objects.filter(name__iexact=fac["name"]).first()
        if fac.get("action") == "remove":
            if existing:
                existing.delete()
        elif existing:
            if fac.get("description"):
                existing.description = fac["description"]
            if fac.get("alignment") is not None:
                existing.alignment = fac["alignment"]
            if fac.get("power") is not None:
                existing.power = fac["power"]
            if fac.get("playerRelation") is not None:
                existing.player_relation = fac["playerRelation"]
            if fac.get("goals"):
                existing.goals = fac["goals"]
            existing.save()
        else:
            Faction.objects.create(
                unique_id=uuid.uuid4(),
                name=fac["name"],
                description=fac.get("description", "A mysterious faction."),
                alignment=fac.get("alignment"),
                power=fac.get("power", 5),
                player_relation=fac.get("playerRelation", 0),
                goals=fac.get("goals", []),
            )
        updated.append(f"faction: {fac['name']}")

    for item in world_update.get("items", []):
        existing = Item.objects.filter(name__iexact=item["name"]).first()
        if item.get("action") == "remove":
            if existing:
                existing.delete()
        elif existing:
            if item.get("type"):
                existing.type = item["type"]
            if item.get("description"):
                existing.description = item["description"]
            if item.get("rarity"):
                existing.rarity = item["rarity"]
            if "ownedBy" in item:
                existing.owned_by = item["ownedBy"]
            if "location" in item:
                existing.location = item["location"]
            if item.get("magical") is not None:
                existing.magical = item["magical"]
            existing.save()
        else:
            Item.objects.create(
                unique_id=uuid.uuid4(),
                name=item["name"],
                type=item.get("type", "misc"),
                description=item.get("description", "A mysterious item."),
                rarity=item.get("rarity", "common"),
                owned_by=item.get("ownedBy"),
                location=item.get("location"),
                magical=item.get("magical", False),
            )
        updated.append(f"item: {item['name']}")

    return updated


# ─── Turn persistence ──────────────────────────────────────────────────────────

def save_turn(session_id: str, action: str, narrative: str, world_update: dict) -> Turn:
    last = Turn.objects.filter(session_id=session_id).order_by("-turn_number").first()
    turn_number = (last.turn_number + 1) if last else 1
    return Turn.objects.create(
        session_id=session_id,
        turn_number=turn_number,
        player_action=action,
        narrative=narrative,
        world_updates=world_update,
    )


# ─── World intro (non-streaming, called on session/new) ───────────────────────

def generate_world_intro(
    world_name: str,
    player_name: str,
    player_class: str,
    world_seed: str | None = None,
) -> tuple[str, dict]:
    seed_context = (
        world_seed
        if world_seed
        else "Create a classic dark fantasy setting with mystery and danger."
    )
    response = get_openai_client().chat.completions.create(
        model=settings.DM_MODEL,
        messages=[
            {"role": "system", "content": DM_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Begin a new RPG session with these parameters:\n"
                    f"- World Name: {world_name}\n"
                    f"- Player Character: {player_name}, a {player_class}\n"
                    f"- {seed_context}\n\n"
                    "Open the story with an atmospheric introduction. Set the scene, "
                    "establish the world, introduce at least 2 NPCs and 2 locations. "
                    "Give the player an immediate situation to respond to.\n\n"
                    "Create a compelling opening that establishes the tone and immediately draws the player in."
                ),
            },
        ],
        max_completion_tokens=2000,
    )
    raw = response.choices[0].message.content or ""
    return extract_narrative(raw), parse_world_update(raw)
