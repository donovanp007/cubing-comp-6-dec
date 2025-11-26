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
import { ArrowLeft, Trophy } from "lucide-react";
import type { EventType } from "@/lib/types/database.types";

export default function CreateCompetitionPage() {
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    competition_date: "",
    competition_time: "",
    max_participants: "",
    is_public: true,
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
    if (data) setEventTypes(data);
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Create competition
    const { data: competition, error: compError } = await supabase
      .from("competitions")
      .insert({
        name: formData.name,
        description: formData.description || null,
        location: formData.location,
        competition_date: formData.competition_date,
        competition_time: formData.competition_time || null,
        max_participants: formData.max_participants
          ? parseInt(formData.max_participants)
          : null,
        is_public: formData.is_public,
        status: "upcoming",
      })
      .select()
      .single();

    if (compError) {
      toast({
        title: "Error",
        description: compError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Add selected events
    if (selectedEvents.length > 0) {
      const eventData = selectedEvents.map((eventTypeId) => ({
        competition_id: competition.id,
        event_type_id: eventTypeId,
        status: "scheduled",
        total_rounds: 1,
      }));

      const { error: eventsError } = await supabase
        .from("competition_events")
        .insert(eventData);

      if (eventsError) {
        toast({
          title: "Warning",
          description: "Competition created but events failed to add",
          variant: "destructive",
        });
      }

      // Create first round for each event
      const { data: compEvents } = await supabase
        .from("competition_events")
        .select("id")
        .eq("competition_id", competition.id);

      if (compEvents) {
        const roundsData = compEvents.map((ce) => ({
          competition_event_id: ce.id,
          round_number: 1,
          round_name: "Round 1",
          status: "pending",
        }));

        await supabase.from("rounds").insert(roundsData);
      }
    }

    toast({
      title: "Success!",
      description: "Competition created successfully",
    });
    router.push("/dashboard/competitions");

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/competitions"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competitions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Create Competition
        </h1>
        <p className="text-gray-500 mt-1">
          Set up a new cubing competition event
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
          <CardDescription>
            Configure your competition settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Spring Cubing Championship 2025"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the competition"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Main School Hall"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.competition_date}
                  onChange={(e) =>
                    setFormData({ ...formData, competition_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.competition_time}
                  onChange={(e) =>
                    setFormData({ ...formData, competition_time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Max Participants */}
            <div className="space-y-2">
              <Label htmlFor="max">Max Participants</Label>
              <Input
                id="max"
                type="number"
                value={formData.max_participants}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Events Selection */}
            <div className="space-y-3">
              <Label>Events</Label>
              <p className="text-sm text-gray-500">
                Select which events to include in this competition
              </p>
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.id}
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={() => handleEventToggle(event.id)}
                    />
                    <Label htmlFor={event.id} className="text-sm font-normal cursor-pointer">
                      {event.display_name} ({event.name})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Public */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_public: checked as boolean })
                }
              />
              <Label htmlFor="is_public" className="text-sm font-normal cursor-pointer">
                Make this competition public (visible to parents)
              </Label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/competitions" className="flex-1">
                <Button variant="outline" className="w-full" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Competition"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
