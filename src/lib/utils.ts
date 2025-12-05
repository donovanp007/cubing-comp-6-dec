import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse time input and convert to milliseconds
 * Supports various input formats:
 * - "90" → 0.90 seconds → 900ms
 * - "1234" → 12.34 seconds → 12340ms
 * - "12345" → 1:23.45 → 83450ms
 * - "123456" → 12:34.56 → 754560ms
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

  // Existing raw number logic
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return 0;

  const num = parseInt(digits, 10);

  // 1-2 digits: centiseconds (90 → 0.90s → 900ms)
  if (digits.length <= 2) {
    return num * 10;
  }

  // 3-4 digits: seconds.centiseconds (1234 → 12.34s → 12340ms)
  if (digits.length <= 4) {
    return num * 10;
  }

  // 5 digits: could be m:ss.cc OR ss.mmm
  // Check if msscc format would give valid seconds (0-59)
  if (digits.length === 5) {
    const possibleSeconds = Math.floor((num % 10000) / 100);

    if (possibleSeconds <= 59) {
      // Valid m:ss.cc format (12345 → 1:23.45 → 83450ms)
      const centiseconds = num % 100;
      const seconds = possibleSeconds;
      const minutes = Math.floor(num / 10000);
      return (minutes * 60000) + (seconds * 1000) + (centiseconds * 10);
    } else {
      // Invalid as m:ss.cc, interpret as ss.mmm (27344 → 27.344 → 27344ms)
      const milliseconds = num % 1000;
      const seconds = Math.floor(num / 1000);
      return (seconds * 1000) + milliseconds;
    }
  }

  // 6+ digits: could be mm:ss.cc or m:ss.mmm
  // Check if mmsscc format would give valid seconds (0-59)
  const mmssccSeconds = Math.floor((num % 10000) / 100);

  if (digits.length === 6 && mmssccSeconds <= 59) {
    // Valid mmsscc format (12:34.56 → 754560ms)
    const centiseconds = num % 100;
    const seconds = mmssccSeconds;
    const minutes = Math.floor(num / 10000);
    return (minutes * 60000) + (seconds * 1000) + (centiseconds * 10);
  } else if (digits.length === 6) {
    // Invalid as mmsscc, interpret as m:ss.mmm with milliseconds (1:16.039 → 76039ms)
    const milliseconds = num % 1000;
    const seconds = Math.floor((num % 100000) / 1000);
    const minutes = Math.floor(num / 100000);
    return (minutes * 60000) + (seconds * 1000) + milliseconds;
  }

  // 7+ digits: mm:ss.mmm format
  const milliseconds = num % 1000;
  const seconds = Math.floor((num % 100000) / 1000);
  const minutes = Math.floor(num / 100000);
  return (minutes * 60000) + (seconds * 1000) + milliseconds;
}

/**
 * Format milliseconds to display time (e.g., "12.34" or "1:23.45")
 */
export function formatTime(ms: number | null): string {
  if (ms === null || ms === undefined) return "-";

  const totalCentiseconds = Math.floor(ms / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const cs = centiseconds.toString().padStart(2, '0');

  if (minutes > 0) {
    const s = seconds.toString().padStart(2, '0');
    return `${minutes}:${s}.${cs}`;
  }

  return `${seconds}.${cs}`;
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
