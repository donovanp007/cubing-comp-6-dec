import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse time input and convert to milliseconds
 * Format: SS.CC (Seconds.Centiseconds) - Stackmat timer format
 * Supports various input formats:
 * - "90" → 0.90 seconds → 900ms
 * - "1234" → 12.34 seconds → 12340ms
 * - "10123" → 1:01.23 → 61230ms
 * - "125252" → 12:52.52 → 772520ms
 * - "1:23.45" → 1 minute 23.45 seconds → 83450ms
 * - "45.67" → 45.67 seconds → 45670ms
 */
export function parseTimeInput(input: string): number {
  if (!input || input.trim().length === 0) return 0;

  // Check for formatted time with colons or dots (M:SS.CC or SS.CC)
  if (input.includes(':') || (input.includes('.') && input.split('.').length > 1)) {
    const parts = input.split(':');
    let minutes = 0;
    let secondsPart = input;

    // Handle M:SS.CC format
    if (parts.length === 2) {
      minutes = parseInt(parts[0], 10);
      secondsPart = parts[1];
    }

    const seconds = parseFloat(secondsPart);
    if (isNaN(seconds)) return 0;

    return Math.round((minutes * 60 + seconds) * 1000);
  }

  // Raw number handling - treat as centiseconds format (SS.CC)
  // Last 2 digits are ALWAYS centiseconds, working backwards
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return 0;

  let centiseconds = 0;
  let seconds = 0;
  let minutes = 0;

  if (digits.length === 1 || digits.length === 2) {
    // 1-2 digits: CS (centiseconds only)
    // 90 → 0.90 seconds
    centiseconds = parseInt(digits, 10);
  } else if (digits.length === 3 || digits.length === 4) {
    // 3-4 digits: SS.CC
    // 1234 → 12.34 seconds
    centiseconds = parseInt(digits.slice(-2), 10);
    seconds = parseInt(digits.slice(0, -2), 10);
  } else if (digits.length === 5) {
    // 5 digits: M|SS|CC
    // 10123 → 1:01.23
    centiseconds = parseInt(digits.slice(-2), 10);
    seconds = parseInt(digits.slice(-4, -2), 10);
    minutes = parseInt(digits.slice(0, -4), 10);
  } else {
    // 6+ digits: MM|SS|CC
    // 125252 → 12:52.52
    centiseconds = parseInt(digits.slice(-2), 10);
    seconds = parseInt(digits.slice(-4, -2), 10);
    minutes = parseInt(digits.slice(0, -4), 10);
  }

  // Convert to milliseconds: centiseconds * 10 = milliseconds
  return (minutes * 60 * 1000) + (seconds * 1000) + (centiseconds * 10);
}

/**
 * Format milliseconds to display time (e.g., "12.34" or "1:23.45")
 * Displays with 2 decimal places (centiseconds) - Stackmat timer format
 */
export function formatTime(ms: number | null): string {
  if (ms === null || ms === undefined) return "-";

  const totalMs = Math.floor(ms);

  // Extract centiseconds (hundredths of a second: 0-99)
  const centiseconds = Math.floor((totalMs % 1000) / 10);

  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const cc = centiseconds.toString().padStart(2, '0');

  if (minutes > 0) {
    const s = seconds.toString().padStart(2, '0');
    return `${minutes}:${s}.${cc}`;
  }

  return `${seconds}.${cc}`;
}

/**
 * Calculate WCA average (remove best and worst, average middle 3)
 */
export function calculateWCAAverage(times: (number | null)[]): number | null {
  const validTimes = times.filter((t): t is number => t !== null && t > 0);

  if (validTimes.length < 3) return null;

  if (validTimes.length === 5) {
    const sorted = [...validTimes].sort((a, b) => a - b);
    const middle3 = sorted.slice(1, 4);
    return Math.round(middle3.reduce((a, b) => a + b, 0) / 3);
  }

  return Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
}

/**
 * Get best time from array
 */
export function getBestTime(times: (number | null)[]): number | null {
  const validTimes = times.filter((t): t is number => t !== null && t > 0);
  if (validTimes.length === 0) return null;
  return Math.min(...validTimes);
}
