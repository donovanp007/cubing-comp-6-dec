"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Calendar,
  Mail,
  School,
  GraduationCap,
  Zap,
  Star,
} from "lucide-react";
import type { Student, Badge as BadgeType, StudentAchievement, StudentStreak, WeeklyResult } from "@/lib/types/database.types";
import { getStudentPointHistory, getStudentPointSummary } from "@/app/actions/students";

interface StudentAchievementWithBadge extends StudentAchievement {
  badges: BadgeType;
}

interface WeeklyResultWithComp extends WeeklyResult {
  weekly_competitions: {
    name: string;
    term: string;
    week_number: number;
    event_types: { display_name: string } | null;
  };
}

interface StudentPointRecord {
  competition_id: string
  competition_name: string
  competition_date: string
  event_name: string
  round_name: string
  total_points: number
  best_time_points: number
  average_time_points: number
  bonus_points: number
  bonus_details: {
    pb_bonus: number
    clutch_bonus: number
    streak_bonus: number
    school_momentum_bonus: number
  }
}

interface CompetitionHistory {
  competition_id: string
  round_id: string
  round_name: string
  competition_name: string
  competition_date: string
  best_time: number | null
  average_time: number | null
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<StudentAchievementWithBadge[]>([]);
  const [streaks, setStreaks] = useState<StudentStreak[]>([]);
  const [results, setResults] = useState<WeeklyResultWithComp[]>([]);
  const [pointHistory, setPointHistory] = useState<StudentPointRecord[]>([]);
  const [pointSummary, setPointSummary] = useState<any>(null);
  const [competitionHistory, setCompetitionHistory] = useState<CompetitionHistory[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionHistory | null>(null);
  const [competitionSolves, setCompetitionSolves] = useState<Array<{ time: number | null; is_dnf: boolean }>>([]);
  const [solvesLoading, setSolvesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // Fetch solve times when a competition is selected
  useEffect(() => {
    const fetchSolves = async () => {
      if (!selectedCompetition) {
        setCompetitionSolves([]);
        return;
      }

      setSolvesLoading(true);
      try {
        const supabase = createClient();
        const { data: solvesData, error: solvesError } = await supabase
          .from("results")
          .select("id, time_milliseconds, is_dnf")
          .eq("round_id", selectedCompetition.round_id)
          .eq("student_id", studentId)
          .limit(5);

        console.log(`[Solves] Fetching for round ${selectedCompetition.round_id}, student ${studentId}`);
        console.log(`[Solves] Error:`, solvesError);
        console.log(`[Solves] Data:`, solvesData);

        if (solvesError) {
          console.error("Error fetching solves:", solvesError);
          setCompetitionSolves([]);
          return;
        }

        if (solvesData) {
          const mapped = solvesData.map((result: any) => ({
            time: result.is_dnf ? null : result.time_milliseconds,
            is_dnf: result.is_dnf,
          }));
          console.log(`[Solves] Mapped ${mapped.length} solves`);
          setCompetitionSolves(mapped);
        } else {
          console.log("[Solves] No data returned");
          setCompetitionSolves([]);
        }
      } catch (error) {
        console.error("Error fetching solves:", error);
        setCompetitionSolves([]);
      } finally {
        setSolvesLoading(false);
      }
    };

    fetchSolves();
  }, [selectedCompetition, studentId]);

  const fetchStudentData = async () => {
    const supabase = createClient();

    // Fetch student
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError || !studentData) {
      toast({
        title: "Error",
        description: "Student not found",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setStudent(studentData);

    // Fetch achievements with badges
    const { data: achievementData } = await supabase
      .from("student_achievements")
      .select("*, badges(*)")
      .eq("student_id", studentId)
      .order("earned_at", { ascending: false });

    setAchievements(achievementData || []);

    // Fetch streaks
    const { data: streakData } = await supabase
      .from("student_streaks")
      .select("*")
      .eq("student_id", studentId);

    setStreaks(streakData || []);

    // Fetch weekly results
    const { data: resultData } = await supabase
      .from("weekly_results")
      .select("*, weekly_competitions(name, term, week_number, event_types(display_name))")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20);

    setResults(resultData || []);

    // Fetch point history and summary
    try {
      const history = await getStudentPointHistory(studentId);
      setPointHistory(history);

      const summary = await getStudentPointSummary(studentId);
      setPointSummary(summary);
    } catch (error) {
      console.error("Error loading point data:", error);
    }

    // Fetch competition history from final_scores - SIMPLE query (matching what works in rankings)
    const { data: finalScoresData } = await supabase
      .from("final_scores")
      .select("student_id, best_time_milliseconds, average_time_milliseconds, round_id, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (finalScoresData && finalScoresData.length > 0) {
      console.log(`[DEBUG] Found ${finalScoresData.length} final_scores for ${studentId}`);

      // Fetch round details for all the round IDs we found
      const roundIds = finalScoresData.map((fs: any) => fs.round_id).filter(Boolean);
      console.log(`[DEBUG] Round IDs to fetch: ${roundIds.join(", ")}`);

      if (roundIds.length > 0) {
        // Step 1: Fetch rounds with just basic info and competition_event_id
        const { data: roundsData, error: roundsError } = await supabase
          .from("rounds")
          .select("id, round_name, competition_event_id")
          .in("id", roundIds);

        console.log(`[DEBUG] Rounds query error: ${roundsError ? roundsError.message : "none"}`);
        console.log(`[DEBUG] Rounds data:`, roundsData);

        if (!roundsData || roundsData.length === 0) {
          console.log("[DEBUG] No rounds data returned, setting empty");
          setCompetitionHistory([]);
        } else {
          // Step 2: Get all unique competition_event_ids
          const compEventIds = [...new Set(roundsData.map((r: any) => r.competition_event_id).filter(Boolean))];
          console.log(`[DEBUG] Competition Event IDs: ${compEventIds.join(", ")}`);

          // Step 3: Fetch competition_events to get competition_id
          const { data: compEventsData, error: compEventsError } = await supabase
            .from("competition_events")
            .select("id, competition_id")
            .in("id", compEventIds);

          console.log(`[DEBUG] Comp Events error: ${compEventsError ? compEventsError.message : "none"}`);
          console.log(`[DEBUG] Comp Events data:`, compEventsData);

          // Step 4: Get all unique competition_ids and fetch competitions
          const competitionIds = compEventsData
            ? [...new Set(compEventsData.map((ce: any) => ce.competition_id).filter(Boolean))]
            : [];
          console.log(`[DEBUG] Competition IDs: ${competitionIds.join(", ")}`);

          const { data: competitionsData, error: competitionsError } = await supabase
            .from("competitions")
            .select("id, name, competition_date")
            .in("id", competitionIds);

          console.log(`[DEBUG] Competitions error: ${competitionsError ? competitionsError.message : "none"}`);
          console.log(`[DEBUG] Competitions data:`, competitionsData);

          // Step 5: Build maps for quick lookup
          const roundsMap = new Map();
          roundsData.forEach((round: any) => {
            roundsMap.set(round.id, round);
          });

          const compEventsMap = new Map();
          if (compEventsData) {
            compEventsData.forEach((ce: any) => {
              compEventsMap.set(ce.id, ce);
            });
          }

          const competitionsMap = new Map();
          if (competitionsData) {
            competitionsData.forEach((comp: any) => {
              competitionsMap.set(comp.id, comp);
            });
          }

          // Step 6: Map to competition history format
          const comps = finalScoresData.map((score: any) => {
            const roundInfo = roundsMap.get(score.round_id);
            const compEventInfo = roundInfo ? compEventsMap.get(roundInfo.competition_event_id) : null;
            const competitionInfo = compEventInfo ? competitionsMap.get(compEventInfo.competition_id) : null;

            return {
              competition_id: compEventInfo?.competition_id || "",
              round_id: score.round_id,
              round_name: roundInfo?.round_name || "Unknown",
              competition_name: competitionInfo?.name || "Unknown",
              competition_date: competitionInfo?.competition_date || "",
              best_time: score.best_time_milliseconds,
              average_time: score.average_time_milliseconds,
            };
          });

          setCompetitionHistory(comps);
          console.log(`[DEBUG] Final mapped competitions:`, comps);
        }
      } else {
        setCompetitionHistory([]);
      }
    } else {
      console.log("[DEBUG] No final_scores found for student");
      setCompetitionHistory([]);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Student not found</p>
        <Link href="/dashboard/students">
          <Button variant="link">Back to Students</Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalComps = results.length;
  const podiums = results.filter((r) => r.ranking && r.ranking <= 3).length;
  const wins = results.filter((r) => r.ranking === 1).length;
  const bestTime = results.length > 0
    ? Math.min(...results.filter((r) => r.best_time).map((r) => r.best_time!))
    : null;
  const participationStreak = streaks.find((s) => s.streak_type === "participation");
  const badgePoints = achievements.reduce((sum, a) => sum + (a.badges?.points || 0), 0);
  const careerPoints = pointSummary?.total_career_points || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/students"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>

        <div className="flex items-start gap-6 flex-1">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {student.first_name[0]}
            {student.last_name[0]}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
              {student.grade && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{student.grade}</span>
                </div>
              )}
              {student.student_class && (
                <Badge variant="outline" className="text-sm">
                  Class {student.student_class}
                </Badge>
              )}
              {student.school && (
                <div className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  <span>{student.school}</span>
                </div>
              )}
              {student.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
              )}
            </div>
            {/* View Achievements & Stats Links */}
            <div className="flex gap-3 mt-4">
              <Link href={`/dashboard/students/${studentId}/achievements`}>
                <Button variant="outline" size="sm">
                  View Achievements
                </Button>
              </Link>
              <Link href={`/dashboard/students/${studentId}/stats`}>
                <Button variant="outline" size="sm">
                  View Statistics
                </Button>
              </Link>
            </div>
          </div>

          <Badge variant={student.status === "active" ? "success" : "secondary"}>
            {student.status}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Competitions"
          value={totalComps.toString()}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={<Medal className="h-5 w-5" />}
          label="Wins"
          value={wins.toString()}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Podiums"
          value={podiums.toString()}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Streak"
          value={participationStreak?.current_streak.toString() || "0"}
          gradient="from-red-500 to-orange-500"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Best Time"
          value={bestTime ? formatTime(bestTime) : "-"}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Career Points"
          value={careerPoints.toString()}
          gradient="from-amber-500 to-yellow-500"
        />
      </div>

      {/* Points Breakdown Section */}
      {pointHistory && pointHistory.length > 0 && (
        <>
          {/* Bonus Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {(() => {
              const totalBestTime = pointHistory.reduce((sum, r) => sum + r.best_time_points, 0);
              const totalAvgTime = pointHistory.reduce((sum, r) => sum + r.average_time_points, 0);
              const totalPBBonus = pointHistory.reduce((sum, r) => sum + r.bonus_details.pb_bonus, 0);
              const totalClutchBonus = pointHistory.reduce((sum, r) => sum + r.bonus_details.clutch_bonus, 0);

              return (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Best Time Pts</p>
                          <p className="text-lg font-bold">{totalBestTime.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Time Pts</p>
                          <p className="text-lg font-bold">{totalAvgTime.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white">
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PB Bonuses</p>
                          <p className="text-lg font-bold">{totalPBBonus.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clutch Bonuses</p>
                          <p className="text-lg font-bold">{totalClutchBonus.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>

          {/* Points History Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Points History
              </CardTitle>
              <CardDescription>Career points earned by competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competition</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Best Time</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">Bonuses</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointHistory.slice(0, 10).map((record) => (
                      <TableRow key={`${record.competition_id}-${record.round_name}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{record.competition_name}</p>
                            <p className="text-xs text-gray-500">{new Date(record.competition_date).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.event_name}</TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {record.best_time_points.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-600">
                          {record.average_time_points.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.bonus_points > 0 ? (
                            <span className="text-sm font-medium text-orange-600">
                              +{record.bonus_points.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {record.total_points.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Achievement Stats from Competition History */}
      {competitionHistory && competitionHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {(() => {
            const bestTime = competitionHistory.length > 0
              ? Math.min(...competitionHistory.filter(c => c.best_time).map(c => c.best_time!))
              : null;
            const bestAverage = competitionHistory.length > 0
              ? Math.min(...competitionHistory.filter(c => c.average_time).map(c => c.average_time!))
              : null;
            const pbCount = competitionHistory.filter(c => c.best_time).length;
            const avgCount = competitionHistory.filter(c => c.average_time).length;

            return (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Personal Best</p>
                        <p className="text-lg font-bold">{bestTime ? formatTime(bestTime) : "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Best Average</p>
                        <p className="text-lg font-bold">{bestAverage ? formatTime(bestAverage) : "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Competitions</p>
                        <p className="text-lg font-bold">{competitionHistory.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white">
                        <Medal className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Results Recorded</p>
                        <p className="text-lg font-bold">{pbCount + avgCount} times</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Badges ({achievements.length})
            </CardTitle>
            <CardDescription>Achievements earned</CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Medal className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No badges yet</p>
                <p className="text-sm">Participate in competitions to earn badges!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <span className="text-2xl">{achievement.badges?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {achievement.badges?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {achievement.badges?.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        achievement.badges?.rarity === "legendary"
                          ? "border-yellow-500 text-yellow-600"
                          : achievement.badges?.rarity === "rare"
                          ? "border-purple-500 text-purple-600"
                          : achievement.badges?.rarity === "uncommon"
                          ? "border-blue-500 text-blue-600"
                          : ""
                      }
                    >
                      +{achievement.badges?.points}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competition History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              All Competition Results
            </CardTitle>
            <CardDescription>Complete competition history with times</CardDescription>
          </CardHeader>
          <CardContent>
            {!competitionHistory || competitionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No competition results yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competition</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead className="text-right">Best Time</TableHead>
                    <TableHead className="text-right">Best Average</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitionHistory.map((comp, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => setSelectedCompetition(comp)}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {comp.competition_name}
                        </button>
                      </TableCell>
                      <TableCell>{comp.round_name}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {comp.best_time ? formatTime(comp.best_time) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        {comp.average_time ? formatTime(comp.average_time) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {comp.competition_date
                          ? new Date(comp.competition_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Streaks */}
      {streaks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {streaks.map((streak) => (
                <div
                  key={streak.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200"
                >
                  <p className="text-sm text-gray-600 capitalize">
                    {streak.streak_type.replace("_", " ")} Streak
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-orange-600">
                      {streak.current_streak}
                    </span>
                    <span className="text-sm text-gray-500">
                      (best: {streak.best_streak})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* School & Scoring Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-500" />
            School & Scoring Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">School</h4>
              {student?.school ? (
                <div className="space-y-2">
                  <p className="text-gray-700">{student.school}</p>
                  {student.grade && (
                    <p className="text-sm text-gray-600">
                      <strong>Grade:</strong> {student.grade}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Your points contribute to your school's team standing in competitions. Check the School Standings page to see how your school ranks!
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No school assigned</p>
              )}
            </div>

            {/* Grade Multiplier Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Point Multiplier</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Your grade affects your point multiplier in the scoring system:
                </p>
                <div className="text-sm space-y-1">
                  {student?.grade && (
                    <>
                      <p className="font-mono">
                        <strong>Your Grade ({student.grade}):</strong>{" "}
                        <span className="text-green-600 font-bold">
                          {(() => {
                            const grade = parseInt(student.grade);
                            const multiplier = Math.max(1.0, 2.0 - (grade - 5) * 0.15);
                            return multiplier.toFixed(2) + "x";
                          })()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        This means for every 10 points from solving times, you earn{" "}
                        <strong>
                          {(() => {
                            const grade = parseInt(student.grade);
                            const multiplier = Math.max(1.0, 2.0 - (grade - 5) * 0.15);
                            return (10 * multiplier).toFixed(1);
                          })()}
                        </strong>{" "}
                        points toward your school team.
                      </p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Lower grades earn higher multipliers (up to 2.0x for Grade 5) to encourage younger student participation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competition Details Modal */}
      {selectedCompetition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCompetition.competition_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCompetition.round_name} •{" "}
                  {selectedCompetition.competition_date
                    ? new Date(selectedCompetition.competition_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompetition(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-semibold">Best Time</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {selectedCompetition.best_time ? formatTime(selectedCompetition.best_time) : "—"}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold">Best Average</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {selectedCompetition.average_time ? formatTime(selectedCompetition.average_time) : "—"}
                  </p>
                </div>
              </div>

              {/* Competition Details */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Competition</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompetition.competition_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Round</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompetition.round_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCompetition.competition_date
                      ? new Date(selectedCompetition.competition_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Individual Solve Times */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3 font-semibold">All 5 Solve Times ({competitionSolves.length})</p>
                {solvesLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading solves...</div>
                ) : competitionSolves.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No solve times recorded</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {competitionSolves.map((solve, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-center font-mono text-sm font-semibold ${
                          solve.is_dnf
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        <div className="text-xs text-gray-600 mb-1">Solve {idx + 1}</div>
                        {solve.is_dnf ? (
                          <div className="text-lg">DNF</div>
                        ) : (
                          <div>{formatTime(solve.time!)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Performance Metrics</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Best Time Recorded</span>
                    <span className="font-semibold">
                      {selectedCompetition.best_time ? formatTime(selectedCompetition.best_time) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Best Average Recorded</span>
                    <span className="font-semibold">
                      {selectedCompetition.average_time ? formatTime(selectedCompetition.average_time) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setSelectedCompetition(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
