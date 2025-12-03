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
import { Trophy, Medal, Users, TrendingUp, Star, Flame } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { useState as useStateHook } from "react";
import { TierBadge } from "@/components/tier-badge";
import { TopPerformersCarousel } from "@/components/top-performers-carousel";
import { RecentAchievers } from "@/components/recent-achievers";

interface SchoolRanking {
  school_id: string;
  school_name: string;
  total_points: number;
  competitions_count: number;
  students_count: number;
  rank: number;
  division?: string;
}

interface StudentRanking {
  student_id: string;
  first_name: string;
  last_name: string;
  grade: number;
  school_name: string;
  total_points: number;
  competitions_count: number;
  rank: number;
  best_time?: number | null;
  best_average?: number | null;
  badge_count?: number;
  typical_tier?: string;
  best_time_points?: number;
  avg_time_points?: number;
  bonus_points?: number;
}

export default function RankingsPage() {
  const [schoolRankings, setSchoolRankings] = useState<SchoolRanking[]>([]);
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [recentAchievers, setRecentAchievers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"schools" | "students">("schools");
  const [filters, setFilters] = useState({
    eventType: "all",
    schoolYear: "all",
    term: "all",
    grade: "all",
  });
  const [availableFilters, setAvailableFilters] = useState({
    eventTypes: [] as Array<{ id: string; name: string }>,
    schoolYears: [] as string[],
    terms: [] as string[],
    grades: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRankings();
  }, [filters]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch overall school rankings
      const { data: schoolData, error: schoolError } = await supabase
        .from("point_transactions")
        .select(
          `
          school_id,
          schools(id, name),
          competition_id
        `
        );

      if (schoolError) {
        console.error("School rankings error:", schoolError);
        return;
      }

      // Calculate school totals
      const schoolTotals = new Map<string, { name: string; points: number; competitions: Set<string>; students: Set<string> }>();

      if (schoolData) {
        for (const record of schoolData) {
          const schoolId = record.school_id;
          const schoolName = record.schools?.name || "Unknown School";

          if (!schoolTotals.has(schoolId)) {
            schoolTotals.set(schoolId, { name: schoolName, points: 0, competitions: new Set(), students: new Set() });
          }

          const existing = schoolTotals.get(schoolId)!;
          existing.competitions.add(record.competition_id);
        }
      }

      // Get total points per school per competition (major competitions only)
      const { data: standingsData } = await supabase
        .from("school_standings")
        .select(`
          school_id,
          schools(name, division, color_hex),
          total_points,
          competition_id,
          competitions(competition_type)
        `)
        .eq("competitions.competition_type", "major");

      const schoolRankingsList: SchoolRanking[] = [];
      const schoolMap = new Map<string, { points: number; competitions: Set<string>; name: string; division?: string; color_hex?: string }>();

      if (standingsData) {
        for (const standing of standingsData) {
          const schoolId = standing.school_id;
          const schoolName = standing.schools?.name || "Unknown School";
          const division = standing.schools?.division;
          const color_hex = standing.schools?.color_hex;

          if (!schoolMap.has(schoolId)) {
            schoolMap.set(schoolId, { points: 0, competitions: new Set(), name: schoolName, division, color_hex });
          }

          const existing = schoolMap.get(schoolId)!;
          existing.points += standing.total_points || 0;
          existing.competitions.add(standing.competition_id);
        }
      }

      // Convert to array and sort
      let rank = 1;
      schoolMap.forEach((data, schoolId) => {
        schoolRankingsList.push({
          school_id: schoolId,
          school_name: data.name,
          total_points: Math.round(data.points * 10) / 10,
          competitions_count: data.competitions.size,
          students_count: 0, // Will fill later
          rank: rank++,
        });
      });

      schoolRankingsList.sort((a, b) => b.total_points - a.total_points);
      schoolRankingsList.forEach((school, index) => {
        school.rank = index + 1;
        // Get division from schoolMap
        const schoolData = schoolMap.get(school.school_id);
        if (schoolData) {
          school.division = schoolData.division;
        }
      });

      setSchoolRankings(schoolRankingsList);

      // Fetch overall student rankings
      const { data: studentData } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade, schools(name)");

      const studentMap = new Map<string, {
        first_name: string;
        last_name: string;
        grade: number;
        school_name: string;
        points: number;
        competitions: Set<string>;
      }>();

      if (studentData) {
        for (const student of studentData) {
          studentMap.set(student.id, {
            first_name: student.first_name,
            last_name: student.last_name,
            grade: student.grade,
            school_name: student.schools?.name || "Unknown School",
            points: 0,
            competitions: new Set(),
          });
        }
      }

      // Get point transactions for each student (major competitions only)
      const { data: pointData } = await supabase
        .from("point_transactions")
        .select(`
          student_id,
          final_points,
          competition_id,
          competitions(competition_type)
        `)
        .eq("competitions.competition_type", "major");

      if (pointData) {
        for (const point of pointData) {
          const student = studentMap.get(point.student_id);
          if (student) {
            student.points += point.final_points || 0;
            student.competitions.add(point.competition_id);
          }
        }
      }

      // Fetch career best times from final_scores (major competitions only)
      const { data: finalScoresData } = await supabase
        .from("final_scores")
        .select(`
          student_id,
          best_time_milliseconds,
          average_time_milliseconds,
          rounds(competition_events(competitions(competition_type)))
        `)
        .eq("rounds.competition_events.competitions.competition_type", "major");

      const careerBestTimes = new Map<string, { best_time?: number; best_average?: number }>();

      if (finalScoresData) {
        for (const score of finalScoresData) {
          const existing = careerBestTimes.get(score.student_id) || { best_time: undefined, best_average: undefined };

          // Track minimum single time
          if (score.best_time_milliseconds) {
            existing.best_time = existing.best_time
              ? Math.min(existing.best_time, score.best_time_milliseconds)
              : score.best_time_milliseconds;
          }

          // Track minimum average time
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

      // Fetch point breakdown by type (major competitions only)
      const { data: pointBreakdownData } = await supabase
        .from("point_transactions")
        .select(`
          student_id,
          point_type,
          final_points,
          tier_achieved,
          competitions(competition_type)
        `)
        .eq("competitions.competition_type", "major");

      const pointBreakdowns = new Map<string, { best_time: number; avg_time: number; bonus: number }>();
      const tierCounts = new Map<string, Map<string, number>>();

      if (pointBreakdownData) {
        for (const pt of pointBreakdownData) {
          if (!pointBreakdowns.has(pt.student_id)) {
            pointBreakdowns.set(pt.student_id, { best_time: 0, avg_time: 0, bonus: 0 });
          }
          const breakdown = pointBreakdowns.get(pt.student_id)!;
          if (pt.point_type === "best_time") {
            breakdown.best_time += pt.final_points;

            // Track tier counts for typical_tier calculation
            if (pt.tier_achieved) {
              if (!tierCounts.has(pt.student_id)) {
                tierCounts.set(pt.student_id, new Map());
              }
              const tierMap = tierCounts.get(pt.student_id)!;
              tierMap.set(pt.tier_achieved, (tierMap.get(pt.tier_achieved) || 0) + 1);
            }
          } else if (pt.point_type === "average_time") {
            breakdown.avg_time += pt.final_points;
          } else {
            breakdown.bonus += pt.final_points;
          }
        }
      }

      // Helper function to find most common tier
      const getTypicalTier = (studentId: string): string | undefined => {
        const tierMap = tierCounts.get(studentId);
        if (!tierMap || tierMap.size === 0) return undefined;

        let maxCount = 0;
        let mostCommonTier: string | undefined;
        for (const [tier, count] of tierMap) {
          if (count > maxCount) {
            maxCount = count;
            mostCommonTier = tier;
          }
        }
        return mostCommonTier;
      };

      // Convert to array and sort
      const studentRankingsList: StudentRanking[] = [];
      rank = 1;
      studentMap.forEach((data, studentId) => {
        const careerTimes = careerBestTimes.get(studentId);
        const breakdown = pointBreakdowns.get(studentId);
        studentRankingsList.push({
          student_id: studentId,
          first_name: data.first_name,
          last_name: data.last_name,
          grade: data.grade,
          school_name: data.school_name,
          total_points: Math.round(data.points * 10) / 10,
          competitions_count: data.competitions.size,
          rank: rank++,
          best_time: careerTimes?.best_time || null,
          best_average: careerTimes?.best_average || null,
          badge_count: badgeCounts.get(studentId) || 0,
          typical_tier: getTypicalTier(studentId),
          best_time_points: breakdown?.best_time || 0,
          avg_time_points: breakdown?.avg_time || 0,
          bonus_points: breakdown?.bonus || 0,
        });
      });

      studentRankingsList.sort((a, b) => b.total_points - a.total_points);
      studentRankingsList.forEach((student, index) => {
        student.rank = index + 1;
      });

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
                <p className="text-sm text-gray-500">Schools Competing</p>
                <p className="text-2xl font-bold">{schoolRankings.length}</p>
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
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{studentRankings.length}</p>
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
                <p className="text-sm text-gray-500">Top School Points</p>
                <p className="text-2xl font-bold">
                  {schoolRankings.length > 0 ? schoolRankings[0].total_points : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter rankings by event, time period, and grade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Event Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Events</option>
                {availableFilters.eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>{et.name}</option>
                ))}
              </select>
            </div>

            {/* School Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">School Year</label>
              <select
                value={filters.schoolYear}
                onChange={(e) => setFilters({ ...filters, schoolYear: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Years</option>
                {availableFilters.schoolYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Term Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Term</label>
              <select
                value={filters.term}
                onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Terms</option>
                {availableFilters.terms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Grades</option>
                {availableFilters.grades.map((grade) => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setActiveTab("schools")}
          variant={activeTab === "schools" ? "default" : "outline"}
        >
          School Rankings
        </Button>
        <Button
          onClick={() => setActiveTab("students")}
          variant={activeTab === "students" ? "default" : "outline"}
        >
          Student Rankings
        </Button>
      </div>

      {/* School Rankings */}
      {activeTab === "schools" && (
        <Card>
          <CardHeader>
            <CardTitle>School Standings</CardTitle>
            <CardDescription>
              Total points accumulated across all competitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading rankings...</div>
            ) : schoolRankings.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No rankings data yet. Complete a competition to generate rankings.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-center">Division</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-right">Competitions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolRankings.map((school) => (
                    <TableRow key={school.school_id}>
                      <TableCell className="font-semibold text-lg">
                        {getMedalEmoji(school.rank)}
                      </TableCell>
                      <TableCell className="font-medium">{school.school_name}</TableCell>
                      <TableCell className="text-center">
                        {school.division ? (
                          <Badge className={
                            school.division === 'A' ? 'bg-red-600' :
                            school.division === 'B' ? 'bg-blue-600' :
                            'bg-green-600'
                          }>
                            Division {school.division}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {school.total_points.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{school.competitions_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Rankings */}
      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Student Rankings</CardTitle>
            <CardDescription>
              Career points across all competitions
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-center">Tier</TableHead>
                    <TableHead className="text-center">Badges</TableHead>
                    <TableHead className="text-right">Best Time</TableHead>
                    <TableHead className="text-right">Best Avg</TableHead>
                    <TableHead className="text-right">Career Points</TableHead>
                    <TableHead className="text-right">Competitions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRankings.slice(0, 100).map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-semibold text-lg">
                        {getMedalEmoji(student.rank)}
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
                      <TableCell className="text-center">
                        {student.typical_tier ? (
                          <TierBadge tier={student.typical_tier} size="sm" />
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.badge_count > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Medal className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold">{student.badge_count}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {student.best_time ? formatTime(student.best_time) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        {student.best_average ? formatTime(student.best_average) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold group relative cursor-help">
                        {student.total_points.toFixed(1)}
                        <div className="hidden group-hover:block absolute z-10 bg-slate-900 text-white p-3 rounded shadow-lg right-0 top-full mt-2 whitespace-nowrap text-sm">
                          <p>Best Time: {student.best_time_points.toFixed(1)}</p>
                          <p>Avg Time: {student.avg_time_points.toFixed(1)}</p>
                          <p>Bonuses: {student.bonus_points.toFixed(1)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{student.competitions_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
