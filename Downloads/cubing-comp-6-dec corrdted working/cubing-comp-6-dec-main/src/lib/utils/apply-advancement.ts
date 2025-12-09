/**
 * Apply Advancement to Database
 * Takes advancement results and updates the database with advancement status
 * INTEGRATED WITH TIER-BASED SCHOOL LEAGUE POINT SYSTEM
 */

import { createClient } from "@/lib/supabase/client";
import {
  AdvancementResult,
  CompetitorResult,
  determineMedalists,
  MedalResult,
} from "./advancement";

// Import tier points system
import { calculatePointsForRound, calculateSchoolMomentumBonus } from "./tier-points";
import { recordPointTransactions, recordSchoolMomentumBonus } from "./record-points";
import { updateAllSchoolStandingsForCompetition } from "./aggregate-school-standings";
import { evaluateAndAwardBadges } from "./badge-evaluator";

interface RoundConfig {
  advancementType: "percentage" | "count" | "time" | "all";
  cutoffPercentage?: number;
  cutoffCount?: number;
  cutoffTime?: number;
  finalsSize?: number;
}

export interface AdvancementApplicationResult {
  success: boolean;
  advancingCount: number;
  eliminatedCount: number;
  medalists?: MedalResult;
  error?: string;
}

/**
 * Apply advancement results to database
 * Updates final_scores table with advancement status
 */
