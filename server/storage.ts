import { 
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer,
  tableSessions, type TableSession, type InsertTableSession,
  tableSeats, type TableSeat, type InsertTableSeat
} from "@shared/schema";

// modify the interface with all necessary CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  getPlayersBySeatId(seatId: number): Promise<Player | undefined>;
  getPlayersByStatus(status: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  
  // Table Session methods
  getCurrentSession(): Promise<TableSession | undefined>;
  createSession(session: InsertTableSession): Promise<TableSession>;
  updateSession(id: number, session: Partial<TableSession>): Promise<TableSession | undefined>;
  endSession(id: number): Promise<TableSession | undefined>;
  
  // Table Seat methods
  getSeats(): Promise<TableSeat[]>;
  updateSeat(id: number, seat: Partial<TableSeat>): Promise<TableSeat | undefined>;
  assignPlayerToSeat(playerId: number, seatId: number): Promise<boolean>;
  removePlayerFromSeat(seatId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private tableSessions: Map<number, TableSession>;
  private tableSeats: Map<number, TableSeat>;
  
  private userCurrentId: number;
  private playerCurrentId: number;
  private sessionCurrentId: number;
  private seatCurrentId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.tableSessions = new Map();
    this.tableSeats = new Map();
    
    this.userCurrentId = 1;
    this.playerCurrentId = 1;
    this.sessionCurrentId = 1;
    this.seatCurrentId = 1;
    
    // Initialize default seats (1-8 positions around the table)
    for (let i = 1; i <= 8; i++) {
      this.tableSeats.set(i, {
        id: i,
        position: i,
        isActive: true
      });
      this.seatCurrentId++;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
  
  async getPlayersBySeatId(seatId: number): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.seatId === seatId && player.isActive
    );
  }
  
  async getPlayersByStatus(status: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.status === status && player.isActive
    );
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerCurrentId++;
    const now = new Date();
    const player: Player = { 
      ...insertPlayer, 
      id, 
      timeJoined: now,
      timeElapsed: 0,
      isActive: true 
    };
    this.players.set(id, player);
    return player;
  }
  
  async updatePlayer(id: number, playerUpdate: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...playerUpdate };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  async deletePlayer(id: number): Promise<boolean> {
    const player = this.players.get(id);
    if (!player) return false;
    
    // Mark as inactive instead of deleting
    player.isActive = false;
    this.players.set(id, player);
    return true;
  }
  
  // Table Session methods
  async getCurrentSession(): Promise<TableSession | undefined> {
    return Array.from(this.tableSessions.values()).find(
      (session) => session.isActive
    );
  }
  
  async createSession(insertSession: InsertTableSession): Promise<TableSession> {
    // First, mark any active sessions as inactive
    const activeSessions = Array.from(this.tableSessions.values()).filter(
      (session) => session.isActive
    );
    
    for (const session of activeSessions) {
      session.isActive = false;
      session.endTime = new Date();
      this.tableSessions.set(session.id, session);
    }
    
    // Create new session
    const id = this.sessionCurrentId++;
    const now = new Date();
    const session: TableSession = {
      ...insertSession,
      id,
      startTime: now,
      endTime: null,
      totalTime: 0,
    };
    this.tableSessions.set(id, session);
    return session;
  }
  
  async updateSession(id: number, sessionUpdate: Partial<TableSession>): Promise<TableSession | undefined> {
    const session = this.tableSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.tableSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async endSession(id: number): Promise<TableSession | undefined> {
    const session = this.tableSessions.get(id);
    if (!session) return undefined;
    
    const now = new Date();
    const endTime = now;
    const totalTime = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
    
    const updatedSession = { 
      ...session, 
      isActive: false,
      endTime,
      totalTime
    };
    
    this.tableSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Table Seat methods
  async getSeats(): Promise<TableSeat[]> {
    return Array.from(this.tableSeats.values());
  }
  
  async updateSeat(id: number, seatUpdate: Partial<TableSeat>): Promise<TableSeat | undefined> {
    const seat = this.tableSeats.get(id);
    if (!seat) return undefined;
    
    const updatedSeat = { ...seat, ...seatUpdate };
    this.tableSeats.set(id, updatedSeat);
    return updatedSeat;
  }
  
  async assignPlayerToSeat(playerId: number, seatId: number): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player) return false;
    
    const seat = this.tableSeats.get(seatId);
    if (!seat) return false;
    
    // Check if seat is already occupied
    const existingPlayer = await this.getPlayersBySeatId(seatId);
    if (existingPlayer && existingPlayer.id !== playerId) {
      // Remove current player from the seat first
      await this.updatePlayer(existingPlayer.id, { seatId: null, status: "waiting" });
    }
    
    // Update the player with the seat ID
    player.seatId = seatId;
    player.status = "active";
    this.players.set(playerId, player);
    return true;
  }
  
  async removePlayerFromSeat(seatId: number): Promise<boolean> {
    const existingPlayer = await this.getPlayersBySeatId(seatId);
    if (!existingPlayer) return false;
    
    // Update the player to remove seat
    existingPlayer.seatId = null;
    existingPlayer.status = "inactive";
    this.players.set(existingPlayer.id, existingPlayer);
    return true;
  }
}

export const storage = new MemStorage();
