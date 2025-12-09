"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Flame } from "lucide-react";
import type { EventType } from "@/lib/types/database.types";

const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
const TERMS = ["Term 1 2025", "Term 2 2025", "Term 3 2025", "Term 4 2025"];

export default function CreateWeeklyCompetitionPage() {
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    term: TERMS[0],
    week_number: 1,
    event_type_id: "",
    grade_filter: [] as string[],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_types")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data) {
      setEventTypes(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, event_type_id: data[0].id }));
      }
    }
  };

  const handleGradeToggle = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      grade_filter: prev.grade_filter.includes(grade)
        ? prev.grade_filter.filter((g) => g !== grade)
        : [...prev.grade_filter, grade],
    }));
  };

  const generateName = () => {
    const event = eventTypes.find((e) => e.id === formData.event_type_id);
    const eventName = event?.display_name || "3x3x3";
    return `Week ${formData.week_number} - ${eventName} Challenge`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("weekly_competitions").insert({
      name: formData.name || generateName(),
      term: formData.term,
      week_number: formData.week_number,
      event_type_id: formData.event_type_id,
      grade_filter: formData.grade_filter.length > 0 ? formData.grade_filter : null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: "active",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Weekly competition created successfully",
      });
      router.push("/dashboard/weekly");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/weekly"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Weekly Competitions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500" />
          Create Weekly Competition
        </h1>
        <p className="text-gray-500 mt-1">
          Set up a new weekly challenge for your students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
          <CardDescription>
            Configure your weekly competition settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Term and Week */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) =>
                    setFormData({ ...formData, term: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="week">Week Number</Label>
                <Select
                  value={formData.week_number.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, week_number: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="event">Event Type</Label>
              <Select
                value={formData.event_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, event_type_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.display_name} ({event.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name (optional)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={generateName()}
              />
              <p className="text-xs text-gray-500">
                Leave blank to auto-generate: &quot;{generateName()}&quot;
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="space-y-3">
              <Label>Grade Filter (optional)</Label>
              <p className="text-sm text-gray-500">
                Leave unchecked to include all grades
              </p>
              <div className="grid grid-cols-3 gap-3">
                {GRADES.map((grade) => (
                  <div key={grade} className="flex items-center space-x-2">
                    <Checkbox
                      id={grade}
                      checked={formData.grade_filter.includes(grade)}
                      onCheckedChange={() => handleGradeToggle(grade)}
                    />
                    <Label htmlFor={grade} className="text-sm font-normal cursor-pointer">
                      {grade}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/weekly" className="flex-1">
                <Button variant="outline" className="w-full" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Competition"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
