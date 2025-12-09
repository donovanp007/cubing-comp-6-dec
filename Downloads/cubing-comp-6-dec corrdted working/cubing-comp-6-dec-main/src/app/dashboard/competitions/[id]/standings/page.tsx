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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
}

interface EventStanding {
  eventId: string;
  eventName: string;
  points: number;
}

interface StudentStanding {
  studentId: string;
  student: Student;
  totalPoints: number;
  eventStandings: EventStanding[];
  placement: number;
}

export default function StandingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [competition, setCompetition] = useState<any>(null);
  const [standings, setStandings] = useState<StudentStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, [competitionId]);

  const fetchStandings = async () => {
    try {
      setLoading(true);

      // Fetch competition
      const { data: comp } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", competitionId)
        .single();

      setCompetition(comp);

      // Fetch all registered students
      const { data: registrations } = await supabase
        .from("registrations")
        .select("students(*)")
        .eq("competition_id", competitionId)
        .eq("status", "confirmed");

      if (!registrations || registrations.length === 0) {
        setStandings([]);
        setLoading(false);
        return;
      }

      // Build standings
      const studentStandings: StudentStanding[] = [];

      for (const reg of registrations as any[]) {
        const student: Student = reg.students;

        // Fetch overall rankings for this student
        const { data: rankings } = await supabase
          .from("overall_rankings")
          .select("*, competition_events(display_name)")
          .eq("competition_id", competitionId)
          .eq("student_id", student.id);

        const totalPoints = rankings?.reduce(
          (sum: number, r: any) => sum + (r.placement_points || 0),
          0
        ) || 0;

        const eventStandings =
          rankings?.map((r: any) => ({
            eventId: r.event_id,
            eventName: r.competition_events?.display_name || "Event",
            points: r.placement_points || 0,
          })) || [];

        studentStandings.push({
          studentId: student.id,
          student,
          totalPoints,
          eventStandings,
          placement: 0, // Will be calculated
        });
      }

      // Sort by total points (descending)
      studentStandings.sort((a, b) => b.totalPoints - a.totalPoints);

      // Calculate placement (accounting for ties)
      let placement = 1;
      for (let i = 0; i < studentStandings.length; i++) {
        if (i > 0 && studentStandings[i].totalPoints !== studentStandings[i - 1].totalPoints) {
          placement = i + 1;
        }
        studentStandings[i].placement = placement;
      }

      setStandings(studentStandings);
    } catch (error) {
      console.error("Error fetching standings:", error);
      toast({
        title: "Error",
        description: "Failed to load standings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/competitions/${competitionId}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competition
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {competition?.name}
              </h1>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-gray-500">Overall Standings</p>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Final Standings
          </CardTitle>
          <CardDescription>
            {standings.length} students | Points based on event placements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {standings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No standings available yet</p>
              <p className="text-sm">Complete events to generate standings</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing, index) => (
                    <TableRow key={standing.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {standing.placement === 1 && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                          {standing.placement === 2 && (
                            <Trophy className="h-5 w-5 text-gray-400" />
                          )}
                          {standing.placement === 3 && (
                            <Trophy className="h-5 w-5 text-orange-600" />
                          )}
                          {standing.placement > 3 && (
                            <span className="font-semibold text-gray-500">
                              {standing.placement}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            {standing.student.first_name}{" "}
                            {standing.student.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Grade {standing.student.grade}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-blue-100 text-blue-800">
                          {standing.totalPoints} pts
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      {standings.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Points Breakdown</CardTitle>
            <CardDescription>Points per event for each student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    {standings[0]?.eventStandings.map((event) => (
                      <TableHead key={event.eventId} className="text-center">
                        {event.eventName}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing) => (
                    <TableRow key={standing.studentId}>
                      <TableCell>
                        <p className="font-semibold">
                          {standing.student.first_name}{" "}
                          {standing.student.last_name}
                        </p>
                      </TableCell>
                      {standing.eventStandings.map((event) => (
                        <TableCell key={event.eventId} className="text-center">
                          {event.points > 0 ? (
                            <span className="font-semibold text-green-600">
                              {event.points}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <span className="font-bold text-lg">
                          {standing.totalPoints}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
