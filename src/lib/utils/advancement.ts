/**
 * Advancement Calculation Engine
 * Automatically determines which competitors advance based on round results
 */

export interface CompetitorResult {
  studentId: string;
  studentName: string;
  bestTime: number | null; // in milliseconds
  isDNF: boolean; // Did Not Finish
  isDNS: boolean; // Did Not Start
  roundRank?: number;
}

export interface AdvancementResult {
  advancing: CompetitorResult[];
  eliminated: CompetitorResult[];
  totalCompetitors: number;
  advancingCount: number;
  eliminatedCount: number;
  cutoffApplied: string; // Description of cutoff
}

export interface RoundConfig {
  advancementType: "percentage" | "count" | "time" | "all";
  cutoffPercentage?: number; // 50, 75, etc.
  cutoffCount?: number; // Top 8, Top 16, etc.
  cutoffTime?: number; // milliseconds
  isFinalsRound?: boolean;
  finalsSize?: number; // 8, 12, etc.
}

/**
 * Sort competitors by time (fastest first)
 * DNF/DNS go to the bottom
 */
function sortByTime(competitors: CompetitorResult[]): CompetitorResult[] {
  return competitors.sort((a, b) => {
    // Both have valid times - sort by time
    if (!a.isDNF && !a.isDNS && !b.isDNF && !b.isDNS) {
      return (a.bestTime || Infinity) - (b.bestTime || Infinity);
    }

    // One has DNF/DNS - valid time goes first
    if ((a.isDNF || a.isDNS) && !(b.isDNF || b.isDNS)) {
      return 1; // a goes after b
    }
    if (!(a.isDNF || a.isDNS) && (b.isDNF || b.isDNS)) {
      return -1; // a goes before b
    }

    // Both are DNF/DNS or neither - keep order
    return 0;
  });
}

/**
 * Calculate advancement using percentage-based cutoff
 * Example: Top 75% advance
 */
export function advanceByPercentage(
  competitors: CompetitorResult[],
  percentage: number
): AdvancementResult {
  const sorted = sortByTime(competitors);
  const totalWithValidTimes = sorted.filter((c) => !c.isDNF && !c.isDNS).length;
  const advanceCount = Math.ceil((totalWithValidTimes * percentage) / 100);

  const advancing = sorted.slice(0, advanceCount);
  const eliminated = sorted.slice(advanceCount);

  return {
    advancing,
    eliminated,
    totalCompetitors: competitors.length,
    advancingCount: advancing.length,
    eliminatedCount: eliminated.length,
    cutoffApplied: `Top ${percentage}% (${advancing.length} competitors)`,
  };
}

/**
 * Calculate advancement using count-based cutoff
 * Example: Top 8 competitors advance
 */
export function advanceByCount(
  competitors: CompetitorResult[],
  topCount: number
): AdvancementResult {
  const sorted = sortByTime(competitors);
  const advancing = sorted.slice(0, topCount);
  const eliminated = sorted.slice(topCount);

  return {
    advancing,
    eliminated,
    totalCompetitors: competitors.length,
    advancingCount: advancing.length,
    eliminatedCount: eliminated.length,
    cutoffApplied: `Top ${topCount} competitors`,
  };
}

/**
 * Calculate advancement using time-based cutoff
 * Example: Everyone under 30 seconds advances
 */
export function advanceByTime(
  competitors: CompetitorResult[],
  timeCutoffMs: number
): AdvancementResult {
  const sorted = sortByTime(competitors);
  const advancing = sorted.filter(
    (c) => (c.bestTime || Infinity) <= timeCutoffMs
  );
  const eliminated = sorted.filter(
    (c) => (c.bestTime || Infinity) > timeCutoffMs
  );

  // Convert milliseconds to seconds for display
  const cutoffSeconds = (timeCutoffMs / 1000).toFixed(2);

  return {
    advancing,
    eliminated,
    totalCompetitors: competitors.length,
    advancingCount: advancing.length,
    eliminatedCount: eliminated.length,
    cutoffApplied: `Under ${cutoffSeconds}s`,
  };
}

/**
 * Calculate advancement: everyone advances
 * (Typically for qualification/first round)
 */
export function advanceAll(
  competitors: CompetitorResult[]
): AdvancementResult {
  const sorted = sortByTime(competitors);

  return {
    advancing: sorted,
    eliminated: [],
    totalCompetitors: competitors.length,
    advancingCount: competitors.length,
    eliminatedCount: 0,
    cutoffApplied: "Everyone advances (Qualification Round)",
  };
}

/**
 * Main advancement calculator
 * Determines advancement based on round configuration
 */
export function calculateAdvancement(
  competitors: CompetitorResult[],
  config: RoundConfig
): AdvancementResult {
  switch (config.advancementType) {
    case "percentage":
      if (!config.cutoffPercentage) {
        throw new Error("Percentage cutoff not specified");
      }
      return advanceByPercentage(competitors, config.cutoffPercentage);

    case "count":
      if (!config.cutoffCount) {
        throw new Error("Count cutoff not specified");
      }
      return advanceByCount(competitors, config.cutoffCount);

    case "time":
      if (!config.cutoffTime) {
        throw new Error("Time cutoff not specified");
      }
      return advanceByTime(competitors, config.cutoffTime);

    case "all":
      return advanceAll(competitors);

    default:
      throw new Error(`Unknown advancement type: ${config.advancementType}`);
  }
}

