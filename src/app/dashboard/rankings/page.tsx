"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Medal, Users, TrendingUp, Flame } from "lucide-react";
import type { Student, EventType } from "@/lib/types/database.types";

interface RankingEntry {
  student: Student;
  competitions: number;
  best_time: number | null;
  best_average: number | null;
  podiums: number;
  wins: number;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventTypes();
    fetchRankings();
  }, [selectedEvent]);

  const fetchEventTypes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_types")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data) setEventTypes(data);
  };

  const fetchRankings = async () => {
    setLoading(true);
    const supabase = createClient();

    // Get all students with their weekly results
    const { data: students } = await supabase
      .from("students")
      .select("*")
      .eq("status", "active");

    if (!students) {
      setLoading(false);
      return;
    }

    // Get all weekly results
    let resultsQuery = supabase
      .from("weekly_results")
      .select("*, weekly_competitions(*, event_types(*))");

    const { data: results } = await resultsQuery;

    // Calculate rankings
    const rankingData: RankingEntry[] = students.map((student) => {
      const studentResults = (results || []).filter(
        (r: any) => r.student_id === student.id &&
        (selectedEvent === "all" || r.weekly_competitions?.event_type_id === selectedEvent)
      );

      const bestTimes = studentResults
        .map((r: any) => r.best_time)
        .filter((t: any) => t !== null);
      const avgTimes = studentResults
        .map((r: any) => r.average_time)
        .filter((t: any) => t !== null);

      return {
        student,
        competitions: studentResults.length,
        best_time: bestTimes.length > 0 ? Math.min(...bestTimes) : null,
        best_average: avgTimes.length > 0 ? Math.min(...avgTimes) : null,
        podiums: studentResults.filter((r: any) => r.ranking && r.ranking <= 3).length,
        wins: studentResults.filter((r: any) => r.ranking === 1).length,
      };
    });

    // Sort by best average, then best time
    rankingData.sort((a, b) => {
      if (a.best_average === null && b.best_average === null) return 0;
      if (a.best_average === null) return 1;
      if (b.best_average === null) return -1;
      return a.best_average - b.best_average;
    });

    // Filter out students with no results
    setRankings(rankingData.filter((r) => r.competitions > 0));
    setLoading(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rankings</h1>
          <p className="text-gray-500 mt-1">
            Student rankings across weekly competitions
          </p>
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventTypes.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <p className="text-sm text-gray-500">Ranked Students</p>
                <p className="text-2xl font-bold">{rankings.length}</p>
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
                <p className="text-sm text-gray-500">Best Time</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0 && rankings[0].best_time
                    ? formatTime(Math.min(...rankings.map((r) => r.best_time || Infinity)))
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
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Most Wins</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0
                    ? Math.max(...rankings.map((r) => r.wins))
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Medal className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Most Podiums</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0
                    ? Math.max(...rankings.map((r) => r.podiums))
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Overall Rankings
          </CardTitle>
          <CardDescription>
            Ranked by best average time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <Medal className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No rankings yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Rankings will appear after students participate in competitions
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-center">Comps</TableHead>
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Podiums</TableHead>
                  <TableHead className="text-right">Best Single</TableHead>
                  <TableHead className="text-right">Best Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((entry, index) => (
                  <TableRow key={entry.student.id} className={index < 3 ? "bg-yellow-50/50" : ""}>
                    <TableCell className="font-bold">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {entry.student.first_name[0]}
                          {entry.student.last_name[0]}
                        </div>
                        <span className="font-medium">
                          {entry.student.first_name} {entry.student.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.student.grade || "-"}</TableCell>
                    <TableCell className="text-center">{entry.competitions}</TableCell>
                    <TableCell className="text-center">
                      {entry.wins > 0 && (
                        <Badge variant="default" className="bg-yellow-500">
                          {entry.wins}
                        </Badge>
                      )}
                      {entry.wins === 0 && "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.podiums > 0 && (
                        <Badge variant="secondary">{entry.podiums}</Badge>
                      )}
                      {entry.podiums === 0 && "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatTime(entry.best_time)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-600">
                      {formatTime(entry.best_average)}
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
