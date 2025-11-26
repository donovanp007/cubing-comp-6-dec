"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import type { Competition } from "@/lib/types/database.types";

export default function PublicCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .eq("is_public", true)
      .order("competition_date", { ascending: true });

    if (!error && data) {
      // Filter out weekly competitions - only show main competitions
      const mainCompetitions = data.filter((comp) =>
        !comp.name.toLowerCase().includes("weekly")
      );
      setCompetitions(mainCompetitions);
    }
    setLoading(false);
  };

  const upcomingComps = competitions.filter((c) => c.status === "upcoming" || c.status === "registration_open");
  const pastComps = competitions.filter((c) => c.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <span className="text-2xl font-bold text-white">Cubing Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/rankings" className="text-white/80 hover:text-white transition">
              Rankings
            </Link>
            <Link href="/results" className="text-white/80 hover:text-white transition">
              Live Results
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur">
                Coach Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Upcoming Competitions
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          View live results, register for events, and track your progress
        </p>
      </section>

      {/* Competitions Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center text-white/60">Loading competitions...</div>
        ) : upcomingComps.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur border-white/20 flex items-center justify-center min-h-[250px]">
            <CardContent className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-white/40 mb-4" />
              <p className="text-white/60">No upcoming competitions</p>
              <p className="text-sm text-white/40 mt-2">
                Check back soon for new events
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingComps.map((comp) => (
              <CompetitionCard
                key={comp.id}
                id={comp.id}
                name={comp.name}
                date={comp.competition_date}
                location={comp.location}
                description={comp.description || ""}
                participants={0}
                status={comp.status as "upcoming" | "in_progress" | "completed"}
              />
            ))}
            {pastComps.length > 0 && (
              <>
                <div className="col-span-full mt-8 mb-4">
                  <h2 className="text-2xl font-bold text-white">Past Competitions</h2>
                </div>
                {pastComps.map((comp) => (
                  <CompetitionCard
                    key={comp.id}
                    id={comp.id}
                    name={comp.name}
                    date={comp.competition_date}
                    location={comp.location}
                    description={comp.description || ""}
                    participants={0}
                    status="completed"
                  />
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/rankings" className="hover:text-white transition">Rankings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CompetitionCard({
  id,
  name,
  date,
  location,
  description,
  participants,
  status,
}: {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: number;
  status: "upcoming" | "in_progress" | "completed";
}) {
  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-white">{name}</CardTitle>
          <Badge
            variant={status === "in_progress" ? "default" : "secondary"}
            className={status === "in_progress" ? "bg-green-500" : "bg-white/20 text-white"}
          >
            {status === "upcoming" ? "Upcoming" : status === "in_progress" ? "Live" : "Completed"}
          </Badge>
        </div>
        {description && <CardDescription className="text-white/70">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Users className="h-4 w-4" />
          <span>{participants} participants</span>
        </div>
        <Link href={`/competitions/${id}/live`} className="block">
          <Button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white">
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
