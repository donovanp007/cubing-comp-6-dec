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
} from "lucide-react";
import type { Student, Badge as BadgeType, StudentAchievement, StudentStreak, WeeklyResult } from "@/lib/types/database.types";

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

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<StudentAchievementWithBadge[]>([]);
  const [streaks, setStreaks] = useState<StudentStreak[]>([]);
  const [results, setResults] = useState<WeeklyResultWithComp[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

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
  const totalPoints = achievements.reduce((sum, a) => sum + (a.badges?.points || 0), 0);

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
          icon={<User className="h-5 w-5" />}
          label="Points"
          value={totalPoints.toString()}
          gradient="from-indigo-500 to-purple-500"
        />
      </div>

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
