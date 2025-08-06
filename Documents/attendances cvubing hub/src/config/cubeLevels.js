export const CUBE_LEVELS = {
  '3x3': [
    { value: '3x3_cross', label: '3x3 Cross' },
    { value: '3x3_middle_layer', label: '3x3 Middle Layer' },
    { value: '3x3_white_corners', label: '3x3 White Corners' },
    { value: '3x3_memorization', label: '3x3 Memorization' },
    { value: '3x3_yellow_face', label: '3x3 Yellow Face' },
    { value: '3x3_yellow_cross', label: '3x3 Yellow Cross' },
    { value: '3x3_last_layer', label: '3x3 Last Layer' },
    { value: '3x3_advanced_algorithms', label: '3x3 Advanced Algorithms' },
    { value: '3x3_advanced_yellow_cross', label: '3x3 Advanced Yellow Cross' },
    { value: '3x3_advanced_white_cross', label: '3x3 Advanced White Cross' },
    { value: '3x3_oll', label: '3x3 OLL' },
    { value: '3x3_completed', label: '3x3 Completed' }
  ],
  '2x2': [
    { value: '2x2_basics', label: '2x2 Basics' },
    { value: '2x2_ortega_method', label: '2x2 Ortega Method' },
    { value: '2x2_cll', label: '2x2 CLL' },
    { value: '2x2_eg', label: '2x2 EG' },
    { value: '2x2_advanced', label: '2x2 Advanced' },
    { value: '2x2_completed', label: '2x2 Completed' }
  ],
  '4x4': [
    { value: '4x4_centers', label: '4x4 Centers' },
    { value: '4x4_edges', label: '4x4 Edges' },
    { value: '4x4_3x3_stage', label: '4x4 3x3 Stage' },
    { value: '4x4_parity', label: '4x4 Parity' },
    { value: '4x4_advanced', label: '4x4 Advanced' },
    { value: '4x4_completed', label: '4x4 Completed' }
  ]
}

export const CUBE_TYPES = [
  { value: '2x2', label: '2x2' },
  { value: '3x3', label: '3x3' },
  { value: '4x4', label: '4x4' }
]

export function getCubeLevelLabel(cubeType, level) {
  const levels = CUBE_LEVELS[cubeType]
  if (!levels) return level
  
  const foundLevel = levels.find(l => l.value === level)
  return foundLevel ? foundLevel.label : level
}

export function getNextLevel(cubeType, currentLevel) {
  const levels = CUBE_LEVELS[cubeType]
  if (!levels) return null
  
  const currentIndex = levels.findIndex(l => l.value === currentLevel)
  if (currentIndex === -1 || currentIndex === levels.length - 1) return null
  
  return levels[currentIndex + 1]
}

export function getPreviousLevel(cubeType, currentLevel) {
  const levels = CUBE_LEVELS[cubeType]
  if (!levels) return null
  
  const currentIndex = levels.findIndex(l => l.value === currentLevel)
  if (currentIndex <= 0) return null
  
  return levels[currentIndex - 1]
}