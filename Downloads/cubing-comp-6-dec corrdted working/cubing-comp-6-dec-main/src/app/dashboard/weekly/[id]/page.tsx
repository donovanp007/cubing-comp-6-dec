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
import { ArrowLeft, Trophy, Users, Calendar, Timer, TrendingUp, Medal, Flame } from "lucide-react";
import type { Student, WeeklyCompetition, WeeklyResult, EventType } from "@/lib/types/database.types";

interface WeeklyCompWithDetails extends WeeklyCompetition {
  event_types: EventType | null;
}

interface WeeklyResultWithStudent extends WeeklyResult {
  students: Student;
}

export default function WeeklyCompetitionDetailPage() {
  const params = useParams();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<WeeklyCompWithDetails | null>(null);
  const [results, setResults] = useState<WeeklyResultWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    const supabase = createClient();

    const { data: compData } = await supabase
      .from("weekly_competitions")
      .select("*, event_types(*)")
      .eq("id", competitionId)
      .single();

    if (compData) {
      setCompetition(compData);

      const { data: resultData } = await supabase
        .from("weekly_results")
        .select("*, students(*)")
        .eq("weekly_competition_id", competitionId)
        .order("average_time", { ascending: true, nullsFirst: false });

      // Add rankings
      const rankedResults = (resultData || []).map((r, i) => ({
        ...r,
        ranking: i + 1,
      }));

      setResults(rankedResults);
    }

    setLoading(false);
  };

  const handleCompleteCompetition = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_competitions")
      .update({ status: "completed" })
      .eq("id", competitionId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Competition Completed!",
        description: "Results have been finalized",
      });
      fetchData();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!competition) {
    return <div className="p-8 text-center text-gray-500">Competition not found</div>;
  }

  const isActive = competition.status === "active";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/weekly"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Weekly Competitions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{competition.name}</h1>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Completed"}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {competition.event_types?.display_name} • {competition.term} • Week {competition.week_number}
            </p>
          </div>
          <div className="flex gap-3">
            {isActive && (
              <>
                <Link href={`/dashboard/weekly/${competitionId}/record`}>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Record Times
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleCompleteCompetition}>
                  Complete Competition
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Timer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Single</p>
                <p className="text-2xl font-bold">
                  {results.length > 0
                    ? formatTime(Math.min(...results.map((r) => r.best_time || Infinity)))
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Average</p>
                <p className="text-2xl font-bold">
                  {results.length > 0
                    ? formatTime(Math.min(...results.filter((r) => r.average_time).map((r) => r.average_time!)))
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-bold">
                  {competition.start_date} - {competition.end_date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Podium (Top 3) */}
      {results.length >= 3 && (
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Podium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex flex-col items-center justify-center text-white mb-2">
                  <span className="text-3xl">🥈</span>
                  <span className="text-xs font-bold">{formatTime(results[1].average_time)}</span>
                </div>
                <p className="font-semibold">{results[1].students.first_name}</p>
                <p className="text-xs text-gray-500">{results[1].students.grade}</p>
              </div>
              {/* 1st Place */}
              <div className="text-center">
                <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex flex-col items-center justify-center text-white mb-2">
                  <span className="text-4xl">🥇</span>
                  <span className="text-sm font-bold">{formatTime(results[0].average_time)}</span>
                </div>
                <p className="font-semibold text-lg">{results[0].students.first_name}</p>
                <p className="text-sm text-gray-500">{results[0].students.grade}</p>
              </div>
              {/* 3rd Place */}
              <div className="text-center">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center text-white mb-2">
                  <span className="text-2xl">🥉</span>
                  <span className="text-xs font-bold">{formatTime(results[2].average_time)}</span>
                </div>
                <p className="font-semibold">{results[2].students.first_name}</p>
                <p className="text-xs text-gray-500">{results[2].students.grade}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-blue-500" />
            Full Results
          </CardTitle>
          <CardDescription>All participants ranked by average time</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No results yet</p>
              {isActive && (
                <Link href={`/dashboard/weekly/${competitionId}/record`}>
                  <Button variant="link" className="mt-2">
                    Start recording times
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-center">Solves</TableHead>
                  <TableHead className="text-right">Best</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={result.id} className={index < 3 ? "bg-yellow-50/50" : ""}>
                    <TableCell className="font-bold">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {result.students.first_name[0]}
                          {result.students.last_name[0]}
                        </div>
                        <span className="font-medium">
                          {result.students.first_name} {result.students.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{result.students.grade || "-"}</TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {[
                        result.dnf_1 ? "DNF" : formatTime(result.attempt_1),
                        result.dnf_2 ? "DNF" : formatTime(result.attempt_2),
                        result.dnf_3 ? "DNF" : formatTime(result.attempt_3),
                        result.dnf_4 ? "DNF" : formatTime(result.attempt_4),
                        result.dnf_5 ? "DNF" : formatTime(result.attempt_5),
                      ].join(" | ")}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-600">
                      {formatTime(result.best_time)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-600">
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
  );
}
