import { createClient } from "@/lib/supabase/client";

interface AwardBadgeResult {
  badgeId: string;
  badgeName: string;
  icon: string;
  points: number;
}

/**
 * Check and award badges based on a student's performance
 */
export async function checkAndAwardBadges(
  studentId: string,
  weeklyCompetitionId: string,
  ranking: number | null,
  bestTime: number | null,
  averageTime: number | null
): Promise<AwardBadgeResult[]> {
  const supabase = createClient();
  const awardedBadges: AwardBadgeResult[] = [];

  // Get all badges
  const { data: badges } = await supabase.from("badges").select("*");
  if (!badges) return awardedBadges;

  // Get student's existing achievements
  const { data: existingAchievements } = await supabase
    .from("student_achievements")
    .select("badge_id")
    .eq("student_id", studentId);

  const earnedBadgeIds = new Set(existingAchievements?.map((a) => a.badge_id) || []);

  // Get student's competition count
  const { count: totalComps } = await supabase
    .from("weekly_results")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId);

  // Get student's stats
  const { data: allResults } = await supabase
    .from("weekly_results")
    .select("ranking, best_time, is_pb")
    .eq("student_id", studentId);

  const podiumFinishes = allResults?.filter((r) => r.ranking && r.ranking <= 3).length || 0;
  const firstPlaces = allResults?.filter((r) => r.ranking === 1).length || 0;
  const pbCount = allResults?.filter((r) => r.is_pb).length || 0;

  // Get streak info
  const { data: streaks } = await supabase
    .from("student_streaks")
    .select("*")
    .eq("student_id", studentId);

  const participationStreak = streaks?.find((s) => s.streak_type === "participation")?.current_streak || 0;

  // Check each badge
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue; // Already has badge

    let shouldAward = false;

    switch (badge.requirement_type) {
      case "total_competitions":
        shouldAward = (totalComps || 0) >= badge.requirement_value;
        break;
      case "participation_streak":
        shouldAward = participationStreak >= badge.requirement_value;
        break;
      case "podium_finishes":
        shouldAward = podiumFinishes >= badge.requirement_value;
        break;
      case "first_places":
        shouldAward = firstPlaces >= badge.requirement_value;
        break;
      case "personal_bests":
        shouldAward = pbCount >= badge.requirement_value;
        break;
      case "sub_30":
        shouldAward = bestTime !== null && bestTime < 30000;
        break;
      case "sub_20":
        shouldAward = bestTime !== null && bestTime < 20000;
        break;
      case "sub_15":
        shouldAward = bestTime !== null && bestTime < 15000;
        break;
    }

    if (shouldAward) {
      const { error } = await supabase.from("student_achievements").insert({
        student_id: studentId,
        badge_id: badge.id,
        weekly_competition_id: weeklyCompetitionId,
      });

      if (!error) {
        awardedBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          icon: badge.icon,
          points: badge.points,
        });
      }
    }
  }

  return awardedBadges;
}

/**
 * Update student streaks after a competition
 */
export async function updateStudentStreaks(
  studentId: string,
  ranking: number | null
): Promise<void> {
  const supabase = createClient();

  // Update participation streak
  await upsertStreak(supabase, studentId, "participation", true);

  // Update podium streak (top 3)
  if (ranking && ranking <= 3) {
    await upsertStreak(supabase, studentId, "podium", true);
  } else {
    await upsertStreak(supabase, studentId, "podium", false);
  }

  // Update win streak (1st place)
  if (ranking === 1) {
    await upsertStreak(supabase, studentId, "win", true);
  } else {
    await upsertStreak(supabase, studentId, "win", false);
  }
}

async function upsertStreak(
  supabase: ReturnType<typeof createClient>,
  studentId: string,
  streakType: string,
  increment: boolean
): Promise<void> {
  const { data: existing } = await supabase
    .from("student_streaks")
    .select("*")
    .eq("student_id", studentId)
    .eq("streak_type", streakType)
    .single();

  if (existing) {
    const newStreak = increment ? existing.current_streak + 1 : 0;
    const newBest = Math.max(existing.best_streak, newStreak);

    await supabase
      .from("student_streaks")
      .update({
        current_streak: newStreak,
        best_streak: newBest,
        last_updated: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else if (increment) {
    await supabase.from("student_streaks").insert({
      student_id: studentId,
      streak_type: streakType,
      current_streak: 1,
      best_streak: 1,
    });
  }
}

/**
 * Check if current result is a personal best
 */
export async function checkPersonalBest(
  studentId: string,
  eventTypeId: string,
  bestTime: number | null,
  averageTime: number | null
): Promise<{ isPB: boolean; previousBest: number | null }> {
  if (!bestTime) return { isPB: false, previousBest: null };

  const supabase = createClient();

  // Get previous best for this event
  const { data: previousResults } = await supabase
    .from("weekly_results")
    .select("best_time, weekly_competitions!inner(event_type_id)")
    .eq("student_id", studentId)
    .eq("weekly_competitions.event_type_id", eventTypeId)
    .order("best_time", { ascending: true })
    .limit(1);

  const previousBest = previousResults?.[0]?.best_time || null;
  const isPB = previousBest === null || bestTime < previousBest;

  return { isPB, previousBest };
}

/**
 * Calculate week-over-week improvement
 */
export async function calculateImprovement(
  studentId: string,
  eventTypeId: string,
  currentAverage: number | null
): Promise<number | null> {
  if (!currentAverage) return null;

  const supabase = createClient();

  // Get previous week's result for same event
  const { data: previousResults } = await supabase
    .from("weekly_results")
    .select("average_time, weekly_competitions!inner(event_type_id, week_number)")
    .eq("student_id", studentId)
    .eq("weekly_competitions.event_type_id", eventTypeId)
    .order("created_at", { ascending: false })
    .limit(2);

  // We need at least 2 results (current + previous)
  if (!previousResults || previousResults.length < 2) return null;

  const previousAverage = previousResults[1]?.average_time;
  if (!previousAverage) return null;

  // Calculate improvement percentage (positive = faster)
  const improvement = ((previousAverage - currentAverage) / previousAverage) * 100;
  return Math.round(improvement * 100) / 100; // Round to 2 decimal places
}
