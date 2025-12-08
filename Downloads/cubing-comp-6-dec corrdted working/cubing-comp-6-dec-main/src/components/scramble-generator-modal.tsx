'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScrambleGenerator, CUBE_CONFIGS } from '@/lib/hooks/useScrambleGenerator';
import { Dice5, Download, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ScrambleGeneratorModalProps {
  numRounds?: number;
  onGenerate?: (scrambles: string[][]) => void;
  triggerButtonText?: string;
}

export default function ScrambleGeneratorModal({
  numRounds = 1,
  onGenerate,
  triggerButtonText = '🎲 Generate Scrambles'
}: ScrambleGeneratorModalProps) {
  const { rounds, cubeType, setCubeType, numRounds: stateNumRounds, setNumRounds, generateScrambles, exportAsText, isGenerating } = useScrambleGenerator();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerate = () => {
    const scrambles = generateScrambles(cubeType, numRounds || stateNumRounds);
    onGenerate?.(scrambles);
  };

  const handleCopy = () => {
    const text = exportAsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = exportAsText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `scrambles-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Dice5 className="h-4 w-4" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scramble Generator</DialogTitle>
          <DialogDescription>
            Generate WCA-compliant scrambles for your competition rounds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cube Type</label>
              <Select value={cubeType} onValueChange={setCubeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CUBE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rounds</label>
              <Select value={String(numRounds || stateNumRounds)} onValueChange={(val) => setNumRounds(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Round{n > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Scrambles'}
          </Button>

          {/* Scrambles Display */}
          {rounds.length > 0 && (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rounds.map((roundScrambles, roundIdx) => (
                  <Card key={roundIdx} className="p-4">
                    <div className="font-semibold text-sm mb-3">Round {roundIdx + 1}</div>
                    <div className="space-y-2 text-xs">
                      {roundScrambles.map((scramble, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded font-mono break-words">
                          <span className="font-semibold text-gray-600">S{idx + 1}:</span> {scramble}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download TXT
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
