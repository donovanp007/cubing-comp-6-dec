/**
 * Calculate and save final_scores for ALL students in a round
 * This ensures final_scores table is populated before round completion
 */

import { createClient } from "@/lib/supabase/client";
import { calculateRanking } from "./ranking";

export async function calculateAllFinalScoresForRound(
  roundId: string,
  eventId: string
): Promise<{
  success: boolean;
  calculated: number;
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Fetch all results for this round
    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("student_id, time_milliseconds, is_dnf")
      .eq("round_id", roundId)
      .order("student_id");

    if (resultsError) {
      return { success: false, calculated: 0, error: resultsError.message };
    }

    if (!results || results.length === 0) {
      return { success: true, calculated: 0 };
    }

    // Group results by student
    const studentResults = new Map<
      string,
      Array<{ time: number | null; isDNF: boolean }>
    >();

    for (const result of results) {
      if (!studentResults.has(result.student_id)) {
        studentResults.set(result.student_id, []);
      }
      studentResults.get(result.student_id)!.push({
        time: result.is_dnf ? null : result.time_milliseconds,
        isDNF: result.is_dnf,
      });
    }

    // Get event format (default to "Average of 5")
    const { data: eventData } = await supabase
      .from("competition_events")
      .select("total_rounds")
      .eq("id", eventId)
      .single();

    const format = "Average of 5"; // TODO: Get from event_types table

    // Calculate final scores for each student
    const finalScoresToUpsert: Array<{
      student_id: string;
      round_id: string;
      best_time_milliseconds: number | null;
      average_time_milliseconds: number | null;
    }> = [];

    for (const [studentId, attempts] of studentResults.entries()) {
      // Extract times (null for DNF)
      const times = attempts.map((a) => a.time);

      // Calculate best and average
      const ranking = calculateRanking(times, format);

      finalScoresToUpsert.push({
        student_id: studentId,
        round_id: roundId,
        best_time_milliseconds: ranking.bestTime || null,
        average_time_milliseconds: ranking.averageTime || null,
      });
    }

    // Upsert all final_scores at once
    if (finalScoresToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from("final_scores")
        .upsert(finalScoresToUpsert, {
          onConflict: "student_id,round_id",
        });

      if (upsertError) {
        return {
          success: false,
          calculated: 0,
          error: `Failed to save final scores: ${upsertError.message}`,
        };
      }
    }

    console.log(
      `✅ Calculated and saved final_scores for ${finalScoresToUpsert.length} students`
    );

    return { success: true, calculated: finalScoresToUpsert.length };
  } catch (error) {
    console.error("Error calculating final scores:", error);
    return {
      success: false,
      calculated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
