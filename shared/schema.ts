import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// New schemas for Poker Table Management

// Players schema
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, waiting
  seatId: integer("seat_id").default(null),
  timeJoined: timestamp("time_joined").notNull().defaultNow(),
  timeElapsed: integer("time_elapsed").notNull().default(0), // in seconds
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  status: true,
  seatId: true,
  notes: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Table Sessions schema
export const tableSessions = pgTable("table_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  totalTime: integer("total_time").notNull().default(0), // in seconds
});

export const insertTableSessionSchema = createInsertSchema(tableSessions).pick({
  name: true,
  isActive: true,
});

export type InsertTableSession = z.infer<typeof insertTableSessionSchema>;
export type TableSession = typeof tableSessions.$inferSelect;

// Seats are fixed positions around the table
export const tableSeats = pgTable("table_seats", {
  id: serial("id").primaryKey(),
  position: integer("position").notNull(), // Position number 1-8
  isActive: boolean("is_active").notNull().default(true),
});

export const insertTableSeatSchema = createInsertSchema(tableSeats).pick({
  position: true,
  isActive: true,
});

export type InsertTableSeat = z.infer<typeof insertTableSeatSchema>;
export type TableSeat = typeof tableSeats.$inferSelect;
