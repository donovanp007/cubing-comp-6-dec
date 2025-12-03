"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trophy, Medal } from "lucide-react";

export interface TopPerformer {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school: string;
  total_points: number;
  badge_count: number;
}

export interface TopPerformersCarouselProps {
  performers: TopPerformer[];
}

export function TopPerformersCarousel({ performers }: TopPerformersCarouselProps) {
  if (performers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">
          <Trophy className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p>No performers yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {performers.slice(0, 10).map((performer, index) => (
          <Card key={performer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-1 bg-gradient-to-r ${
              index === 0 ? 'from-yellow-400 to-yellow-600' :
              index === 1 ? 'from-gray-300 to-gray-500' :
              index === 2 ? 'from-orange-400 to-orange-600' :
              'from-blue-400 to-blue-600'
            }`} />
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    #{index + 1}
                  </span>
                  {index < 3 && (
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/students/${performer.id}`}
                className="hover:underline block mb-2"
              >
                <p className="font-bold text-gray-900 text-sm hover:text-blue-600 truncate">
                  {performer.first_name} {performer.last_name}
                </p>
              </Link>

              <div className="space-y-2 text-xs">
                <p className="text-gray-600">{performer.school}</p>
                <Badge variant="outline" className="text-xs">
                  {performer.grade}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Points</span>
                  <span className="font-bold text-blue-600">
                    {performer.total_points.toFixed(0)}
                  </span>
                </div>
                {performer.badge_count > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Badges</span>
                    <div className="flex items-center gap-1">
                      <Medal className="h-3 w-3 text-yellow-600" />
                      <span className="font-bold">{performer.badge_count}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TopPerformersCarousel;
