"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { Trophy, ArrowLeft, Medal, Star, TrendingUp, Users, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student, WeeklyCompetition, WeeklyResult, EventType } from "@/lib/types/database.types";

interface WeeklyCompWithDetails extends WeeklyCompetition {
  event_types: EventType | null;
}

interface WeeklyResultWithStudent extends WeeklyResult {
  students: Student;
}

export default function PublicResultPage() {
  const params = useParams();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<WeeklyCompWithDetails | null>(null);
  const [results, setResults] = useState<WeeklyResultWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [competitionId, autoRefresh]);

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

      // Fetch results with student info
      const { data: resultData } = await supabase
        .from("weekly_results")
        .select("*, students(*)")
        .eq("weekly_competition_id", competitionId)
        .order("ranking", { ascending: true });

      setResults(resultData || []);
    }

    setLastUpdated(new Date());
    setLoading(false);
  };

  // Group results by class/grade for team view
  const groupedByClass = results.reduce((acc, result) => {
    const classKey = result.students.student_class || result.students.grade || "Unassigned";
    if (!acc[classKey]) {
      acc[classKey] = [];
    }
    acc[classKey].push(result);
    return acc;
  }, {} as Record<string, WeeklyResultWithStudent[]>);

  // Calculate class averages
  const classStats = Object.entries(groupedByClass).map(([className, classResults]) => {
    const validAverages = classResults
      .filter((r) => r.average_time !== null)
      .map((r) => r.average_time as number);

    const classAverage = validAverages.length > 0
      ? Math.round(validAverages.reduce((a, b) => a + b, 0) / validAverages.length)
      : null;

    const podiums = classResults.filter(r => r.ranking && r.ranking <= 3).length;

    return {
      className,
      participants: classResults.length,
      classAverage,
      podiums,
      bestResult: classResults[0]?.ranking || 999,
    };
  }).sort((a, b) => (a.classAverage || 999999) - (b.classAverage || 999999));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading results...</div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-500">Competition not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/results" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            All Results
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Competition Header */}
        <div className="text-center mb-8">
          <Badge className={competition.status === "active" ? "bg-green-100 text-green-700 mb-4" : "bg-blue-100 text-blue-700 mb-4"}>
            {competition.status === "active" ? "Live Competition" : "Completed"}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {competition.name}
          </h1>
          <p className="text-lg text-gray-600">
            {competition.event_types?.display_name} | {competition.term} - Week {competition.week_number}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
            <Users className="h-5 w-5" />
            <span className="text-lg">{results.length} Participants</span>
          </div>
        </div>

        {/* Podium */}
        {results.length >= 3 && (
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* 2nd Place */}
              <div className="text-center order-1">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-4xl">🥈</span>
                </div>
                <p className="font-bold text-gray-900">
                  {results[1]?.students.first_name} {results[1]?.students.last_name}
                </p>
                <p className="text-sm text-gray-500">{results[1]?.students.student_class || results[1]?.students.grade}</p>
                <p className="text-lg font-mono text-blue-600 mt-1">
                  {formatTime(results[1]?.average_time)}
                </p>
              </div>

              {/* 1st Place */}
              <div className="text-center order-0 md:order-1 -mt-8">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl ring-4 ring-yellow-200">
                  <span className="text-5xl">🥇</span>
                </div>
                <p className="font-bold text-xl text-gray-900">
                  {results[0]?.students.first_name} {results[0]?.students.last_name}
                </p>
                <p className="text-sm text-gray-500">{results[0]?.students.student_class || results[0]?.students.grade}</p>
                <p className="text-xl font-mono text-green-600 mt-1 font-bold">
                  {formatTime(results[0]?.average_time)}
                </p>
                {results[0]?.is_pb && (
                  <Badge className="mt-2 bg-yellow-100 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" /> New PB!
                  </Badge>
                )}
              </div>

              {/* 3rd Place */}
              <div className="text-center order-2">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-4xl">🥉</span>
                </div>
                <p className="font-bold text-gray-900">
                  {results[2]?.students.first_name} {results[2]?.students.last_name}
                </p>
                <p className="text-sm text-gray-500">{results[2]?.students.student_class || results[2]?.students.grade}</p>
                <p className="text-lg font-mono text-blue-600 mt-1">
                  {formatTime(results[2]?.average_time)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Full Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Full Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Timer className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No results yet</p>
                    <p className="text-sm">Check back soon!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Best</TableHead>
                        <TableHead className="text-right">Average</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow key={result.id} className={index < 3 ? "bg-yellow-50/50" : ""}>
                          <TableCell>
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="text-gray-500 font-medium">{index + 1}</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {result.students.first_name} {result.students.last_name}
                              </span>
                              {result.is_pb && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {result.students.student_class || result.students.grade || "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            {formatTime(result.best_time)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
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

          {/* Class/Team Rankings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Class Rankings
                </CardTitle>
                <CardDescription>
                  Team competition standings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No class data</p>
                ) : (
                  <div className="space-y-4">
                    {classStats.map((classStat, index) => (
                      <div
                        key={classStat.className}
                        className={`p-4 rounded-lg ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                            : index === 1
                            ? "bg-gray-50 border border-gray-200"
                            : index === 2
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-white border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-xl">🏆</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
                            <span className="font-bold text-gray-900">
                              {classStat.className}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {classStat.participants} students
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Class Average:</span>
                          <span className="font-mono font-bold text-blue-600">
                            {formatTime(classStat.classAverage)}
                          </span>
                        </div>
                        {classStat.podiums > 0 && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-500">Podium finishes:</span>
                            <span className="font-bold text-green-600">
                              {classStat.podiums}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fastest Single:</span>
                    <span className="font-mono font-bold text-green-600">
                      {formatTime(Math.min(...results.filter(r => r.best_time).map(r => r.best_time as number)))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Best Average:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {formatTime(Math.min(...results.filter(r => r.average_time).map(r => r.average_time as number)))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Personal Bests:</span>
                    <span className="font-bold text-yellow-600">
                      {results.filter(r => r.is_pb).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          Results auto-refresh every 10 seconds when Live mode is enabled
        </div>
      </footer>
    </div>
  );
}
