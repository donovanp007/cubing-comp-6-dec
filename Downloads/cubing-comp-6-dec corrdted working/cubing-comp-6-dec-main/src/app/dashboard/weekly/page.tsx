"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Trophy, Flame, Users, Timer, TrendingUp } from "lucide-react";
import type { WeeklyCompetition, EventType } from "@/lib/types/database.types";

interface WeeklyCompWithEvent extends WeeklyCompetition {
  event_types: EventType | null;
  result_count: number;
}

export default function WeeklyCompetitionsPage() {
  const [competitions, setCompetitions] = useState<WeeklyCompWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("weekly_competitions")
      .select(`
        *,
        event_types(*),
        weekly_results(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch competitions",
        variant: "destructive",
      });
    } else {
      const compsWithCounts = (data || []).map((comp: any) => ({
        ...comp,
        result_count: comp.weekly_results?.[0]?.count || 0,
      }));
      setCompetitions(compsWithCounts);
    }
    setLoading(false);
  };

  const activeComps = competitions.filter((c) => c.status === "active");
  const completedComps = competitions.filter((c) => c.status === "completed");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Termly Leagues</h1>
          <p className="text-gray-500 mt-1">
            Weekly rankings and cumulative league standings throughout the term
          </p>
        </div>
        <Link href="/dashboard/weekly/create">
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            New League Week
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active This Week"
          value={activeComps.length.toString()}
          icon={<Flame className="h-5 w-5" />}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Total Completed"
          value={completedComps.length.toString()}
          icon={<Trophy className="h-5 w-5" />}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Participants"
          value={competitions.reduce((acc, c) => acc + c.result_count, 0).toString()}
          icon={<Users className="h-5 w-5" />}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="This Term"
          value={competitions.length.toString()}
          icon={<Calendar className="h-5 w-5" />}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Active Competitions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Active Competitions
        </h2>
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        ) : activeComps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No active competitions this week</p>
              <Link href="/dashboard/weekly/create">
                <Button variant="link" className="mt-2">
                  Create a new weekly competition
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeComps.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Competitions */}
      {completedComps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedComps.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitionCard({ competition }: { competition: WeeklyCompWithEvent }) {
  const isActive = competition.status === "active";

  return (
    <Card className={isActive ? "border-orange-200 bg-orange-50/30" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{competition.name}</CardTitle>
            <CardDescription>
              {competition.term} • Week {competition.week_number}
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="h-4 w-4" />
            <span>{competition.event_types?.display_name || "3x3x3"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{competition.result_count} participants</span>
          </div>
          {competition.grade_filter && competition.grade_filter.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {competition.grade_filter.map((grade) => (
                <Badge key={grade} variant="outline" className="text-xs">
                  {grade}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t flex gap-2">
          <Link href={`/dashboard/weekly/${competition.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {isActive && (
            <Link href={`/dashboard/weekly/${competition.id}/record`}>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                Record
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
