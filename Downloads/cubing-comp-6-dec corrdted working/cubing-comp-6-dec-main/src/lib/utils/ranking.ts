/**
 * WCA-compliant ranking calculations
 */

export interface RankingResult {
  bestTime: number | null;
  averageTime: number | null;
  isDNF: boolean;
  times: (number | null)[];
}

/**
 * Calculate WCA-compliant ranking based on event format
 * @param times Array of times in milliseconds (null for DNF)
 * @param format Format like "Best of 3", "Average of 5", etc.
 * @returns Ranking result with best, average, and DNF status
 */
export function calculateRanking(
  times: (number | null)[],
  format: string
): RankingResult {
  const validTimes = times.filter((t) => t !== null) as number[];
  const dnfCount = times.filter((t) => t === null).length;

  // If all are DNF, it's a DNF
  if (validTimes.length === 0) {
    return {
      bestTime: null,
      averageTime: null,
      isDNF: true,
      times,
    };
  }

  const bestTime = Math.min(...validTimes);

  // Parse format string (e.g., "Best of 5", "Average of 5")
  const formatLower = format.toLowerCase();
  let averageTime: number | null = null;

  if (formatLower.includes("best")) {
    // For "Best of X" - just use the best time
    averageTime = bestTime;
  } else if (formatLower.includes("average")) {
    // For "Average of X" - remove best and worst, average the rest
    // Standard WCA: remove 1 best and 1 worst from 5 attempts
    if (times.length >= 3 && dnfCount === 0) {
      const sortedTimes = validTimes.sort((a, b) => a - b);
      // Remove best (first) and worst (last)
      const middleTimes = sortedTimes.slice(1, -1);
      averageTime =
        middleTimes.reduce((a, b) => a + b, 0) / middleTimes.length;
    } else if (dnfCount === 1) {
      // If exactly 1 DNF, it's still a DNF for average purposes
      averageTime = null;
    } else if (dnfCount > 1) {
      // If more than 1 DNF, entire average is DNF
      averageTime = null;
    }
  }

  return {
    bestTime,
    averageTime,
    isDNF: dnfCount > 0,
    times,
  };
}

/**
 * Rank students by their scores
 * @param results Array of ranking results with student IDs
 * @returns Array of students sorted by ranking
 */
export function rankStudents(
  results: Array<{ studentId: string; result: RankingResult }>
) {
  return results.sort((a, b) => {
    const aScore = a.result.averageTime ?? a.result.bestTime ?? Infinity;
    const bScore = b.result.averageTime ?? b.result.bestTime ?? Infinity;

    // DNF students go to the end
    if (a.result.isDNF && !b.result.isDNF) return 1;
    if (!a.result.isDNF && b.result.isDNF) return -1;
    if (a.result.isDNF && b.result.isDNF) return 0;

    return aScore - bScore;
  });
}

/**
 * Calculate ranking position (1st, 2nd, 3rd, etc.)
 * Takes into account ties
 */
export function calculateRankingPositions(
  results: Array<{ studentId: string; result: RankingResult }>
) {
  const ranked = rankStudents(results);
  const positions = new Map<string, number>();
  let currentPosition = 1;

  for (let i = 0; i < ranked.length; i++) {
    positions.set(ranked[i].studentId, currentPosition);
    // If next result is different, increment position
    if (i < ranked.length - 1) {
      const currentScore =
        ranked[i].result.averageTime ??
        ranked[i].result.bestTime ??
        Infinity;
      const nextScore =
        ranked[i + 1].result.averageTime ??
        ranked[i + 1].result.bestTime ??
        Infinity;
      if (currentScore !== nextScore) {
        currentPosition = i + 2;
      }
    }
  }

  return positions;
}
