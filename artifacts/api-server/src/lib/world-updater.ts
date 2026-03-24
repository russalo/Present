import { db } from "@workspace/db";
import {
  worldStateTable,
  charactersTable,
  locationsTable,
  factionsTable,
  itemsTable,
  WorldState,
  Character,
  Location,
  Faction,
  Item,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { WorldUpdate } from "./dm-ai.js";

export async function applyWorldUpdate(update: WorldUpdate): Promise<string[]> {
  const updatedEntities: string[] = [];

  if (update.world && Object.keys(update.world).length > 0) {
    const existing = await db.select().from(worldStateTable).limit(1);
    if (existing.length > 0) {
      await db
        .update(worldStateTable)
        .set({
          ...(update.world.currentLocation && { currentLocation: update.world.currentLocation }),
          ...(update.world.weather && { weather: update.world.weather }),
          ...(update.world.timeOfDay && { timeOfDay: update.world.timeOfDay }),
          ...(update.world.tension !== undefined && { tension: update.world.tension }),
          updatedAt: new Date(),
        })
        .where(eq(worldStateTable.id, existing[0].id));
    }
    updatedEntities.push("world state");
  }

  if (update.characters && update.characters.length > 0) {
    for (const char of update.characters) {
      const existing = await db.select().from(charactersTable).where(
        sql`lower(${charactersTable.name}) = lower(${char.name})`
      );

      if (existing.length > 0) {
        await db.update(charactersTable).set({
          ...(char.health !== undefined && { health: char.health }),
          ...(char.maxHealth !== undefined && { maxHealth: char.maxHealth }),
          ...(char.status && { status: char.status }),
          ...(char.currentLocation !== undefined && { currentLocation: char.currentLocation }),
          ...(char.description && { description: char.description }),
          ...(char.traits && { traits: char.traits }),
          ...(char.role && { role: char.role }),
          ...(char.class && { class: char.class }),
          ...(char.race && { race: char.race }),
          ...(char.level !== undefined && { level: char.level }),
          updatedAt: new Date(),
        }).where(eq(charactersTable.id, existing[0].id));
      } else {
        await db.insert(charactersTable).values({
          name: char.name,
          role: char.role ?? "npc",
          class: char.class ?? null,
          race: char.race ?? null,
          level: char.level ?? 1,
          health: char.health ?? 100,
          maxHealth: char.maxHealth ?? 100,
          currentLocation: char.currentLocation ?? null,
          description: char.description ?? null,
          traits: char.traits ?? [],
          status: char.status ?? "alive",
        });
      }
      updatedEntities.push(`character: ${char.name}`);
    }
  }

  if (update.locations && update.locations.length > 0) {
    for (const loc of update.locations) {
      const existing = await db.select().from(locationsTable).where(
        sql`lower(${locationsTable.name}) = lower(${loc.name})`
      );

      if (existing.length > 0) {
        await db.update(locationsTable).set({
          ...(loc.type && { type: loc.type }),
          ...(loc.description && { description: loc.description }),
          ...(loc.region !== undefined && { region: loc.region }),
          ...(loc.discovered !== undefined && { discovered: loc.discovered }),
          ...(loc.danger !== undefined && { danger: loc.danger }),
          ...(loc.notableFeatures && { notableFeatures: loc.notableFeatures }),
          updatedAt: new Date(),
        }).where(eq(locationsTable.id, existing[0].id));
      } else {
        await db.insert(locationsTable).values({
          name: loc.name,
          type: loc.type ?? "area",
          description: loc.description ?? "An undiscovered location.",
          region: loc.region ?? null,
          discovered: loc.discovered ?? true,
          danger: loc.danger ?? 0,
          notableFeatures: loc.notableFeatures ?? [],
        });
      }
      updatedEntities.push(`location: ${loc.name}`);
    }
  }

  if (update.factions && update.factions.length > 0) {
    for (const fac of update.factions) {
      const existing = await db.select().from(factionsTable).where(
        sql`lower(${factionsTable.name}) = lower(${fac.name})`
      );

      if (existing.length > 0) {
        await db.update(factionsTable).set({
          ...(fac.description && { description: fac.description }),
          ...(fac.alignment !== undefined && { alignment: fac.alignment }),
          ...(fac.power !== undefined && { power: fac.power }),
          ...(fac.playerRelation !== undefined && { playerRelation: fac.playerRelation }),
          ...(fac.goals && { goals: fac.goals }),
          updatedAt: new Date(),
        }).where(eq(factionsTable.id, existing[0].id));
      } else {
        await db.insert(factionsTable).values({
          name: fac.name,
          description: fac.description ?? "A mysterious faction.",
          alignment: fac.alignment ?? null,
          power: fac.power ?? 5,
          playerRelation: fac.playerRelation ?? 0,
          goals: fac.goals ?? [],
        });
      }
      updatedEntities.push(`faction: ${fac.name}`);
    }
  }

  if (update.items && update.items.length > 0) {
    for (const item of update.items) {
      const existing = await db.select().from(itemsTable).where(
        sql`lower(${itemsTable.name}) = lower(${item.name})`
      );

      if (existing.length > 0) {
        await db.update(itemsTable).set({
          ...(item.type && { type: item.type }),
          ...(item.description && { description: item.description }),
          ...(item.rarity && { rarity: item.rarity }),
          ...(item.ownedBy !== undefined && { ownedBy: item.ownedBy }),
          ...(item.location !== undefined && { location: item.location }),
          ...(item.magical !== undefined && { magical: item.magical }),
          updatedAt: new Date(),
        }).where(eq(itemsTable.id, existing[0].id));
      } else {
        await db.insert(itemsTable).values({
          name: item.name,
          type: (item.type as any) ?? "misc",
          description: item.description ?? "A mysterious item.",
          rarity: (item.rarity as any) ?? "common",
          ownedBy: item.ownedBy ?? null,
          location: item.location ?? null,
          magical: item.magical ?? false,
        });
      }
      updatedEntities.push(`item: ${item.name}`);
    }
  }

  return updatedEntities;
}

export async function getWorldContext() {
  const [worldState, characters, locations, factions, items] = await Promise.all([
    db.select().from(worldStateTable).limit(1),
    db.select().from(charactersTable),
    db.select().from(locationsTable),
    db.select().from(factionsTable),
    db.select().from(itemsTable),
  ]);

  const state = worldState[0];

  return {
    worldName: state?.worldName ?? "Unknown Realm",
    currentEra: state?.currentEra ?? "Unknown Age",
    currentLocation: state?.currentLocation ?? "Nowhere",
    weather: state?.weather ?? "Calm",
    timeOfDay: state?.timeOfDay ?? "Day",
    tension: state?.tension ?? 0,
    characters: characters.map(c => ({
      name: c.name,
      status: c.status,
      currentLocation: c.currentLocation,
      role: c.role,
    })),
    locations: locations.map(l => ({
      name: l.name,
      type: l.type,
      discovered: l.discovered,
    })),
    factions: factions.map(f => ({
      name: f.name,
      playerRelation: f.playerRelation,
    })),
    items: items.map(i => ({
      name: i.name,
      ownedBy: i.ownedBy,
      type: i.type,
    })),
    recentTurns: [] as Array<{ playerAction: string; narrative: string }>,
  };
}
