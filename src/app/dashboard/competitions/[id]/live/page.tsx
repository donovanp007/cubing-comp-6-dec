"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, X, Flag } from "lucide-react";
import Link from "next/link";
import { calculateRanking } from "@/lib/utils/ranking";
import { completeRoundAndCalculateAdvancement, getAdvancementSummary } from "@/lib/utils/apply-advancement";
import { formatTime as formatTimeMs } from "@/lib/utils/advancement";

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface Group {
  id: string;
  group_name: string;
  color_hex: string;
  color_name: string;
  students: Student[];
}

interface CompetitionEvent {
  id: string;
  event_types: { id: string; name: string };
}

interface Round {
  id: string;
  round_number: number;
  round_name: string;
}

interface LiveResult {
  studentId: string;
  studentName: string;
  groupId: string;
  attempt: number;
  times: (number | null)[];
  dnf: boolean[];
}

export default function CompetitionLivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [competition, setCompetition] = useState<any>(null);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isDNF, setIsDNF] = useState(false);
  const [studentProgress, setStudentProgress] = useState<Map<string, number>>(new Map());
  const [liveResults, setLiveResults] = useState<Map<string, LiveResult>>(new Map());

  // Advancement configuration
  const [showAdvancementConfig, setShowAdvancementConfig] = useState(false);
  const [advancementType, setAdvancementType] = useState<"percentage" | "count" | "time" | "all">("percentage");
  const [cutoffPercentage, setCutoffPercentage] = useState(75);
  const [cutoffCount, setCutoffCount] = useState(8);
  const [cutoffTimeSeconds, setCutoffTimeSeconds] = useState(30);
  const [isCompleting, setIsCompleting] = useState(false);
  const [advancementResults, setAdvancementResults] = useState<any>(null);
  const [penalty, setPenalty] = useState(0); // 0 = none, 2 = +2 seconds

  // Load persisted live state on mount AND when competition changes
  useEffect(() => {
    const savedLiveState = localStorage.getItem(`live_state_${competitionId}`);
    if (savedLiveState === "true") {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
    fetchData();
  }, [competitionId]);

  // Persist live state to localStorage (survives page refreshes and navigation)
  useEffect(() => {
    localStorage.setItem(`live_state_${competitionId}`, isLive.toString());
  }, [isLive, competitionId]);

  useEffect(() => {
    if (selectedEvent) {
      fetchRounds();
    }
  }, [selectedEvent]);

  useEffect(() => {
    const selectedGroupData = groups.find((g) => g.id === selectedGroup);
    const groupStudents = selectedGroupData?.students || [];
    if (groupStudents.length > 0) {
      setSelectedStudent(groupStudents[0].id);
    }
  }, [selectedGroup, groups]);

  useEffect(() => {
    if (selectedRound) {
      fetchRoundStudents();
    }
  }, [selectedRound]);

  useEffect(() => {
    if (selectedRound && selectedGroup) {
      fetchStudentProgress();
    }
  }, [selectedRound, selectedGroup]);

  // When student selection changes, reset input fields and update current attempt
  useEffect(() => {
    if (selectedStudent && studentProgress) {
      // Clear input fields
      setInputValue("");
      setIsDNF(false);
      setPenalty(0);

      // Get student's current progress and set attempt to next one
      const progress = studentProgress.get(selectedStudent) || 0;
      const nextAttempt = Math.min(progress + 1, 5);
      setCurrentAttempt(nextAttempt);
    }
  }, [selectedStudent, studentProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter: Submit time
      if (e.key === "Enter" && isLive && selectedStudent) {
        e.preventDefault();
        handleTimeEntry(selectedStudent);
      }
      // Space: Toggle DNF
      if (e.code === "Space" && isLive) {
        e.preventDefault();
        setIsDNF(!isDNF);
      }
      // Escape: Clear input
      if (e.key === "Escape") {
        setInputValue("");
        setIsDNF(false);
      }
      // ArrowDown: Next attempt
      if (e.code === "ArrowDown" && isLive && currentAttempt < 5) {
        e.preventDefault();
        setCurrentAttempt(currentAttempt + 1);
      }
      // ArrowUp: Previous attempt
      if (e.code === "ArrowUp" && isLive && currentAttempt > 1) {
        e.preventDefault();
        setCurrentAttempt(currentAttempt - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLive, selectedStudent, isDNF, currentAttempt]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch competition
      const { data: comp } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", competitionId)
        .single();

      setCompetition(comp);

      // Fetch events
      const { data: eventsData } = await supabase
        .from("competition_events")
        .select("*, event_types(*)")
        .eq("competition_id", competitionId);

      setEvents(eventsData || []);
      if (eventsData && eventsData.length > 0) {
        setSelectedEvent(eventsData[0].id);
      }

      // Fetch groups
      const { data: groupsData } = await supabase
        .from("competition_groups")
        .select("*")
        .eq("competition_id", competitionId)
        .order("sort_order", { ascending: true });

      // Fetch group assignments with students
      const { data: assignmentsData } = await supabase
        .from("group_assignments")
        .select("group_id, student_id, students(id, first_name, last_name, grade)")
        .eq("competition_id", competitionId);

      // Map students to groups
      let processedGroups = (groupsData || []).map((g: any) => ({
        ...g,
        students: (assignmentsData || [])
          .filter((a: any) => a.group_id === g.id)
          .map((a: any) => a.students)
          .filter(Boolean),
      }));

      // If no groups exist, fetch students from registrations and create a default group
      const totalStudentsInGroups = processedGroups.reduce(
        (sum, g) => sum + (g.students?.length || 0),
        0
      );

      if (processedGroups.length === 0 || totalStudentsInGroups === 0) {
        // Fetch students who registered for this competition
        const { data: registrationsData } = await supabase
          .from("registrations")
          .select("*, students(id, first_name, last_name, grade, gender)")
          .eq("competition_id", competitionId);

        if (registrationsData && registrationsData.length > 0) {
          // Create a default "All Students" group
          processedGroups = [
            {
              id: "default-group",
              group_name: "All Students",
              color_hex: "#6366f1",
              color_name: "indigo",
              students: registrationsData
                .map((r: any) => {
                  if (!r.students) return null;
                  return {
                    id: r.students.id,
                    name: `${r.students.first_name} ${r.students.last_name}`.trim(),
                    grade: r.students.grade || "Unknown",
                  };
                })
                .filter(Boolean),
            },
          ];
        }
      }

      setGroups(processedGroups);
      if (processedGroups.length > 0) {
        setSelectedGroup(processedGroups[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load competition data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRounds = async () => {
    try {
      const { data } = await supabase
        .from("rounds")
        .select("*")
        .eq("competition_event_id", selectedEvent)
        .order("round_number");

      setRounds(data || []);
      if (data && data.length > 0) {
        setSelectedRound(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching rounds:", error);
    }
  };

  const fetchRoundStudents = async () => {
    try {
      // Fetch all students registered for this competition
      const { data: registrationsData } = await supabase
        .from("registrations")
        .select("*, students(id, first_name, last_name, grade)")
        .eq("competition_id", competitionId);

      if (!registrationsData) return;

      // Get group assignments to organize students by groups
      const { data: assignmentsData } = await supabase
        .from("group_assignments")
        .select("student_id, competition_groups(id, group_name, color_hex, color_name, sort_order)")
        .eq("competition_id", competitionId);

      // Organize students by groups
      const groupMap = new Map<string, Group>();
      const assignmentMap = new Map<string, string>(); // student_id -> group_id

      assignmentsData?.forEach((a: any) => {
        const groupId = a.competition_groups?.id;
        if (groupId) {
          assignmentMap.set(a.student_id, groupId);

          if (!groupMap.has(groupId)) {
            groupMap.set(groupId, {
              id: groupId,
              group_name: a.competition_groups.group_name,
              color_hex: a.competition_groups.color_hex,
              color_name: a.competition_groups.color_name,
              students: [],
            });
          }
        }
      });

      // Add students to groups
      const assignedStudentIds = new Set<string>();

      registrationsData.forEach((reg: any) => {
        const student = {
          id: reg.students.id,
          name: `${reg.students.first_name} ${reg.students.last_name}`.trim(),
          grade: reg.students.grade || "Unknown",
        };

        const groupId = assignmentMap.get(reg.students.id);
        if (groupId && groupMap.has(groupId)) {
          groupMap.get(groupId)!.students.push(student);
          assignedStudentIds.add(reg.students.id);
        }
      });

      // Get or create "All Students" group for unassigned students
      let processedGroups = Array.from(groupMap.values());

      const unassignedStudents = registrationsData
        .filter((r: any) => !assignedStudentIds.has(r.students.id))
        .map((r: any) => ({
          id: r.students.id,
          name: `${r.students.first_name} ${r.students.last_name}`.trim(),
          grade: r.students.grade || "Unknown",
        }));

      // If there are unassigned students, add them to "All Students" group
      if (unassignedStudents.length > 0) {
        const allStudentsGroup = processedGroups.find(g => g.id === "default-group" || g.group_name === "All Students");
        if (allStudentsGroup) {
          allStudentsGroup.students.push(...unassignedStudents);
        } else {
          processedGroups.push({
            id: "default-group",
            group_name: "All Students",
            color_hex: "#6366f1",
            color_name: "indigo",
            students: unassignedStudents,
          });
        }
      }

      // If no groups at all, create default group with all students
      if (processedGroups.length === 0) {
        processedGroups = [
          {
            id: "default-group",
            group_name: "All Students",
            color_hex: "#6366f1",
            color_name: "indigo",
            students: registrationsData.map((r: any) => ({
              id: r.students.id,
              name: `${r.students.first_name} ${r.students.last_name}`.trim(),
              grade: r.students.grade || "Unknown",
            })),
          },
        ];
      }

      setGroups(processedGroups);
      if (processedGroups.length > 0) {
        setSelectedGroup(processedGroups[0].id);
      }
    } catch (error) {
      console.error("Error fetching round students:", error);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const selectedGroupData = groups.find((g) => g.id === selectedGroup);
      const groupStudents = selectedGroupData?.students || [];

      if (groupStudents.length === 0) return;

      const { data } = await supabase
        .from("results")
        .select("student_id, attempt_number")
        .eq("round_id", selectedRound)
        .in("student_id", groupStudents.map((s) => s.id));

      const progressMap = new Map<string, number>();
      data?.forEach((result) => {
        const current = progressMap.get(result.student_id) || 0;
        progressMap.set(result.student_id, Math.max(current, result.attempt_number));
      });

      setStudentProgress(progressMap);
    } catch (error) {
      console.error("Error fetching student progress:", error);
    }
  };

  const parseTimeInput = (input: string): number | null => {
    if (!input) return null;

    const num = parseInt(input.replace(/\D/g, ""), 10);
    if (isNaN(num)) return null;

    // Standard cubing centiseconds format:
    // "1234" = 12.34 seconds = 12340 milliseconds
    // "2534" = 25.34 seconds = 25340 milliseconds
    // "120323" = 1203.23 centiseconds = 1203.23 seconds (hmm, that's too much)

    // Better interpretation: last 2 digits are centiseconds
    // "1234" = 12 seconds 34 centiseconds = 12.34s
    // "234" = 2 seconds 34 centiseconds = 2.34s
    // "34" = 0 seconds 34 centiseconds = 0.34s
    // "120323" = 1203 seconds 23 centiseconds = 1203.23s (20 minutes!)

    const centiseconds = num % 100;
    const seconds = Math.floor(num / 100);
    const totalMs = (seconds * 1000) + (centiseconds * 10);

    return totalMs;
  };

  const formatTime = (ms: number): string => {
    if (!ms) return "-.--";
    const seconds = ms / 1000;
    return seconds.toFixed(2);
  };

  const formatTimeDisplay = (ms: number): string => {
    if (!ms) return "-.--";
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}:${secs.toFixed(2).padStart(5, '0')}`;
    }
    return secs.toFixed(2);
  };

  const handleCompleteRound = async () => {
    if (!selectedRound) {
      toast({
        title: "Error",
        description: "Please select a round",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);
    try {
      const result = await completeRoundAndCalculateAdvancement(
        selectedRound,
        selectedEvent,
        {
          advancementType,
          cutoffPercentage: advancementType === "percentage" ? cutoffPercentage : undefined,
          cutoffCount: advancementType === "count" ? cutoffCount : undefined,
          cutoffTime: advancementType === "time" ? cutoffTimeSeconds * 1000 : undefined,
        },
        false
      );

      if (result.success) {
        // Fetch advancement summary to display
        const summary = await getAdvancementSummary(selectedRound);
        setAdvancementResults(summary);

        toast({
          title: "Round Completed!",
          description: `${result.advancingCount} advancing, ${result.eliminatedCount} eliminated`,
        });

        setShowAdvancementConfig(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete round",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing round:", error);
      toast({
        title: "Error",
        description: "Failed to calculate advancement",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleMoveToNextRound = async () => {
    try {
      if (!selectedEvent) return;

      // Fetch all rounds for this event
      const { data: allRounds } = await supabase
        .from("rounds")
        .select("*")
        .eq("competition_event_id", selectedEvent)
        .order("round_number", { ascending: true });

      if (!allRounds || allRounds.length === 0) {
        toast({
          title: "No Rounds Found",
          description: "No rounds available for this event",
          variant: "destructive",
        });
        return;
      }

      // Find current round number
      const currentRound = allRounds.find((r) => r.id === selectedRound);
      if (!currentRound) return;

      const currentRoundNumber = currentRound.round_number;
      const nextRound = allRounds.find((r) => r.round_number === currentRoundNumber + 1);

      if (!nextRound) {
        toast({
          title: "No Next Round",
          description: "This was the final round",
          variant: "default",
        });
        return;
      }

      // Move to next round
      setSelectedRound(nextRound.id);
      setAdvancementResults(null);
      setInputValue("");
      setIsDNF(false);
      setPenalty(0);
      setCurrentAttempt(1);
      setStudentProgress(new Map());

      toast({
        title: "Moving to Next Round",
        description: `Moving to Round ${nextRound.round_number}: ${nextRound.round_name}`,
      });
    } catch (error) {
      console.error("Error moving to next round:", error);
      toast({
        title: "Error",
        description: "Failed to move to next round",
        variant: "destructive",
      });
    }
  };

  const updateStudentRanking = async (
    studentId: string,
    roundId: string,
    eventId: string
  ) => {
    try {
      // Fetch all results for this student in this round
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select("time_milliseconds, is_dnf")
        .eq("student_id", studentId)
        .eq("round_id", roundId)
        .order("attempt_number");

      if (resultsError) throw resultsError;

      if (!results || results.length === 0) {
        return;
      }

      // Extract times
      const times = results.map((r: any) =>
        r.is_dnf ? null : r.time_milliseconds
      );

      // Get event format
      const { data: eventData } = await supabase
        .from("competition_events")
        .select("total_rounds")
        .eq("id", eventId)
        .single();

      // Default format: "Average of 5" for most events
      const format = "Average of 5"; // TODO: Get from event_types table when available

      // Calculate ranking
      const ranking = calculateRanking(times, format);

      // Update or insert into final_scores
      const { error: upsertError } = await supabase.from("final_scores").upsert(
        {
          student_id: studentId,
          round_id: roundId,
          best_time_milliseconds: ranking.bestTime,
          average_time_milliseconds: ranking.averageTime,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,round_id",
        }
      );

      if (upsertError) {
        console.error("Error updating ranking:", {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code,
          studentId,
          roundId,
          ranking
        });
      }
    } catch (error) {
      console.error("Error in updateStudentRanking:", {
        message: error instanceof Error ? error.message : String(error),
        error,
        studentId,
        roundId,
      });
    }
  };

  const handleTimeEntry = async (studentId: string) => {
    if (!isLive) {
      toast({
        title: "Not Live",
        description: "Click 'Go Live' to start recording times",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRound) {
      toast({
        title: "No Round Selected",
        description: "Please select a round first",
        variant: "destructive",
      });
      return;
    }

    if (!isDNF) {
      const timeMs = parseTimeInput(inputValue);
      if (timeMs === null || timeMs === 0) {
        toast({
          title: "Invalid time",
          description: "Please enter a valid time",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const timeMs = isDNF ? null : parseTimeInput(inputValue);

      // Save to database with penalty_seconds field (using upsert to handle updates)
      const { data, error } = await supabase.from("results").upsert({
        round_id: selectedRound,
        student_id: studentId,
        attempt_number: currentAttempt,
        time_milliseconds: timeMs,
        is_dnf: isDNF,
        penalty_seconds: penalty, // 0 or 2
      },
      {
        onConflict: "round_id,student_id,attempt_number",
      });

      if (error) {
        console.error("Database error:", error);
        throw new Error(error.message || "Failed to save time to database");
      }

      console.log("Time saved successfully:", { timeMs, penalty, data });

      toast({
        title: "Success",
        description: isDNF
          ? `Recorded DNF for attempt ${currentAttempt}`
          : `Recorded ${formatTime(timeMs!)}${penalty === 2 ? ' (+2s penalty)' : ''} for attempt ${currentAttempt}`,
      });

      // Clear input, DNF, and penalty
      setInputValue("");
      setIsDNF(false);
      setPenalty(0);

      // Auto-advance to next attempt or show completion
      if (currentAttempt < 5) {
        setCurrentAttempt(currentAttempt + 1);
      } else {
        // All 5 attempts done
        toast({
          title: "Attempts Complete",
          description: `All 5 attempts recorded for ${selectedStudent}`,
        });
      }

      // Auto-calculate and save rankings
      await updateStudentRanking(studentId, selectedRound, selectedEvent);

      // Update progress
      const currentProgress = studentProgress.get(studentId) || 0;
      const newProgress = Math.max(currentProgress, currentAttempt);

      if (newProgress < 5) {
        // Move to next attempt for same student
        setCurrentAttempt(newProgress + 1);
        setStudentProgress(new Map(studentProgress.set(studentId, newProgress)));
      } else {
        // Student completed all 5 attempts, move to next student
        const selectedGroupData = groups.find((g) => g.id === selectedGroup);
        const groupStudents = selectedGroupData?.students || [];
        const currentIndex = groupStudents.findIndex((s) => s.id === studentId);

        if (currentIndex < groupStudents.length - 1) {
          const nextStudent = groupStudents[currentIndex + 1];
          setSelectedStudent(nextStudent.id);
          const nextProgress = studentProgress.get(nextStudent.id) || 0;
          setCurrentAttempt(nextProgress + 1);
        } else {
          // Last student in group completed
          toast({
            title: "Group Complete",
            description: "All students have completed their 5 attempts",
          });
          setCurrentAttempt(1);
        }
      }
    } catch (error) {
      console.error("Error saving time:", error);
      toast({
        title: "Error",
        description: "Failed to save time",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading...</div>;
  }

  const selectedGroupData = groups.find((g) => g.id === selectedGroup);
  const groupStudents = selectedGroupData?.students || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/competitions/${competitionId}`}>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competition
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">
              {competition?.name} - Live Entry
            </h1>
            <Button
              size="lg"
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? "destructive" : "default"}
              className="gap-2"
            >
              {isLive ? (
                <>
                  <Pause className="h-5 w-5" />
                  Stop Live
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Go Live
                </>
              )}
            </Button>
          </div>
          <p className="text-slate-300">
            Enter times for each student's attempts in real-time
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Event Select */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">
                Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Event...</option>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.event_types?.name || 'Unknown Event'}
                    </option>
                  ))
                ) : (
                  <option disabled>No events available</option>
                )}
              </select>
            </CardContent>
          </Card>

          {/* Round Select */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">
                Round
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Round...</option>
                {rounds && rounds.length > 0 ? (
                  rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.round_name} (Round {round.round_number})
                    </option>
                  ))
                ) : (
                  <option disabled>No rounds available</option>
                )}
              </select>
            </CardContent>
          </Card>

          {/* Group Select */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">
                Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Group...</option>
                {groups && groups.length > 0 ? (
                  groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.group_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No groups available</option>
                )}
              </select>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={isLive ? "bg-green-600" : "bg-slate-600"}>
                {isLive ? "🔴 LIVE" : "⚪ STOPPED"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students list */}
          <Card className="lg:col-span-1 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedGroupData?.group_name} ({groupStudents.length} students)
              </CardTitle>
              <CardDescription className="text-slate-300">
                Click any student to record their time (any order)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupStudents.length === 0 ? (
                  <p className="text-slate-400 text-sm">No students in this group</p>
                ) : (
                  groupStudents.map((student) => (
                    <Button
                      key={student.id}
                      variant={selectedStudent === student.id ? "default" : "outline"}
                      className={`w-full justify-between text-left h-auto py-3 ${
                        selectedStudent === student.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-black">{student.name}</p>
                        <p className="text-xs text-slate-600">Grade {student.grade}</p>
                      </div>
                      <Badge variant="outline" className="text-xs ml-2">
                        {studentProgress.get(student.id) || 0}/5
                      </Badge>
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time entry */}
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Time Entry</CardTitle>
              <CardDescription>Enter times in seconds (e.g., "2534" = 25.34s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attempt counter */}
              <div className="bg-slate-700 p-4 rounded border border-slate-600">
                <div className="text-center">
                  <p className="text-slate-300 text-sm mb-2">Current Attempt</p>
                  <p className="text-5xl font-bold text-white">{currentAttempt}/5</p>
                </div>
              </div>

              {/* Time input */}
              <div className="space-y-2">
                <label className="text-white font-medium block">Enter Time</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && selectedStudent) {
                      handleTimeEntry(selectedStudent);
                    }
                  }}
                  placeholder="2534"
                  className="w-full px-4 py-3 bg-slate-700 text-white text-2xl text-center rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                  autoFocus
                />
                <p className="text-slate-400 text-sm text-center">
                  Preview: {parseTimeInput(inputValue) ? formatTimeDisplay(parseTimeInput(inputValue)!) : "-.--"}
                </p>
              </div>

              {/* DNF option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dnf"
                  checked={isDNF}
                  onChange={(e) => {
                    setIsDNF(e.target.checked);
                    if (e.target.checked) {
                      setInputValue("");
                    }
                  }}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="dnf" className="text-white font-medium cursor-pointer">
                  Did Not Finish (DNF)
                </label>
              </div>

              {/* +2 Penalty option */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setPenalty(penalty === 2 ? 0 : 2)}
                  variant={penalty === 2 ? "default" : "outline"}
                  className={`flex-1 ${penalty === 2 ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  disabled={isDNF || !inputValue}
                >
                  {penalty === 2 ? '✓ +2 Seconds' : '+ 2 Seconds'}
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleTimeEntry(selectedStudent)}
                  className="flex-1 h-12 text-lg gap-2"
                  disabled={!selectedStudent || !selectedRound || (!inputValue && !isDNF) || !isLive}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Record Attempt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputValue("");
                    setCurrentAttempt(1);
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick tips and shortcuts */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Keyboard Shortcuts & Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm space-y-3">
            <div>
              <p className="font-semibold text-white mb-2">Shortcuts:</p>
              <p>• <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Enter</kbd> - Submit time</p>
              <p>• <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Space</kbd> - Toggle DNF</p>
              <p>• <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">↑↓</kbd> - Change attempt</p>
              <p>• <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Esc</kbd> - Clear input</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Tips:</p>
              <p>• Type time in centiseconds (e.g., "2534" = 25.34s)</p>
              <p>• System automatically calculates rankings after each time</p>
              <p>• All 5 attempts are tracked per student</p>
            </div>
          </CardContent>
        </Card>

        {/* Complete Round Section */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white">Complete Round & Calculate Advancement</CardTitle>
              </div>
              <Button
                onClick={() => setShowAdvancementConfig(!showAdvancementConfig)}
                variant={showAdvancementConfig ? "secondary" : "outline"}
                size="sm"
              >
                {showAdvancementConfig ? "Hide" : "Show"} Configuration
              </Button>
            </div>
            <CardDescription>
              When all students have completed their attempts, use this to automatically calculate who advances
            </CardDescription>
          </CardHeader>

          {showAdvancementConfig && (
            <CardContent className="space-y-6 border-t border-slate-700 pt-6">
              {/* Advancement Type Selection */}
              <div className="space-y-3">
                <p className="font-semibold text-white">Advancement Type</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={advancementType === "percentage" ? "default" : "outline"}
                    onClick={() => setAdvancementType("percentage")}
                    className="text-left justify-start"
                  >
                    <input type="radio" checked={advancementType === "percentage"} onChange={() => {}} className="mr-2" />
                    Percentage (Top X%)
                  </Button>
                  <Button
                    variant={advancementType === "count" ? "default" : "outline"}
                    onClick={() => setAdvancementType("count")}
                    className="text-left justify-start"
                  >
                    <input type="radio" checked={advancementType === "count"} onChange={() => {}} className="mr-2" />
                    Count (Top N)
                  </Button>
                  <Button
                    variant={advancementType === "time" ? "default" : "outline"}
                    onClick={() => setAdvancementType("time")}
                    className="text-left justify-start"
                  >
                    <input type="radio" checked={advancementType === "time"} onChange={() => {}} className="mr-2" />
                    Time-Based
                  </Button>
                  <Button
                    variant={advancementType === "all" ? "default" : "outline"}
                    onClick={() => setAdvancementType("all")}
                    className="text-left justify-start"
                  >
                    <input type="radio" checked={advancementType === "all"} onChange={() => {}} className="mr-2" />
                    All Advance
                  </Button>
                </div>
              </div>

              {/* Cutoff Value */}
              {advancementType === "percentage" && (
                <div className="space-y-2">
                  <label className="text-white font-medium block">Top {cutoffPercentage}% advance</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={cutoffPercentage}
                    onChange={(e) => setCutoffPercentage(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-slate-400 text-sm">{cutoffPercentage}% of competitors will advance to next round</p>
                </div>
              )}

              {advancementType === "count" && (
                <div className="space-y-2">
                  <label className="text-white font-medium block">Top {cutoffCount} competitors</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cutoffCount}
                    onChange={(e) => setCutoffCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-slate-400 text-sm">Top {cutoffCount} will advance to next round</p>
                </div>
              )}

              {advancementType === "time" && (
                <div className="space-y-2">
                  <label className="text-white font-medium block">Under {cutoffTimeSeconds} seconds</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={cutoffTimeSeconds}
                    onChange={(e) => setCutoffTimeSeconds(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-slate-400 text-sm">All students with times under {cutoffTimeSeconds}s advance</p>
                </div>
              )}

              {advancementType === "all" && (
                <div className="p-4 bg-slate-700 rounded border border-slate-600">
                  <p className="text-slate-300">All competitors will advance to the next round (typical for qualification rounds)</p>
                </div>
              )}

              {/* Complete Button */}
              <Button
                onClick={handleCompleteRound}
                disabled={isCompleting}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
              >
                {isCompleting ? "Calculating..." : "✓ Complete Round & Calculate Advancement"}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Advancement Results */}
        {advancementResults && (
          <Card className="mt-8 bg-slate-800 border-slate-700 border-green-600/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">✓ Advancement Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Advancing Students */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Badge className="bg-green-600">✓ ADVANCING</Badge>
                  {advancementResults.advancing.length} students
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {advancementResults.advancing.map((student: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-700 rounded border border-green-600/30 flex justify-between">
                      <span className="text-white">{idx + 1}. {student.name}</span>
                      <span className="text-slate-300 font-mono">{formatTime(student.bestTime)}s</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eliminated Students */}
              {advancementResults.eliminated && advancementResults.eliminated.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-red-600">✗ ELIMINATED</Badge>
                    {advancementResults.eliminated.length} students
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {advancementResults.eliminated.map((student: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-700 rounded border border-red-600/30 flex justify-between">
                        <span className="text-white">{idx + advancementResults.advancing.length + 1}. {student.name}</span>
                        <span className="text-slate-300 font-mono">{formatTime(student.bestTime)}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medalists */}
              {advancementResults.medalists && (
                <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded border border-yellow-600/30">
                  <h3 className="text-white font-semibold mb-2">🏆 Medal Winners</h3>
                  <div className="space-y-1 text-slate-300">
                    <p>🥇 Champion: <span className="text-white font-medium">{advancementResults.medalists.champion}</span></p>
                    <p>🥈 Runner-Up: <span className="text-white font-medium">{advancementResults.medalists.runnerUp}</span></p>
                    <p>🥉 3rd Place: <span className="text-white font-medium">{advancementResults.medalists.thirdPlace}</span></p>
                  </div>
                </div>
              )}

              {/* Move to Next Round Button */}
              <Button
                onClick={handleMoveToNextRound}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 mt-4"
              >
                → Move to Next Round
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
