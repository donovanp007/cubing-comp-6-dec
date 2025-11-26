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

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get all students
      const { data: allStudents } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade")
        .eq("status", "active")
        .order("last_name");

      // Get already registered students
      const { data: registered } = await supabase
        .from("registrations")
        .select("student_id, students(id, first_name, last_name, grade)")
        .eq("competition_id", competitionId);

      const registeredIds = new Set(registered?.map((r: any) => r.student_id) || []);
      const available = (allStudents || []).filter((s: any) => !registeredIds.has(s.id));
      const registeredList = registered?.map((r: any) => r.students) || [];

      setAvailableStudents(available);
      setRegisteredStudents(registeredList);

      // Get competition events
      const { data: eventData } = await supabase
        .from("competition_events")
        .select("id, event_type_id, event_types(display_name)")
        .eq("competition_id", competitionId);

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
      setLoading(false);
    }
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
    if (!selectedStudent) {
      toast({
        title: "No student selected",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    if (selectedEvents.size === 0) {
      toast({
        title: "No events selected",
        description: "Select at least one event for this student",
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    try {
      // Get the selected student details
      const student = availableStudents.find((s) => s.id === selectedStudent);
      if (!student) throw new Error("Student not found");

      // Create registration
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .insert({
          competition_id: competitionId,
          student_id: selectedStudent,
          status: "confirmed",
          registration_date: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (regError) throw regError;

      // Create event enrollments
      const enrollments = Array.from(selectedEvents).map((eventId) => ({
        registration_id: reg.id,
        competition_event_id: eventId,
        student_id: selectedStudent,
        status: "confirmed",
      }));

      const { error: enrollError } = await supabase
        .from("event_enrollments")
        .insert(enrollments);

      if (enrollError) throw enrollError;

      toast({
        title: "Success!",
        description: `${student.first_name} ${student.last_name} registered for ${selectedEvents.size} event(s)`,
      });

      // Reset form and reload data
      setSelectedStudent("");
      setSelectedEvents(new Set());
      await fetchData();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register student",
        variant: "destructive",
      });
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

  const selectedStudentData = availableStudents.find((s) => s.id === selectedStudent);

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
        <h1 className="text-3xl font-bold text-gray-900">Add Student to Competition</h1>
        <p className="text-gray-500 mt-2">Register one student at a time and select their events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Registration Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Register Student
              </CardTitle>
              <CardDescription>
                {availableStudents.length} students available to register
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Student
                </label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <span className="flex items-center gap-2">
                          <span>{student.first_name} {student.last_name}</span>
                          <Badge variant="outline" className="ml-2">Grade {student.grade}</Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Preview */}
              {selectedStudentData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {selectedStudentData.first_name[0]}{selectedStudentData.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedStudentData.first_name} {selectedStudentData.last_name}
                      </p>
                      <p className="text-sm text-gray-600">Grade {selectedStudentData.grade}</p>
                    </div>
                  </div>
                </div>
              )}

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
                    !selectedStudent ||
                    selectedEvents.size === 0 ||
                    registering
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg h-12"
                >
                  {registering ? "Registering..." : `Register ${selectedStudentData ? selectedStudentData.first_name : "Student"}`}
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
