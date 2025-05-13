// Define the seat statuses
export type SeatStatus = 'Open' | 'Playing' | 'Break' | 'Blocked' | 'Closed';

// Define player object
export interface Player {
  id: number;
  name: string;
}

// Define seat object
export interface Seat {
  id: number;
  position: number;
  status: SeatStatus;
  playerId?: number;
}

// Status color mapping for visual display
export const STATUS_COLORS = {
  Open: '#4ade80', // Green
  Playing: '#3b82f6', // Blue
  Break: '#f97316', // Orange
  Blocked: '#ef4444', // Red
  Closed: '#6b7280', // Gray
};