"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { parseTimeInput, formatTime, calculateWCAAverage, getBestTime } from "@/lib/utils";
import { checkAndAwardBadges, updateStudentStreaks, checkPersonalBest } from "@/lib/utils/badges";
import { ArrowLeft, Trophy, Timer, TrendingUp, Medal, Award } from "lucide-react";
import type { Student, WeeklyCompetition, WeeklyResult, EventType } from "@/lib/types/database.types";

interface WeeklyCompWithDetails extends WeeklyCompetition {
  event_types: EventType | null;
}

interface WeeklyResultWithStudent extends WeeklyResult {
  students: Student;
}

export default function RecordTimesPage() {
  const params = useParams();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<WeeklyCompWithDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<WeeklyResultWithStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [attempts, setAttempts] = useState<string[]>(["", "", "", "", ""]);
  const [dnfs, setDnfs] = useState<boolean[]>([false, false, false, false, false]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch competition
    const { data: compData } = await supabase
      .from("weekly_competitions")
      .select("*, event_types(*)")
      .eq("id", competitionId)
      .single();

    if (compData) {
      setCompetition(compData);

      // Fetch students (filtered by grade if specified)
      let studentQuery = supabase
        .from("students")
        .select("*")
        .eq("status", "active")
        .order("last_name");

      if (compData.grade_filter && compData.grade_filter.length > 0) {
        studentQuery = studentQuery.in("grade", compData.grade_filter);
      }

      const { data: studentData } = await studentQuery;
      setStudents(studentData || []);

      // Fetch existing results
      const { data: resultData } = await supabase
        .from("weekly_results")
        .select("*, students(*)")
        .eq("weekly_competition_id", competitionId)
        .order("ranking", { ascending: true });

      setResults(resultData || []);
    }

    setLoading(false);
  };

  const handleTimeInput = (index: number, value: string) => {
    const newAttempts = [...attempts];
    newAttempts[index] = value;
    setAttempts(newAttempts);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < 4) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleDnfToggle = (index: number) => {
    const newDnfs = [...dnfs];
    newDnfs[index] = !newDnfs[index];
    setDnfs(newDnfs);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Parse times
    const times = attempts.map((a, i) => (dnfs[i] ? null : parseTimeInput(a)));
    const bestTime = getBestTime(times);
    const avgTime = calculateWCAAverage(times);

    const supabase = createClient();

    // Check for existing result
    const { data: existing } = await supabase
      .from("weekly_results")
      .select("id")
      .eq("weekly_competition_id", competitionId)
      .eq("student_id", selectedStudent)
      .single();

    const resultData = {
      weekly_competition_id: competitionId,
      student_id: selectedStudent,
      attempt_1: times[0],
      attempt_2: times[1],
      attempt_3: times[2],
      attempt_4: times[3],
      attempt_5: times[4],
      dnf_1: dnfs[0],
      dnf_2: dnfs[1],
      dnf_3: dnfs[2],
      dnf_4: dnfs[3],
      dnf_5: dnfs[4],
      best_time: bestTime,
      average_time: avgTime,
    };

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from("weekly_results")
        .update(resultData)
        .eq("id", existing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("weekly_results")
        .insert(resultData);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Calculate ranking for this result
    const { data: allResults } = await supabase
      .from("weekly_results")
      .select("id, student_id, average_time")
      .eq("weekly_competition_id", competitionId)
      .order("average_time", { ascending: true, nullsFirst: false });

    // Update rankings for all participants
    if (allResults) {
      let currentRanking = 0;
      for (const result of allResults) {
        currentRanking++;
        await supabase
          .from("weekly_results")
          .update({ ranking: currentRanking })
          .eq("id", result.id);
      }
    }

    // Get the student's final ranking
    const studentRanking = allResults?.findIndex(r => r.student_id === selectedStudent);
    const finalRanking = studentRanking !== undefined && studentRanking >= 0 ? studentRanking + 1 : null;

    // Check for personal best
    let isPB = false;
    if (competition?.event_types?.id && bestTime) {
      const pbResult = await checkPersonalBest(
        selectedStudent,
        competition.event_types.id,
        bestTime,
        avgTime
      );
      isPB = pbResult.isPB;

      // Update the result with PB flag
      if (isPB) {
        await supabase
          .from("weekly_results")
          .update({ is_pb: true })
          .eq("weekly_competition_id", competitionId)
          .eq("student_id", selectedStudent);
      }
    }

    // Update student streaks
    await updateStudentStreaks(selectedStudent, finalRanking);

    // Check and award badges
    const awardedBadges = await checkAndAwardBadges(
      selectedStudent,
      competitionId,
      finalRanking,
      bestTime,
      avgTime
    );

    // Build success message
    let description = `Best: ${formatTime(bestTime)} | Avg: ${formatTime(avgTime)}`;
    if (isPB) {
      description += " | New PB!";
    }
    if (finalRanking && finalRanking <= 3) {
      description += ` | Rank: ${finalRanking === 1 ? "🥇" : finalRanking === 2 ? "🥈" : "🥉"}`;
    }

    toast({
      title: "Times Recorded!",
      description,
    });

    // Show badge notification if any badges were awarded
    if (awardedBadges.length > 0) {
      setTimeout(() => {
        toast({
          title: `${awardedBadges.length > 1 ? "Badges" : "Badge"} Unlocked!`,
          description: awardedBadges.map(b => `${b.icon} ${b.badgeName}`).join(", "),
        });
      }, 1500);
    }

    // Reset form
    setSelectedStudent("");
    setAttempts(["", "", "", "", ""]);
    setDnfs([false, false, false, false, false]);
    inputRefs.current[0]?.focus();

    // Refresh results
    fetchData();

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading...</div>
    );
  }

  if (!competition) {
    return (
      <div className="p-8 text-center text-gray-500">Competition not found</div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/weekly/${competitionId}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competition
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{competition.name}</h1>
        <p className="text-gray-500 mt-1">
          {competition.event_types?.display_name} • {competition.term} • Week {competition.week_number}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Record Times
            </CardTitle>
            <CardDescription>
              Enter 5 solve times for a student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Student Select */}
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                        {student.grade && ` (${student.grade})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Inputs */}
              <div className="space-y-3">
                <Label>Solve Times</Label>
                <p className="text-xs text-gray-500">
                  Enter times like: 1234 = 12.34s | 12345 = 1:23.45
                </p>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium text-gray-500">
                      #{i + 1}
                    </span>
                    <Input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={attempts[i]}
                      onChange={(e) => handleTimeInput(i, e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, i)}
                      placeholder="Enter time"
                      className="font-mono text-lg"
                      disabled={dnfs[i]}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`dnf-${i}`}
                        checked={dnfs[i]}
                        onCheckedChange={() => handleDnfToggle(i)}
                      />
                      <Label htmlFor={`dnf-${i}`} className="text-sm text-gray-500">
                        DNF
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {attempts.some((a) => a) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Best</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatTime(getBestTime(attempts.map((a, i) => dnfs[i] ? null : parseTimeInput(a))))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Average</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatTime(calculateWCAAverage(attempts.map((a, i) => dnfs[i] ? null : parseTimeInput(a))))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                disabled={submitting || !selectedStudent}
              >
                {submitting ? "Saving..." : "Submit Times"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Live Leaderboard
            </CardTitle>
            <CardDescription>
              {results.length} participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Medal className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No results yet</p>
                <p className="text-sm">Record times to see the leaderboard</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Best</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        {index === 0 && <span className="text-xl">🥇</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                        {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {result.students.first_name} {result.students.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.students.grade}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatTime(result.best_time)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
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
    </div>
  );
}
