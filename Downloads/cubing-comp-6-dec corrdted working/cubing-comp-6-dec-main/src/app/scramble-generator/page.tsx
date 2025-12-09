'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import styles from './scramble-generator.module.css';

interface CubeConfig {
  moves: string[];
  length: number;
  description: string;
}

const CUBE_CONFIGS: Record<string, CubeConfig> = {
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
  }
};

const MOVE_IMAGES: Record<string, string> = {
  'R': '/scramble-generator/assets/notations/R.png',
  "R'": '/scramble-generator/assets/notations/R\'.png',
  'L': '/scramble-generator/assets/notations/L.png',
  "L'": '/scramble-generator/assets/notations/L\'.png',
  'U': '/scramble-generator/assets/notations/U.png',
  "U'": '/scramble-generator/assets/notations/U\'.png',
  'D': '/scramble-generator/assets/notations/D.png',
  "D'": '/scramble-generator/assets/notations/D\'.png',
  'F': '/scramble-generator/assets/notations/F.png',
  "F'": '/scramble-generator/assets/notations/F\'.png',
  'B': '/scramble-generator/assets/notations/B.png',
  "B'": '/scramble-generator/assets/notations/B\'.png'
};

const generateScramble = (cubeType: string = '3x3'): string => {
  const config = CUBE_CONFIGS[cubeType];
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

export default function ScrambleGenerator() {
  const [rounds, setRounds] = useState<string[][]>([]);
  const [cubeType, setCubeType] = useState('3x3');
  const [numRounds, setNumRounds] = useState(1);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  const handleGenerate = () => {
    const newRounds: string[][] = [];
    for (let round = 0; round < numRounds; round++) {
      const roundScrambles: string[] = [];
      for (let i = 0; i < 6; i++) {
        roundScrambles.push(generateScramble(cubeType));
      }
      newRounds.push(roundScrambles);
    }
    setRounds(newRounds);
    setCopied(false);
    setImageError(false);
  };

  const getMoveImageSrc = (move: string): string => {
    if (move.includes('2')) {
      const baseMove = move.replace('2', '');
      return MOVE_IMAGES[baseMove] || '';
    }
    return MOVE_IMAGES[move] || '';
  };

  const handleCopy = () => {
    let allText = '';
    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      allText += `Round ${roundIdx + 1}:\n`;
      for (let i = 0; i < rounds[roundIdx].length; i++) {
        allText += `Scramble ${i + 1}: ${rounds[roundIdx][i]}\n`;
      }
      allText += '\n';
    }
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    pdf.setFontSize(20);
    pdf.setTextColor(102, 126, 234);
    pdf.text(`${CUBE_CONFIGS[cubeType].description} - The Cubing Hub`, 105, 20, {
      align: 'center'
    });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${numRounds} Round${numRounds > 1 ? 's' : ''} - ${new Date().toLocaleDateString()}`, 105, 27, {
      align: 'center'
    });

    let yPosition = 45;

    const loadImageAsBase64 = async (move: string): Promise<string> => {
      if (imageCache[move]) {
        return imageCache[move];
      }

      try {
        const imagePath = MOVE_IMAGES[move];
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error(`Failed to load image: ${move}`, error);
        throw error;
      }
    };

    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      const scrambles = rounds[roundIdx];

      pdf.setFontSize(16);
      pdf.setTextColor(102, 126, 234);
      pdf.text(`Round ${roundIdx + 1}`, 20, yPosition);
      yPosition += 12;

      pdf.setDrawColor(102, 126, 234);
      pdf.setLineWidth(1);
      pdf.line(20, yPosition - 2, 190, yPosition - 2);
      yPosition += 8;

      for (let i = 0; i < scrambles.length; i++) {
        pdf.setFontSize(12);
        pdf.setTextColor(102, 126, 234);
        pdf.text(`Scramble ${i + 1}:`, 20, yPosition);

        yPosition += 10;

        const moves = scrambles[i].split(' ');
        let xPosition = 20;
        const imageWidth = 12;
        const imageHeight = 15;
        const imageGap = 2;

        for (let j = 0; j < moves.length; j++) {
          const move = moves[j];
          const lookupKey = move.includes('2') ? move.replace('2', '') : move;

          try {
            const base64Image = await loadImageAsBase64(lookupKey);
            pdf.addImage(base64Image, 'PNG', xPosition, yPosition, imageWidth, imageHeight);

            if (move.includes('2')) {
              pdf.setDrawColor(255, 215, 0);
              pdf.setLineWidth(0.5);
              pdf.rect(xPosition - 0.5, yPosition - 0.5, imageWidth + 1, imageHeight + 1);
            }

            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);
            pdf.text(move, xPosition + imageWidth / 2, yPosition + imageHeight + 3, {
              align: 'center'
            });

            xPosition += imageWidth + imageGap;

            if (xPosition > 180) {
              xPosition = 20;
              yPosition += 22;
            }
          } catch (error) {
            console.error('Error loading image for move ' + move + ':', error);
            pdf.setFontSize(9);
            pdf.setTextColor(200, 0, 0);
            pdf.text('❌ ' + move, xPosition, yPosition + 8);
            pdf.setTextColor(80, 80, 80);
            xPosition += 15;
          }
        }

        yPosition += 25;

        if (i < scrambles.length - 1) {
          pdf.setDrawColor(233, 236, 239);
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += 10;
        }

        if (yPosition > 240 && i < scrambles.length - 1) {
          pdf.addPage();
          yPosition = 20;
        }
      }

      if (roundIdx < rounds.length - 1) {
        yPosition += 15;
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }
      }
    }

    const pageCount = (pdf as any).getNumberOfPages?.() || pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated by The Cubing Hub - Page ${i} of ${pageCount}`, 105, 285, {
        align: 'center'
      });
    }

    pdf.save(`cubing-hub-scrambles-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const preloadImages = async () => {
      const cache: Record<string, string> = {};
      const imageKeys = Object.keys(MOVE_IMAGES);

      for (const key of imageKeys) {
        try {
          const imagePath = MOVE_IMAGES[key];
          const response = await fetch(imagePath);
          const blob = await response.blob();
          const reader = new FileReader();

          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              cache[key] = reader.result as string;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error(`Failed to preload image: ${key}`, error);
        }
      }

      setImageCache(cache);
      console.log('Images preloaded:', Object.keys(cache).length);
    };

    preloadImages();
    handleGenerate();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🎲 {CUBE_CONFIGS[cubeType].description}</h1>
      <p className={styles.subtitle}>The Cubing Hub</p>

      {imageError && (
        <div className={styles.imageError}>
          ⚠️ Images not found. Please ensure notation images are in the public folder.
        </div>
      )}

      <div className={styles.selectors}>
        <div className={styles.selectorGroup}>
          <label htmlFor="cube-type">Cube Type:</label>
          <select
            id="cube-type"
            value={cubeType}
            onChange={(e) => {
              setCubeType(e.target.value);
              handleGenerate();
            }}
          >
            <option value="2x2">2x2 Cube</option>
            <option value="3x3">3x3 Cube</option>
            <option value="4x4">4x4 Cube</option>
            <option value="5x5">5x5 Cube</option>
          </select>
        </div>
        <div className={styles.selectorGroup}>
          <label htmlFor="num-rounds">Rounds:</label>
          <select
            id="num-rounds"
            value={numRounds}
            onChange={(e) => {
              setNumRounds(Number(e.target.value));
              handleGenerate();
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} Round{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.generateBtn} onClick={handleGenerate}>
          🔄 Generate Scrambles
        </button>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          disabled={rounds.length === 0}
        >
          {copied ? '✓ Copied!' : '📋 Copy All'}
        </button>
        <button
          className={styles.exportBtn}
          onClick={handleExportPDF}
          disabled={rounds.length === 0}
        >
          📄 Export to PDF
        </button>
      </div>

      <div className={styles.roundsContainer}>
        {rounds.length === 0 ? (
          <div className={styles.emptyState}>Click "Generate Scrambles" to get started</div>
        ) : (
          rounds.map((roundScrambles, roundIdx) => (
            <div key={roundIdx} className={styles.roundGroup}>
              <div className={styles.roundHeader}>Round {roundIdx + 1}</div>
              <div className={styles.scramblesContainer}>
                {roundScrambles.map((scramble, idx) => (
                  <div key={idx} className={styles.scrambleItem}>
                    <div className={styles.scrambleNumber}>Scramble {idx + 1}</div>
                    <div className={styles.scrambleMoves}>
                      {scramble.split(' ').map((move, moveIdx) => (
                        <div key={moveIdx} className={styles.moveCard}>
                          <img
                            src={getMoveImageSrc(move)}
                            alt={move}
                            className={`${styles.moveImage} ${
                              move.includes('2') ? styles.doubleMove : ''
                            }`}
                            onError={() => setImageError(true)}
                          />
                          <div className={styles.moveLabel}>{move}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
