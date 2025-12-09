"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Star, Trophy, Flame, Target } from "lucide-react";
import type { Student } from "@/lib/types/database.types";

interface Achievement {
  id: string;
  badge_id: string;
  earned_at: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
}

interface BadgeWithStatus extends Achievement {
  earned: boolean;
}

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  uncommon: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  rare: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  legendary: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
};

export default function AchievementsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch student
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    setStudent(studentData);

    // Fetch earned achievements
    const { data: achievementData } = await supabase
      .from("student_achievements")
      .select(
        `
        id, earned_at, badge_id,
        badges(name, description, icon, category, rarity, points, requirement_type, requirement_value)
      `
      )
      .eq("student_id", studentId)
      .order("earned_at", { ascending: false });

    const earnedAchievements = (achievementData || []).map((a: any) => ({
      id: a.id,
      badge_id: a.badge_id,
      earned_at: a.earned_at,
      ...a.badges,
    }));
    setAchievements(earnedAchievements);

    // Fetch all badges to show locked ones
    const { data: badgeData } = await supabase
      .from("badges")
      .select("*")
      .order("rarity", { ascending: true });

    const earnedBadgeIds = new Set(earnedAchievements.map((a: Achievement) => a.badge_id));
    const allBadgesWithStatus = (badgeData || []).map((b: any) => ({
      ...b,
      earned: earnedBadgeIds.has(b.id),
    }));

    setAllBadges(allBadgesWithStatus);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading achievements...</div>;
  }

  const earnedCount = achievements.length;
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/students/${studentId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {student?.first_name} {student?.last_name}'s Achievements
            </h1>
            <p className="text-gray-500 mt-2">
              {earnedCount} badges earned • {totalPoints} total points
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Badges Earned</p>
                <p className="text-2xl font-bold">{earnedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Legendary Badges</p>
                <p className="text-2xl font-bold">
                  {achievements.filter((a) => a.rarity === "legendary").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Locked Badges</p>
                <p className="text-2xl font-bold">
                  {allBadges.filter((b) => !b.earned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Achievements Timeline */}
      {achievements.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const colors = rarityColors[achievement.rarity] || rarityColors.common;
              const earnedDate = new Date(achievement.earned_at).toLocaleDateString();

              return (
                <Card
                  key={achievement.id}
                  className={`border-2 ${colors.border} ${colors.bg} hover:shadow-md transition`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {achievement.name}
                            </h3>
                            <Badge className={colors.text}>{achievement.rarity}</Badge>
                            <Badge variant="secondary">{achievement.points} pts</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Category: {achievement.category} • Earned on {earnedDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Requirement</p>
                        <p className="font-semibold text-gray-900">
                          {achievement.requirement_type}: {achievement.requirement_value}+
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Badges Gallery */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Badges</h2>

        {/* Organize by category */}
        {["participation", "streak", "achievement", "improvement", "speed"].map((category) => {
          const categoryBadges = allBadges.filter((b) => b.category === category);
          if (categoryBadges.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {category} Badges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBadges.map((badge) => {
                  const colors = rarityColors[badge.rarity] || rarityColors.common;

                  return (
                    <Card
                      key={badge.id}
                      className={`transition ${
                        badge.earned
                          ? `border-2 ${colors.border} hover:shadow-lg`
                          : "opacity-50 border-2 border-gray-200"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-5xl mb-3">{badge.earned ? badge.icon : "🔒"}</div>

                          <h4 className="font-bold text-gray-900 mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-500 mb-3">{badge.description}</p>

                          <div className="flex flex-wrap gap-2 justify-center mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {badge.rarity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {badge.points} pts
                            </Badge>
                          </div>

                          {badge.earned ? (
                            <div className="text-xs text-green-600 font-semibold">
                              ✓ Earned
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              <p>Requires:</p>
                              <p className="font-semibold">
                                {badge.requirement_type}: {badge.requirement_value}+
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
