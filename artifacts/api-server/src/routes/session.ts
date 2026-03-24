import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, turnsTable, worldStateTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { processDmTurn, generateWorldIntro } from "../lib/dm-ai.js";
import { applyWorldUpdate, getWorldContext } from "../lib/world-updater.js";

const router: IRouter = Router();

router.get("/session", async (req, res) => {
  try {
    const activeSession = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.active, true))
      .orderBy(desc(sessionsTable.startedAt))
      .limit(1);

    if (!activeSession.length) {
      res.json({
        sessionId: "",
        turns: [],
        startedAt: new Date().toISOString(),
        worldName: "No active session",
      });
      return;
    }

    const session = activeSession[0];
    const turns = await db
      .select()
      .from(turnsTable)
      .where(eq(turnsTable.sessionId, session.id))
      .orderBy(turnsTable.turnNumber);

    res.json({
      sessionId: session.id,
      turns: turns.map(t => ({
        id: t.id,
        sessionId: t.sessionId,
        turnNumber: t.turnNumber,
        playerAction: t.playerAction,
        narrative: t.narrative,
        worldUpdates: t.worldUpdates ?? {},
        createdAt: t.createdAt.toISOString(),
      })),
      startedAt: session.startedAt.toISOString(),
      worldName: session.worldName,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get session log");
    res.status(500).json({ error: "internal_error", message: "Failed to get session log" });
  }
});

router.post("/session/new", async (req, res) => {
  try {
    const {
      worldName = "The Shattered Realm",
      playerCharacterName = "Traveler",
      playerCharacterClass = "Adventurer",
      worldSeed,
    } = req.body ?? {};

    await db.update(sessionsTable).set({ active: false });

    const sessionId = randomUUID();
    await db.insert(sessionsTable).values({
      id: sessionId,
      worldName,
      active: true,
    });

    const existingWorld = await db.select().from(worldStateTable).limit(1);
    if (existingWorld.length > 0) {
      await db.update(worldStateTable).set({
        worldName,
        currentEra: "The Age of Fracture",
        currentLocation: "The Crossroads Tavern",
        weather: "Overcast, a chill in the air",
        timeOfDay: "Dusk",
        tension: 3,
        updatedAt: new Date(),
      }).where(eq(worldStateTable.id, existingWorld[0].id));
    } else {
      await db.insert(worldStateTable).values({
        worldName,
        currentEra: "The Age of Fracture",
        currentLocation: "The Crossroads Tavern",
        weather: "Overcast, a chill in the air",
        timeOfDay: "Dusk",
        tension: 3,
      });
    }

    const dmResponse = await generateWorldIntro(
      worldName,
      playerCharacterName,
      playerCharacterClass,
      worldSeed
    );

    await applyWorldUpdate(dmResponse.worldUpdate);

    const playerIntroTurn = await db.insert(turnsTable).values({
      sessionId,
      turnNumber: 0,
      playerAction: `[Session Start] ${playerCharacterName} the ${playerCharacterClass} begins their journey in ${worldName}.`,
      narrative: dmResponse.narrative,
      worldUpdates: dmResponse.worldUpdate as any,
    }).returning();

    const turns = await db
      .select()
      .from(turnsTable)
      .where(eq(turnsTable.sessionId, sessionId))
      .orderBy(turnsTable.turnNumber);

    res.json({
      sessionId,
      turns: turns.map(t => ({
        id: t.id,
        sessionId: t.sessionId,
        turnNumber: t.turnNumber,
        playerAction: t.playerAction,
        narrative: t.narrative,
        worldUpdates: t.worldUpdates ?? {},
        createdAt: t.createdAt.toISOString(),
      })),
      startedAt: new Date().toISOString(),
      worldName,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to start new session");
    res.status(500).json({ error: "internal_error", message: "Failed to start new session" });
  }
});

router.post("/session", async (req, res) => {
  try {
    const { action, sessionId } = req.body ?? {};

    if (!action || !sessionId) {
      res.status(400).json({ error: "bad_request", message: "action and sessionId are required" });
      return;
    }

    const session = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.active, true)))
      .limit(1);

    if (!session.length) {
      res.status(400).json({ error: "bad_request", message: "Session not found or inactive" });
      return;
    }

    const recentTurns = await db
      .select()
      .from(turnsTable)
      .where(eq(turnsTable.sessionId, sessionId))
      .orderBy(desc(turnsTable.turnNumber))
      .limit(5);

    const worldContext = await getWorldContext();
    worldContext.recentTurns = recentTurns.reverse().map(t => ({
      playerAction: t.playerAction,
      narrative: t.narrative,
    }));

    const currentTurnCount = recentTurns.length > 0 ? recentTurns[0].turnNumber + 1 : 1;

    const dmResponse = await processDmTurn(action, worldContext);

    const updatedEntities = await applyWorldUpdate(dmResponse.worldUpdate);

    const [newTurn] = await db.insert(turnsTable).values({
      sessionId,
      turnNumber: currentTurnCount,
      playerAction: action,
      narrative: dmResponse.narrative,
      worldUpdates: dmResponse.worldUpdate as any,
    }).returning();

    res.json({
      turn: {
        id: newTurn.id,
        sessionId: newTurn.sessionId,
        turnNumber: newTurn.turnNumber,
        playerAction: newTurn.playerAction,
        narrative: newTurn.narrative,
        worldUpdates: newTurn.worldUpdates ?? {},
        createdAt: newTurn.createdAt.toISOString(),
      },
      worldUpdates: dmResponse.worldUpdate,
      updatedEntities,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to process turn");
    res.status(500).json({ error: "internal_error", message: "Failed to process turn" });
  }
});

export default router;
