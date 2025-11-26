import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Users, TrendingUp } from "lucide-react";

export default function PublicRankingsPage() {
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

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Student Rankings
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          See who&apos;s leading the pack across all events and competitions
        </p>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Champions</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Students</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Best Time</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white">
                  <Medal className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Badges Earned</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rankings Content */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-white/60">
              Students ranked by best average time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Medal className="h-16 w-16 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 text-lg">No rankings yet</p>
              <p className="text-white/40 text-sm mt-2">
                Rankings will appear once students participate in competitions
              </p>
              <Link href="/competitions">
                <Button className="mt-6 bg-white/20 hover:bg-white/30 text-white">
                  View Competitions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/competitions" className="hover:text-white transition">Competitions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
