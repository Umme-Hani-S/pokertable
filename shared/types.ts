// User Roles
export type UserRole = 'admin' | 'club_owner' | 'dealer';

// Seat Statuses
export type SeatStatus = 'Open' | 'Playing' | 'Break' | 'Blocked' | 'Closed';

// For backwards compatibility with the existing PokerTable component
export interface Seat {
  id: number;
  position: number;
  status: SeatStatus;
  playerId?: number;
  tableId?: number;
  sessionId?: number;
  timeStarted?: Date;
  timeElapsed?: number;
}

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  isActive: boolean;
  lastLogin?: Date;
  clubOwnerId?: number;
}

// Club interfaces
export interface Club {
  id: number;
  name: string;
  ownerId: number;
  address?: string;
  phoneNumber?: string;
  licenseLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  tables?: Table[];
}

// Table interfaces
export interface Table {
  id: number;
  name: string;
  clubId: number;
  dealerId?: number;
  isActive: boolean;
  maxSeats: number;
  createdAt: Date;
  updatedAt: Date;
  club?: Club;
  dealer?: User;
  seats?: TableSeat[];
  sessions?: TableSession[];
}

// Player interfaces
export interface Player {
  id: number;
  name: string;
  clubId: number;
  email?: string;
  phoneNumber?: string;
  notes?: string;
  totalPlayTime: number;
  lastPlayed?: Date;
  createdAt: Date;
  updatedAt: Date;
  club?: Club;
}

// Table session interfaces
export interface TableSession {
  id: number;
  tableId: number;
  dealerId?: number;
  name: string;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  totalTime: number;
  table?: Table;
  dealer?: User;
}

// Table seat interfaces
export interface TableSeat {
  id: number;
  tableId: number;
  position: number;
  status: SeatStatus;
  playerId?: number;
  sessionId?: number;
  timeStarted?: Date;
  timeElapsed: number;
  table?: Table;
  player?: Player;
  session?: TableSession;
}

// Player time record interfaces
export interface PlayerTimeRecord {
  id: number;
  playerId: number;
  seatId: number;
  sessionId?: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  date: Date;
  player?: Player;
  seat?: TableSeat;
  session?: TableSession;
}

// Status color mapping for visual display
export const STATUS_COLORS = {
  Open: '#4ade80', // Green
  Playing: '#3b82f6', // Blue
  Break: '#f97316', // Orange
  Blocked: '#ef4444', // Red
  Closed: '#6b7280', // Gray
};