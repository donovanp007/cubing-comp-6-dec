"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Calendar, MapPin, Users, Timer } from "lucide-react";
import type { Competition } from "@/lib/types/database.types";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .order("competition_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch competitions",
        variant: "destructive",
      });
    } else {
      setCompetitions(data || []);
    }
    setLoading(false);
  };

  const upcomingComps = competitions.filter(
    (c) => c.status === "upcoming" || c.status === "registration_open"
  );
  const pastComps = competitions.filter((c) => c.status === "completed");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-500 mt-1">
            Manage big events and official competitions
          </p>
        </div>
        <Link href="/dashboard/competitions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Competition
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Competitions</p>
                <p className="text-2xl font-bold">{competitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingComps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Timer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{pastComps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Competitions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Upcoming Competitions
        </h2>
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        ) : upcomingComps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No upcoming competitions</p>
              <Link href="/dashboard/competitions/new">
                <Button variant="link" className="mt-2">
                  Create a new competition
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingComps.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        )}
      </div>

      {/* Past Competitions */}
      {pastComps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Past Competitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastComps.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitionCard({ competition }: { competition: Competition }) {
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

  return (
    <Link href={`/dashboard/competitions/${competition.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{competition.name}</CardTitle>
            {getStatusBadge(competition.status)}
          </div>
          {competition.description && (
            <CardDescription>{competition.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{competition.competition_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{competition.location}</span>
            </div>
            {competition.max_participants && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Max {competition.max_participants} participants</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Manage Competition
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
