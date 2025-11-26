import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Timer, Medal, TrendingUp, Flame } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <span className="text-2xl font-bold text-white">Cubing Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/competitions" className="text-white/80 hover:text-white transition">
              Competitions
            </Link>
            <Link href="/rankings" className="text-white/80 hover:text-white transition">
              Rankings
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
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Competition Management
          <br />
          <span className="text-yellow-300">Made Simple</span>
        </h1>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Run cubing competitions with real-time scoring, automatic rankings, badges, and streaks.
          Keep students engaged week after week!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/competitions">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              View Competitions
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Coach Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Timer className="h-8 w-8" />}
            title="Fast Time Entry"
            description="Enter times in seconds with smart parsing. Just type 1234 for 12.34 seconds!"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8" />}
            title="Weekly Competitions"
            description="Run weekly challenges to keep students engaged throughout the term."
            gradient="from-yellow-500 to-orange-500"
          />
          <FeatureCard
            icon={<Medal className="h-8 w-8" />}
            title="Badges & Achievements"
            description="17+ badges for students to earn. Track participation, streaks, and improvements!"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Flame className="h-8 w-8" />}
            title="Streak Tracking"
            description="Track participation streaks, winning streaks, and podium streaks."
            gradient="from-red-500 to-orange-500"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Improvement Stats"
            description="See week-over-week improvements and compare with classmates."
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Student Profiles"
            description="Complete profiles with competition history, personal bests, and badges."
            gradient="from-indigo-500 to-purple-500"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Start running weekly competitions today and watch your students&apos; skills improve!
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition">
      <CardHeader>
        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white/70">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
