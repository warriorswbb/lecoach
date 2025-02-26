"use client";

import { useState } from "react";

interface Play {
  id: string;
  period: number;
  time_remaining: number;
  offense_team: string;
  defense_team: string;
  offense_player: string;
  play_type: string;
  play_result: string;
  description: string;
  home_score: number;
  away_score: number;
  is_home_offense: boolean;
  shot_quality?: number;
  score_margin: number;
  run_team?: string;
  run_points?: number;
}

interface PlayByPlayProps {
  plays: Play[];
}

export default function PlayByPlay({ plays }: PlayByPlayProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  // Group plays by period
  const periodPlays = plays.filter((play) => play.period === selectedPeriod);

  // Get unique periods
  const periods = [...new Set(plays.map((play) => play.period))].sort();

  // Format time remaining (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex mb-4 space-x-2 overflow-x-auto pb-2">
        {periods.map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded ${
              selectedPeriod === period ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => setSelectedPeriod(period)}
          >
            {period === 5 ? "OT" : `Q${period}`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {periodPlays.map((play) => (
          <div key={play.id} className="border-l-4 border-gray-700 pl-4 py-2">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>{formatTime(play.time_remaining)}</span>
              <span>
                {play.home_score} - {play.away_score}
              </span>
            </div>

            <div className="flex items-start">
              <div className="w-24 flex-shrink-0">
                <span
                  className={`font-semibold ${
                    play.is_home_offense ? "text-blue-400" : "text-red-400"
                  }`}
                >
                  {play.offense_team}
                </span>
              </div>

              <div className="flex-grow">
                {play.offense_player && (
                  <span className="font-medium mr-2">
                    {play.offense_player}
                  </span>
                )}

                {play.description || `${play.play_type} - ${play.play_result}`}

                {play.shot_quality && (
                  <span className="ml-2 text-sm text-gray-400">
                    (Shot Quality: {play.shot_quality.toFixed(2)})
                  </span>
                )}

                {play.run_team && play.run_points && play.run_points > 4 && (
                  <div className="mt-1 text-sm text-yellow-400">
                    {play.run_team} on a {play.run_points}-0 run
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {periodPlays.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No plays available for this period
          </div>
        )}
      </div>
    </div>
  );
}
