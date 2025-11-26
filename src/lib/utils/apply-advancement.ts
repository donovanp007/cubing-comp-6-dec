/**
 * Apply Advancement to Database
 * Takes advancement results and updates the database with advancement status
 */

import { createClient } from "@/lib/supabase/client";
import {
  AdvancementResult,
  CompetitorResult,
  determineMedalists,
  MedalResult,
} from "./advancement";

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
    // We need to update final_scores table with upsert
    // Since the records should already exist from updateStudentRanking

    const updatePromises = updates.map((update) =>
      supabase
        .from("final_scores")
        .update({ advancement_status: update.advancement_status })
        .eq("student_id", update.student_id)
        .eq("round_id", update.round_id)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error("Errors updating advancement status:", errors);
      return {
        success: false,
        advancingCount: advancementResult.advancingCount,
        eliminatedCount: advancementResult.eliminatedCount,
        error: `Failed to update ${errors.length} students`,
      };
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
      .select("student_id, students(name), best_time_milliseconds, is_dnf")
      .eq("round_id", roundId);

    if (scoresError || !finalScores) {
      throw new Error("Failed to fetch round scores");
    }

    // Convert to CompetitorResult format
    const competitors: CompetitorResult[] = finalScores.map((score: any) => ({
      studentId: score.student_id,
      studentName: score.students?.name || "Unknown",
      bestTime: score.best_time_milliseconds,
      isDNF: score.is_dnf || false,
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
