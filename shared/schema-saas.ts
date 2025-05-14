import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, foreignKey, uniqueIndex, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'club_owner', 'dealer']);
export const seatStatusEnum = pgEnum('seat_status', ['Open', 'Playing', 'Break', 'Blocked', 'Closed']);

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  role: userRoleEnum("role").notNull().default('dealer'),
  fullName: varchar("full_name", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").notNull().default(true),
  clubOwnerId: integer("club_owner_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  fullName: true,
  clubOwnerId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Club Model
export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  licenseLimit: integer("license_limit").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubs).pick({
  name: true,
  ownerId: true,
  address: true,
  phoneNumber: true,
  licenseLimit: true,
});

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

// Table Model
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  clubId: integer("club_id").notNull().references(() => clubs.id),
  dealerId: integer("dealer_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  maxSeats: integer("max_seats").notNull().default(9),
});

export const insertTableSchema = createInsertSchema(tables).pick({
  name: true,
  clubId: true,
  dealerId: true,
  maxSeats: true,
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

// Player Model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  clubId: integer("club_id").notNull().references(() => clubs.id),
  email: varchar("email", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  totalPlayTime: integer("total_play_time").notNull().default(0), // In seconds
  lastPlayed: timestamp("last_played"),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  clubId: true,
  email: true,
  phoneNumber: true,
  notes: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Table Session Model
export const tableSessions = pgTable("table_sessions", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => tables.id),
  dealerId: integer("dealer_id").references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  totalTime: integer("total_time").notNull().default(0), // In seconds
});

export const insertTableSessionSchema = createInsertSchema(tableSessions).pick({
  tableId: true,
  dealerId: true,
  name: true,
  isActive: true,
  startTime: true,
});

export type InsertTableSession = z.infer<typeof insertTableSessionSchema>;
export type TableSession = typeof tableSessions.$inferSelect;

// Table Seat Model
export const tableSeats = pgTable("table_seats", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => tables.id),
  position: integer("position").notNull(),
  status: seatStatusEnum("status").notNull().default("Open"),
  playerId: integer("player_id").references(() => players.id),
  sessionId: integer("session_id").references(() => tableSessions.id),
  timeStarted: timestamp("time_started"),
  timeElapsed: integer("time_elapsed").notNull().default(0), // In seconds
}, (t) => ({
  // Ensure each table has unique seat positions
  tablePositionIdx: uniqueIndex('table_position_idx').on(t.tableId, t.position)
}));

export const insertTableSeatSchema = createInsertSchema(tableSeats).pick({
  tableId: true,
  position: true,
  status: true,
  playerId: true,
  sessionId: true,
});

export type InsertTableSeat = z.infer<typeof insertTableSeatSchema>;
export type TableSeat = typeof tableSeats.$inferSelect;

// Seat Time Tracking
export const playerTimeRecords = pgTable("player_time_records", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  seatId: integer("seat_id").notNull().references(() => tableSeats.id),
  sessionId: integer("session_id").references(() => tableSessions.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull().default(0), // In seconds
  date: date("date").notNull().defaultNow(),
});

export const insertPlayerTimeRecordSchema = createInsertSchema(playerTimeRecords).pick({
  playerId: true,
  seatId: true,
  sessionId: true,
  startTime: true,
  endTime: true,
  duration: true,
});

export type InsertPlayerTimeRecord = z.infer<typeof insertPlayerTimeRecordSchema>;
export type PlayerTimeRecord = typeof playerTimeRecords.$inferSelect;

// Player Queue Model
export const playerQueue = pgTable("player_queue", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull().references(() => clubs.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  tableId: integer("table_id").references(() => tables.id), // Optional - if assigned to specific table
  priority: integer("priority").notNull().default(0), // Higher number = higher priority
  status: varchar("status", { length: 20 }).notNull().default('waiting'), // waiting, assigned, removed
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  assignedAt: timestamp("assigned_at"),
  notes: text("notes"),
});

export const insertPlayerQueueSchema = createInsertSchema(playerQueue).pick({
  clubId: true,
  playerId: true,
  tableId: true,
  priority: true,
  status: true,
  notes: true,
});

