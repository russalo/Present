import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { charactersTable, locationsTable, factionsTable, itemsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/characters", async (req, res) => {
  try {
    const chars = await db.select().from(charactersTable).orderBy(desc(charactersTable.updatedAt));
    res.json(chars.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      class: c.class,
      race: c.race,
      level: c.level,
      health: c.health,
      maxHealth: c.maxHealth,
      currentLocation: c.currentLocation,
      description: c.description,
      traits: c.traits ?? [],
      status: c.status,
      updatedAt: c.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list characters");
    res.status(500).json({ error: "internal_error", message: "Failed to list characters" });
  }
});

router.get("/locations", async (req, res) => {
  try {
    const locs = await db.select().from(locationsTable).orderBy(desc(locationsTable.updatedAt));
    res.json(locs.map(l => ({
      id: l.id,
      name: l.name,
      type: l.type,
      description: l.description,
      region: l.region,
      discovered: l.discovered,
      danger: l.danger,
      notableFeatures: l.notableFeatures ?? [],
      updatedAt: l.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list locations");
    res.status(500).json({ error: "internal_error", message: "Failed to list locations" });
  }
});

router.get("/factions", async (req, res) => {
  try {
    const facs = await db.select().from(factionsTable).orderBy(desc(factionsTable.updatedAt));
    res.json(facs.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      alignment: f.alignment,
      power: f.power,
      playerRelation: f.playerRelation,
      goals: f.goals ?? [],
      updatedAt: f.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list factions");
    res.status(500).json({ error: "internal_error", message: "Failed to list factions" });
  }
});

router.get("/items", async (req, res) => {
  try {
    const itms = await db.select().from(itemsTable).orderBy(desc(itemsTable.updatedAt));
    res.json(itms.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      description: i.description,
      rarity: i.rarity,
      ownedBy: i.ownedBy,
      location: i.location,
      magical: i.magical,
      updatedAt: i.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list items");
    res.status(500).json({ error: "internal_error", message: "Failed to list items" });
  }
});

export default router;
