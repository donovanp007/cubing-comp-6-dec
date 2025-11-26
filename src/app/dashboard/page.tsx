import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Calendar, Medal, TrendingUp, Flame, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/weekly/create">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              New Weekly Comp
            </Button>
          </Link>
          <Link href="/dashboard/competitions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Competition
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value="0"
          description="Active students"
          icon={<Users className="h-5 w-5" />}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Competitions"
          value="0"
          description="This term"
          icon={<Trophy className="h-5 w-5" />}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Weekly Comps"
          value="0"
          description="Active this week"
          icon={<Calendar className="h-5 w-5" />}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Badges Earned"
          value="0"
          description="Total badges"
          icon={<Medal className="h-5 w-5" />}
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Competitions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  This Week&apos;s Competitions
                </CardTitle>
                <CardDescription>Active weekly challenges</CardDescription>
              </div>
              <Link href="/dashboard/weekly">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No weekly competitions yet</p>
              <Link href="/dashboard/weekly/create">
                <Button variant="link" className="mt-2">Create your first weekly comp</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Recent Results
                </CardTitle>
                <CardDescription>Latest competition results</CardDescription>
              </div>
              <Link href="/dashboard/rankings">
                <Button variant="outline" size="sm">View Rankings</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No results yet</p>
              <p className="text-sm mt-1">Results will appear here once students compete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to set up your first competition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step={1}
              title="Add Students"
              description="Import or manually add your students to the system"
              href="/dashboard/students"
              buttonText="Manage Students"
            />
            <StepCard
              step={2}
              title="Create Competition"
              description="Set up a weekly competition or a big event"
              href="/dashboard/weekly/create"
              buttonText="Create Competition"
            />
            <StepCard
              step={3}
              title="Record Times"
              description="Enter solve times and watch rankings update live"
              href="/dashboard/weekly"
              buttonText="View Competitions"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
  href,
  buttonText,
}: {
  step: number;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 flex-1">{description}</p>
      <Link href={href} className="mt-4">
        <Button variant="outline" className="w-full">{buttonText}</Button>
      </Link>
    </div>
  );
}
