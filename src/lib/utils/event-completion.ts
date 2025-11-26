/**
 * Event completion and overall rankings transfer logic
 */

export const PLACEMENT_POINTS = {
  1: 10,
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
} as const;

export interface StudentFinalScore {
  student_id: string;
  best_time: number | null;
  average_time: number | null;
  is_dnf: boolean;
}

/**
 * Calculate points for each student based on placement
 */
export function calculatePlacementPoints(
  finalScores: StudentFinalScore[]
): Map<string, number> {
  const points = new Map<string, number>();

  // Sort by best/average time (WCA rules)
  const sorted = [...finalScores].sort((a, b) => {
    const aScore = a.average_time ?? a.best_time ?? Infinity;
    const bScore = b.average_time ?? b.best_time ?? Infinity;

    // DNF students go to the end
    if (a.is_dnf && !b.is_dnf) return 1;
    if (!a.is_dnf && b.is_dnf) return -1;
    if (a.is_dnf && b.is_dnf) return 0;

    return aScore - bScore;
  });

  // Assign points based on placement
  for (let i = 0; i < sorted.length; i++) {
    const placement = i + 1;
    const point =
      PLACEMENT_POINTS[placement as keyof typeof PLACEMENT_POINTS] || 0;
    points.set(sorted[i].student_id, point);
  }

  return points;
}

/**
 * Get ranking position from sorted scores
 */
export function getRankingPosition(
  studentId: string,
  scores: StudentFinalScore[]
): number {
  const sorted = [...scores].sort((a, b) => {
    const aScore = a.average_time ?? a.best_time ?? Infinity;
    const bScore = b.average_time ?? b.best_time ?? Infinity;

    if (a.is_dnf && !b.is_dnf) return 1;
    if (!a.is_dnf && b.is_dnf) return -1;
    if (a.is_dnf && b.is_dnf) return 0;

    return aScore - bScore;
  });

  return sorted.findIndex((s) => s.student_id === studentId) + 1;
}
