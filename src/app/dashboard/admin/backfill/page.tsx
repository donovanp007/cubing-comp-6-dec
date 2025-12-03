"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { runBackfillFinalScores } from "@/app/actions/backfill";
import { AlertCircle, CheckCircle2, Info, Loader } from "lucide-react";

export default function BackfillPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRunBackfill = async () => {
    setIsRunning(true);
    try {
      const backfillResult = await runBackfillFinalScores();
      setResult(backfillResult);

      if (backfillResult.successfully_backfilled > 0 || backfillResult.already_has_scores > 0) {
        toast({
          title: "Backfill Complete!",
          description: `Successfully backfilled ${backfillResult.successfully_backfilled} rounds with ${backfillResult.total_students_backfilled} students.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Backfill Complete",
          description: "All rounds already have final scores.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run backfill",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Final Scores Backfill</h1>
        <p className="text-gray-600 mt-2">
          Restore historical final_scores data for old completed competitions
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            What Does This Do?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            This utility scans all completed rounds in the system and populates the final_scores table with:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Best time for each student in each round</li>
            <li>Average time for each student in each round</li>
          </ul>
          <p className="mt-3 text-xs">
            This fixes the issue where old competition results weren't showing in student profiles.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Backfill</CardTitle>
          <CardDescription>
            This process will check all completed rounds and populate missing final scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRunBackfill}
            disabled={isRunning}
            size="lg"
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Running Backfill...
              </>
            ) : (
              "Run Backfill Now"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.failed_rounds.length === 0 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.failed_rounds.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Backfill Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-gray-600">Total Rounds Found</div>
                <div className="text-2xl font-bold">{result.total_rounds}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Already Had Scores</div>
                <div className="text-2xl font-bold text-blue-600">{result.already_has_scores}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Needed Backfill</div>
                <div className="text-2xl font-bold">{result.rounds_needing_backfill}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Successfully Backfilled</div>
                <div className="text-2xl font-bold text-green-600">{result.successfully_backfilled}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Students Backfilled</div>
                <div className="text-2xl font-bold text-green-600">{result.total_students_backfilled}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Completion Time</div>
                <div className="text-2xl font-bold">{result.completion_time_ms}ms</div>
              </div>
            </div>

            {result.failed_rounds.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-900">Failed Rounds ({result.failed_rounds.length})</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.failed_rounds.map((failed: any, idx: number) => (
                    <div key={idx} className="text-sm p-2 bg-white rounded border border-orange-200">
                      <div className="font-medium">{failed.round_name}</div>
                      <div className="text-xs text-gray-600">{failed.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.successfully_backfilled > 0 && (
              <div className="p-3 bg-white rounded border border-green-200">
                <p className="text-sm text-green-900">
                  ✅ Backfill successful! Student profiles should now show historical competition data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
