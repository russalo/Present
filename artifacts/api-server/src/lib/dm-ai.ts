import { openai } from "@workspace/integrations-openai-ai-server";

const DM_SYSTEM_PROMPT = `You are the Dungeon Master (DM) of a persistent, living RPG world. Your role is to:

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
    "tension": 0-10 integer if tension changed
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
      "playerRelation": -10 to 10,
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

Only include arrays/objects that actually have changes. Empty arrays are fine if nothing changed in that category.`;

export interface WorldContext {
  worldName: string;
  currentEra: string;
  currentLocation: string;
  weather: string;
  timeOfDay: string;
  tension: number;
  recentTurns: Array<{ playerAction: string; narrative: string }>;
  characters: Array<{ name: string; status: string; currentLocation?: string | null; role: string }>;
  locations: Array<{ name: string; type: string; discovered: boolean }>;
  factions: Array<{ name: string; playerRelation: number | null }>;
  items: Array<{ name: string; ownedBy?: string | null; type: string }>;
}

export interface WorldUpdate {
  world?: {
    currentLocation?: string;
    weather?: string;
    timeOfDay?: string;
    tension?: number;
  };
  characters?: Array<{
    name: string;
    action: "upsert" | "remove";
    health?: number;
    maxHealth?: number;
    status?: string;
    currentLocation?: string;
    description?: string;
    traits?: string[];
    role?: string;
    class?: string;
    race?: string;
    level?: number;
  }>;
  locations?: Array<{
    name: string;
    action: "upsert" | "remove";
    type?: string;
    description?: string;
    region?: string;
    discovered?: boolean;
    danger?: number;
    notableFeatures?: string[];
  }>;
  factions?: Array<{
    name: string;
    action: "upsert" | "remove";
    description?: string;
    alignment?: string;
    power?: number;
    playerRelation?: number;
    goals?: string[];
  }>;
  items?: Array<{
    name: string;
    action: "upsert" | "remove";
    type?: string;
    description?: string;
    rarity?: string;
    ownedBy?: string | null;
    location?: string | null;
    magical?: boolean;
  }>;
}

export interface DmResponse {
  narrative: string;
  worldUpdate: WorldUpdate;
  rawResponse: string;
}

function parseWorldUpdate(raw: string): WorldUpdate {
  try {
    const match = raw.match(/<world_update>([\s\S]*?)<\/world_update>/);
    if (!match) return {};
    const json = match[1].trim();
    return JSON.parse(json) as WorldUpdate;
  } catch {
    return {};
  }
}

function extractNarrative(raw: string): string {
  return raw.replace(/<world_update>[\s\S]*?<\/world_update>/g, "").trim();
}

export async function processDmTurn(
  playerAction: string,
  worldContext: WorldContext
): Promise<DmResponse> {
  const contextBlock = `
CURRENT WORLD STATE:
- World: ${worldContext.worldName} (${worldContext.currentEra})
- Location: ${worldContext.currentLocation}
- Time: ${worldContext.timeOfDay}, Weather: ${worldContext.weather}
- Tension: ${worldContext.tension}/10

KNOWN CHARACTERS: ${worldContext.characters.map(c => `${c.name} (${c.role}, ${c.status})`).join(", ") || "None yet"}
KNOWN LOCATIONS: ${worldContext.locations.map(l => l.name).join(", ") || "None yet"}
KNOWN FACTIONS: ${worldContext.factions.map(f => `${f.name} (relation: ${f.playerRelation})`).join(", ") || "None yet"}
ITEMS IN PLAY: ${worldContext.items.map(i => `${i.name}${i.ownedBy ? ` (owned by ${i.ownedBy})` : ""}`).join(", ") || "None yet"}

RECENT TURNS:
${worldContext.recentTurns.slice(-3).map((t, i) => `Player: ${t.playerAction}\nDM: ${t.narrative}`).join("\n\n") || "This is the beginning of the session."}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: DM_SYSTEM_PROMPT },
      { role: "user", content: contextBlock + "\n\nPLAYER ACTION: " + playerAction },
    ],
    max_completion_tokens: 2000,
  });

  const rawContent = response.choices[0]?.message?.content ?? "";
  const narrative = extractNarrative(rawContent);
  const worldUpdate = parseWorldUpdate(rawContent);

  return { narrative, worldUpdate, rawResponse: rawContent };
}

export async function generateWorldIntro(
  worldName: string,
  playerName: string,
  playerClass: string,
  worldSeed?: string
): Promise<DmResponse> {
  const seedContext = worldSeed ? `World seed/theme: ${worldSeed}` : "Create a classic dark fantasy setting with mystery and danger.";

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: DM_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Begin a new RPG session with these parameters:
- World Name: ${worldName}
- Player Character: ${playerName}, a ${playerClass}
- ${seedContext}

Open the story with an atmospheric introduction. Set the scene, establish the world, introduce at least 2 NPCs and 2 locations. Give the player an immediate situation to respond to.

Create a compelling opening that establishes the tone and immediately draws the player in.`,
      },
    ],
    max_completion_tokens: 2000,
  });

  const rawContent = response.choices[0]?.message?.content ?? "";
  const narrative = extractNarrative(rawContent);
  const worldUpdate = parseWorldUpdate(rawContent);

  return { narrative, worldUpdate, rawResponse: rawContent };
}
