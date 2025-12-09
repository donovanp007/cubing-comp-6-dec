"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Timer,
  Plus,
  Play,
  CheckCircle,
  Medal,
  Star,
  Zap,
} from "lucide-react";
import type { Competition, CompetitionEvent, EventType, Registration, Student } from "@/lib/types/database.types";
import { calculatePlacementPoints } from "@/lib/utils/event-completion";

interface CompetitionEventWithType extends CompetitionEvent {
  event_types: EventType | null;
}

interface RegistrationWithStudent extends Registration {
  students: Student;
}

interface RankingEntry {
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  bestTime: number;
  gender?: string;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [events, setEvents] = useState<CompetitionEventWithType[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationWithStudent[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Rankings state
  const [rankings, setRankings] = useState<{
    grade1: RankingEntry | null;
    grade2: RankingEntry | null;
    grade3: RankingEntry | null;
    grade4: RankingEntry | null;
    overallWinner: RankingEntry | null;
    fastestGirl: RankingEntry | null;
  }>({
    grade1: null,
    grade2: null,
    grade3: null,
    grade4: null,
    overallWinner: null,
    fastestGirl: null,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitionData();
  }, [competitionId]);

  const fetchRankings = async () => {
    const supabase = createClient();

    try {
      // Get all registered students for this competition
      const { data: registeredStudents } = await supabase
        .from("registrations")
        .select("student_id, students(id, first_name, last_name, grade, gender)")
        .eq("competition_id", competitionId);

      if (!registeredStudents || registeredStudents.length === 0) {
        return;
      }

      // Get final scores for all events
      const { data: finalScores } = await supabase
        .from("final_scores")
        .select("student_id, best_time_milliseconds, rounds(competition_event_id)")
        .not("best_time_milliseconds", "is", null);

      if (!finalScores || finalScores.length === 0) {
        return;
      }

      // Build a map of student fastest times
      const studentTimes: { [key: string]: { student: any; bestTime: number } } = {};

      registeredStudents.forEach((reg: any) => {
        const student = reg.students;
        const studentScores = finalScores.filter((fs: any) => fs.student_id === student.id);

        if (studentScores.length > 0) {
          const bestTime = Math.min(...studentScores.map((fs: any) => fs.best_time_milliseconds || Infinity));
          if (bestTime !== Infinity) {
            studentTimes[student.id] = { student, bestTime };
          }
        }
      });

      // Calculate rankings by grade (sorted by best time - lower is faster)
      const grade1Competitors = Object.values(studentTimes)
        .filter((t: any) => t.student.grade === "1")
        .sort((a: any, b: any) => a.bestTime - b.bestTime);
      const grade2Competitors = Object.values(studentTimes)
        .filter((t: any) => t.student.grade === "2")
        .sort((a: any, b: any) => a.bestTime - b.bestTime);
      const grade3Competitors = Object.values(studentTimes)
        .filter((t: any) => t.student.grade === "3")
        .sort((a: any, b: any) => a.bestTime - b.bestTime);
      const grade4Competitors = Object.values(studentTimes)
        .filter((t: any) => t.student.grade === "4")
        .sort((a: any, b: any) => a.bestTime - b.bestTime);
      const allCompetitors = Object.values(studentTimes).sort(
        (a: any, b: any) => a.bestTime - b.bestTime
      );
      const girlCompetitors = Object.values(studentTimes)
        .filter((t: any) => t.student.gender === "female")
        .sort((a: any, b: any) => a.bestTime - b.bestTime);

      const newRankings = {
        grade1: grade1Competitors.length > 0
          ? {
              studentId: grade1Competitors[0].student.id,
              firstName: grade1Competitors[0].student.first_name,
              lastName: grade1Competitors[0].student.last_name,
              grade: grade1Competitors[0].student.grade,
              bestTime: grade1Competitors[0].bestTime,
              gender: grade1Competitors[0].student.gender,
            }
          : null,
        grade2: grade2Competitors.length > 0
          ? {
              studentId: grade2Competitors[0].student.id,
              firstName: grade2Competitors[0].student.first_name,
              lastName: grade2Competitors[0].student.last_name,
              grade: grade2Competitors[0].student.grade,
              bestTime: grade2Competitors[0].bestTime,
              gender: grade2Competitors[0].student.gender,
            }
          : null,
        grade3: grade3Competitors.length > 0
          ? {
              studentId: grade3Competitors[0].student.id,
              firstName: grade3Competitors[0].student.first_name,
              lastName: grade3Competitors[0].student.last_name,
              grade: grade3Competitors[0].student.grade,
              bestTime: grade3Competitors[0].bestTime,
              gender: grade3Competitors[0].student.gender,
            }
          : null,
        grade4: grade4Competitors.length > 0
          ? {
              studentId: grade4Competitors[0].student.id,
              firstName: grade4Competitors[0].student.first_name,
              lastName: grade4Competitors[0].student.last_name,
              grade: grade4Competitors[0].student.grade,
              bestTime: grade4Competitors[0].bestTime,
              gender: grade4Competitors[0].student.gender,
            }
          : null,
        overallWinner: allCompetitors.length > 0
          ? {
              studentId: allCompetitors[0].student.id,
              firstName: allCompetitors[0].student.first_name,
              lastName: allCompetitors[0].student.last_name,
              grade: allCompetitors[0].student.grade,
              bestTime: allCompetitors[0].bestTime,
              gender: allCompetitors[0].student.gender,
            }
          : null,
        fastestGirl: girlCompetitors.length > 0
          ? {
              studentId: girlCompetitors[0].student.id,
              firstName: girlCompetitors[0].student.first_name,
              lastName: girlCompetitors[0].student.last_name,
              grade: girlCompetitors[0].student.grade,
              bestTime: girlCompetitors[0].bestTime,
              gender: girlCompetitors[0].student.gender,
            }
          : null,
      };

      setRankings(newRankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return "N/A";
    const seconds = milliseconds / 1000;
    return seconds.toFixed(2) + "s";
  };

  const fetchCompetitionData = async () => {
    const supabase = createClient();

    // Fetch competition
    const { data: compData, error } = await supabase
      .from("competitions")
      .select("*")
      .eq("id", competitionId)
      .single();

    if (error || !compData) {
      toast({
        title: "Error",
        description: "Competition not found",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setCompetition(compData);

    // Fetch events
    const { data: eventData } = await supabase
      .from("competition_events")
      .select("*, event_types(*)")
      .eq("competition_id", competitionId)
      .order("created_at");

    setEvents(eventData || []);

    // Fetch registrations
    const { data: regData } = await supabase
      .from("registrations")
      .select("*, students(*)")
      .eq("competition_id", competitionId)
      .order("registration_date");

    setRegistrations(regData || []);

    // Fetch all students for quick-add
    const { data: studentsData } = await supabase
      .from("students")
      .select("*")
      .eq("status", "active")
      .order("last_name");

    setAllStudents(studentsData || []);

    // Fetch rankings
    await fetchRankings();

    setLoading(false);
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    // Check if already registered
    if (registrations.some((r) => r.student_id === selectedStudent)) {
      toast({
        title: "Already Registered",
        description: "This student is already registered for this competition",
        variant: "destructive",
      });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("registrations").insert({
      competition_id: competitionId,
      student_id: selectedStudent,
      status: "confirmed",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Student Added",
        description: "Student has been registered for this competition",
      });
      setSelectedStudent("");
      fetchCompetitionData();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("competitions")
      .update({ status: newStatus })
      .eq("id", competitionId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Competition is now ${newStatus}`,
      });
      fetchCompetitionData();
    }
  };

  const goLive = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get first event
      const { data: firstEvent, error: eventError } = await supabase
        .from("competition_events")
        .select("id")
        .eq("competition_id", competitionId)
        .order("created_at")
        .limit(1)
        .single();

      if (eventError || !firstEvent) {
        toast({
          title: "Error",
          description: "No events configured for this competition",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get first round of the event
      const { data: firstRound, error: roundError } = await supabase
        .from("rounds")
        .select("id")
        .eq("competition_event_id", firstEvent.id)
        .order("round_number")
        .limit(1)
        .single();

      if (roundError || !firstRound) {
        toast({
          title: "Error",
          description: "No rounds configured for the first event",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Update competition to go live
      const { error: updateError } = await supabase
        .from("competitions")
        .update({
          status: "in_progress",
          is_live: true,
          live_event_id: firstEvent.id,
          live_round_id: firstRound.id,
        })
        .eq("id", competitionId);

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Going Live!",
        description: "Competition is now live. Navigating to time entry...",
      });

      // Navigate to live page
      router.push(
        `/dashboard/competitions/${competitionId}/live?event=${firstEvent.id}&round=${firstRound.id}`
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to go live",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const completeEvent = async (eventId: string) => {
    const supabase = createClient();
    try {
      // Update event status to completed
      const { error: eventError } = await supabase
        .from("competition_events")
        .update({ status: "completed" })
        .eq("id", eventId);

      if (eventError) throw eventError;

      // Fetch final scores for this event
      const { data: finalScores, error: scoresError } = await supabase
        .from("final_scores")
        .select("student_id, best_time, average_time, is_dnf")
        .eq("round_id", eventId); // Note: Assuming round_id links to event

      if (scoresError) throw scoresError;

      if (finalScores && finalScores.length > 0) {
        // Calculate placement points
        const points = calculatePlacementPoints(finalScores);

        // Update or insert into overall_rankings
        const overallUpdates = Array.from(points.entries()).map(
          ([studentId, points]) => ({
            competition_id: competitionId,
            student_id: studentId,
            event_id: eventId,
            placement_points: points,
            updated_at: new Date().toISOString(),
          })
        );

        const { error: rankingError } = await supabase
          .from("overall_rankings")
          .upsert(overallUpdates, {
            onConflict: "competition_id,student_id,event_id",
          });

        if (rankingError) throw rankingError;
      }

      toast({
        title: "Event Completed",
        description: "Event marked as completed and rankings transferred",
      });

      fetchCompetitionData();
    } catch (error) {
      console.error("Error completing event:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to complete event",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!competition) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Competition not found</p>
        <Link href="/dashboard/competitions">
          <Button variant="link">Back to Competitions</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "registration_open":
        return <Badge variant="success">Registration Open</Badge>;
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const availableStudents = allStudents.filter(
    (s) => !registrations.some((r) => r.student_id === s.id)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/competitions"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competitions
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{competition.name}</h1>
              {getStatusBadge(competition.status)}
            </div>
            {competition.description && (
              <p className="text-gray-500 mt-1">{competition.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            {competition.status === "upcoming" && (
              <Button onClick={() => handleStatusChange("registration_open")}>
                <Play className="h-4 w-4 mr-2" />
                Open Registration
              </Button>
            )}
            {competition.status === "registration_open" && (
              <Button onClick={goLive} disabled={loading} className="bg-red-500 hover:bg-red-600">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 bg-white rounded-full animate-pulse"></span>
                  Go Live
                </div>
              </Button>
            )}
            {competition.status === "in_progress" && (
              <Button onClick={() => handleStatusChange("completed")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href={`/dashboard/competitions/${competitionId}`}
            className="pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium whitespace-nowrap"
          >
            Overview
          </Link>
          <Link
            href={`/dashboard/competitions/${competitionId}/register`}
            className="pb-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Register Students
          </Link>
          <Link
            href={`/dashboard/competitions/${competitionId}/rounds`}
            className="pb-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
          >
            Rounds
          </Link>
          <Link
            href={`/dashboard/competitions/${competitionId}/groups`}
            className="pb-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
          >
            Groups
          </Link>
          <Link
            href={`/dashboard/competitions/${competitionId}/live`}
            className="pb-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Live Entry
          </Link>
          <Link
            href={`/dashboard/competitions/${competitionId}/standings`}
            className="pb-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Standings
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{competition.competition_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{competition.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Events</p>
                <p className="font-semibold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p className="font-semibold">
                  {registrations.length}
                  {competition.max_participants && ` / ${competition.max_participants}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings/Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Grade 1 Fastest */}
        <Card className={rankings.grade1 ? "border-blue-200 bg-gradient-to-br from-blue-50 to-transparent" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-5 w-5 text-blue-500" />
              Fastest - Grade 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.grade1 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {rankings.grade1.firstName[0]}{rankings.grade1.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.grade1.firstName} {rankings.grade1.lastName}</p>
                    <p className="text-sm text-gray-500">{formatTime(rankings.grade1.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No scores yet</p>
            )}
          </CardContent>
        </Card>

        {/* Grade 2 Fastest */}
        <Card className={rankings.grade2 ? "border-green-200 bg-gradient-to-br from-green-50 to-transparent" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-5 w-5 text-green-500" />
              Fastest - Grade 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.grade2 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                    {rankings.grade2.firstName[0]}{rankings.grade2.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.grade2.firstName} {rankings.grade2.lastName}</p>
                    <p className="text-sm text-gray-500">{formatTime(rankings.grade2.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No scores yet</p>
            )}
          </CardContent>
        </Card>

        {/* Grade 3 Fastest */}
        <Card className={rankings.grade3 ? "border-purple-200 bg-gradient-to-br from-purple-50 to-transparent" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-5 w-5 text-purple-500" />
              Fastest - Grade 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.grade3 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {rankings.grade3.firstName[0]}{rankings.grade3.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.grade3.firstName} {rankings.grade3.lastName}</p>
                    <p className="text-sm text-gray-500">{formatTime(rankings.grade3.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No scores yet</p>
            )}
          </CardContent>
        </Card>

        {/* Grade 4 Fastest */}
        <Card className={rankings.grade4 ? "border-orange-200 bg-gradient-to-br from-orange-50 to-transparent" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-5 w-5 text-orange-500" />
              Fastest - Grade 4
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.grade4 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-semibold">
                    {rankings.grade4.firstName[0]}{rankings.grade4.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.grade4.firstName} {rankings.grade4.lastName}</p>
                    <p className="text-sm text-gray-500">{formatTime(rankings.grade4.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No scores yet</p>
            )}
          </CardContent>
        </Card>

        {/* Overall Winner */}
        <Card className={rankings.overallWinner ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 lg:col-span-1" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Overall Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.overallWinner ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-semibold shadow-lg">
                    {rankings.overallWinner.firstName[0]}{rankings.overallWinner.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.overallWinner.firstName} {rankings.overallWinner.lastName}</p>
                    <p className="text-sm text-gray-500">Grade {rankings.overallWinner.grade}</p>
                    <p className="text-sm font-medium text-amber-700">{formatTime(rankings.overallWinner.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No scores yet</p>
            )}
          </CardContent>
        </Card>

        {/* Fastest Girl Cuber */}
        <Card className={rankings.fastestGirl ? "border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 lg:col-span-1" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-5 w-5 text-pink-500" />
              Fastest Girl Cuber
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.fastestGirl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold">
                    {rankings.fastestGirl.firstName[0]}{rankings.fastestGirl.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{rankings.fastestGirl.firstName} {rankings.fastestGirl.lastName}</p>
                    <p className="text-sm text-gray-500">Grade {rankings.fastestGirl.grade}</p>
                    <p className="text-sm font-medium text-pink-700">{formatTime(rankings.fastestGirl.bestTime)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No female competitors yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events configured</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{event.event_types?.display_name}</p>
                      <p className="text-xs text-gray-500">
                        Round {event.current_round} of {event.total_rounds}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeEvent(event.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Badge
                        variant={
                          event.status === "completed"
                            ? "outline"
                            : event.status === "in_progress"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Register Students - Ultra Fast */}
        <Card className="lg:col-span-2 border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Register Students
                </CardTitle>
                <CardDescription>{registrations.length} student(s) registered</CardDescription>
              </div>
              {(competition.status === "upcoming" || competition.status === "registration_open") && (
                <Link href={`/dashboard/competitions/${competitionId}/register`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Batch Register
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No students registered yet</p>
                <p className="text-sm mt-1">Click "Batch Register" to add multiple students at once</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">Registered students:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {reg.students.first_name[0]}
                        {reg.students.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {reg.students.first_name} {reg.students.last_name}
                        </p>
                        <p className="text-xs text-gray-500">Grade {reg.students.grade || "-"}</p>
                      </div>
                      <Badge variant={reg.status === "confirmed" ? "success" : "secondary"} className="flex-shrink-0">
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
