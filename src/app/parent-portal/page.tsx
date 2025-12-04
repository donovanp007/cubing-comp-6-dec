"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, HelpCircle, Zap } from "lucide-react";
import { useState } from "react";

export default function ParentPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/rankings?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
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
            <Link href="/competitions" className="text-white/80 hover:text-white transition">
              Competitions
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur">
                Coach Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Welcome, Parents! 👋
        </h1>
        <p className="text-2xl text-white/80 max-w-3xl mx-auto mb-8">
          Track your child's cubing journey and celebrate their achievements
        </p>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="bg-white/10 backdrop-blur border-white/20 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-center">Find Your Child</CardTitle>
            <CardDescription className="text-white/60 text-center">
              Search by their first or last name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter their name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none transition"
              />
              <Button
                type="submit"
                className="bg-white text-purple-600 hover:bg-white/90 font-bold px-8"
              >
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Rankings Card */}
          <Link href="/rankings">
            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition cursor-pointer h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white mb-4">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">View Rankings</h3>
                  <p className="text-white/60">
                    See all student rankings and compare performance across the school
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Live Competitions Card */}
          <Link href="/competitions">
            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition cursor-pointer h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white mb-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Live Competitions</h3>
                  <p className="text-white/60">
                    Watch competitions happening right now and see live results
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="bg-white/10 backdrop-blur border-white/20 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="border-b border-white/20 pb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                How do I find my child's profile?
              </h4>
              <p className="text-white/80">
                Use the search bar above to find your child by name, or click "View Rankings" to browse all students and click on their name to see their full profile.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="border-b border-white/20 pb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                What information can I see on my child's profile?
              </h4>
              <p className="text-white/80">
                You can see their current ranking, total points earned, personal best times, competition history, and all achievements and badges they've earned.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="border-b border-white/20 pb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                Can I watch competitions live?
              </h4>
              <p className="text-white/80">
                Yes! Click "Live Competitions" to see real-time results and standings during active competitions. You can follow your child's performance as it happens.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="pb-6">
              <h4 className="text-lg font-bold text-white mb-2">
                How are points and rankings calculated?
              </h4>
              <p className="text-white/80">
                Points are awarded based on performance tier (S/A/B/C/D), adjusted for grade level. Bonuses are awarded for personal bests, clutch performances, and consistency. Rankings are determined by total career points.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/rankings" className="hover:text-white transition">
              Rankings
            </Link>
            <Link href="/competitions" className="hover:text-white transition">
              Competitions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
