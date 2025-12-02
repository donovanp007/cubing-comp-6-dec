import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { Trophy, Heart } from 'lucide-react';

export interface HighlightStudent {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school: string;
  best_time_milliseconds: number;
}

export interface ChampionshipHighlightsProps {
  overallWinner?: HighlightStudent | null;
  fastestGirl?: HighlightStudent | null;
}

export function ChampionshipHighlights({
  overallWinner,
  fastestGirl,
}: ChampionshipHighlightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Overall Winner */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">Overall Winner</h3>
            </div>
            <span className="text-4xl">🏆</span>
          </div>

          {overallWinner ? (
            <div className="space-y-3">
              <Link
                href={`/students/${overallWinner.id}`}
                className="hover:underline"
              >
                <p className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                  {overallWinner.first_name} {overallWinner.last_name}
                </p>
              </Link>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{overallWinner.grade}</Badge>
                <span className="text-sm text-gray-600">{overallWinner.school}</span>
              </div>
              <div className="pt-2 border-t border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Fastest Time</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatTime(overallWinner.best_time_milliseconds)}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No scores yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fastest Girl */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-600" />
              <h3 className="text-lg font-bold text-gray-900">Fastest Girl</h3>
            </div>
            <span className="text-4xl">⚡</span>
          </div>

          {fastestGirl ? (
            <div className="space-y-3">
              <Link
                href={`/students/${fastestGirl.id}`}
                className="hover:underline"
              >
                <p className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                  {fastestGirl.first_name} {fastestGirl.last_name}
                </p>
              </Link>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{fastestGirl.grade}</Badge>
                <span className="text-sm text-gray-600">{fastestGirl.school}</span>
              </div>
              <div className="pt-2 border-t border-rose-200">
                <p className="text-sm text-gray-600 mb-1">Fastest Time</p>
                <p className="text-xl font-bold text-rose-600">
                  {formatTime(fastestGirl.best_time_milliseconds)}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Heart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No female competitors yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ChampionshipHighlights;
