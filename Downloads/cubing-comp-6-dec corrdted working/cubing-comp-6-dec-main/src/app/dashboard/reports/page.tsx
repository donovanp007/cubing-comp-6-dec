"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Users,
  Trophy,
  Calendar,
  TrendingUp,
  Medal,
  Flame,
  Target,
} from "lucide-react";

interface Stats {
  totalStudents: number;
  activeStudents: number;
  totalCompetitions: number;
  weeklyCompetitions: number;
  totalResults: number;
  badgesEarned: number;
  averageBestTime: number | null;
  topPerformer: { name: string; wins: number } | null;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [gradeBreakdown, setGradeBreakdown] = useState<{ grade: string; count: number }[]>([]);
  const [topStudents, setTopStudents] = useState<{ name: string; competitions: number; wins: number; bestTime: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = createClient();

    try {
      // Total students
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Active students
      const { count: activeStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Total competitions
      const { count: totalCompetitions } = await supabase
        .from("competitions")
        .select("*", { count: "exact", head: true });

      // Weekly competitions
      const { count: weeklyCompetitions } = await supabase
        .from("weekly_competitions")
        .select("*", { count: "exact", head: true });

      // Total weekly results
      const { count: totalResults } = await supabase
        .from("weekly_results")
        .select("*", { count: "exact", head: true });

      // Badges earned
      const { count: badgesEarned } = await supabase
        .from("student_achievements")
        .select("*", { count: "exact", head: true });

      // Average best time from weekly results
      const { data: timeData } = await supabase
        .from("weekly_results")
        .select("best_time")
        .not("best_time", "is", null);

      const avgBest = timeData && timeData.length > 0
        ? Math.round(timeData.reduce((sum, r) => sum + r.best_time!, 0) / timeData.length)
        : null;

      // Grade breakdown
      const { data: students } = await supabase
        .from("students")
        .select("grade")
        .eq("status", "active");

      const gradeMap = new Map<string, number>();
      students?.forEach((s) => {
        const grade = s.grade || "Unknown";
        gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
      });

      const breakdown = Array.from(gradeMap.entries())
        .map(([grade, count]) => ({ grade, count }))
        .sort((a, b) => a.grade.localeCompare(b.grade));

      setGradeBreakdown(breakdown);

      // Top students by results
      const { data: allResults } = await supabase
        .from("weekly_results")
        .select("student_id, ranking, best_time, students(first_name, last_name)");

      const studentStatsMap = new Map<string, { name: string; competitions: number; wins: number; bestTime: number | null }>();

      allResults?.forEach((r: any) => {
        const studentId = r.student_id;
        const name = `${r.students?.first_name} ${r.students?.last_name}`;

        if (!studentStatsMap.has(studentId)) {
          studentStatsMap.set(studentId, {
            name,
            competitions: 0,
            wins: 0,
            bestTime: null,
          });
        }

        const stats = studentStatsMap.get(studentId)!;
        stats.competitions++;
        if (r.ranking === 1) stats.wins++;
        if (r.best_time && (!stats.bestTime || r.best_time < stats.bestTime)) {
          stats.bestTime = r.best_time;
        }
      });

      const topList = Array.from(studentStatsMap.values())
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);

      setTopStudents(topList);

      // Find top performer
      const topPerformer = topList.length > 0
        ? { name: topList[0].name, wins: topList[0].wins }
        : null;

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalCompetitions: totalCompetitions || 0,
        weeklyCompetitions: weeklyCompetitions || 0,
        totalResults: totalResults || 0,
        badgesEarned: badgesEarned || 0,
        averageBestTime: avgBest,
        topPerformer,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading statistics...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          Reports & Analytics
        </h1>
        <p className="text-gray-500 mt-1">Overview of your cubing program</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Users className="h-6 w-6" />}
          label="Total Students"
          value={stats?.totalStudents || 0}
          subtext={`${stats?.activeStudents || 0} active`}
          gradient="from-blue-500 to-cyan-500"
        />
        <MetricCard
          icon={<Trophy className="h-6 w-6" />}
          label="Competitions"
          value={(stats?.totalCompetitions || 0) + (stats?.weeklyCompetitions || 0)}
          subtext={`${stats?.weeklyCompetitions || 0} weekly`}
          gradient="from-yellow-500 to-orange-500"
        />
        <MetricCard
          icon={<Target className="h-6 w-6" />}
          label="Total Results"
          value={stats?.totalResults || 0}
          subtext="recorded solves"
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={<Medal className="h-6 w-6" />}
          label="Badges Earned"
          value={stats?.badgesEarned || 0}
          subtext="achievements"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Students by Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradeBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No student data</p>
            ) : (
              <div className="space-y-3">
                {gradeBreakdown.map((g) => (
                  <div key={g.grade} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{g.grade}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(g.count / (stats?.activeStudents || 1)) * 100}%`,
                          minWidth: "40px",
                        }}
                      >
                        <span className="text-xs text-white font-medium">{g.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with most wins</CardDescription>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No competition data yet</p>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div
                    key={student.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="w-6 text-center font-bold text-gray-400">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-gray-500">
                        {student.competitions} competitions
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">{student.wins} wins</Badge>
                      {student.bestTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          PB: {formatTime(student.bestTime)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Average Best Time</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.averageBestTime ? formatTime(stats.averageBestTime) : "-"}
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Top Performer</p>
              <p className="text-xl font-bold text-orange-600">
                {stats?.topPerformer?.name || "-"}
              </p>
              {stats?.topPerformer && (
                <p className="text-sm text-gray-500">{stats.topPerformer.wins} wins</p>
              )}
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Participation Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.activeStudents && stats.totalResults
                  ? Math.round((stats.totalResults / stats.activeStudents) * 10) / 10
                  : 0}
              </p>
              <p className="text-sm text-gray-500">results per student</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  gradient: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-gray-400">{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
