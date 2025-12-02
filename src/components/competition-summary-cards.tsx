import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Zap, Users } from 'lucide-react';

export interface CompetitionSummary {
  date?: string;
  location?: string;
  totalEvents: number;
  totalParticipants: number;
}

export function CompetitionSummaryCards({ summary }: { summary: CompetitionSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Date Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-lg font-bold text-gray-900">
                {summary.date ? new Date(summary.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {summary.location || 'TBA'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Events</p>
              <p className="text-lg font-bold text-gray-900">{summary.totalEvents}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Participants</p>
              <p className="text-lg font-bold text-gray-900">{summary.totalParticipants}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompetitionSummaryCards;
