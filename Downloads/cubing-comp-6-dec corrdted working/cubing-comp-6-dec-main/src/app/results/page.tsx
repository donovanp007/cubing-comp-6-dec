"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Trophy, Calendar, Users, ArrowRight, Timer } from "lucide-react";
import type { WeeklyCompetition, EventType } from "@/lib/types/database.types";

interface WeeklyCompWithDetails extends WeeklyCompetition {
  event_types: EventType | null;
  weekly_results: { count: number }[];
}

export default function PublicResultsPage() {
  const [competitions, setCompetitions] = useState<WeeklyCompWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from("weekly_competitions")
      .select(`
        *,
        event_types(*),
        weekly_results(count)
      `)
      .order("start_date", { ascending: false })
      .limit(20);

    setCompetitions(data || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cubing Hub
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/rankings" className="text-gray-600 hover:text-gray-900">
              Rankings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Competition Results
          </h1>
          <p className="text-lg text-gray-600">
            Watch your students compete in real-time
          </p>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-16">
            <Timer className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No competitions yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {competitions.map((comp) => (
              <Link key={comp.id} href={`/results/${comp.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <Trophy className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {comp.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {comp.term} - Week {comp.week_number}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {comp.weekly_results?.[0]?.count || 0} participants
                            </span>
                            {comp.event_types && (
                              <span>{comp.event_types.display_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(comp.status || "active")}>
                          {comp.status === "active" ? "Live" : comp.status}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          Cubing Hub Competition Management System
        </div>
      </footer>
    </div>
  );
}
