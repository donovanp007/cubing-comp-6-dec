"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Calendar,
  School,
  GraduationCap,
  Zap,
  Star,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Stat Card Component
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
          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PublicStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<StudentAchievementWithBadge[]>([]);
  const [streaks, setStreaks] = useState<StudentStreak[]>([]);
  const [results, setResults] = useState<WeeklyResultWithComp[]>([]);
  const [pointHistory, setPointHistory] = useState<StudentPointRecord[]>([]);
  const [pointSummary, setPointSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    const supabase = createClient();

    // Fetch student (only safe public fields)
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, first_name, last_name, grade, school, status")
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

    setStudent(studentData as unknown as Student);

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

    // Fallback: Also fetch competition history from final_scores if point history is empty
    if ((!pointHistory || pointHistory.length === 0) && !pointSummary) {
      try {
        const { data: finalScoresData } = await supabase
          .from("final_scores")
          .select(`
            round_id,
            best_time_milliseconds,
            average_time_milliseconds,
            rounds!inner(
              id,
              round_name,
              round_number,
              competition_event_id,
              competition_events!inner(
                id,
                competition_id,
                competitions(id, name, competition_date)
              )
            )
          `)
          .eq("student_id", studentId)
          .order("rounds(created_at)", { ascending: false });

        // If we have final_scores, create point history from them
        if (finalScoresData && finalScoresData.length > 0) {
          const fallbackHistory: StudentPointRecord[] = finalScoresData.map((score: any) => ({
            competition_id: score.rounds.competition_events.competition_id,
            competition_name: score.rounds.competition_events.competitions.name,
            competition_date: score.rounds.competition_events.competitions.competition_date,
            event_id: score.rounds.competition_events.id,
            event_name: score.rounds.competition_events.id,
            round_id: score.round_id,
            round_name: score.rounds.round_name,
            round_number: score.rounds.round_number,
            total_points: 0,
            best_time_points: 0,
            average_time_points: 0,
            bonus_points: 0,
            bonus_details: {
              pb_bonus: 0,
              clutch_bonus: 0,
              streak_bonus: 0,
              school_momentum_bonus: 0,
            },
          }));
          setPointHistory(fallbackHistory);
        }
      } catch (error) {
        console.error("Error loading fallback competition data:", error);
      }
    }

    setLoading(false);
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/students/${studentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Profile URL copied to clipboard",
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Student not found</p>
        <Link href="/">
          <Button variant="link">Back to Home</Button>
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
  const careerPoints = pointSummary?.total_career_points || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
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
              {student.school && (
                <div className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  <span>{student.school}</span>
                </div>
              )}
            </div>
            {/* Share Profile */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={copyProfileUrl}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Profile Link"}
              </Button>
            </div>
          </div>

          <Badge variant={student.status === "active" ? "default" : "secondary"}>
            {student.status}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
      {pointHistory.length > 0 && (
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
                    {pointHistory.slice(0, 20).map((record) => (
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
              Competition History
            </CardTitle>
            <CardDescription>Recent weekly competition results</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No competition history</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competition</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                    <TableHead className="text-right">Best</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {result.weekly_competitions?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.weekly_competitions?.term}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.weekly_competitions?.event_types?.display_name || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.ranking === 1 && "🥇"}
                        {result.ranking === 2 && "🥈"}
                        {result.ranking === 3 && "🥉"}
                        {result.ranking && result.ranking > 3 && result.ranking}
                        {!result.ranking && "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {formatTime(result.best_time)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        {formatTime(result.average_time)}
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
            School Information
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
                    Your points contribute to your school's team standing in competitions.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No school assigned</p>
              )}
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">About Points</h4>
              <p className="text-sm text-gray-700">
                Your points are calculated based on your solve times, compared against tier thresholds.
                Younger students receive point multipliers to balance the competition fairly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
