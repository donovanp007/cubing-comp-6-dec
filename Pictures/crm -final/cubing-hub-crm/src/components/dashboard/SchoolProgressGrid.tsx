'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SchoolProgress } from '@/types'
import { cn } from '@/lib/utils'
import { School, TrendingUp, TrendingDown } from 'lucide-react'

interface SchoolProgressGridProps {
  schools: SchoolProgress[]
  loading?: boolean
}

export default function SchoolProgressGrid({ schools, loading = false }: SchoolProgressGridProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">School Progress</h3>
          <p className="text-sm text-gray-600">Track enrollment progress for each school</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">School Progress</h3>
        <p className="text-sm text-gray-600">Track enrollment progress for each school</p>
      </div>

      <div className="space-y-4">
        {schools.map((school) => {
          const isOnTarget = school.distanceToTarget <= 5
          const isCloseToTarget = school.distanceToTarget <= 10
          
          return (
            <div
              key={school.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{school.name}</h4>
                  <p className="text-sm text-gray-600">
                    {school.current} / {school.target} students
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Progress Bar */}
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      school.percentComplete >= 100 
                        ? "bg-green-500" 
                        : school.percentComplete >= 80 
                        ? "bg-blue-500"
                        : school.percentComplete >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(school.percentComplete, 100)}%` }}
                  />
                </div>

                {/* Distance to Target */}
                <div className="flex items-center space-x-2">
                  {school.distanceToTarget > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <Badge 
                        variant={isOnTarget ? "default" : isCloseToTarget ? "secondary" : "destructive"}
                        className={cn(
                          "min-w-[60px] justify-center",
                          isOnTarget && "bg-green-100 text-green-800 hover:bg-green-100",
                          isCloseToTarget && !isOnTarget && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        )}
                      >
                        -{school.distanceToTarget}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <Badge variant="destructive" className="min-w-[60px] justify-center">
                        +{Math.abs(school.distanceToTarget)}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Percentage */}
                <div className="text-right min-w-[60px]">
                  <span className="text-sm font-medium text-gray-900">
                    {school.percentComplete.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {schools.length === 0 && (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-sm text-gray-600">Add schools to start tracking enrollment progress.</p>
        </div>
      )}
    </Card>
  )
}