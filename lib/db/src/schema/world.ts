import { pgTable, text, integer, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const worldStateTable = pgTable("world_state", {
  id: serial("id").primaryKey(),
  worldName: text("world_name").notNull().default("The Shattered Realm"),
  currentEra: text("current_era").notNull().default("The Age of Fracture"),
  currentLocation: text("current_location").notNull().default("The Crossroads Tavern"),
  weather: text("weather").notNull().default("Overcast, a chill in the air"),
  timeOfDay: text("time_of_day").notNull().default("Dusk"),
  tension: integer("tension").notNull().default(3),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorldStateSchema = createInsertSchema(worldStateTable).omit({ id: true, updatedAt: true });
export type InsertWorldState = z.infer<typeof insertWorldStateSchema>;
export type WorldState = typeof worldStateTable.$inferSelect;

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  worldName: text("world_name").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertSessionSchema = createInsertSchema(sessionsTable);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;

export const turnsTable = pgTable("turns", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessionsTable.id),
  turnNumber: integer("turn_number").notNull(),
  playerAction: text("player_action").notNull(),
  narrative: text("narrative").notNull(),
  worldUpdates: jsonb("world_updates"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTurnSchema = createInsertSchema(turnsTable).omit({ id: true, createdAt: true });
export type InsertTurn = z.infer<typeof insertTurnSchema>;
export type Turn = typeof turnsTable.$inferSelect;
