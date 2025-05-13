import { Player, Seat, SeatStatus } from '../shared/types';

export interface IStorage {
  // Player methods
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(name: string): Promise<Player>;
  
  // Seat methods
  getSeats(): Promise<Seat[]>;
  getSeat(id: number): Promise<Seat | undefined>;
  updateSeatStatus(id: number, status: SeatStatus, playerId?: number): Promise<Seat | undefined>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private seats: Map<number, Seat>;
  private playerCurrentId: number;
  
  constructor() {
    this.players = new Map();
    this.seats = new Map();
    this.playerCurrentId = 1;
    
    // Initialize with 9 seats
    for (let i = 1; i <= 9; i++) {
      this.seats.set(i, {
        id: i,
        position: i,
        status: 'Open'
      });
    }
    
    // Add some sample players
    this.createPlayer('John');
    this.createPlayer('Maria');
    this.createPlayer('Alex');
  }
  
  // Player methods
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
  
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async createPlayer(name: string): Promise<Player> {
    const id = this.playerCurrentId++;
    const player = { id, name };
    this.players.set(id, player);
    return player;
  }
  
  // Seat methods
  async getSeats(): Promise<Seat[]> {
    return Array.from(this.seats.values());
  }
  
  async getSeat(id: number): Promise<Seat | undefined> {
    return this.seats.get(id);
  }
  
  async updateSeatStatus(id: number, status: SeatStatus, playerId?: number): Promise<Seat | undefined> {
    const seat = this.seats.get(id);
    if (!seat) return undefined;
    
    // New player management logic:
    // - For Playing: set the provided playerId
    // - For Break or Blocked: keep existing playerId if coming from Playing, otherwise use provided ID 
    // - For Open or Closed: clear the playerId (player left the seat)
    let updatedPlayerId = undefined;
    
    if (status === 'Playing') {
      // Playing seats always need a player ID
      updatedPlayerId = playerId;
    } else if (status === 'Break' || status === 'Blocked') {
      // Keep the current player ID if it exists, otherwise use the provided one
      updatedPlayerId = seat.playerId || playerId;
    }
    // Open and Closed will get undefined playerId
    
    const updatedSeat: Seat = {
      ...seat,
      status,
      playerId: updatedPlayerId
    };
    
    this.seats.set(id, updatedSeat);
    return updatedSeat;
  }
}

// Export a singleton instance
export const storage = new MemStorage();