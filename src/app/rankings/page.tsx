"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import { TierBadge } from "@/components/tier-badge";

interface StudentRanking {
  student_id: string;
  first_name: string;
  last_name: string;
  grade: number;
  school_name: string;
  total_points: number;
  best_time?: number | null;
  best_average?: number | null;
}

export default function PublicRankingsPage() {
  const [students, setStudents] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const supabase = createClient();

      // Fetch all students with their total points
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
          studentMap.set(student.id, {
            first_name: student.first_name,
            last_name: student.last_name,
            grade: student.grade,
            school_name: student.schools?.name || "Unknown",
            points: 0,
          });
        }
      }

      // Get all point transactions (no filters)
      const { data: pointData } = await supabase
        .from("point_transactions")
        .select(`
          student_id,
          final_points
        `);

      if (pointData) {
        for (const point of pointData) {
          const student = studentMap.get(point.student_id);
          if (student) {
            student.points += point.final_points || 0;
          }
        }
      }

      // Get best times from final_scores (no filters)
      const { data: finalScoresData } = await supabase
        .from("final_scores")
        .select(`
          student_id,
          best_time_milliseconds,
          average_time_milliseconds
        `);

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

      // Combine and sort
      const rankings: StudentRanking[] = [];
      for (const [studentId, data] of studentMap.entries()) {
        const times = careerBestTimes.get(studentId);
        rankings.push({
          student_id: studentId,
          first_name: data.first_name,
          last_name: data.last_name,
          grade: data.grade,
          school_name: data.school_name,
          total_points: data.points,
          best_time: times?.best_time,
          best_average: times?.best_average,
        });
      }

      rankings.sort((a, b) => b.total_points - a.total_points);
      setStudents(rankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and grade
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === "" ||
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesGrade =
      gradeFilter === "all" ||
      (student.grade != null && student.grade.toString() === gradeFilter);

    return matchesSearch && matchesGrade;
  });

  // Get unique grades for filter dropdown
  const uniqueGrades = Array.from(new Set(students.filter(s => s.grade != null).map((s) => s.grade))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <span className="text-2xl font-bold text-white">Cubing Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/competitions" className="text-white/80 hover:text-white transition">
              Competitions
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur">
                Coach Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Student Rankings
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          See who&apos;s leading the pack across all events and competitions
        </p>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Students</p>
                  <p className="text-2xl font-bold text-white">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Top Score</p>
                  <p className="text-2xl font-bold text-white">{students.length > 0 ? students[0].total_points : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Best Time</p>
                  <p className="text-2xl font-bold text-white">
                    {students.length > 0 && students[0].best_time ? formatTime(students[0].best_time) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white">
                  <Medal className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Avg Points</p>
                  <p className="text-2xl font-bold text-white">
                    {students.length > 0
                      ? Math.round((students.reduce((sum, s) => sum + s.total_points, 0) / students.length) * 10) / 10
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 pb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search for your child..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none transition"
          />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-white/60 focus:outline-none transition"
          >
            <option value="all" className="text-gray-900">All Grades</option>
            {uniqueGrades.map((grade) => (
              <option key={grade} value={grade.toString()} className="text-gray-900">
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Rankings Content */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Student Rankings
            </CardTitle>
            <CardDescription className="text-white/60">
              {filteredStudents.length === 0
                ? "No students match your search"
                : `${filteredStudents.length} of ${students.length} students • Click a name to view their profile`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading rankings...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Medal className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/60 text-lg">No rankings yet</p>
                <p className="text-white/40 text-sm mt-2">
                  Rankings will appear once students participate in competitions
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2">Rank</th>
                      <th className="text-left py-3 px-2">Name</th>
                      <th className="text-left py-3 px-2">Grade</th>
                      <th className="text-left py-3 px-2">School</th>
                      <th className="text-right py-3 px-2">Points</th>
                      <th className="text-right py-3 px-2">Best Time</th>
                      <th className="text-right py-3 px-2">Best Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const rank = students.indexOf(student) + 1;
                      return (
                        <tr key={student.student_id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="py-3 px-2">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`}
                          </td>
                          <td className="py-3 px-2">
                            <Link href={`/students/${student.student_id}`} className="hover:text-yellow-300 transition">
                              {student.first_name} {student.last_name}
                            </Link>
                          </td>
                          <td className="py-3 px-2">{student.grade}</td>
                          <td className="py-3 px-2">{student.school_name}</td>
                          <td className="py-3 px-2 text-right font-bold">{student.total_points}</td>
                          <td className="py-3 px-2 text-right">{student.best_time ? formatTime(student.best_time) : "—"}</td>
                          <td className="py-3 px-2 text-right">{student.best_average ? formatTime(student.best_average) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/competitions" className="hover:text-white transition">Competitions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
