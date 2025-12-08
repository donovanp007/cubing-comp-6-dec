import { useState, useCallback } from 'react';

interface CubeConfig {
  moves: string[];
  length: number;
  description: string;
}

export const CUBE_CONFIGS: Record<string, CubeConfig> = {
  '2x2': {
    moves: ['R', 'U', 'F'],
    length: 9,
    description: '2x2 Cube (WCA Standard)'
  },
  '3x3': {
    moves: ['R', 'L', 'U', 'D', 'F', 'B'],
    length: 20,
    description: '3x3 Cube (WCA Standard)'
  },
  '4x4': {
    moves: ['R', 'L', 'U', 'D', 'F', 'B', 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw'],
    length: 40,
    description: '4x4 Cube (WCA Standard)'
  },
  '5x5': {
    moves: ['R', 'L', 'U', 'D', 'F', 'B', 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw', 'M', 'E', 'S'],
    length: 60,
    description: '5x5 Cube (WCA Standard)'
  },
  'Pyraminx': {
    moves: ['R', 'U', 'L', 'B'],
    length: 11,
    description: 'Pyraminx (WCA Standard)'
  },
  'Megaminx': {
    moves: ['R', 'U'],
    length: 70,
    description: 'Megaminx (WCA Standard)'
  },
};

const generateScramble = (cubeType: string = '3x3'): string => {
  const config = CUBE_CONFIGS[cubeType] || CUBE_CONFIGS['3x3'];
  const moves = config.moves;
  const length = config.length;
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastMove = '';

  for (let i = 0; i < length; i++) {
    let move: string;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
    } while (move === lastMove);

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
    lastMove = move;
  }

  return scramble.join(' ');
};

export const useScrambleGenerator = () => {
  const [rounds, setRounds] = useState<string[][]>([]);
  const [cubeType, setCubeType] = useState('3x3');
  const [numRounds, setNumRounds] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScrambles = useCallback((
    cubetype?: string,
    numRoundsOverride?: number,
    scramblesPerRound: number = 6
  ) => {
    setIsGenerating(true);
    const finalCubeType = cubetype || cubeType;
    const finalNumRounds = numRoundsOverride ?? numRounds;

    const newRounds: string[][] = [];
    for (let round = 0; round < finalNumRounds; round++) {
      const roundScrambles: string[] = [];
      for (let i = 0; i < scramblesPerRound; i++) {
        roundScrambles.push(generateScramble(finalCubeType));
      }
      newRounds.push(roundScrambles);
    }
    setRounds(newRounds);
    setIsGenerating(false);
    return newRounds;
  }, [cubeType, numRounds]);

  const exportAsText = useCallback(() => {
    let allText = '';
    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      allText += `Round ${roundIdx + 1}:\n`;
      for (let i = 0; i < rounds[roundIdx].length; i++) {
        allText += `Scramble ${i + 1}: ${rounds[roundIdx][i]}\n`;
      }
      allText += '\n';
    }
    return allText;
  }, [rounds]);

  return {
    rounds,
    cubeType,
    setCubeType,
    numRounds,
    setNumRounds,
    generateScrambles,
    exportAsText,
    isGenerating,
  };
};