export type InsertPlayerQueue = z.infer<typeof insertPlayerQueueSchema>;
export type PlayerQueue = typeof playerQueue.$inferSelect;

// Club Player Limits - For admin to control player allocation
export const clubPlayerLimits = pgTable("club_player_limits", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull().references(() => clubs.id).unique(),
  maxPlayers: integer("max_players").notNull().default(50), // Default limit of 50 players
  currentPlayers: integer("current_players").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertClubPlayerLimitsSchema = createInsertSchema(clubPlayerLimits).pick({
  clubId: true,
  maxPlayers: true,
  currentPlayers: true,
  updatedBy: true,
});

export type InsertClubPlayerLimits = z.infer<typeof insertClubPlayerLimitsSchema>;
export type ClubPlayerLimits = typeof clubPlayerLimits.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  clubs: many(clubs, { relationName: 'ownerClubs' }),
  dealers: many(users, { relationName: 'clubOwnerDealers' }),
  clubOwner: one(users, {
    fields: [users.clubOwnerId],
    references: [users.id],
    relationName: 'clubOwnerDealers'
  }),
  tables: many(tables, { relationName: 'dealerTables' }),
  sessions: many(tableSessions, { relationName: 'dealerSessions' }),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  owner: one(users, {
    fields: [clubs.ownerId],
    references: [users.id],
    relationName: 'ownerClubs'
  }),
  tables: many(tables),
  players: many(players),
  playerQueue: many(playerQueue),
  playerLimits: one(clubPlayerLimits, {
    fields: [clubs.id],
    references: [clubPlayerLimits.clubId]
  }),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  club: one(clubs, {
    fields: [tables.clubId],
    references: [clubs.id]
  }),
  dealer: one(users, {
    fields: [tables.dealerId],
    references: [users.id],
    relationName: 'dealerTables'
  }),
  seats: many(tableSeats),
  sessions: many(tableSessions),
  queue: many(playerQueue),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  club: one(clubs, {
    fields: [players.clubId],
    references: [clubs.id]
  }),
  seats: many(tableSeats),
  timeRecords: many(playerTimeRecords),
  queueEntries: many(playerQueue),
}));

export const tableSessionsRelations = relations(tableSessions, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableSessions.tableId],
    references: [tables.id]
  }),
  dealer: one(users, {
    fields: [tableSessions.dealerId],
    references: [users.id],
    relationName: 'dealerSessions'
  }),
  seats: many(tableSeats),
  timeRecords: many(playerTimeRecords),
}));

export const tableSeatsRelations = relations(tableSeats, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableSeats.tableId],
    references: [tables.id]
  }),
  player: one(players, {
    fields: [tableSeats.playerId],
    references: [players.id]
  }),
  session: one(tableSessions, {
    fields: [tableSeats.sessionId],
    references: [tableSessions.id]
  }),
  timeRecords: many(playerTimeRecords),
}));

export const playerTimeRecordsRelations = relations(playerTimeRecords, ({ one }) => ({
  player: one(players, {
    fields: [playerTimeRecords.playerId],
    references: [players.id]
  }),
  seat: one(tableSeats, {
    fields: [playerTimeRecords.seatId],
    references: [tableSeats.id]
  }),
  session: one(tableSessions, {
    fields: [playerTimeRecords.sessionId],
    references: [tableSessions.id]
  }),
}));

export const playerQueueRelations = relations(playerQueue, ({ one }) => ({
  player: one(players, {
    fields: [playerQueue.playerId],
    references: [players.id]
  }),
  club: one(clubs, {
    fields: [playerQueue.clubId],
    references: [clubs.id]
  }),
  table: one(tables, {
    fields: [playerQueue.tableId],
    references: [tables.id]
  }),
}));

export const clubPlayerLimitsRelations = relations(clubPlayerLimits, ({ one }) => ({
  club: one(clubs, {
    fields: [clubPlayerLimits.clubId],
    references: [clubs.id]
  }),
  updatedByUser: one(users, {
    fields: [clubPlayerLimits.updatedBy],
    references: [users.id]
  }),
}));