"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState<string>("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerGroupId, setColorPickerGroupId] = useState<string>("");

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

      console.log(`Starting group creation for ${numGroups} groups with ${registeredStudents.length} students`);

      // Delete existing assignments first
      const { error: deleteAssignmentsError } = await supabase
        .from("group_assignments")
        .delete()
        .eq("competition_id", competitionId);

      if (deleteAssignmentsError) {
        console.error("Failed to delete old assignments:", deleteAssignmentsError);
      }

      // Delete existing groups
      const { error: deleteError } = await supabase
        .from("competition_groups")
        .delete()
        .eq("competition_id", competitionId);

      if (deleteError) throw deleteError;
      console.log("✓ Deleted existing groups and assignments");

      // Create new groups
      const newGroups: Group[] = [];

      for (let i = 0; i < numGroups; i++) {
        const color = GROUP_COLORS[i % GROUP_COLORS.length];
        const { data: group, error } = await supabase
          .from("competition_groups")
          .insert({
            competition_id: competitionId,
            group_name: `${color.name.charAt(0).toUpperCase() + color.name.slice(1)} Team`,
            color_hex: color.hex,
            color_name: color.name,
            sort_order: i,
          })
          .select()
          .single();

        if (error) throw error;
        if (group) newGroups.push(group);
      }

      // Verify all groups were created
      if (!newGroups || newGroups.length !== numGroups) {
        throw new Error(`Expected ${numGroups} groups, created ${newGroups?.length || 0}`);
      }
      console.log(`✓ Created ${newGroups.length} groups`);

      setGroups(newGroups.map((g) => ({ ...g, students: [] })));
      setSelectedStudents(new Set());
      setSelectedGroupForAssignment("");

      toast({
        title: "Success",
        description: `Created ${numGroups} teams. Now select students and assign them!`,
      });
    } catch (error) {
      console.error("❌ Error creating groups:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create groups",
        variant: "destructive",
      });
    }
  };

  const bulkAssignStudents = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: "No students selected",
        description: "Select at least one student to assign",
        variant: "destructive",
      });
      return;
    }

    if (!selectedGroupForAssignment) {
      toast({
        title: "No group selected",
        description: "Select a team to assign students to",
        variant: "destructive",
      });
      return;
    }

    try {
      const assignments = Array.from(selectedStudents).map((studentId) => ({
        competition_id: competitionId,
        student_id: studentId,
        group_id: selectedGroupForAssignment,
      }));

      // Delete existing assignments for these students first
      const { error: deleteError } = await supabase
        .from("group_assignments")
        .delete()
        .eq("competition_id", competitionId)
        .in("student_id", Array.from(selectedStudents));

      if (deleteError) throw deleteError;

      // Insert new assignments
      const { error: assignError } = await supabase
        .from("group_assignments")
        .insert(assignments);

      if (assignError) throw assignError;

      toast({
        title: "Success",
        description: `Assigned ${selectedStudents.size} student(s) to team`,
      });

      setSelectedStudents(new Set());
      setSelectedGroupForAssignment("");
      await fetchData();
    } catch (error) {
      console.error("Error assigning students:", error);
      toast({
        title: "Error",
        description: "Failed to assign students",
        variant: "destructive",
      });
    }
  };

  const removeStudentFromGroup = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("group_assignments")
        .delete()
        .eq("student_id", studentId)
        .eq("competition_id", competitionId);

      if (error) throw error;

      toast({ title: "Success", description: "Student removed from team" });
      await fetchData();
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllUnassigned = () => {
    const unassignedIds = new Set(
      unassignedStudents.map((s) => s.id)
    );
    setSelectedStudents(unassignedIds);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const updateGroupColor = async (groupId: string, newColorHex: string, newColorName: string) => {
    try {
      const { error } = await supabase
        .from("competition_groups")
        .update({
          color_hex: newColorHex,
          color_name: newColorName,
        })
        .eq("id", groupId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group color updated",
      });

      await fetchData();
    } catch (error) {
      console.error("Error updating group color:", error);
      toast({
        title: "Error",
        description: "Failed to update group color",
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
          {competition?.name} - Group Assignment
        </h1>
        <p className="text-gray-500 mt-2">
          {registeredStudents.length} students registered • {unassignedStudents.length} unassigned
        </p>
      </div>

      {/* Create Groups Section */}
      {groups.length === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Teams</CardTitle>
            <CardDescription>
              Create teams first, then select and assign students
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="font-medium">Number of teams:</label>
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
              Create Teams
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Assignment Interface */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student Selection Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Unassigned Students
                </CardTitle>
                <CardDescription>
                  {unassignedStudents.length} students to assign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {unassignedStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">All students assigned! ✅</p>
                ) : (
                  <>
                    {/* Selection Info */}
                    {selectedStudents.size > 0 && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">
                          {selectedStudents.size} student{selectedStudents.size !== 1 ? "s" : ""} selected
                        </p>
                      </div>
                    )}

                    {/* Student List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {unassignedStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`p-3 rounded border-2 cursor-pointer transition-all ${
                            selectedStudents.has(student.id)
                              ? "bg-blue-50 border-blue-400"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.id)}
                              onChange={() => {}}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-gray-500">Grade {student.grade}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={selectAllUnassigned}
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSelection}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Team Assignment */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bulk Assignment Card */}
            {selectedStudents.size > 0 && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base">Assign to Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {groups.map((group) => (
                      <Button
                        key={group.id}
                        onClick={() => setSelectedGroupForAssignment(group.id)}
                        variant={selectedGroupForAssignment === group.id ? "default" : "outline"}
                        style={
                          selectedGroupForAssignment === group.id
                            ? { backgroundColor: group.color_hex }
                            : {}
                        }
                        className="justify-start"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: group.color_hex }}
                        />
                        {group.group_name}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={bulkAssignStudents}
                    disabled={!selectedGroupForAssignment}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Assign {selectedStudents.size} Student{selectedStudents.size !== 1 ? "s" : ""} to{" "}
                    {groups.find((g) => g.id === selectedGroupForAssignment)?.group_name || "Team"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Panels */}
            <div className="grid grid-cols-1 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader style={{ borderLeftColor: group.color_hex, borderLeftWidth: "4px" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          className="w-5 h-5 rounded cursor-pointer hover:opacity-80 transition"
                          style={{ backgroundColor: group.color_hex }}
                          title="Click to change color"
                          onClick={() => {
                            setColorPickerGroupId(group.id);
                            setColorPickerOpen(true);
                          }}
                        />
                        <CardTitle>{group.group_name}</CardTitle>
                        <Badge variant="secondary" className="text-lg">
                          {group.students.length}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {group.students.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No students assigned yet</p>
                    ) : (
                      <div className="space-y-2">
                        {group.students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded border-2"
                            style={{
                              backgroundColor: group.color_hex + "15",
                              borderColor: group.color_hex + "40",
                            }}
                          >
                            <div>
                              <p className="font-medium">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-gray-500">Grade {student.grade}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeStudentFromGroup(student.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Dialog */}
      <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Choose a Color</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 p-4">
            {GROUP_COLORS.map((color) => (
              <button
                key={color.hex}
                className="w-14 h-14 rounded border-4 transition hover:scale-110"
                style={{
                  backgroundColor: color.hex,
                  borderColor:
                    groups.find(g => g.id === colorPickerGroupId)?.color_hex === color.hex
                      ? "#000"
                      : "#ddd",
                }}
                onClick={() => {
                  updateGroupColor(colorPickerGroupId, color.hex, color.name);
                  setColorPickerOpen(false);
                }}
                title={color.name}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
