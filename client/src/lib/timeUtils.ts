/**
 * Formats a time in seconds to a string in the format "HH:MM:SS"
 * @param seconds The time in seconds
 * @returns A formatted string
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [hours, minutes, secs]
    .map(v => v < 10 ? "0" + v : v)
    .join(":");
}

/**
 * Gets the elapsed time since a given date in seconds
 * @param startTime The start time as a Date object or string
 * @returns The elapsed time in seconds
 */
export function getElapsedTime(startTime: Date | string): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 1000);
}

/**
 * Formats a date to a readable time string (e.g., "10:15 AM")
 * @param date The date to format
 * @returns A formatted time string
 */
export function formatTimeOfDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
