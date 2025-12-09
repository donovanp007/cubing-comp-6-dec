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
import { ChevronDown, TrendingUp, Zap, Square } from 'lucide-react'

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
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="space-y-1">
          {/* Category Tabs - Compact */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-600 shrink-0">Filter:</span>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onCategoryChange(cat)
                  onFilterChange('')
                }}
                className="capitalize shrink-0 h-7 px-2 text-xs"
              >
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
          </div>

          {/* Category Sub-filter Dropdown - Compact */}
          {selectedCategory !== 'all' && getFilterOptions().length > 0 && (
            <div className="flex items-center gap-1">
              <Select value={selectedFilter} onValueChange={onFilterChange}>
                <SelectTrigger className="w-32 h-7">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {getFilterOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cube Type Selection - Compact */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-600 shrink-0">Cube:</span>
            <Button
              variant={selectedCube === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCubeChange('all')}
              className="shrink-0 h-7 px-2 text-xs"
            >
              All
            </Button>
            {availableFilters.cubes.map((cube) => (
              <Button
                key={cube.id}
                variant={selectedCube === cube.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCubeChange(cube.name)}
                className="shrink-0 h-7 px-2 text-xs"
              >
                {cube.name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={onMetricToggle}
              className="shrink-0 h-7 px-2 text-xs ml-auto flex items-center gap-1"
            >
              {rankingMetric === 'average' ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">Avg</span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  <span className="hidden sm:inline">Single</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
