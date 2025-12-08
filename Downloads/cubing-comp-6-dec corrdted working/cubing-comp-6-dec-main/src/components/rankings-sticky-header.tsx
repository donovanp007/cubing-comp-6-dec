'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, TrendingUp, Zap } from 'lucide-react'

interface StickyHeaderProps {
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
  selectedCube: string
  onCubeChange: (cube: string) => void
  rankingMetric: 'average' | 'single'
  onMetricToggle: () => void
  availableFilters: {
    schools: string[]
    grades: string[]
    cubes: { id: string; name: string }[]
  }
}

export default function RankingsStickyHeader({
  selectedCategory,
  onCategoryChange,
  selectedFilter,
  onFilterChange,
  selectedCube,
  onCubeChange,
  rankingMetric,
  onMetricToggle,
  availableFilters,
}: StickyHeaderProps) {
  const categories = ['all', 'schools', 'grades', 'ages']
  const ageRanges = ['5-7', '8-10', '11-13', '14+']

  const getFilterOptions = () => {
    switch (selectedCategory) {
      case 'schools':
        return availableFilters.schools
      case 'grades':
        return availableFilters.grades
      case 'ages':
        return ageRanges
      default:
        return []
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-semibold text-gray-700 shrink-0">
              Filter by:
            </span>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onCategoryChange(cat)
                    onFilterChange('')
                  }}
                  className="capitalize shrink-0"
                >
                  {cat === 'all' ? 'All' : cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Sub-filters and Cube Selection */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Sub-filter Dropdown */}
            {selectedCategory !== 'all' && getFilterOptions().length > 0 && (
              <Select value={selectedFilter} onValueChange={onFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={`Select ${selectedCategory.slice(0, -1)}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getFilterOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Cube Type Dropdown */}
            <Select value={selectedCube} onValueChange={onCubeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Cube Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cube Types</SelectItem>
                {availableFilters.cubes.map((cube) => (
                  <SelectItem key={cube.id} value={cube.name}>
                    {cube.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ranking Metric Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onMetricToggle}
              className="flex items-center gap-2"
            >
              {rankingMetric === 'average' ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>Average First</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Single First</span>
                </>
              )}
            </Button>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategory !== 'all' && selectedFilter && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}: {selectedFilter}
              </Badge>
            )}
            {selectedCube !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Cube: {selectedCube}
              </Badge>
            )}
            {rankingMetric === 'single' && (
              <Badge variant="secondary" className="text-xs">
                Single Time Priority
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
