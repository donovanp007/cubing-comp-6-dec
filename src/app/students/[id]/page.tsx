"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
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
import { formatTime } from "@/lib/utils";
import { Trophy, Medal, TrendingUp, Calendar, School, GraduationCap, ArrowUpDown, Share2, Copy } from "lucide-react";
import { PublicNavBar } from "@/components/public-navbar";

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
  school: string;
  status: string;
}

interface CompetitionRound {
  round_name: string;
  competition_name: string;
  competition_date: string;
  best_time: number | null;
  average_time: number | null;
}

type SortOption = "date" | "best-time" | "best-avg";

export default function PublicStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionRound[]>([]);
  const [sortedCompetitions, setSortedCompetitions] = useState<CompetitionRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentRank, setStudentRank] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  useEffect(() => {
    applySorting();
  }, [competitions, sortBy]);

  const applySorting = () => {
    let sorted = [...competitions];

    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.competition_date).getTime();
        const dateB = new Date(b.competition_date).getTime();
        return dateB - dateA; // Newest first
      });
    } else if (sortBy === "best-time") {
      sorted.sort((a, b) => {
        const timeA = a.best_time ?? Infinity;
        const timeB = b.best_time ?? Infinity;
        return timeA - timeB; // Fastest first
      });
    } else if (sortBy === "best-avg") {
      sorted.sort((a, b) => {
        const avgA = a.average_time ?? Infinity;
        const avgB = b.average_time ?? Infinity;
        return avgA - avgB; // Fastest average first
      });
    }

    setSortedCompetitions(sorted);
  };

  const fetchStudentData = async () => {
    try {
      const supabase = createClient();

      // Fetch student info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade, school, status")
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        setError("Student not found");
        setLoading(false);
        return;
      }

      setStudent(studentData as StudentData);

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

        if (roundIds.length > 0) {
          const { data: roundsData } = await supabase
            .from("rounds")
            .select(`
              id,
              round_name,
              competition_events(
                competitions(name, competition_date)
              )
            `)
            .in("id", roundIds);

          const roundsMap = new Map();
          if (roundsData) {
            roundsData.forEach((round: any) => {
              roundsMap.set(round.id, round);
            });
          }

          const comps = finalScoresData.map((score: any) => {
            const roundInfo = roundsMap.get(score.round_id);
            return {
              round_name: roundInfo?.round_name || "Unknown",
              competition_name: roundInfo?.competition_events?.[0]?.competitions?.name || "Unknown",
              competition_date: roundInfo?.competition_events?.[0]?.competitions?.competition_date || "",
              best_time: score.best_time_milliseconds,
              average_time: score.average_time_milliseconds,
            };
          });
          setCompetitions(comps);
          console.log(`[DEBUG] Mapped ${comps.length} competitions`);
        } else {
          setCompetitions([]);
        }
      } else {
        console.log("[DEBUG] No final_scores found for student");
        setCompetitions([]);
      }

      // Fetch all students to calculate rank
      const { data: allStudentsData } = await supabase
        .from("students")
        .select("id");

      if (allStudentsData) {
        setTotalStudents(allStudentsData.length);

        // Fetch all final scores to calculate best times
        const { data: allFinalScores } = await supabase
          .from("final_scores")
          .select("student_id, best_time_milliseconds");

        const bestTimes = new Map<string, number>();
        if (allFinalScores) {
          for (const score of allFinalScores) {
            if (score.best_time_milliseconds) {
              const current = bestTimes.get(score.student_id);
              bestTimes.set(
                score.student_id,
                current ? Math.min(current, score.best_time_milliseconds) : score.best_time_milliseconds
              );
            }
          }
        }

        // Calculate this student's rank
        const myBestTime = bestTimes.get(studentId);
        if (myBestTime) {
          let rank = 1;
          for (const [otherId, otherBestTime] of bestTimes.entries()) {
            if (otherId !== studentId && otherBestTime < myBestTime) {
              rank++;
            }
          }
          setStudentRank(rank);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading student data:", err);
      setError("Failed to load student data");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>;
  }

  if (error || !student) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-4">{error || "Student not found"}</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>;
  }

  const bestTime = competitions.length > 0
    ? Math.min(...competitions.filter(c => c.best_time).map(c => c.best_time!))
    : null;

  const bestAverage = competitions.length > 0
    ? Math.min(...competitions.filter(c => c.average_time).map(c => c.average_time!))
    : null;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <PublicNavBar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/rankings" className="hover:text-gray-900">Rankings</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{student.first_name} {student.last_name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{student.first_name} {student.last_name}</h1>
              <p className="text-gray-600 mt-2">Grade {student.grade} • {student.school}</p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {copySuccess ? (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rank</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {studentRank ? `#${studentRank}` : "—"}
                  </p>
                  <p className="text-xs text-gray-500">of {totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Competitions</p>
                  <p className="text-2xl font-bold text-gray-900">{competitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Medal className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Best Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bestTime ? formatTime(bestTime) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Best Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bestAverage ? formatTime(bestAverage) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competition History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Competition History
                </CardTitle>
                <CardDescription>
                  All competitions participated in
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("date")}
                  className="text-xs"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Date
                </Button>
                <Button
                  variant={sortBy === "best-time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("best-time")}
                  className="text-xs"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Fastest Time
                </Button>
                <Button
                  variant={sortBy === "best-avg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("best-avg")}
                  className="text-xs"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Fastest Avg
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {competitions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No competitions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competition</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead className="text-right">Best Time</TableHead>
                      <TableHead className="text-right">Best Avg</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCompetitions.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.competition_name}</TableCell>
                        <TableCell>{comp.round_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {comp.best_time ? (
                            <span className="text-green-600 font-semibold">{formatTime(comp.best_time)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {comp.average_time ? (
                            <span className="text-blue-600 font-semibold">{formatTime(comp.average_time)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
