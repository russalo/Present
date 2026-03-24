import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charactersTable = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("npc"),
  class: text("class"),
  race: text("race"),
  level: integer("level").default(1),
  health: integer("health").default(100),
  maxHealth: integer("max_health").default(100),
  currentLocation: text("current_location"),
  description: text("description"),
  traits: text("traits").array(),
  status: text("status").notNull().default("alive"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({ id: true, updatedAt: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
