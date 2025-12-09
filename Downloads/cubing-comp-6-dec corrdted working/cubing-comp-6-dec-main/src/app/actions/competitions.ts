"use server";

import { createClient } from '@/lib/supabase/server'

/**
 * Complete a competition
 * - Updates competition status to "completed"
 * - Calculates all school standings and rankings
 * - Aggregates points from all rounds
 */
export async function completeCompetition(competitionId: string) {
  try {
    // Use fetch to call Supabase REST API directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: "Supabase configuration missing" };
    }

    // Step 1: Get all registered students in this competition
    const registrationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/registrations?competition_id=eq.${competitionId}&select=student_id,students(id,school)`,
      {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
      }
    );

    if (!registrationsResponse.ok) {
      return { success: false, error: "Failed to fetch registrations" };
    }

    const registrations = await registrationsResponse.json();
    const schoolNames = new Set<string>();

    console.log(`[completeCompetition] Found ${registrations.length} registrations`);

    registrations.forEach((reg: any) => {
      if (reg.students?.school) {
        schoolNames.add(reg.students.school);
      }
    });

    console.log(`[completeCompetition] Found ${schoolNames.size} schools: ${Array.from(schoolNames).join(", ")}`);

    // Now map school names to school IDs
    const schoolIds = new Map<string, string>();
    for (const schoolName of Array.from(schoolNames)) {
      const schoolResponse = await fetch(
        `${supabaseUrl}/rest/v1/schools?name=eq.${encodeURIComponent(schoolName)}&select=id`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
        }
      );

      if (schoolResponse.ok) {
        const schools = await schoolResponse.json();
        if (schools.length > 0) {
          schoolIds.set(schoolName, schools[0].id);
          console.log(`[completeCompetition] Mapped school "${schoolName}" to ID: ${schools[0].id}`);
        }
      }
    }

    // Step 2: For each school, calculate total points from all point_transactions
    for (const [schoolName, schoolId] of schoolIds.entries()) {
      // Get all point transactions for this school in this competition
      const pointsResponse = await fetch(
        `${supabaseUrl}/rest/v1/point_transactions?school_id=eq.${schoolId}&competition_id=eq.${competitionId}&select=final_points`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
        }
      );

      let totalPoints = 0;
      let studentsParticipated = 0;

      if (pointsResponse.ok) {
        const points = await pointsResponse.json();
        const uniqueStudents = new Set();

        console.log(`[completeCompetition] School ${schoolId}: Found ${points.length} point transactions`);

        points.forEach((p: any) => {
          totalPoints += p.final_points || 0;
        });

        console.log(`[completeCompetition] School ${schoolId}: Total points = ${totalPoints}`);

        // Get unique student count for this school in this competition
        const studentsResponse = await fetch(
          `${supabaseUrl}/rest/v1/registrations?school_id=eq.${schoolId}&competition_id=eq.${competitionId}&select=student_id`,
          {
            headers: {
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
          }
        );

        if (studentsResponse.ok) {
          const students = await studentsResponse.json();
          studentsParticipated = new Set(students.map((s: any) => s.student_id)).size;
          console.log(`[completeCompetition] School ${schoolId}: ${studentsParticipated} students participated`);
        }
      }

      const avgPointsPerStudent = studentsParticipated > 0 ? totalPoints / studentsParticipated : 0;

      // Step 3: Upsert into school_standings
      const standingData = {
        competition_id: competitionId,
        school_id: schoolId,
        total_points: totalPoints,
        avg_points_per_student: avgPointsPerStudent,
        total_students_participated: studentsParticipated,
        updated_at: new Date().toISOString(),
      };

      // Try to update, if not exists it will fail, then we insert
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/school_standings?competition_id=eq.${competitionId}&school_id=eq.${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
        }
      );

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing.length > 0) {
          // Update existing
          await fetch(
            `${supabaseUrl}/rest/v1/school_standings?competition_id=eq.${competitionId}&school_id=eq.${schoolId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseAnonKey}`,
                apikey: supabaseAnonKey,
              },
              body: JSON.stringify(standingData),
            }
          );
        } else {
          // Insert new
          await fetch(`${supabaseUrl}/rest/v1/school_standings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify(standingData),
          });
        }
      }
    }

    // Step 4: Get all standings for this competition and rank them
    const allStandingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/school_standings?competition_id=eq.${competitionId}&order=total_points.desc`,
      {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
      }
    );

    if (allStandingsResponse.ok) {
      const standings = await allStandingsResponse.json();

      // Update rankings
      for (let i = 0; i < standings.length; i++) {
        await fetch(
          `${supabaseUrl}/rest/v1/school_standings?id=eq.${standings[i].id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ overall_rank: i + 1 }),
          }
        );
      }
    }

    // Step 5: Update competition status to "completed"
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/competitions?id=eq.${competitionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          status: "completed",
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      return { success: false, error: error.message || "Failed to update competition" };
    }

    // Step 6: Get competition name for success message
    const competitionResponse = await fetch(
      `${supabaseUrl}/rest/v1/competitions?id=eq.${competitionId}&select=name`,
      {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
      }
    );

    let competitionName = "Competition";
    if (competitionResponse.ok) {
      const [competition] = await competitionResponse.json();
      if (competition) competitionName = competition.name;
    }

    return {
      success: true,
      message: `${competitionName} completed! Rankings calculated and updated.`,
      competitionId,
    };
  } catch (error) {
    console.error("Error completing competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get competition status
 */
export async function getCompetitionStatus(competitionId: string) {
  const supabase = await createClient();

  const { data: competition, error } = await supabase
    .from("competitions")
    .select("status, name")
    .eq("id", competitionId)
    .single();

  if (error) {
    return { status: null, error: error.message };
  }

  return { status: competition?.status, name: competition?.name };
}

/**
 * Get competition leaderboard snapshot (final results when completed)
 */
export async function getCompetitionResults(competitionId: string) {
  const supabase = await createClient();

  try {
    // Get school standings
    const { data: standings } = await supabase
      .from("school_standings")
      .select(
        "id, school_id, total_points, overall_rank, division, schools(name)"
      )
      .eq("competition_id", competitionId)
      .order("overall_rank", { ascending: true });

    // Get student rankings
    const { data: registrations } = await supabase
      .from("registrations")
      .select(
        "students(id, first_name, last_name, grade, school_id), competition_events!inner(competition_id)"
      )
      .eq("competition_events.competition_id", competitionId);

    return {
      success: true,
      standings: standings || [],
      participants: registrations || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch results",
    };
  }
}
