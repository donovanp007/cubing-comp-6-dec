/**
 * Competition Rankings and Scoring Utilities
 * Implements WCA (World Cube Association) style scoring for cubing competitions
 */

export interface StudentResult {
  studentId: string;
  studentName: string;
  attempts: (number | null)[]; // Array of 5 attempts in milliseconds (null = DNF)
  dnfs: boolean[]; // Array of 5 DNF flags
}

export interface RankedResult {
  rank: number;
  studentId: string;
  studentName: string;
  bestTime: number | null;
  averageTime: number | null; // Average of 5 (or average of available if < 5)
  attempts: (number | null)[];
  dnfCount: number;
  attemptsCompleted: number;
}

/**
 * Calculate best single time from an array of attempts
 * Ignores DNFs and null values
 */
export function calculateBestTime(attempts: (number | null)[], dnfs: boolean[]): number | null {
  const validTimes = attempts.filter((time, i) => time !== null && !dnfs[i]);
  if (validTimes.length === 0) return null;
  return Math.min(...(validTimes as number[]));
}

/**
 * Calculate WCA average (Ao5)
 * Removes best and worst times, averages middle 3
 * Returns null if fewer than 3 valid attempts
 */
export function calculateWCAAverage(attempts: (number | null)[], dnfs: boolean[]): number | null {
  const validTimes = attempts
    .map((time, i) => (!dnfs[i] && time !== null ? time : null))
    .filter((time): time is number => time !== null);

  if (validTimes.length < 3) return null;

  if (validTimes.length === 5) {
    // Remove best and worst
    const sorted = [...validTimes].sort((a, b) => a - b);
    const middle3 = sorted.slice(1, 4);
    return Math.round(middle3.reduce((a, b) => a + b, 0) / 3);
  }

  // If fewer than 5, just average what we have
  return Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
}

/**
 * Generate ranked leaderboard from results
 * Sorts by:
 1. Best time (lower is better)
 2. If best times equal, by average time
 3. If both equal, by attempts completed (more is better)
 */
export function rankResults(results: StudentResult[]): RankedResult[] {
  const ranked = results.map((result) => {
    const bestTime = calculateBestTime(result.attempts, result.dnfs);
    const averageTime = calculateWCAAverage(result.attempts, result.dnfs);
    const dnfCount = result.dnfs.filter(Boolean).length;
    const attemptsCompleted = result.attempts.filter((a) => a !== null || a !== undefined).length;

    return {
      rank: 0, // Will be set after sorting
      studentId: result.studentId,
      studentName: result.studentName,
      bestTime,
      averageTime,
      attempts: result.attempts,
      dnfCount,
      attemptsCompleted,
    };
  });

  // Sort by best time, then average, then attempts completed
  ranked.sort((a, b) => {
    // Students with no valid times go to bottom
    if (a.bestTime === null && b.bestTime === null) return 0;
    if (a.bestTime === null) return 1;
    if (b.bestTime === null) return -1;

    // Compare best times
    if (a.bestTime !== b.bestTime) {
      return a.bestTime - b.bestTime;
    }

    // If best times equal, compare averages
    if (a.averageTime === null && b.averageTime === null) return 0;
    if (a.averageTime === null) return 1;
    if (b.averageTime === null) return -1;

    if (a.averageTime !== b.averageTime) {
      return a.averageTime - b.averageTime;
    }

    // If both equal, by attempts completed (more is better)
    return b.attemptsCompleted - a.attemptsCompleted;
  });

  // Assign rankings (handle ties)
  let currentRank = 1;
  let prevBestTime = -1;
  let prevAvgTime = -1;

  return ranked.map((result, index) => {
    // If same best and average times as previous, keep same rank
    if (result.bestTime === prevBestTime && result.averageTime === prevAvgTime) {
      result.rank = currentRank;
    } else {
      currentRank = index + 1;
      result.rank = currentRank;
      prevBestTime = result.bestTime || -1;
      prevAvgTime = result.averageTime || -1;
    }

    return result;
  });
}

/**
 * Get group leaderboard (multiple groups)
 * Returns ranked results per group
 */
export function rankByGroups(
  results: StudentResult[],
  groupAssignments: Map<string, string> // Map<studentId, groupId>
): Map<string, RankedResult[]> {
  const groupedResults = new Map<string, StudentResult[]>();

  // Group results by group ID
  results.forEach((result) => {
    const groupId = groupAssignments.get(result.studentId);
    if (groupId) {
      if (!groupedResults.has(groupId)) {
        groupedResults.set(groupId, []);
      }
      groupedResults.get(groupId)!.push(result);
    }
  });

  // Rank within each group
  const groupedRankings = new Map<string, RankedResult[]>();
  groupedResults.forEach((groupResults, groupId) => {
    groupedRankings.set(groupId, rankResults(groupResults));
  });

  return groupedRankings;
}

/**
 * Get overall leaderboard across all groups
 */
export function getOverallLeaderboard(
  results: StudentResult[],
  groupAssignments: Map<string, string>
): RankedResult[] {
  return rankResults(results);
}

/**
 * Calculate head-to-head stats between two students
 */
export function getHeadToHead(result1: RankedResult, result2: RankedResult) {
  const times1 = result1.attempts.filter((t): t is number => t !== null);
  const times2 = result2.attempts.filter((t): t is number => t !== null);

  let wins1 = 0;
  let wins2 = 0;

  // Compare each attempt
  Math.min(times1.length, times2.length) && times1.forEach((time1, i) => {
    if (times2[i]) {
      if (time1 < times2[i]) wins1++;
      else if (time1 > times2[i]) wins2++;
    }
  });

  return { wins1, wins2, matchups: Math.min(times1.length, times2.length) };
}

/**
 * Export results as CSV format
 */
export function exportResultsCSV(ranked: RankedResult[], eventName: string, roundName: string): string {
  const headers = ["Rank", "Name", "Best Time", "Average Time", "Attempts Completed", "DNFs"];
  const rows = ranked.map((r) => [
    r.rank,
    r.studentName,
    r.bestTime ? (r.bestTime / 1000).toFixed(2) : "DNF",
    r.averageTime ? (r.averageTime / 1000).toFixed(2) : "N/A",
    r.attemptsCompleted,
    r.dnfCount,
  ]);

  const csv = [
    `${eventName} - ${roundName}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csv;
}

/**
 * Validate that results have required data for leaderboard
 */
export function validateResultsForLeaderboard(results: StudentResult[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (results.length === 0) {
    errors.push("No results to rank");
    return { valid: false, errors };
  }

  results.forEach((result) => {
    if (!result.studentId || !result.studentName) {
      errors.push(`Missing student ID or name for result`);
    }
    if (result.attempts.length !== 5) {
      errors.push(`Student ${result.studentName}: Expected 5 attempts, got ${result.attempts.length}`);
    }
    if (result.dnfs.length !== 5) {
      errors.push(`Student ${result.studentName}: Expected 5 DNF flags, got ${result.dnfs.length}`);
    }
  });

  return { valid: errors.length === 0, errors };
}
