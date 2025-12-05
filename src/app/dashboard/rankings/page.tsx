"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Medal, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { TierBadge } from "@/components/tier-badge";
import { TopPerformersCarousel } from "@/components/top-performers-carousel";
import { RecentAchievers } from "@/components/recent-achievers";

interface StudentRanking {
  student_id: string;
  first_name: string;
  last_name: string;
  grade: number;
  school_name: string;
  total_points: number;
  best_time?: number | null;
  best_average?: number | null;
  badge_count?: number;
}

export default function RankingsPage() {
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [recentAchievers, setRecentAchievers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch all students with basic info
      const { data: studentData } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade, schools(name)");

      const studentMap = new Map<string, {
        first_name: string;
        last_name: string;
        grade: number;
        school_name: string;
        points: number;
      }>();

      if (studentData) {
        for (const student of studentData) {
          const schoolName = Array.isArray(student.schools)
            ? student.schools[0]?.name
            : student.schools?.name || "Unknown School";

          studentMap.set(student.id, {
            first_name: student.first_name,
            last_name: student.last_name,
            grade: student.grade,
            school_name: schoolName,
            points: 0,
          });
        }
      }

      // Get all point transactions (same logic as public rankings)
      const { data: pointData } = await supabase
        .from("point_transactions")
        .select("student_id, final_points");

      if (pointData) {
        for (const point of pointData) {
          const student = studentMap.get(point.student_id);
          if (student) {
            student.points += point.final_points || 0;
          }
        }
      }

      // Get best times from final_scores (same logic as public rankings - NO filters)
      const { data: finalScoresData } = await supabase
        .from("final_scores")
        .select("student_id, best_time_milliseconds, average_time_milliseconds");

      const careerBestTimes = new Map<string, { best_time?: number; best_average?: number }>();

      if (finalScoresData) {
        for (const score of finalScoresData) {
          const existing = careerBestTimes.get(score.student_id) || { best_time: undefined, best_average: undefined };

          if (score.best_time_milliseconds) {
            existing.best_time = existing.best_time
              ? Math.min(existing.best_time, score.best_time_milliseconds)
              : score.best_time_milliseconds;
          }

          if (score.average_time_milliseconds) {
            existing.best_average = existing.best_average
              ? Math.min(existing.best_average, score.average_time_milliseconds)
              : score.average_time_milliseconds;
          }

          careerBestTimes.set(score.student_id, existing);
        }
      }

      // Fetch badge counts
      const { data: badgeData } = await supabase
        .from("student_achievements")
        .select("student_id");

      const badgeCounts = new Map<string, number>();
      if (badgeData) {
        for (const badge of badgeData) {
          badgeCounts.set(badge.student_id, (badgeCounts.get(badge.student_id) || 0) + 1);
        }
      }

      // Convert to array and sort
      const studentRankingsList: StudentRanking[] = [];
      studentMap.forEach((data, studentId) => {
        const careerTimes = careerBestTimes.get(studentId);
        studentRankingsList.push({
          student_id: studentId,
          first_name: data.first_name,
          last_name: data.last_name,
          grade: data.grade,
          school_name: data.school_name,
          total_points: data.points,
          best_time: careerTimes?.best_time || null,
          best_average: careerTimes?.best_average || null,
          badge_count: badgeCounts.get(studentId) || 0,
        });
      });

      studentRankingsList.sort((a, b) => b.total_points - a.total_points);

      setStudentRankings(studentRankingsList);

      // Fetch top performers (top 10 students by points)
      const topPerformersData = studentRankingsList
        .slice(0, 10)
        .map((student) => ({
          id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade: `Grade ${student.grade}`,
          school: student.school_name,
          total_points: student.total_points,
          badge_count: student.badge_count || 0,
        }));

      setTopPerformers(topPerformersData);

      // Fetch recent achievers (latest badges earned)
      const { data: recentAchievementsData } = await supabase
        .from("student_achievements")
        .select(`
          earned_at,
          students(id, first_name, last_name),
          badges(name, icon),
          competitions(name)
        `)
        .order("earned_at", { ascending: false })
        .limit(10);

      if (recentAchievementsData) {
        const achievers = recentAchievementsData.map((achievement: any) => ({
          student_id: achievement.students?.id || "",
          student_name: `${achievement.students?.first_name} ${achievement.students?.last_name}`,
          badge_name: achievement.badges?.name || "Achievement",
          badge_icon: achievement.badges?.icon,
          earned_at: achievement.earned_at,
          competition_name: achievement.competitions?.name,
        }));
        setRecentAchievers(achievers);
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rankings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">League Rankings</h1>
        <p className="text-gray-500 mt-1">Career standings across all competitions</p>
      </div>

      {/* Top Performers and Recent Achievers Section */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <TopPerformersCarousel performers={topPerformers} />
          </div>
          <div>
            <RecentAchievers achievers={recentAchievers} />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{studentRankings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top Student Points</p>
                <p className="text-2xl font-bold">
                  {studentRankings.length > 0 ? Math.round(studentRankings[0].total_points) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top Student Best Time</p>
                <p className="text-2xl font-bold">
                  {studentRankings.length > 0 && studentRankings[0].best_time
                    ? formatTime(studentRankings[0].best_time)
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Student Rankings</CardTitle>
          <CardDescription>
            Career points and times across all competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading rankings...</div>
          ) : studentRankings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No rankings data yet. Complete a competition to generate rankings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-right">Best Time</TableHead>
                    <TableHead className="text-right">Best Avg</TableHead>
                    <TableHead className="text-right">Career Points</TableHead>
                    <TableHead className="text-right">Badges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRankings.map((student, index) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-semibold text-lg">
                        {getMedalEmoji(index + 1)}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/students/${student.student_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {student.first_name} {student.last_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {student.grade}</Badge>
                      </TableCell>
                      <TableCell>{student.school_name}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {student.best_time ? formatTime(student.best_time) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        {student.best_average ? formatTime(student.best_average) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Math.round(student.total_points)}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.badge_count > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Medal className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold">{student.badge_count}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
