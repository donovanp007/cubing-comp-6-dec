"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import { ChevronDown, ChevronUp, Star, Flame, Trophy, Zap } from "lucide-react";
import { useState } from "react";

export interface CompletedRoundData {
  id: string;
  round_name: string;
  points: PointTransaction[];
}

export interface PointTransaction {
  student_id: string;
  student_name: string;
  grade: string;
  school: string;
  total_points: number;
  tier_achieved?: string;
  pb_bonus: number;
  clutch_bonus: number;
  streak_bonus: number;
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-yellow-600",
  A: "bg-purple-600",
  B: "bg-orange-600",
  C: "bg-green-600",
  D: "bg-gray-600",
};

export function CompletedRoundsPoints({
  rounds,
}: {
  rounds: CompletedRoundData[];
}) {
  const [expandedRound, setExpandedRound] = useState<string | null>(
    rounds.length > 0 ? rounds[0].id : null
  );

  if (rounds.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center text-slate-400">
          <Zap className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <p>No completed rounds yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Card key={round.id} className="bg-slate-800 border-slate-700">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/50"
            onClick={() =>
              setExpandedRound(expandedRound === round.id ? null : round.id)
            }
          >
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-semibold">{round.round_name}</h4>
                <p className="text-xs text-slate-400">
                  {round.points.length} competitors with points
                </p>
              </div>
            </div>
            {expandedRound === round.id ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>

          {expandedRound === round.id && (
            <CardContent className="border-t border-slate-700 pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300 w-12">Rank</TableHead>
                      <TableHead className="text-slate-300">Student</TableHead>
                      <TableHead className="text-slate-300 text-center">Tier</TableHead>
                      <TableHead className="text-slate-300 text-right">Points</TableHead>
                      <TableHead className="text-slate-300 text-center">Bonuses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {round.points
                      .sort((a, b) => b.total_points - a.total_points)
                      .slice(0, 10)
                      .map((point, index) => (
                        <TableRow key={point.student_id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="font-bold text-white">
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && (
                              <span className="text-slate-400">#{index + 1}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/students/${point.student_id}`}
                              className="text-white hover:text-blue-400 hover:underline"
                            >
                              <div>
                                <p className="font-medium">{point.student_name}</p>
                                <p className="text-xs text-slate-400">
                                  {point.grade} • {point.school}
                                </p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            {point.tier_achieved && (
                              <Badge className={TIER_COLORS[point.tier_achieved] || "bg-gray-600"}>
                                {point.tier_achieved}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xl font-bold text-blue-400">
                              {point.total_points.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2 text-xs">
                              {point.pb_bonus > 0 && (
                                <div title="PB Bonus" className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-400" />
                                  <span className="text-yellow-400">
                                    +{point.pb_bonus.toFixed(0)}
                                  </span>
                                </div>
                              )}
                              {point.clutch_bonus > 0 && (
                                <div title="Clutch Bonus" className="flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-orange-400" />
                                  <span className="text-orange-400">
                                    +{point.clutch_bonus.toFixed(0)}
                                  </span>
                                </div>
                              )}
                              {point.streak_bonus > 0 && (
                                <div title="Streak Bonus" className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3 text-purple-400" />
                                  <span className="text-purple-400">
                                    +{point.streak_bonus.toFixed(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default CompletedRoundsPoints;