export async function applyAdvancementToDatabase(
  roundId: string,
  advancementResult: AdvancementResult,
  isFinalsRound: boolean = false
): Promise<AdvancementApplicationResult> {
  try {
    const supabase = createClient();

    // Determine advancement statuses based on results
    const updates: Array<{
      student_id: string;
      round_id: string;
      advancement_status: string;
    }> = [];

    // Mark advancing students
    advancementResult.advancing.forEach((competitor) => {
      updates.push({
        student_id: competitor.studentId,
        round_id: roundId,
        advancement_status: isFinalsRound ? "finalist" : "advancing",
      });
    });

    // Mark eliminated students (unless it's finals)
    if (!isFinalsRound) {
      advancementResult.eliminated.forEach((competitor) => {
        updates.push({
          student_id: competitor.studentId,
          round_id: roundId,
          advancement_status: "eliminated",
        });
      });
    }

    // If this is finals round, determine medalists
    if (isFinalsRound) {
      const medals = determineMedalists(advancementResult.advancing);
      if (medals) {
        // Update champion
        const championUpdate = updates.find(
          (u) => u.student_id === medals.champion.studentId
        );
        if (championUpdate) {
          championUpdate.advancement_status = "champion";
        }

        // Update runner-up
        const runnerUpUpdate = updates.find(
          (u) => u.student_id === medals.runnerUp.studentId
        );
        if (runnerUpUpdate) {
          runnerUpUpdate.advancement_status = "runner_up";
        }

        // Update 3rd place
        const thirdPlaceUpdate = updates.find(
          (u) => u.student_id === medals.thirdPlace.studentId
        );
        if (thirdPlaceUpdate) {
          thirdPlaceUpdate.advancement_status = "third_place";
        }
      }
    }

    // Apply updates to database
    // Try to update final_scores with advancement status
    // If column doesn't exist, silently skip (migration may not have been applied yet)

    if (updates.length > 0) {
      try {
        const updatePromises = updates.map((update) =>
          supabase
            .from("final_scores")
            .update({ advancement_status: update.advancement_status })
            .eq("student_id", update.student_id)
            .eq("round_id", update.round_id)
        );

        const results = await Promise.all(updatePromises);

        // Log any actual errors but don't fail
        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
          console.warn(`Note: ${errors.length} advancement status updates failed - column may not exist. Run APPLY_ALL_MISSING_MIGRATIONS.sql in Supabase.`);
        }
      } catch (err) {
        // Silently handle errors - advancement status column might not exist yet
        console.warn(`Could not update advancement status:`, err instanceof Error ? err.message : String(err));
      }
    }

    const medalists = isFinalsRound ? determineMedalists(advancementResult.advancing) : undefined;

    return {
      success: true,
      advancingCount: advancementResult.advancingCount,
      eliminatedCount: advancementResult.eliminatedCount,
      medalists: medalists ?? undefined,
    };
  } catch (error) {
    console.error("Error applying advancement:", error);
    return {
      success: false,
      advancingCount: 0,
      eliminatedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Complete a round and calculate advancement
 * This is the main function called when coach clicks "Complete Event"
 */
export async function completeRoundAndCalculateAdvancement(
  roundId: string,
  competitionEventId: string,
  roundConfig: RoundConfig,
  isFinalsRound: boolean = false
): Promise<AdvancementApplicationResult> {
  try {
    const supabase = createClient();

    // Fetch all final scores for this round
    const { data: finalScores, error: scoresError } = await supabase
      .from("final_scores")
      .select("student_id, best_time_milliseconds")
      .eq("round_id", roundId);

    if (scoresError || !finalScores) {
      throw new Error("Failed to fetch round scores");
    }

    // Fetch student names separately
    const studentIds = finalScores.map(fs => fs.student_id);
    const { data: students } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    const studentMap = new Map(
      (students || []).map(s => [s.id, `${s.first_name} ${s.last_name}`])
    );

    // Fetch results to get DNF status
    const { data: results } = await supabase
      .from("results")
      .select("student_id, is_dnf")
      .eq("round_id", roundId);

    const dnfMap = new Map();
    (results || []).forEach(r => {
      if (r.is_dnf) {
        dnfMap.set(r.student_id, true);
      }
    });

    // Convert to CompetitorResult format
    const competitors: CompetitorResult[] = finalScores.map((score: any) => ({
      studentId: score.student_id,
      studentName: studentMap.get(score.student_id) || "Unknown",
      bestTime: score.best_time_milliseconds,
      isDNF: dnfMap.get(score.student_id) || false,
      isDNS: false, // Could be enhanced to track DNS separately
    }));

    // Import the advancement function dynamically
    const {
      calculateAdvancement,
    } = await import("./advancement");

    // Calculate advancement based on round config
    const advancementResult = calculateAdvancement(competitors, {
      advancementType: roundConfig.advancementType,
      cutoffPercentage: roundConfig.cutoffPercentage,
      cutoffCount: roundConfig.cutoffCount,
      cutoffTime: roundConfig.cutoffTime,
    });

    // Apply to database
    const applicationResult = await applyAdvancementToDatabase(
      roundId,
      advancementResult,
      isFinalsRound
    );

    // CRITICAL: Manually populate student_competition_history for rankings page
    if (applicationResult.success) {
      try {
        console.log("🔹 Populating student_competition_history for rankings...");

        // Get competition ID and event type from the round
        const { data: roundData } = await supabase
          .from("rounds")
          .select("competition_event_id, competition_events(competition_id, event_type_id)")
          .eq("id", roundId)
          .single();

        if (roundData) {
          const competitionId = (roundData as any).competition_events.competition_id;
          const eventTypeId = (roundData as any).competition_events.event_type_id;

          // For each final score, update student_competition_history
          for (const score of finalScores) {
            await supabase
              .from("student_competition_history")
              .upsert({
                student_id: score.student_id,
                competition_id: competitionId,
                event_type_id: eventTypeId,
                best_single_milliseconds: score.best_time_milliseconds,
                best_average_milliseconds: score.best_time_milliseconds,
                is_pb_single: false,
                is_pb_average: false,
                is_record_single: false,
                is_record_average: false,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: "student_id,competition_id,event_type_id"
              });
          }

          console.log(`✅ Updated student_competition_history for ${finalScores.length} students`);
        }
      } catch (err) {
        console.warn("Could not update student_competition_history:", err instanceof Error ? err.message : String(err));
      }
    }

    // NEW: Calculate and record tier-based points
    if (applicationResult.success) {
      try {
        console.log("🔹 Calculating tier-based points for round...");

        // Get competition ID from the round
        const { data: roundData, error: roundError } = await supabase
          .from("rounds")
          .select("competition_event_id, competition_events(competition_id)")
          .eq("id", roundId)
          .single();

        if (roundError || !roundData) {
          console.error("Error fetching competition ID:", roundError);
          return applicationResult;
        }

        const competitionId = (roundData as any).competition_events.competition_id;

        // Calculate points for all students in this round
        const pointCalculations = await calculatePointsForRound(roundId);
        console.log(`✅ Calculated points for ${pointCalculations.length} students`);

        // Record point transactions
        let totalRecorded = 0;
        for (const calculation of pointCalculations) {
          const recorded = await recordPointTransactions(calculation);
          totalRecorded += recorded.length;
        }
        console.log(`✅ Recorded ${totalRecorded} point transactions`);

        // Calculate and record school momentum bonuses
        const schools = new Set(pointCalculations.map(c => c.schoolId));
        for (const schoolId of schools) {
          const bonusAmount = await calculateSchoolMomentumBonus(roundId, schoolId);
          if (bonusAmount > 0) {
            await recordSchoolMomentumBonus(
              competitionId,
              competitionEventId,
              roundId,
              schoolId,
              bonusAmount
            );
            console.log(`✅ School momentum bonus recorded: +${bonusAmount} for school ${schoolId}`);
          }
        }

        // Update all school standings for the competition
        const standingsUpdated = await updateAllSchoolStandingsForCompetition(competitionId);
        if (standingsUpdated) {
          console.log("✅ School standings updated");
        }

        // Evaluate and award badges
        const badgesAwarded = await evaluateAndAwardBadges(competitionId);
        console.log(`✅ Badges awarded: ${badgesAwarded}`);

        console.log("🎯 Point system integration complete!");
      } catch (error) {
        // Log error but don't fail the advancement - points are secondary
        console.error("⚠️  Error in point calculation:", error);
      }
    }

    return applicationResult;
  } catch (error) {
    console.error("Error completing round:", error);
    return {
      success: false,
      advancingCount: 0,
      eliminatedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch advancing students for next round
 * Returns only students marked as "advancing" for display in next round
 */
export async function fetchAdvancingStudents(
  roundId: string
): Promise<string[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("final_scores")
      .select("student_id")
      .eq("round_id", roundId)
      .eq("advancement_status", "advancing");

    if (error) {
      throw error;
    }

    return data?.map((d: any) => d.student_id) || [];
  } catch (error) {
    console.error("Error fetching advancing students:", error);
    return [];
  }
}

/**
 * Get advancement summary for a round
 * Used for displaying results to coach
 */
export async function getAdvancementSummary(
  roundId: string
): Promise<{
  advancing: Array<{ studentId: string; name: string; bestTime: number }>;
  eliminated: Array<{ studentId: string; name: string; bestTime: number }>;
  medalists?: {
    champion: string;
    runnerUp: string;
    thirdPlace: string;
  };
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("final_scores")
      .select("student_id, students(name), best_time_milliseconds, advancement_status")
      .eq("round_id", roundId)
      .order("best_time_milliseconds");

    if (error || !data) {
      throw error;
    }

    const advancing: any[] = [];
    const eliminated: any[] = [];
    const medalists: any = {};

    data.forEach((record: any) => {
      const entry = {
        studentId: record.student_id,
        name: record.students?.name || "Unknown",
        bestTime: record.best_time_milliseconds,
      };

      switch (record.advancement_status) {
        case "champion":
          medalists.champion = entry.name;
          advancing.push(entry);
          break;
        case "runner_up":
          medalists.runnerUp = entry.name;
          advancing.push(entry);
          break;
        case "third_place":
          medalists.thirdPlace = entry.name;
          advancing.push(entry);
          break;
        case "advancing":
          advancing.push(entry);
          break;
        case "eliminated":
          eliminated.push(entry);
          break;
      }
    });

    return {
      advancing,
      eliminated,
      medalists: Object.keys(medalists).length > 0 ? medalists : undefined,
    };
  } catch (error) {
    console.error("Error fetching advancement summary:", error);
    return { advancing: [], eliminated: [] };
  }
}
