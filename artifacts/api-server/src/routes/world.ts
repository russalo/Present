import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { worldStateTable, turnsTable, charactersTable, locationsTable, factionsTable, itemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/world", async (req, res) => {
  try {
    const worldState = await db.select().from(worldStateTable).limit(1);
    const state = worldState[0];

    if (!state) {
      res.json({
        worldName: "Unknown Realm",
        currentEra: "The Beginning",
        currentLocation: "Nowhere",
        weather: "Calm",
        timeOfDay: "Dawn",
        tension: 0,
        characterCount: 0,
        locationCount: 0,
        factionCount: 0,
        itemCount: 0,
        turnCount: 0,
        lastUpdated: new Date().toISOString(),
      });
      return;
    }

    const [charCount, locCount, facCount, itemCount, turnCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(charactersTable),
      db.select({ count: sql<number>`count(*)` }).from(locationsTable),
      db.select({ count: sql<number>`count(*)` }).from(factionsTable),
      db.select({ count: sql<number>`count(*)` }).from(itemsTable),
      db.select({ count: sql<number>`count(*)` }).from(turnsTable),
    ]);

    res.json({
      worldName: state.worldName,
      currentEra: state.currentEra,
      currentLocation: state.currentLocation,
      weather: state.weather,
      timeOfDay: state.timeOfDay,
      tension: state.tension,
      characterCount: Number(charCount[0]?.count ?? 0),
      locationCount: Number(locCount[0]?.count ?? 0),
      factionCount: Number(facCount[0]?.count ?? 0),
      itemCount: Number(itemCount[0]?.count ?? 0),
      turnCount: Number(turnCount[0]?.count ?? 0),
      lastUpdated: state.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get world state");
    res.status(500).json({ error: "internal_error", message: "Failed to get world state" });
  }
});

export default router;
