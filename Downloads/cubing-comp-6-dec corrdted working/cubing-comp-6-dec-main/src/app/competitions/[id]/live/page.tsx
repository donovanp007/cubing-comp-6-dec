"use client";

import { useEffect, useState } from "react";
import { use } from "react";
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
import { ArrowLeft, Eye, Trophy, Users, RefreshCw, Share2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import EventPodium from "@/components/event-podium";

interface Student {
  id: string;
  name: string;
  grade: string;
  gender?: string;
}

interface Group {
  id: string;
  group_name: string;
  color_hex: string;
  color_name: string;
}

interface Result {
  student_id: string;
  student_name: string;
  group_id: string;
  best_time: number;
  average_time: number;
  attempts_completed: number;
  dnf_count: number;
  advancement_status?: string;
  attempts: Array<{ time: number | null; is_dnf: boolean }>;
  is_record_breaker?: boolean;
}

interface Competition {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: string;
}

export default function CompetitionLivePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load persisted selections from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(`live_competition_${competitionId}`);
    if (saved) {
      try {
        const { event, round } = JSON.parse(saved);
        if (event) setSelectedEvent(event);
        if (round) setSelectedRound(round);
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
    }
    // Reset states when competition changes
    setEvents([]);
    setRounds([]);
    setResults([]);
    setSelectedEvent("");
    setSelectedRound("");
    fetchData();
  }, [competitionId]);

  // Auto-refresh every 2 seconds for real-time sync
  useEffect(() => {
    if (!selectedEvent || !selectedRound) return;

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedEvent, selectedRound]);

  // Refetch rounds when selected event changes
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchRounds = async () => {
      const { data: roundsData, error: roundsError } = await supabase
        .from("rounds")
        .select("*")
        .eq("competition_event_id", selectedEvent)
        .order("round_number");

      if (!roundsError) {
        setRounds(roundsData || []);
        if (roundsData && roundsData.length > 0) {
          setSelectedRound(roundsData[0].id);
        }
      }
    };

    fetchRounds();
  }, [selectedEvent]);

  // Persist selections to sessionStorage
  useEffect(() => {
    if (selectedEvent && selectedRound) {
      sessionStorage.setItem(
        `live_competition_${competitionId}`,
        JSON.stringify({ event: selectedEvent, round: selectedRound })
      );
    }
  }, [selectedEvent, selectedRound, competitionId]);

  const fetchData = async () => {
    try {
      setError(null);
      if (!loading) setIsRefreshing(true);

      // Fetch competition
      const { data: comp, error: compError } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", competitionId)
        .single();

      if (compError || !comp) {
        setError("Competition not found");
        setLoading(false);
        return;
      }

      setCompetition(comp);

      // Always fetch events for this competition
      const { data: eventsData, error: eventsError } = await supabase
        .from("competition_events")
        .select("*, event_types(*)")
        .eq("competition_id", competitionId)
        .order("event_types(name)");

      if (!eventsError) {
        setEvents(eventsData || []);
        if (eventsData && eventsData.length > 0 && !selectedEvent) {
          setSelectedEvent(eventsData[0].id);
        }
      }

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("competition_groups")
        .select("*")
        .eq("competition_id", competitionId)
        .order("sort_order");

      if (!groupsError) {
        setGroups(groupsData || []);
      }

      // Fetch results if round selected - get live data from results table
      if (selectedRound) {
        // Fetch all registrations for this competition
        const { data: registrationsData } = await supabase
          .from("registrations")
          .select("*, students(id, first_name, last_name, grade)")
          .eq("competition_id", competitionId);

        if (registrationsData && registrationsData.length > 0) {
          const studentIds = registrationsData.map((r: any) => r.students.id);

          // Get all results for this round
          const { data: allResults } = await supabase
            .from("results")
            .select("student_id, time_milliseconds, is_dnf, attempt_number")
            .eq("round_id", selectedRound)
            .in("student_id", studentIds);

          // Get group assignments
          const { data: assignments } = await supabase
            .from("group_assignments")
            .select("student_id, competition_groups(id, group_name)")
            .eq("competition_id", competitionId)
            .in("student_id", studentIds);

          // Create lookup maps
          const assignmentMap = new Map(
            (assignments || []).map((a: any) => [
              a.student_id,
              a.competition_groups?.id || "",
            ])
          );

          // Build a map of student times and all attempts
          const studentResultsMap = new Map<
            string,
            {
              bestTime: number | null;
              averageTime: number | null;
              attempts: number;
              dnfCount: number;
              allAttempts: Array<{ time: number | null; is_dnf: boolean }>;
            }
          >();

          allResults?.forEach((result: any) => {
            const studentId = result.student_id;
            let current = studentResultsMap.get(studentId) || {
              bestTime: null,
              averageTime: null,
              attempts: 0,
              dnfCount: 0,
              allAttempts: [],
            };

            // Track all attempts
            current.allAttempts.push({
              time: result.is_dnf ? null : result.time_milliseconds,
              is_dnf: result.is_dnf,
            });

            // Track best time (excluding DNF)
            if (!result.is_dnf && result.time_milliseconds) {
              current.bestTime = !current.bestTime
                ? result.time_milliseconds
                : Math.min(current.bestTime, result.time_milliseconds);
            }

            current.attempts += 1;
            if (result.is_dnf) current.dnfCount += 1;

            studentResultsMap.set(studentId, current);
          });

          // Calculate averages for each student (standard: best of 5 is average of middle 3)
          studentResultsMap.forEach((stats, studentId) => {
            if (stats.allAttempts.length > 0) {
              // Get all valid times (non-DNF)
              const validTimes = stats.allAttempts
                .filter((a) => a.time !== null && !a.is_dnf)
                .map((a) => a.time as number)
                .sort((a, b) => a - b);

              if (validTimes.length > 0) {
                // For 5 attempts: remove best and worst, average the middle 3
                if (validTimes.length >= 3) {
                  const middle = validTimes.slice(1, -1);
                  stats.averageTime = Math.round(middle.reduce((a, b) => a + b, 0) / middle.length);
                } else if (validTimes.length === 2) {
                  // If only 2 valid times, average them
                  stats.averageTime = Math.round((validTimes[0] + validTimes[1]) / 2);
                } else {
                  // Only 1 valid time, use it as average
                  stats.averageTime = validTimes[0];
                }
              } else if (stats.dnfCount < stats.allAttempts.length) {
                // Has some invalid times but not all DNF
                stats.averageTime = null;
              } else {
                // All DNF
                stats.averageTime = null;
              }
            }
          });

          // Find competition record (best time across all students)
          let recordTime: number | null = null;
          studentResultsMap.forEach((stats) => {
            if (stats.bestTime) {
              recordTime = recordTime ? Math.min(recordTime, stats.bestTime) : stats.bestTime;
            }
          });

          // Build results array with live data - show ALL students, with times if available
          const resultsData: Result[] = registrationsData
            .map((reg: any) => {
              const studentId = reg.students.id;
              const stats = studentResultsMap.get(studentId) || {
                bestTime: null,
                averageTime: null,
                attempts: 0,
                dnfCount: 0,
                allAttempts: [],
              };

              // Pad attempts array to show all 5 slots
              const allAttempts = [...stats.allAttempts];
              while (allAttempts.length < 5) {
                allAttempts.push({ time: null, is_dnf: false });
              }

              return {
                student_id: studentId,
                student_name: `${reg.students.first_name} ${reg.students.last_name}`.trim(),
                group_id: assignmentMap.get(studentId) || "",
                best_time: stats.bestTime || 0,
                average_time: stats.averageTime || 0,
                attempts_completed: stats.attempts,
                dnf_count: stats.dnfCount,
                advancement_status: undefined,
                attempts: allAttempts,
                is_record_breaker: !!(recordTime && stats.bestTime && stats.bestTime === recordTime && stats.bestTime > 0),
              };
            })
            .sort((a, b) => {
              // Sort by average time (students with averages first, then by average)
              if (!a.average_time && !b.average_time) return 0;
              if (!a.average_time) return 1;
              if (!b.average_time) return -1;
              return a.average_time - b.average_time;
            });

          setResults(resultsData);
        } else {
          setResults([]);
        }
      }

      setLastUpdated(new Date());
      setLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load competition data");
      setLoading(false);
      setIsRefreshing(false);
    }
  };


  const getGroupColor = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group?.color_hex || "#808080";
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group?.group_name || "Unknown";
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/competitions/${competitionId}/live`;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${competition?.name} - Live Results`,
          text: "Watch the live cubing competition results",
          url: url,
        });
        return;
      } catch (err) {
        console.log("Share cancelled");
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "champion":
        return <Badge className="bg-yellow-600">🥇 CHAMPION</Badge>;
      case "runner_up":
        return <Badge className="bg-gray-400">🥈 RUNNER-UP</Badge>;
      case "third_place":
        return <Badge className="bg-orange-600">🥉 3RD PLACE</Badge>;
      case "finalist":
        return <Badge className="bg-purple-600">🏆 FINALIST</Badge>;
      case "advancing":
        return <Badge className="bg-green-600">✅ ADVANCING</Badge>;
      case "eliminated":
        return <Badge className="bg-red-600">❌ ELIMINATED</Badge>;
      default:
        return <Badge className="bg-slate-600">⏳ PENDING</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 bg-slate-700 rounded-lg mb-4">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-white text-xl font-semibold mb-4">Loading Live Results...</p>
          <p className="text-slate-300">Connecting to competition data</p>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <Link href="/competitions" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Competitions
        </Link>
        <Card className="bg-slate-800 border-slate-700 border-red-500/30">
          <CardContent className="p-8 text-center">
            <p className="text-white text-lg">{error || "Competition not found"}</p>
            <button
              onClick={() => fetchData()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/competitions" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Competitions
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{competition.name}</h1>
                <Badge className={competition.status === "in_progress" ? "bg-green-600" : "bg-slate-600"}>
                  {competition.status === "in_progress" ? "🔴 LIVE" : "Offline"}
                </Badge>
              </div>
              {competition.description && (
                <p className="text-slate-300">{competition.description}</p>
              )}
            </div>
            <Button
              onClick={handleShare}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Link
                </>
              )}
            </Button>
          </div>

          {/* Location */}
          {competition.location && (
            <p className="text-slate-400 flex items-center gap-2">
              📍 {competition.location}
            </p>
          )}
        </div>

        {/* Status bar */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardContent className="p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Eye className="h-5 w-5" />
              <span className="font-medium">
                Live Results • Last updated: {lastUpdated.toLocaleTimeString()}
                {isRefreshing && " (updating...)"}
              </span>
            </div>
            <Badge className="bg-white/20 flex items-center gap-2">
              {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
              Auto-refreshing every 2 seconds
            </Badge>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Event Select */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Event</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setSelectedRound("");
                }}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_types.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Round Select */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Round</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {rounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.round_name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Rankings Table */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white">Live Rankings</CardTitle>
              </div>
              <span className="text-slate-400 text-sm">{results.length} competitors</span>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p>No results yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300 w-12">Pos</TableHead>
                    <TableHead className="text-slate-300">Group</TableHead>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300 text-right">Attempt 1</TableHead>
                    <TableHead className="text-slate-300 text-right">Attempt 2</TableHead>
                    <TableHead className="text-slate-300 text-right">Attempt 3</TableHead>
                    <TableHead className="text-slate-300 text-right">Attempt 4</TableHead>
                    <TableHead className="text-slate-300 text-right">Attempt 5</TableHead>
                    <TableHead className="text-slate-300 text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow
                      key={result.student_id}
                      className={`border-slate-700 ${
                        result.advancement_status === "advancing" || result.advancement_status?.includes("champion") || result.advancement_status?.includes("runner") || result.advancement_status?.includes("third")
                          ? "bg-green-900/20"
                          : result.advancement_status === "eliminated"
                          ? "bg-red-900/20"
                          : "hover:bg-slate-700/50"
                      }`}
                    >
                      <TableCell className="font-bold text-white">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && <span className="text-slate-400">#{index + 1}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: getGroupColor(result.group_id) + "30", borderColor: getGroupColor(result.group_id) }}
                          className="border text-white"
                        >
                          {getGroupName(result.group_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          {result.student_name}
                          {result.is_record_breaker && (
                            <Badge className="bg-yellow-600 animate-pulse">🏆 RECORD</Badge>
                          )}
                        </div>
                      </TableCell>
                      {result.attempts.map((attempt, attemptIdx) => (
                        <TableCell key={attemptIdx} className="text-right text-white font-mono text-sm">
                          {attempt.time === null ? (
                            <span className="text-slate-500">-</span>
                          ) : attempt.is_dnf ? (
                            <span className="text-red-400 font-bold">DNF</span>
                          ) : (
                            <span>{formatTime(attempt.time)}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-white font-mono font-bold text-lg">
                        {result.average_time > 0 ? formatTime(result.average_time) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Podium & Achievements Section */}
        {results.length > 0 && selectedEvent && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Achievements & Podiums - {events.find((e) => e.id === selectedEvent)?.event_types?.name || "Current Event"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const eventName = events.find((e) => e.id === selectedEvent)?.event_types?.name || "Unknown Event";

                  // Top 3 by average time (final standings)
                  const topResults = results
                    .slice()
                    .sort((a, b) => {
                      if (!a.average_time && !b.average_time) return 0;
                      if (!a.average_time) return 1;
                      if (!b.average_time) return -1;
                      return a.average_time - b.average_time;
                    })
                    .slice(0, 3);

                  // Find student with fastest best time overall
                  const fastestBestTime = results
                    .slice()
                    .sort((a, b) => {
                      if (!a.best_time && !b.best_time) return 0;
                      if (!a.best_time) return 1;
                      if (!b.best_time) return -1;
                      return a.best_time - b.best_time;
                    })[0];

                  return (
                    <EventPodium
                      key="podium"
                      eventName={eventName}
                      podium={topResults}
                      fastestGirl={fastestBestTime}
                    />
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group status */}
        {groups.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groups Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {groups.map((group) => {
                  const groupStudents = results.filter((r) => r.group_id === group.id);
                  const completedStudents = groupStudents.filter(
                    (r) => r.attempts_completed === 5
                  ).length;

                  return (
                    <div key={group.id} className="p-4 rounded-lg bg-slate-700 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: group.color_hex }}
                        />
                        <p className="text-white font-medium">{group.group_name}</p>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {completedStudents}/{groupStudents.length} completed
                      </p>
                      <div className="mt-2 w-full bg-slate-600 rounded h-2">
                        <div
                          className="bg-green-500 h-2 rounded transition-all duration-300"
                          style={{
                            width: `${groupStudents.length > 0 ? (completedStudents / groupStudents.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>This page updates automatically every 5 seconds</p>
          <p>Share this URL with parents to show live competition results</p>
        </div>
      </div>
    </div>
  );
}
