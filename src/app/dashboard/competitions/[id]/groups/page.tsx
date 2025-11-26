"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
}

interface Group {
  id: string;
  group_name: string;
  color_hex: string;
  color_name: string;
  sort_order: number;
}

interface GroupWithStudents extends Group {
  students: Student[];
}

const GROUP_COLORS = [
  { name: "red", hex: "#EF4444" },
  { name: "orange", hex: "#F97316" },
  { name: "yellow", hex: "#EAB308" },
  { name: "green", hex: "#22C55E" },
  { name: "blue", hex: "#3B82F6" },
  { name: "purple", hex: "#A855F7" },
  { name: "pink", hex: "#EC4899" },
  { name: "cyan", hex: "#06B6D4" },
];

export default function CompetitionGroupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [groups, setGroups] = useState<GroupWithStudents[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [numGroups, setNumGroups] = useState(2);
  const [competition, setCompetition] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

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

      // Fetch registered students
      const { data: registrations } = await supabase
        .from("registrations")
        .select("student_id, students!inner(id, first_name, last_name, grade)")
        .eq("competition_id", competitionId)
        .eq("status", "confirmed");

      const students = (registrations || []).map((r: any) => r.students).filter(Boolean);
      setRegisteredStudents(students);

      // Fetch groups
      const { data: groupsData } = await supabase
        .from("competition_groups")
        .select("*")
        .eq("competition_id", competitionId)
        .order("sort_order");

      if (groupsData && groupsData.length > 0) {
        // Fetch students for each group separately
        const groupsWithStudents: GroupWithStudents[] = [];

        for (const group of groupsData) {
          const { data: assignments } = await supabase
            .from("group_assignments")
            .select("student_id")
            .eq("group_id", group.id);

          const studentIds = (assignments || []).map((a: any) => a.student_id);
          const groupStudents = students.filter((s: Student) => studentIds.includes(s.id));

          groupsWithStudents.push({
            ...group,
            students: groupStudents,
          });
        }

        setGroups(groupsWithStudents);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroupsAutomatically = async () => {
    try {
      if (registeredStudents.length === 0) {
        toast({
          title: "No students",
          description: "Register students before creating groups",
          variant: "destructive",
        });
        return;
      }

      // Delete existing groups
      const { error: deleteError } = await supabase
        .from("competition_groups")
        .delete()
        .eq("competition_id", competitionId);

      if (deleteError) throw deleteError;

      // Create new groups
      const newGroups: Group[] = [];

      for (let i = 0; i < numGroups; i++) {
        const color = GROUP_COLORS[i % GROUP_COLORS.length];
        const { data: group, error } = await supabase
          .from("competition_groups")
          .insert({
            competition_id: competitionId,
            group_name: `Group ${String.fromCharCode(65 + i)}`,
            color_hex: color.hex,
            color_name: color.name,
            sort_order: i,
          })
          .select()
          .single();

        if (error) throw error;
        if (group) newGroups.push(group);
      }

      // Assign students evenly
      const assignments: any[] = [];
      registeredStudents.forEach((student, index) => {
        const groupIndex = index % newGroups.length;
        assignments.push({
          competition_id: competitionId,
          student_id: student.id,
          group_id: newGroups[groupIndex].id,
        });
      });

      const { error: assignError } = await supabase
        .from("group_assignments")
        .insert(assignments);

      if (assignError) throw assignError;

      toast({
        title: "Success",
        description: `Created ${numGroups} groups and assigned ${registeredStudents.length} students`,
      });

      await fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create groups",
        variant: "destructive",
      });
    }
  };

  const assignStudentToGroup = async (studentId: string, groupId: string) => {
    try {
      // Check if already assigned
      const { data: existing } = await supabase
        .from("group_assignments")
        .select("id")
        .eq("student_id", studentId)
        .eq("competition_id", competitionId)
        .single();

      if (existing) {
        // Update
        await supabase
          .from("group_assignments")
          .update({ group_id: groupId })
          .eq("id", existing.id);
      } else {
        // Insert
        await supabase.from("group_assignments").insert({
          competition_id: competitionId,
          student_id: studentId,
          group_id: groupId,
        });
      }

      toast({ title: "Success", description: "Student assigned to group" });
      await fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to assign student",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const unassignedStudents = registeredStudents.filter(
    (s) => !groups.some((g) => g.students.some((st) => st.id === s.id))
  );

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

        <h1 className="text-3xl font-bold text-gray-900">
          {competition?.name} - Groups
        </h1>
        <p className="text-gray-500 mt-2">
          {registeredStudents.length} students registered
        </p>
      </div>

      {/* Auto-create groups section */}
      {groups.length === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Groups Automatically</CardTitle>
            <CardDescription>
              Evenly distribute {registeredStudents.length} students
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium">Number of groups:</label>
              <Input
                type="number"
                min="1"
                max={Math.min(registeredStudents.length, 8)}
                value={numGroups}
                onChange={(e) => setNumGroups(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
              />
            </div>
            <Button onClick={createGroupsAutomatically} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Groups
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader style={{ borderTopColor: group.color_hex, borderTopWidth: "4px" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: group.color_hex }}
                    />
                    <CardTitle>{group.group_name}</CardTitle>
                    <Badge variant="secondary">{group.students.length} students</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {group.students.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No students assigned</p>
                  ) : (
                    group.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-gray-500">Grade {student.grade}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unassigned students */}
      {unassignedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Unassigned Students ({unassignedStudents.length})
            </CardTitle>
            <CardDescription>
              {groups.length === 0
                ? "Create groups first"
                : "Click a group button to assign"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <p className="text-gray-500">Create groups to assign students</p>
            ) : (
              <div className="space-y-3">
                {unassignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 bg-gray-50 rounded border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-500">Grade {student.grade}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {groups.map((group) => (
                        <Button
                          key={group.id}
                          size="sm"
                          onClick={() => assignStudentToGroup(student.id, group.id)}
                          style={{
                            backgroundColor: group.color_hex,
                            color: "white",
                          }}
                          className="hover:opacity-80"
                        >
                          {group.group_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
