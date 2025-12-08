"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Users,
  Target,
  Clock,
} from "lucide-react";
import Link from "next/link";
import ScrambleGeneratorModal from "@/components/scramble-generator-modal";

interface EventType {
  id: string;
  name: string;
  display_name: string;
}

interface CompetitionEvent {
  id: string;
  event_types: EventType;
  total_rounds: number;
  current_round: number;
}

interface Round {
  id: string;
  competition_event_id: string;
  round_number: number;
  round_name: string;
  cutoff_percentage?: number;
  cutoff_count?: number;
  advancement_type: "percentage" | "count" | "time";
  status: "pending" | "in_progress" | "completed";
  max_participants?: number;
}

const ADVANCEMENT_OPTIONS = [
  { value: "percentage", label: "Top Percentage", example: "Top 50% advance" },
  { value: "count", label: "Top Count", example: "Top 8 advance" },
  { value: "time", label: "Time-Based", example: "Under 30s advance" },
];

export default function RoundConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [competition, setCompetition] = useState<any>(null);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [rounds, setRounds] = useState<Map<string, Round[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string>("");
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

      // Fetch events with event types
      const { data: eventsData } = await supabase
        .from("competition_events")
        .select("*, event_types(*)")
        .eq("competition_id", competitionId)
        .order("created_at");

      setEvents(eventsData || []);

      // Fetch rounds for each event
      if (eventsData) {
        const roundsMap = new Map<string, Round[]>();

        for (const event of eventsData) {
          const { data: roundsData } = await supabase
            .from("rounds")
            .select("*")
            .eq("competition_event_id", event.id)
            .order("round_number");

          roundsMap.set(event.id, roundsData || []);
        }

        setRounds(roundsMap);
        if (eventsData.length > 0) {
          setExpandedEvent(eventsData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load round configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRound = async (eventId: string) => {
    try {
      const eventRounds = rounds.get(eventId) || [];
      const nextRoundNumber = eventRounds.length + 1;

      const { data: newRound, error } = await supabase
        .from("rounds")
        .insert({
          competition_event_id: eventId,
          round_number: nextRoundNumber,
          round_name: `Round ${nextRoundNumber}`,
          advancement_type: "percentage",
          cutoff_percentage: 50,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedRounds = new Map(rounds);
      updatedRounds.set(eventId, [...eventRounds, newRound]);
      setRounds(updatedRounds);

      toast({
        title: "Round Created",
        description: `Round ${nextRoundNumber} added`,
      });
    } catch (error) {
      console.error("Error adding round:", error);
      toast({
        title: "Error",
        description: "Failed to add round",
        variant: "destructive",
      });
    }
  };

  const updateRound = async (round: Round) => {
    try {
      const { error } = await supabase
        .from("rounds")
        .update({
          round_name: round.round_name,
          advancement_type: round.advancement_type,
          cutoff_percentage: round.cutoff_percentage,
          cutoff_count: round.cutoff_count,
          max_participants: round.max_participants,
        })
        .eq("id", round.id);

      if (error) throw error;

      fetchData();
      setEditingRound(null);
      setShowForm(false);

      toast({
        title: "Round Updated",
        description: "Round configuration saved",
      });
    } catch (error) {
      console.error("Error updating round:", error);
      toast({
        title: "Error",
        description: "Failed to update round",
        variant: "destructive",
      });
    }
  };

  const deleteRound = async (roundId: string, eventId: string) => {
    if (!confirm("Delete this round? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("rounds").delete().eq("id", roundId);

      if (error) throw error;

      // Update local state
      const updatedRounds = new Map(rounds);
      const eventRounds = updatedRounds.get(eventId) || [];
      updatedRounds.set(
        eventId,
        eventRounds.filter((r) => r.id !== roundId)
      );
      setRounds(updatedRounds);

      toast({
        title: "Round Deleted",
        description: "Round removed",
      });
    } catch (error) {
      console.error("Error deleting round:", error);
      toast({
        title: "Error",
        description: "Failed to delete round",
        variant: "destructive",
      });
    }
  };

  const getAdvancementLabel = (round: Round) => {
    switch (round.advancement_type) {
      case "percentage":
        return `Top ${round.cutoff_percentage}% advance`;
      case "count":
        return `Top ${round.cutoff_count} advance`;
      case "time":
        return `Under ${round.max_participants}s advance`;
      default:
        return "No advancement rule";
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading...</div>;
  }

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

          <h1 className="text-4xl font-bold text-white mb-2">
            {competition?.name} - Round Configuration
          </h1>
          <p className="text-slate-300">
            Set up advancement rules for each event and round
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total Rounds</p>
                  <p className="text-2xl font-bold text-white">
                    {Array.from(rounds.values()).reduce(
                      (sum, arr) => sum + arr.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <Badge className={competition?.status === "in_progress" ? "bg-green-600" : "bg-slate-600"}>
                    {competition?.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events and Rounds */}
        <div className="space-y-4 mb-8">
          {events.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No events configured. Add events to the competition first.
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const eventRounds = rounds.get(event.id) || [];
              const isExpanded = expandedEvent === event.id;

              return (
                <Card key={event.id} className="bg-slate-800 border-slate-700">
                  <CardHeader
                    className="cursor-pointer hover:bg-slate-700/50"
                    onClick={() =>
                      setExpandedEvent(isExpanded ? "" : event.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        <div>
                          <CardTitle className="text-white">
                            {event.event_types.display_name}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {eventRounds.length} rounds configured
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <ScrambleGeneratorModal
                          numRounds={eventRounds.length}
                          triggerButtonText="Generate Scrambles"
                        />
                        <Button
                          size="sm"
                          onClick={() => addRound(event.id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Round
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t border-slate-700 pt-6">
                      {eventRounds.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">
                          No rounds yet. Click "Add Round" to create one.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {eventRounds.map((round) => (
                            <div
                              key={round.id}
                              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500"
                            >
                              {editingRound?.id === round.id ? (
                                <RoundEditForm
                                  round={round}
                                  onSave={updateRound}
                                  onCancel={() => setEditingRound(null)}
                                />
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-white font-semibold">
                                        {round.round_name}
                                      </h4>
                                      <p className="text-slate-400 text-sm mt-1">
                                        {getAdvancementLabel(round)}
                                      </p>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setEditingRound(round)
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          deleteRound(round.id, event.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <Badge
                                    variant={
                                      round.status === "completed"
                                        ? "secondary"
                                        : round.status === "in_progress"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {round.status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Information Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How Advancement Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Percentage-Based
              </h4>
              <p className="text-sm">
                Set a percentage (e.g., 50%) and the top 50% of competitors advance to the next round based on their score/time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Count-Based
              </h4>
              <p className="text-sm">
                Set a number (e.g., 8) and only the top 8 competitors advance to the next round.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time-Based (Cutoff)
              </h4>
              <p className="text-sm">
                Set a time limit (e.g., 30 seconds) and competitors who solve under that time automatically advance.
              </p>
            </div>

            <div className="bg-blue-600/20 border border-blue-600/50 rounded p-3 mt-4">
              <p className="text-sm">
                💡 <strong>Tip:</strong> WCA competitions typically use percentage or count-based advancement (e.g., Top 50% then Top 8). Time-based cutoffs are used in qualification rounds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Round Edit Form Component
function RoundEditForm({
  round,
  onSave,
  onCancel,
}: {
  round: Round;
  onSave: (round: Round) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(round);

  return (
    <div className="space-y-4 p-4 bg-slate-600/50 rounded border border-slate-500">
      <div>
        <label className="block text-white text-sm font-medium mb-1">
          Round Name
        </label>
        <input
          type="text"
          value={formData.round_name}
          onChange={(e) =>
            setFormData({ ...formData, round_name: e.target.value })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-1">
          Advancement Type
        </label>
        <select
          value={formData.advancement_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              advancement_type: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          {ADVANCEMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {formData.advancement_type === "percentage" && (
        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Percentage (%)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.cutoff_percentage || 50}
            onChange={(e) =>
              setFormData({
                ...formData,
                cutoff_percentage: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Top {formData.cutoff_percentage}% will advance
          </p>
        </div>
      )}

      {formData.advancement_type === "count" && (
        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Number of Competitors
          </label>
          <input
            type="number"
            min="1"
            value={formData.cutoff_count || 8}
            onChange={(e) =>
              setFormData({
                ...formData,
                cutoff_count: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Top {formData.cutoff_count} competitors will advance
          </p>
        </div>
      )}

      {formData.advancement_type === "time" && (
        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            min="1"
            value={formData.max_participants || 30}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_participants: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            Competitors with times under {formData.max_participants}s advance
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onSave(formData)}
          className="flex-1"
          size="sm"
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
