import { supabase } from './db';
import * as schema from '@/../../shared/schema-saas';
import { SeatStatus } from '@/../../shared/types';

export class DatabaseStorage {
  // User methods
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getUserById(id: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(data: any) {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newUser;
  }

  // Club methods
  async getClubs() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getClubById(id: number) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getClubsByOwnerId(ownerId: number) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('ownerId', ownerId);
    if (error) throw error;
    return data;
  }

  async createClub(data: any) {
    const { data: newClub, error } = await supabase
      .from('clubs')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newClub;
  }

  // Table methods
  async getTables() {
    const { data, error } = await supabase
      .from('tables')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getTablesByClubId(clubId: number) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('clubId', clubId);
    if (error) throw error;
    return data;
  }

  async createTable(data: any) {
    const { data: newTable, error } = await supabase
      .from('tables')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newTable;
  }

  // Player methods
  async getPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getPlayersByClubId(clubId: number) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('clubId', clubId);
    if (error) throw error;
    return data;
  }

  async getPlayer(id: number) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createPlayer(data: any) {
    const { data: newPlayer, error } = await supabase
      .from('players')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newPlayer;
  }

  // Seat methods
  async getSeats() {
    const { data, error } = await supabase
      .from('table_seats')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getSeatsByTableId(tableId: number) {
    const { data, error } = await supabase
      .from('table_seats')
      .select('*')
      .eq('tableId', tableId);
    if (error) throw error;
    return data;
  }

  async getSeat(id: number) {
    const { data, error } = await supabase
      .from('table_seats')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createSeat(data: any) {
    const { data: newSeat, error } = await supabase
      .from('table_seats')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newSeat;
  }

  async updateSeatStatus(
    id: number,
    status: SeatStatus,
    playerId?: number,
    sessionId?: number
  ): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('table_seats')
      .update({
        status: status,
        playerId: playerId || null,
        sessionId: sessionId || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Session methods
  async getSessions() {
    const { data, error } = await supabase
      .from('table_sessions')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getSessionsByTableId(tableId: number) {
    const { data, error } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('tableId', tableId);
    if (error) throw error;
    return data;
  }

  async getSession(id: number) {
    const { data, error } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createSession(data: any) {
    const { data: newSession, error } = await supabase
      .from('table_sessions')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newSession;
  }

  async updateSession(id: number, data: Partial<any>): Promise<any | undefined> {
    const { data: updatedSession, error } = await supabase
      .from('table_sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedSession;
  }

  // Time tracking methods
  async getPlayerTimeRecords(playerId: number) {
    const { data, error } = await supabase
      .from('player_time_records')
      .select('*')
      .eq('playerId', playerId);
    if (error) throw error;
    return data;
  }

  async createPlayerTimeRecord(data: any) {
    const { data: newRecord, error } = await supabase
      .from('player_time_records')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newRecord;
  }

  async updatePlayerTimeRecord(id: number, data: Partial<any>): Promise<any | undefined> {
    const { data: updatedRecord, error } = await supabase
      .from('player_time_records')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedRecord;
  }

  // Player Queue methods
  async getPlayerQueue(clubId: number) {
    const { data, error } = await supabase
      .from('player_queue')
      .select('*')
      .eq('clubId', clubId)
      .order('priority')
      .order('joinedAt');
    if (error) throw error;
    return data;
  }

  async getPlayerQueueByTableId(tableId: number) {
    const { data, error } = await supabase
      .from('player_queue')
      .select('*')
      .eq('tableId', tableId)
      .order('priority')
      .order('joinedAt');
    if (error) throw error;
    return data;
  }

  async addPlayerToQueue(data: any) {
    const { data: newQueueEntry, error } = await supabase
      .from('player_queue')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newQueueEntry;
  }

  async updatePlayerQueueEntry(id: number, data: Partial<any>): Promise<any | undefined> {
    const { data: updatedQueueEntry, error } = await supabase
      .from('player_queue')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedQueueEntry;
  }

  async removePlayerFromQueue(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('player_queue')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing player from queue:", error);
      return false;
    }

    return true;
  }

  async assignPlayerFromQueue(queueId: number, tableId: number): Promise<any | undefined> {
    const { data: assignedPlayer, error } = await supabase
      .from('player_queue')
      .update({
        tableId: tableId,
        status: 'assigned',
        assignedAt: new Date()
      })
      .eq('id', queueId)
      .select()
      .single();

    if (error) throw error;
    return assignedPlayer;
  }

  // Club Player Limits methods
  async getClubPlayerLimits(clubId: number) {
    const { data, error } = await supabase
      .from('club_player_limits')
      .select('*')
      .eq('clubId', clubId)
      .single();
    if (error) throw error;
    return data;
  }

  async setClubPlayerLimits(data: any) {
    // Check if limits already exist for this club
    const existingLimits = await this.getClubPlayerLimits(data.clubId);

    if (existingLimits) {
      // Update existing limits
      const { data: updatedLimits, error } = await supabase
        .from('club_player_limits')
        .update({
          maxPlayers: data.maxPlayers,
          updatedAt: new Date(),
          updatedBy: data.updatedBy
        })
        .eq('clubId', data.clubId)
        .select()
        .single();

      if (error) throw error;
      return updatedLimits;
    } else {
      // Create new limits
      const { data: newLimits, error } = await supabase
        .from('club_player_limits')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return newLimits;
    }
  }

  async updateClubPlayerLimits(clubId: number, data: Partial<any>): Promise<any | undefined> {
    const updatedData = {
      ...data,
      updatedAt: new Date()
    };

    const { data: updatedLimits, error } = await supabase
      .from('club_player_limits')
      .update(updatedData)
      .eq('clubId', clubId)
      .select()
      .single();

    if (error) throw error;
    return updatedLimits;
  }

  async increaseCurrentPlayers(clubId: number): Promise<any | undefined> {
    // Get current limits
    const limits = await this.getClubPlayerLimits(clubId);

    if (!limits) {
      // Create default limits if they don't exist
      return this.setClubPlayerLimits({
        clubId,
        maxPlayers: 50,
        currentPlayers: 1
      });
    }

    // Increase by 1
    const { data: updatedLimits, error } = await supabase
      .from('club_player_limits')
      .update({
        currentPlayers: limits.currentPlayers + 1,
        updatedAt: new Date()
      })
      .eq('clubId', clubId)
      .select()
      .single();

    if (error) throw error;
    return updatedLimits;
  }

  async decreaseCurrentPlayers(clubId: number): Promise<any | undefined> {
    // Get current limits
    const limits = await this.getClubPlayerLimits(clubId);

    if (!limits) {
      return undefined;
    }

    // Decrease by 1, but ensure we don't go below 0
    const newCount = Math.max(0, limits.currentPlayers - 1);

    const { data: updatedLimits, error } = await supabase
      .from('club_player_limits')
      .update({
        currentPlayers: newCount,
        updatedAt: new Date()
      })
      .eq('clubId', clubId)
      .select()
      .single();

    if (error) throw error;
    return updatedLimits;
  }

  async checkPlayerLimit(clubId: number): Promise<{ hasReachedLimit: boolean, currentCount: number, maxCount: number }> {
    // Get current limits
    const limits = await this.getClubPlayerLimits(clubId);

    if (!limits) {
      // If no limits exist, create default ones and return not reached
      await this.setClubPlayerLimits({
        clubId,
        maxPlayers: 50,
        currentPlayers: 0
      });
      return {
        hasReachedLimit: false,
        currentCount: 0,
        maxCount: 50
      };
    }

    return {
      hasReachedLimit: limits.currentPlayers >= limits.maxPlayers,
      currentCount: limits.currentPlayers,
      maxCount: limits.maxPlayers
    };
  }
}

export const storage = new DatabaseStorage();