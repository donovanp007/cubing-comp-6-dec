"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Award, Zap, Target } from "lucide-react";
import type { Student } from "@/lib/types/database.types";

interface StudentStats {
  total_competitions: number;
  total_wins: number;
  total_podiums: number;
  best_time_ms: number | null;
  worst_time_ms: number | null;
  average_time_ms: number | null;
  improvement_percent: number;
  consistency_score: number;
  pb_count: number;
}

interface EventStats {
  event_name: string;
  best_single_ms: number | null;
  best_average_ms: number | null;
  competition_count: number;
}

export default function StatsPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    total_competitions: 0,
    total_wins: 0,
    total_podiums: 0,
    best_time_ms: null,
    worst_time_ms: null,
    average_time_ms: null,
    improvement_percent: 0,
    consistency_score: 0,
    pb_count: 0,
  });
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch student
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    setStudent(studentData);

    // Fetch weekly results for stats
    const { data: resultsData } = await supabase
      .from("weekly_results")
      .select(
        `
        best_time, average_time, ranking, is_pb,
        weekly_competitions(name, event_types(display_name))
      `
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    // Calculate statistics
    if (resultsData && resultsData.length > 0) {
      const results = resultsData as any[];
      const validTimes = results
        .filter((r) => r.best_time && r.average_time)
        .map((r) => ({ best: r.best_time, avg: r.average_time, pb: r.is_pb, rank: r.ranking }));

      const bestTime = Math.min(...validTimes.map((r) => r.best));
      const worstTime = Math.max(...validTimes.map((r) => r.best));
      const avgTime = validTimes.reduce((sum, r) => sum + r.avg, 0) / validTimes.length;

      const wins = results.filter((r) => r.ranking === 1).length;
      const podiums = results.filter((r) => r.ranking && r.ranking <= 3).length;
      const pbCount = results.filter((r) => r.is_pb).length;

      // Consistency score: how close times are to average (0-100)
      const variance = validTimes.reduce((sum, r) => sum + Math.abs(r.avg - avgTime), 0);
      const avgVariance = variance / validTimes.length;
      const consistencyScore = Math.max(0, 100 - avgVariance / avgTime) as number;

      // Improvement: compare first 5 and last 5 average times
      let improvementPercent = 0;
      if (validTimes.length >= 10) {
        const first5Avg = validTimes
          .slice(validTimes.length - 5)
          .reduce((sum, r) => sum + r.avg, 0) / 5;
        const last5Avg = validTimes.slice(0, 5).reduce((sum, r) => sum + r.avg, 0) / 5;
        improvementPercent = ((first5Avg - last5Avg) / first5Avg) * 100;
      }

      setStats({
        total_competitions: results.length,
        total_wins: wins,
        total_podiums: podiums,
        best_time_ms: bestTime,
        worst_time_ms: worstTime,
        average_time_ms: Math.round(avgTime),
        improvement_percent: Math.round(improvementPercent * 10) / 10,
        consistency_score: Math.round(consistencyScore),
        pb_count: pbCount,
      });

      // Group by event type
      const eventGroups = new Map<string, any>();
      results.forEach((r) => {
        const eventName = r.weekly_competitions?.event_types?.display_name || "Unknown";
        if (!eventGroups.has(eventName)) {
          eventGroups.set(eventName, { times: [], count: 0 });
        }
        const group = eventGroups.get(eventName);
        if (r.best_time) group.times.push(r.best_time);
        group.count++;
      });

      // Fetch personal bests for each event
      const { data: pbData } = await supabase
        .from("personal_bests")
        .select(
          `
        event_types(display_name),
        best_single_milliseconds,
        best_average_milliseconds
      `
        )
        .eq("student_id", studentId);

      const eventStatsList: EventStats[] = [];
      eventGroups.forEach((group, eventName) => {
        const pb = (pbData || []).find(
          (p: any) => p.event_types?.display_name === eventName
        ) as any;
        eventStatsList.push({
          event_name: eventName,
          best_single_ms: pb?.best_single_milliseconds,
          best_average_ms: pb?.best_average_milliseconds,
          competition_count: group.count,
        });
      });

      setEventStats(eventStatsList.sort((a, b) => b.competition_count - a.competition_count));
    }

    setLoading(false);
  };

  const formatTime = (ms: number | null): string => {
    if (!ms) return "N/A";
    const seconds = ms / 1000;
    return seconds.toFixed(2);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading statistics...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/students/${studentId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {student?.first_name} {student?.last_name}'s Statistics
          </h1>
          <p className="text-gray-500 mt-2">Career statistics and event breakdown</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Competitions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_competitions}</div>
            <p className="text-xs text-gray-500 mt-2">All competitions participated</p>
          </CardContent>
        </Card>

        {/* Wins */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">1st Place Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.total_wins}</div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total_competitions > 0
                ? ((stats.total_wins / stats.total_competitions) * 100).toFixed(1)
                : 0}
              % win rate
            </p>
          </CardContent>
        </Card>

        {/* Podiums */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top 3 Podiums</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.total_podiums}</div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total_competitions > 0
                ? ((stats.total_podiums / stats.total_competitions) * 100).toFixed(1)
                : 0}
              % podium rate
            </p>
          </CardContent>
        </Card>

        {/* Personal Bests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Personal Bests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.pb_count}</div>
            <p className="text-xs text-gray-500 mt-2">Times achieved as personal bests</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Time Statistics
            </CardTitle>
            <CardDescription>Best, average, and worst solving times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Time</span>
                <span className="font-bold text-lg text-green-600">
                  {formatTime(stats.best_time_ms)}s
                </span>
              </div>
              <div className="h-2 bg-green-200 rounded-full w-full"></div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Time</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatTime(stats.average_time_ms)}s
                </span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full w-full"></div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Worst Time</span>
                <span className="font-bold text-lg text-orange-600">
                  {formatTime(stats.worst_time_ms)}s
                </span>
              </div>
              <div className="h-2 bg-orange-200 rounded-full w-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Improvement and consistency tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consistency Score</span>
                <span className="font-bold text-lg text-purple-600">{stats.consistency_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.consistency_score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                How consistent your times are (higher = more consistent)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Improvement</span>
                <span className={`font-bold text-lg ${stats.improvement_percent > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {stats.improvement_percent > 0 ? '+' : ''}{stats.improvement_percent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stats.improvement_percent > 0 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.abs(stats.improvement_percent)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Improvement from first 5 to last 5 competitions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Specialization */}
      {eventStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Event Specialization
            </CardTitle>
            <CardDescription>Best times by event type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventStats.map((event) => (
                <div key={event.event_name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{event.event_name}</h4>
                    <Badge variant="secondary">{event.competition_count} comps</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Best Single</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatTime(event.best_single_ms)}s
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Best Average</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatTime(event.best_average_ms)}s
                      </p>
                    </div>
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