/**
 * Generate finals from top competitors
 * Called after last qualifying round
 */
export function generateFinals(
  competitors: CompetitorResult[],
  finalsSize: number = 8
): CompetitorResult[] {
  const sorted = sortByTime(competitors);

  // Add finals status to top competitors
  const finalists = sorted.slice(0, finalsSize).map((c) => ({
    ...c,
    status: "finalist" as const,
  }));

  return finalists;
}

/**
 * Determine medalists and champion
 * Assumes competitors are sorted by time
 */
export interface MedalResult {
  champion: CompetitorResult; // 🥇 Gold
  runnerUp: CompetitorResult; // 🥈 Silver
  thirdPlace: CompetitorResult; // 🥉 Bronze
  finalists: CompetitorResult[]; // 4th-8th place
}

export function determineMedalists(
  competitors: CompetitorResult[]
): MedalResult | null {
  const sorted = sortByTime(competitors);

  if (sorted.length < 3) {
    return null; // Need at least 3 competitors for medals
  }

  return {
    champion: sorted[0],
    runnerUp: sorted[1],
    thirdPlace: sorted[2],
    finalists: sorted.slice(3),
  };
}

/**
 * Format time for display
 * Convert milliseconds to seconds
 */
export function formatTime(milliseconds: number | null): string {
  if (milliseconds === null || milliseconds === undefined) {
    return "N/A";
  }
  return (milliseconds / 1000).toFixed(2) + "s";
}

/**
 * Check if advancement will be automatic
 * (Percentage or count based on valid times)
 */
export function isAutomaticAdvancement(
  config: RoundConfig
): boolean {
  return config.advancementType === "percentage" || config.advancementType === "count";
}

/**
 * Generate advancement report
 * Useful for displaying to coaches/organizers
 */
export interface AdvancementReport {
  roundName: string;
  totalParticipants: number;
  participantsWithTimes: number;
  advancingCount: number;
  eliminatedCount: number;
  cutoffDescription: string;
  fastestTime: string;
  slowestAdvancingTime: string;
  advancingCompetitors: Array<{
    rank: number;
    name: string;
    time: string;
    status: "advancing" | "eliminated" | "finalist";
  }>;
}

export function generateAdvancementReport(
  roundName: string,
  result: AdvancementResult
): AdvancementReport {
  const advancing = result.advancing.map((c, idx) => ({
    rank: idx + 1,
    name: c.studentName,
    time: formatTime(c.bestTime),
    status: "advancing" as const,
  }));

  const eliminated = result.eliminated.map((c, idx) => ({
    rank: result.advancingCount + idx + 1,
    name: c.studentName,
    time: formatTime(c.bestTime),
    status: "eliminated" as const,
  }));

  const all = [...advancing, ...eliminated];
  const participantsWithTimes = result.advancing.filter(
    (c) => !c.isDNF && !c.isDNS
  ).length;

  return {
    roundName,
    totalParticipants: result.totalCompetitors,
    participantsWithTimes,
    advancingCount: result.advancingCount,
    eliminatedCount: result.eliminatedCount,
    cutoffDescription: result.cutoffApplied,
    fastestTime: formatTime(result.advancing[0]?.bestTime || null),
    slowestAdvancingTime: formatTime(
      result.advancing[result.advancing.length - 1]?.bestTime || null
    ),
    advancingCompetitors: all,
  };
}

/**
 * Calculate advancement statistics
 * Useful for analytics/reporting
 */
export interface AdvancementStats {
  averageTime: number;
  medianTime: number;
  minTime: number;
  maxTime: number;
  dnfCount: number;
  dnsCount: number;
  percentageAdvancing: number;
}

export function calculateAdvancementStats(
  result: AdvancementResult
): AdvancementStats {
  const allTimes = [
    ...result.advancing,
    ...result.eliminated,
  ]
    .filter((c) => !c.isDNF && !c.isDNS && c.bestTime !== null)
    .map((c) => c.bestTime as number)
    .sort((a, b) => a - b);

  const dnfCount = result.advancing.filter((c) => c.isDNF).length +
    result.eliminated.filter((c) => c.isDNF).length;
  const dnsCount = result.advancing.filter((c) => c.isDNS).length +
    result.eliminated.filter((c) => c.isDNS).length;

  const averageTime =
    allTimes.length > 0
      ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length
      : 0;
  const medianTime =
    allTimes.length > 0
      ? allTimes[Math.floor(allTimes.length / 2)]
      : 0;

  return {
    averageTime,
    medianTime,
    minTime: allTimes[0] || 0,
    maxTime: allTimes[allTimes.length - 1] || 0,
    dnfCount,
    dnsCount,
    percentageAdvancing:
      (result.advancingCount / result.totalCompetitors) * 100,
  };
}
