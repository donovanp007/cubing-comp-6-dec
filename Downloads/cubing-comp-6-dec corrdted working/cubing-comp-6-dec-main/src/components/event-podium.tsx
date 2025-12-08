"use client";

import { Medal, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";

interface PodiumResult {
  student_id: string;
  student_name: string;
  average_time: number;
  best_time: number;
  grade: string;
  gender?: string;
}

interface EventPodiumProps {
  eventName: string;
  podium: PodiumResult[];
  fastestGirl?: PodiumResult;
}

export default function EventPodium({
  eventName,
  podium,
  fastestGirl,
}: EventPodiumProps) {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-blue-100 border-blue-300";
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-500" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {eventName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Podium Rankings */}
          {podium.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No results yet</p>
          ) : (
            <>
              {podium.map((result, index) => (
                <div
                  key={result.student_id}
                  className={`p-4 rounded-lg border-2 ${getMedalColor(
                    index + 1
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getMedalIcon(index + 1) && (
                        <div className="flex-shrink-0 mt-1">
                          {getMedalIcon(index + 1)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">
                            #{index + 1} {result.student_name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {result.grade}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                          <p>
                            <span className="font-semibold">Average:</span>{" "}
                            {result.average_time > 0
                              ? formatTime(result.average_time)
                              : "-"}
                          </p>
                          <p>
                            <span className="font-semibold">Best:</span>{" "}
                            {result.best_time > 0
                              ? formatTime(result.best_time)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Fastest Girl Section */}
          {fastestGirl && podium[0]?.student_id !== fastestGirl.student_id && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-pink-50 border-2 border-pink-300 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-pink-600" />
                  <p className="font-bold text-pink-700">Fastest Girl</p>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold">{fastestGirl.student_name}</p>
                  <p>
                    <span className="font-medium">Average:</span>{" "}
                    {fastestGirl.average_time > 0
                      ? formatTime(fastestGirl.average_time)
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Best:</span>{" "}
                    {fastestGirl.best_time > 0
                      ? formatTime(fastestGirl.best_time)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
