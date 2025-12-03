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
import { Trophy, Medal, TrendingUp, Calendar, School, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function PublicStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

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

      // Fetch competition history from final_scores
      const { data: finalScoresData, error: scoresError } = await supabase
        .from("final_scores")
        .select(`
          best_time_milliseconds,
          average_time_milliseconds,
          rounds(
            round_name,
            competition_events(
              competitions(name, competition_date)
            )
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (scoresError) {
        console.error("Error fetching scores:", scoresError);
        setCompetitions([]);
      } else {
        console.log(`[DEBUG] final_scores data for ${studentId}:`, finalScoresData);
        if (finalScoresData && finalScoresData.length > 0) {
          const comps = finalScoresData.map((score: any) => ({
            round_name: score.rounds?.round_name || "Unknown",
            competition_name: score.rounds?.competition_events?.competitions?.name || "Unknown",
            competition_date: score.rounds?.competition_events?.competitions?.competition_date || "",
            best_time: score.best_time_milliseconds,
            average_time: score.average_time_milliseconds,
          }));
          setCompetitions(comps);
          console.log(`[DEBUG] Mapped ${comps.length} competitions`);
        } else {
          console.log("[DEBUG] No final_scores found - student may need backfill");
          setCompetitions([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{student.first_name} {student.last_name}</h1>
              <p className="text-gray-600 mt-2">Grade {student.grade} • {student.school}</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600" />
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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Competition History
            </CardTitle>
            <CardDescription>
              All competitions participated in
            </CardDescription>
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
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitions.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.competition_name}</TableCell>
                        <TableCell>{comp.round_name}</TableCell>
                        <TableCell className="text-right">
                          {comp.best_time ? formatTime(comp.best_time) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
