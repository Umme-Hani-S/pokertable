import { db } from './db';
import * as schema from '@/../../shared/schema-saas';
import { eq, and } from 'drizzle-orm';
import { SeatStatus } from '@/../../shared/types';
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUsers(): Promise<schema.User[]>;
  getUserById(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(data: schema.InsertUser): Promise<schema.User>;

  // Club methods
  getClubs(): Promise<schema.Club[]>;
  getClubById(id: number): Promise<schema.Club | undefined>;
  getClubsByOwnerId(ownerId: number): Promise<schema.Club[]>;
  createClub(data: schema.InsertClub): Promise<schema.Club>;
  updateClub(id: number, data: Partial<schema.InsertClub>): Promise<schema.Club | undefined>;

  // Table methods
  getTables(): Promise<schema.Table[]>;
  getTableById(id: number): Promise<schema.Table | undefined>;
  getTablesByClubId(clubId: number): Promise<schema.Table[]>;
  createTable(data: schema.InsertTable): Promise<schema.Table>;
  updateTable(id: number, data: Partial<schema.InsertTable>): Promise<schema.Table | undefined>;

  // Player methods
  getPlayers(): Promise<schema.Player[]>;
  getPlayersByClubId(clubId: number): Promise<schema.Player[]>;
  getPlayer(id: number): Promise<schema.Player | undefined>;
  createPlayer(data: schema.InsertPlayer): Promise<schema.Player>;
  updatePlayer(id: number, data: Partial<schema.InsertPlayer>): Promise<schema.Player | undefined>;
  
  // Seat methods
  getSeats(): Promise<schema.TableSeat[]>;
  getSeatsByTableId(tableId: number): Promise<schema.TableSeat[]>;
  getSeat(id: number): Promise<schema.TableSeat | undefined>;
  createSeat(data: schema.InsertTableSeat): Promise<schema.TableSeat>;
  updateSeatStatus(id: number, status: SeatStatus, playerId?: number, sessionId?: number): Promise<schema.TableSeat | undefined>;
  
  // Session methods
  getSessions(): Promise<schema.TableSession[]>;
  getSessionsByTableId(tableId: number): Promise<schema.TableSession[]>;
  getSession(id: number): Promise<schema.TableSession | undefined>;
  createSession(data: schema.InsertTableSession): Promise<schema.TableSession>;
  updateSession(id: number, data: Partial<schema.InsertTableSession>): Promise<schema.TableSession | undefined>;
  
  // Time tracking methods
  getPlayerTimeRecords(playerId: number): Promise<schema.PlayerTimeRecord[]>;
  createPlayerTimeRecord(data: schema.InsertPlayerTimeRecord): Promise<schema.PlayerTimeRecord>;
  updatePlayerTimeRecord(id: number, data: Partial<schema.InsertPlayerTimeRecord>): Promise<schema.PlayerTimeRecord | undefined>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUsers(): Promise<schema.User[]> {
    return db.select().from(schema.users);
  }

  async getUserById(id: number): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(data: schema.InsertUser): Promise<schema.User> {
    const result = await db.insert(schema.users).values(data).returning();
    return result[0];
  }

  // Club methods
  async getClubs(): Promise<schema.Club[]> {
    return db.select().from(schema.clubs);
  }

  async getClubById(id: number): Promise<schema.Club | undefined> {
    const result = await db.select().from(schema.clubs).where(eq(schema.clubs.id, id));
    return result[0];
  }

  async getClubsByOwnerId(ownerId: number): Promise<schema.Club[]> {
    return db.select().from(schema.clubs).where(eq(schema.clubs.ownerId, ownerId));
  }

  async createClub(data: schema.InsertClub): Promise<schema.Club> {
    const result = await db.insert(schema.clubs).values(data).returning();
    return result[0];
  }

  async updateClub(id: number, data: Partial<schema.InsertClub>): Promise<schema.Club | undefined> {
    const result = await db.update(schema.clubs)
      .set(data)
      .where(eq(schema.clubs.id, id))
      .returning();
    return result[0];
  }

  // Table methods
  async getTables(): Promise<schema.Table[]> {
    return db.select().from(schema.tables);
  }

  async getTableById(id: number): Promise<schema.Table | undefined> {
    const result = await db.select().from(schema.tables).where(eq(schema.tables.id, id));
    return result[0];
  }

  async getTablesByClubId(clubId: number): Promise<schema.Table[]> {
    return db.select().from(schema.tables).where(eq(schema.tables.clubId, clubId));
  }

  async createTable(data: schema.InsertTable): Promise<schema.Table> {
    const result = await db.insert(schema.tables).values(data).returning();
    return result[0];
  }

  async updateTable(id: number, data: Partial<schema.InsertTable>): Promise<schema.Table | undefined> {
    const result = await db.update(schema.tables)
      .set(data)
      .where(eq(schema.tables.id, id))
      .returning();
    return result[0];
  }

  // Player methods
  async getPlayers(): Promise<schema.Player[]> {
    return db.select().from(schema.players);
  }

  async getPlayersByClubId(clubId: number): Promise<schema.Player[]> {
    return db.select().from(schema.players).where(eq(schema.players.clubId, clubId));
  }

  async getPlayer(id: number): Promise<schema.Player | undefined> {
    const result = await db.select().from(schema.players).where(eq(schema.players.id, id));
    return result[0];
  }

  async createPlayer(data: schema.InsertPlayer): Promise<schema.Player> {
    const result = await db.insert(schema.players).values(data).returning();
    return result[0];
  }

  async updatePlayer(id: number, data: Partial<schema.InsertPlayer>): Promise<schema.Player | undefined> {
    const result = await db.update(schema.players)
      .set(data)
      .where(eq(schema.players.id, id))
      .returning();
    return result[0];
  }

  // Seat methods
  async getSeats(): Promise<schema.TableSeat[]> {
    return db.select().from(schema.tableSeats);
  }

  async getSeatsByTableId(tableId: number): Promise<schema.TableSeat[]> {
    return db.select().from(schema.tableSeats).where(eq(schema.tableSeats.tableId, tableId));
  }

  async getSeat(id: number): Promise<schema.TableSeat | undefined> {
    const result = await db.select().from(schema.tableSeats).where(eq(schema.tableSeats.id, id));
    return result[0];
  }

  async createSeat(data: schema.InsertTableSeat): Promise<schema.TableSeat> {
    const result = await db.insert(schema.tableSeats).values(data).returning();
    return result[0];
  }

  async updateSeatStatus(
    id: number, 
    status: SeatStatus, 
    playerId?: number,
    sessionId?: number
  ): Promise<schema.TableSeat | undefined> {
    const data: Partial<schema.InsertTableSeat> = { status: status as any };
    
    if (playerId !== undefined) {
      data.playerId = playerId || null;
    }
    
    if (sessionId !== undefined) {
      data.sessionId = sessionId || null;
    }
    
    // Start time tracking if status is Playing
    if (status === 'Playing') {
      data.timeStarted = new Date();
    }
    
    const result = await db.update(schema.tableSeats)
      .set(data)
      .where(eq(schema.tableSeats.id, id))
      .returning();
    
    return result[0];
  }

  // Session methods
  async getSessions(): Promise<schema.TableSession[]> {
    return db.select().from(schema.tableSessions);
  }

  async getSessionsByTableId(tableId: number): Promise<schema.TableSession[]> {
    return db.select().from(schema.tableSessions).where(eq(schema.tableSessions.tableId, tableId));
  }

  async getSession(id: number): Promise<schema.TableSession | undefined> {
    const result = await db.select().from(schema.tableSessions).where(eq(schema.tableSessions.id, id));
    return result[0];
  }

  async createSession(data: schema.InsertTableSession): Promise<schema.TableSession> {
    const result = await db.insert(schema.tableSessions).values(data).returning();
    return result[0];
  }

  async updateSession(id: number, data: Partial<schema.InsertTableSession>): Promise<schema.TableSession | undefined> {
    const result = await db.update(schema.tableSessions)
      .set(data)
      .where(eq(schema.tableSessions.id, id))
      .returning();
    return result[0];
  }

  // Time tracking methods
  async getPlayerTimeRecords(playerId: number): Promise<schema.PlayerTimeRecord[]> {
    return db.select().from(schema.playerTimeRecords).where(eq(schema.playerTimeRecords.playerId, playerId));
  }

  async createPlayerTimeRecord(data: schema.InsertPlayerTimeRecord): Promise<schema.PlayerTimeRecord> {
    const result = await db.insert(schema.playerTimeRecords).values(data).returning();
    return result[0];
  }

  async updatePlayerTimeRecord(id: number, data: Partial<schema.InsertPlayerTimeRecord>): Promise<schema.PlayerTimeRecord | undefined> {
    const result = await db.update(schema.playerTimeRecords)
      .set(data)
      .where(eq(schema.playerTimeRecords.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();