import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, turnsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  getOpenAIClient,
  DM_MODEL,
  buildMessages,
  parseWorldUpdate,
  extractNarrative,
} from "../lib/dm-ai.js";
import { getWorldContext, applyWorldUpdate } from "../lib/world-updater.js";

const router: IRouter = Router();

router.post("/stream", async (req, res) => {
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

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (obj: object) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const recentTurns = await db
      .select()
      .from(turnsTable)
      .where(eq(turnsTable.sessionId, sessionId))
      .orderBy(desc(turnsTable.turnNumber))
      .limit(5);

    const currentTurnCount = recentTurns.length > 0 ? recentTurns[0].turnNumber + 1 : 1;

    const worldContext = await getWorldContext();
    worldContext.recentTurns = recentTurns.reverse().map(t => ({
      playerAction: t.playerAction,
      narrative: t.narrative,
    }));

    const stream = await getOpenAIClient().chat.completions.create({
      model: DM_MODEL,
      messages: buildMessages(action, worldContext),
      stream: true,
      max_completion_tokens: 2000,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        fullText += token;
        send({ type: "token", content: token });
      }
    }

    const worldUpdate = parseWorldUpdate(fullText);
    const narrative = extractNarrative(fullText);

    await applyWorldUpdate(worldUpdate);
    await db.insert(turnsTable).values({
      sessionId,
      turnNumber: currentTurnCount,
      playerAction: action,
      narrative,
      worldUpdates: worldUpdate as any,
    });

    send({ type: "world_update", data: worldUpdate });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log?.error({ err }, "Stream failed");
    try {
      send({ type: "error", message: "Stream failed" });
      res.end();
    } catch {
      // response may already be closed
    }
  }
});

export default router;
