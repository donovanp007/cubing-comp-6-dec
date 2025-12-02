"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import { Trophy, Medal, Users, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CompetitionResult {
  id: string;
  name: string;
  status: string;
}

interface StudentResult {
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  grade: string;
  best_time_milliseconds: number | null;
  average_time_milliseconds: number | null;
  advancement_status: string;
}

interface RoundStats {
  total_competitors: number;
  fastest_time: number | null;
  average_time: number | null;
  dnf_count: number;
  completion_rate: number;
}

export default function CompetitionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();

  const [competition, setCompetition] = useState<CompetitionResult | null>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [roundResults, setRoundResults] = useState<StudentResult[]>([]);
  const [roundStats, setRoundStats] = useState<RoundStats | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitionData();
  }, [competitionId]);

  useEffect(() => {
    if (selectedEvent) {
      fetchRounds();
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedRound) {
      fetchRoundResults();
      fetchRoundStats();
    }
  }, [selectedRound]);

  const fetchCompetitionData = async () => {
    const { data: comp } = await supabase
      .from("competitions")
      .select("id, name, status")
      .eq("id", competitionId)
      .single();

    if (comp) {
      setCompetition(comp);

      // Fetch events
      const { data: eventsData } = await supabase
        .from("competition_events")
        .select("id, event_type_id, event_types(display_name)")
        .eq("competition_id", competitionId);

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData);
        setSelectedEvent(eventsData[0].id);
      }
    }

    setLoading(false);
  };

  const fetchRounds = async () => {
    const { data: roundsData } = await supabase
      .from("rounds")
      .select("id, round_number, round_name")
      .eq("competition_event_id", selectedEvent)
      .order("round_number");

    if (roundsData && roundsData.length > 0) {
      setRounds(roundsData);
      setSelectedRound(roundsData[0].id);
    }
  };

  const fetchRoundResults = async () => {
    const { data: results } = await supabase
      .from("final_scores")
      .select("student_id, students(first_name, last_name, gender, grade), best_time_milliseconds, average_time_milliseconds, advancement_status")
      .eq("round_id", selectedRound)
      .order("best_time_milliseconds", { ascending: true, nullsFirst: false });

    if (results) {
      const formatted = results.map((r: any) => ({
        student_id: r.student_id,
        first_name: r.students?.first_name || "Unknown",
        last_name: r.students?.last_name || "",
        gender: r.students?.gender || "not_specified",
        grade: r.students?.grade || "-",
        best_time_milliseconds: r.best_time_milliseconds,
        average_time_milliseconds: r.average_time_milliseconds,
        advancement_status: r.advancement_status,
      }));

      setRoundResults(formatted);
    }
  };

  const fetchRoundStats = async () => {
    const { data: results } = await supabase
      .from("final_scores")
      .select("best_time_milliseconds, average_time_milliseconds, is_dnf")
      .eq("round_id", selectedRound);

    if (results) {
      const validTimes = results.filter((r: any) => r.best_time_milliseconds);
      const dnfCount = results.filter((r: any) => r.is_dnf).length;

      const stats: RoundStats = {
        total_competitors: results.length,
        fastest_time: validTimes.length > 0 ? Math.min(...validTimes.map((r: any) => r.best_time_milliseconds)) : null,
        average_time: validTimes.length > 0
          ? Math.round(validTimes.reduce((sum: number, r: any) => sum + (r.average_time_milliseconds || 0), 0) / validTimes.length)
          : null,
        dnf_count: dnfCount,
        completion_rate: results.length > 0 ? Math.round(((results.length - dnfCount) / results.length) * 100) : 0,
      };

      setRoundStats(stats);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!competition) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Competition not found</p>
        <Link href="/competitions">Back to Competitions</Link>
      </div>
    );
  }

  const fastestGirl = roundResults.find((r) => r.gender === "female");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/competitions" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Competitions
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">{competition.name}</h1>
        <p className="text-gray-500 mt-2">Competition Results & Standings</p>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Champion */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Champion</p>
                <p className="text-lg font-bold">
                  {roundResults.find((r) => r.advancement_status === "champion")
                    ? `${roundResults.find((r) => r.advancement_status === "champion")?.first_name} ${roundResults.find((r) => r.advancement_status === "champion")?.last_name}`
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fastest Girl */}
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-sm text-gray-600">Fastest Girl</p>
                <p className="text-lg font-bold">
                  {fastestGirl
                    ? `${fastestGirl.first_name} ${fastestGirl.last_name}`
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Competitors */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Competitors</p>
                <p className="text-lg font-bold">{roundStats?.total_competitors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fastest Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Fastest Time</p>
                <p className="text-lg font-bold font-mono">
                  {roundStats?.fastest_time ? formatTime(roundStats.fastest_time) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Rounds */}
      {events.length > 0 && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results by Round</CardTitle>
            <CardDescription>
              Detailed standings for each round
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedRound} onValueChange={setSelectedRound}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${rounds.length}, 1fr)` }}>
                {rounds.map((round) => (
                  <TabsTrigger key={round.id} value={round.id}>
                    {round.round_name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {rounds.map((round) => (
                <TabsContent key={round.id} value={round.id} className="space-y-6">
                  {/* Round Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Competitors</p>
                        <p className="text-2xl font-bold">{roundStats?.total_competitors}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold">{roundStats?.completion_rate}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Fastest Time</p>
                        <p className="text-lg font-mono font-bold">
                          {roundStats?.fastest_time ? formatTime(roundStats.fastest_time) : "-"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">DNF Count</p>
                        <p className="text-2xl font-bold">{roundStats?.dnf_count}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Results Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Place</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Best Time</TableHead>
                        <TableHead className="text-right">Average</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roundResults.map((result, index) => (
                        <TableRow key={result.student_id} className={result.advancement_status === "champion" ? "bg-yellow-50" : ""}>
                          <TableCell className="font-bold text-lg">
                            {result.advancement_status === "champion" ? "🥇" : result.advancement_status === "runner_up" ? "🥈" : result.advancement_status === "third_place" ? "🥉" : index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {result.first_name} {result.last_name}
                            {result.gender === "female" && <Heart className="h-4 w-4 text-pink-500 inline ml-2" />}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{result.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {result.best_time_milliseconds ? formatTime(result.best_time_milliseconds) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {result.average_time_milliseconds ? formatTime(result.average_time_milliseconds) : "-"}
                          </TableCell>
                          <TableCell>
                            {result.advancement_status === "champion" && <Badge className="bg-yellow-500">Champion</Badge>}
                            {result.advancement_status === "advancing" && <Badge className="bg-green-500">Advancing</Badge>}
                            {result.advancement_status === "eliminated" && <Badge variant="destructive">Eliminated</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
