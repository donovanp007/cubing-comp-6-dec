"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trophy, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";

export interface RecentAchiever {
  student_id: string;
  student_name: string;
  badge_name: string;
  badge_icon?: string;
  badge_color?: string;
  earned_at: string;
  competition_name?: string;
}

export interface RecentAchieversProps {
  achievers: RecentAchiever[];
}

export function RecentAchievers({ achievers }: RecentAchieversProps) {
  if (achievers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">
          <Trophy className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p>No recent achievements yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Recent Achievements
        </CardTitle>
        <CardDescription>Latest badges earned by students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievers.slice(0, 10).map((achiever, index) => {
            const earnedDate = new Date(achiever.earned_at);
            const formattedDate = earnedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={`${achiever.student_id}-${achiever.badge_name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{achiever.badge_icon || "⭐"}</div>
                  <div className="flex-1">
                    <Link
                      href={`/students/${achiever.student_id}`}
                      className="hover:underline"
                    >
                      <p className="font-semibold text-gray-900 hover:text-blue-600">
                        {achiever.student_name}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-600">{achiever.badge_name}</p>
                    {achiever.competition_name && (
                      <p className="text-xs text-gray-500">
                        at {achiever.competition_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAchievers;
