import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const factionsTable = pgTable("factions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  alignment: text("alignment"),
  power: integer("power").default(5),
  playerRelation: integer("player_relation").default(0),
  goals: text("goals").array(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFactionSchema = createInsertSchema(factionsTable).omit({ id: true, updatedAt: true });
export type InsertFaction = z.infer<typeof insertFactionSchema>;
export type Faction = typeof factionsTable.$inferSelect;
