// Time tracking utility for poker players

export interface PlayerTimeRecord {
  playerId: number;
  startTime: number | null; // Timestamp when the player started playing
  totalTime: number; // Total accumulated time in seconds
  isActive: boolean; // Whether the player is currently being timed
}

export class TimeTracker {
  private playerRecords: Map<number, PlayerTimeRecord>;
  private intervalId: number | null;
  
  constructor() {
    this.playerRecords = new Map();
    this.intervalId = null;
  }
  
  // Start tracking time for a player
  public startTracking(playerId: number): void {
    // Check if player exists in records
    if (!this.playerRecords.has(playerId)) {
      this.playerRecords.set(playerId, {
        playerId,
        startTime: Date.now(),
        totalTime: 0,
        isActive: true
      });
    } else {
      // Player exists, resume timing
      const record = this.playerRecords.get(playerId)!;
      record.startTime = Date.now();
      record.isActive = true;
      this.playerRecords.set(playerId, record);
    }
    
    // Start interval if not already running
    this.startInterval();
  }
  
  // Stop tracking time for a player
  public stopTracking(playerId: number): void {
    if (this.playerRecords.has(playerId)) {
      const record = this.playerRecords.get(playerId)!;
      
      if (record.isActive && record.startTime) {
        // Calculate elapsed time and add to total
        const elapsedTime = Math.floor((Date.now() - record.startTime) / 1000);
        record.totalTime += elapsedTime;
      }
      
      // Update record
      record.isActive = false;
      record.startTime = null;
      this.playerRecords.set(playerId, record);
    }
    
    // Check if we need to stop the interval
    if (this.checkAllPlayersStopped()) {
      this.stopInterval();
    }
  }
  
  // Get current time record for a player
  public getPlayerTimeRecord(playerId: number): PlayerTimeRecord | undefined {
    return this.playerRecords.get(playerId);
  }
  
  // Get total time for a player in seconds
  public getPlayerTotalTime(playerId: number): number {
    if (!this.playerRecords.has(playerId)) {
      return 0;
    }
    
    const record = this.playerRecords.get(playerId)!;
    
    // If player is active, calculate current elapsed time
    if (record.isActive && record.startTime) {
      const currentElapsed = Math.floor((Date.now() - record.startTime) / 1000);
      return record.totalTime + currentElapsed;
    }
    
    return record.totalTime;
  }
  
  // Get formatted time string (HH:MM:SS) for a player
  public getFormattedTime(playerId: number): string {
    const totalSeconds = this.getPlayerTotalTime(playerId);
    return this.formatTimeString(totalSeconds);
  }
  
  // Format seconds to HH:MM:SS
  public formatTimeString(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }
  
  // Start the update interval
  private startInterval(): void {
    if (this.intervalId === null) {
      // Update every second
      this.intervalId = window.setInterval(() => this.updateTimes(), 1000);
    }
  }
  
  // Stop the update interval
  private stopInterval(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  // Update all active player times (used by interval)
  private updateTimes(): void {
    // Nothing to do here as times are calculated on demand
    // This is just to trigger UI updates if needed
  }
  
  // Check if all players are stopped
  private checkAllPlayersStopped(): boolean {
    const records = Array.from(this.playerRecords.values());
    for (const record of records) {
      if (record.isActive) {
        return false;
      }
    }
    return true;
  }
  
  // Get all player records
  public getAllPlayerRecords(): PlayerTimeRecord[] {
    return Array.from(this.playerRecords.values());
  }
}

// Export a singleton instance
export const timeTracker = new TimeTracker();