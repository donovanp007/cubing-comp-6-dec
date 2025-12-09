"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
}

interface CompetitionEvent {
  id: string;
  display_name: string;
}

export default function RegisterStudentPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const supabase = createClient();
  const { toast } = useToast();

  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Get all students
      const { data: allStudents, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade")
        .eq("status", "active")
        .order("last_name");

      if (studentsError) throw studentsError;

      // Get already registered students
      const { data: registered, error: regError } = await supabase
        .from("registrations")
        .select("student_id, students(id, first_name, last_name, grade)")
        .eq("competition_id", competitionId);

      if (regError) throw regError;

      const registeredIds = new Set(registered?.map((r: any) => r.student_id) || []);
      const available = (allStudents || []).filter((s: any) => !registeredIds.has(s.id));
      const registeredList = registered?.map((r: any) => r.students) || [];

      setAvailableStudents(available);
      setRegisteredStudents(registeredList);

      // Get competition events
      const { data: eventData, error: eventError } = await supabase
        .from("competition_events")
        .select("id, event_type_id, event_types(display_name)")
        .eq("competition_id", competitionId);

      if (eventError) throw eventError;

      // Map events
      const mappedEvents: CompetitionEvent[] = (eventData || []).map((e: any) => ({
        id: e.id,
        display_name: e.event_types?.display_name || `Event ${e.id.slice(0, 4)}`,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load students or events",
        variant: "destructive",
      });
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const toggleEvent = (eventId: string) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
    } else {
      newSet.add(eventId);
    }
    setSelectedEvents(newSet);
  };

  const handleRegister = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    if (selectedEvents.size === 0) {
      toast({
        title: "No events selected",
        description: "Select at least one event for the selected students",
        variant: "destructive",
      });
      return;
    }

    // Check if students are already registered (double-check before sending)
    const registeredIds = new Set(registeredStudents.map((s) => s.id));
    const alreadyRegistered = Array.from(selectedStudents).filter((id) => registeredIds.has(id));

    if (alreadyRegistered.length > 0) {
      const names = alreadyRegistered
        .map((id) => availableStudents.find((s) => s.id === id))
        .filter((s) => s)
        .map((s) => `${s!.first_name} ${s!.last_name}`)
        .join(", ");

      toast({
        title: "Already Registered",
        description: `${names} ${alreadyRegistered.length === 1 ? "is" : "are"} already registered for this competition`,
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    try {
      let successCount = 0;

      // Register all selected students
      for (const studentId of Array.from(selectedStudents)) {
        const student = availableStudents.find((s) => s.id === studentId);
        if (!student) continue;

        // Create registration
        const { data: reg, error: regError } = await supabase
          .from("registrations")
          .insert({
            competition_id: competitionId,
            student_id: studentId,
            status: "confirmed",
            registration_date: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (regError) {
          console.error(`Failed to register ${student.first_name} ${student.last_name}:`, regError);
          continue;
        }

        if (!reg) {
          console.error(`Registration not created for ${student.first_name} ${student.last_name}`);
          continue;
        }

        // Create event enrollments
        const enrollments = Array.from(selectedEvents).map((eventId) => ({
          registration_id: reg.id,
          competition_event_id: eventId,
          student_id: studentId,
          status: "confirmed",
        }));

        const { error: enrollError } = await supabase
          .from("event_enrollments")
          .insert(enrollments);

        if (enrollError) {
          console.error(`Failed to create event enrollments for ${student.first_name} ${student.last_name}:`, enrollError);
          continue;
        }

        successCount++;
      }

      if (successCount === 0) {
        throw new Error("Failed to register any students");
      }

      toast({
        title: "Success!",
        description: `${successCount} student${successCount === 1 ? "" : "s"} registered for ${selectedEvents.size} event${selectedEvents.size === 1 ? "" : "s"}`,
      });

      // Reset form and reload data (silent refresh without loading state)
      setSelectedStudents(new Set());
      setSelectedEvents(new Set());
      await fetchData(true);
    } catch (error) {
      let errorMessage = "Failed to register student";

      if (error instanceof Error) {
        // Check for specific database errors
        if (error.message.includes("duplicate key")) {
          errorMessage = "This student is already registered for this competition";
        } else if (error.message.includes("23505")) {
          errorMessage = "This student is already registered for this competition";
        } else {
          errorMessage = error.message;
        }
      } else if (error && typeof error === "object") {
        const err = error as any;
        if (err.message?.includes("duplicate key") || err.code === "23505") {
          errorMessage = "This student is already registered for this competition";
        } else {
          errorMessage = err.message || JSON.stringify(error);
        }
      }

      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Refresh the data to get latest registered students
      await fetchData(true);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin">Loading...</div>
      </div>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Add Students to Competition</h1>
        <p className="text-gray-500 mt-2">Select multiple students at once and register them for events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Registration Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Register Students
              </CardTitle>
              <CardDescription>
                {availableStudents.length} students available to register
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Students
                  </label>
                  {selectedStudents.size > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedStudents.size} selected
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 border border-gray-300 rounded-lg p-4 bg-white max-h-80 overflow-y-auto">
                  {availableStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No students available to register</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudent(student.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition cursor-pointer ${
                            selectedStudents.has(student.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="h-5 w-5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500">Grade {student.grade}</p>
                          </div>
                          {selectedStudents.has(student.id) && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {availableStudents.length > 0 && selectedStudents.size === 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Click students to select them
                  </p>
                )}
              </div>

              {/* Event Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Events
                  </label>
                  {selectedEvents.size > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedEvents.size} selected
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 border border-gray-300 rounded-lg p-4 bg-white">
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No events configured for this competition</p>
                      <p className="text-sm text-gray-400 mt-1">Go to Rounds tab to add events</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => toggleEvent(event.id)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                            selectedEvents.has(event.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <Checkbox
                            checked={selectedEvents.has(event.id)}
                            onChange={() => toggleEvent(event.id)}
                            className="h-5 w-5"
                          />
                          <span className="font-medium text-gray-900 flex-1">
                            {event.display_name}
                          </span>
                          {selectedEvents.has(event.id) && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {events.length > 0 && selectedEvents.size === 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Click an event to select it
                  </p>
                )}
              </div>

              {/* Register Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRegister}
                  disabled={
                    selectedStudents.size === 0 ||
                    selectedEvents.size === 0 ||
                    registering
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg h-12"
                >
                  {registering ? "Registering..." : `Register ${selectedStudents.size} Student${selectedStudents.size === 1 ? "" : "s"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Registered
            </CardTitle>
            <CardDescription>{registeredStudents.length} student(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {registeredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No students registered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {registeredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-500">Grade {student.grade}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
