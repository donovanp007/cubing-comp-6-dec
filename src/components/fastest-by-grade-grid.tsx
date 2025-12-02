import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { Zap } from 'lucide-react';

export interface FastestStudent {
  id: string;
  first_name: string;
  last_name: string;
  school: string;
  best_time_milliseconds: number;
}

export interface FastestByGradeProps {
  data: {
    grade: number;
    student: FastestStudent | null;
  }[];
}

const GRADE_COLORS = [
  'from-red-500 to-pink-500',      // Grade 1
  'from-orange-500 to-yellow-500', // Grade 2
  'from-yellow-500 to-green-500',  // Grade 3
  'from-green-500 to-cyan-500',    // Grade 4
  'from-blue-500 to-purple-500',   // Grade 5
  'from-purple-500 to-pink-500',   // Grade 6
  'from-indigo-500 to-blue-500',   // Grade 7
];

export function FastestByGradeGrid({ data }: FastestByGradeProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">Fastest by Grade</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map(({ grade, student }, index) => {
          const gradientClass = GRADE_COLORS[index] || GRADE_COLORS[0];

          return (
            <Card key={grade} className="overflow-hidden">
              <div className={`bg-gradient-to-r ${gradientClass} h-2`} />
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  Grade {grade}
                </p>

                {student ? (
                  <div className="space-y-2">
                    <Link
                      href={`/students/${student.id}`}
                      className="hover:underline block"
                    >
                      <p className="font-bold text-gray-900 hover:text-blue-600 text-sm truncate">
                        {student.first_name} {student.last_name}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-600 truncate">
                      {student.school}
                    </p>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Fastest Time</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatTime(student.best_time_milliseconds)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No scores yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default FastestByGradeGrid;
