"use client";

import { useState } from "react";

interface PlayByPlay {
  play_id: string;
  game_id: string;
  team_id: string;
  team_short: string;
  team_name: string;
  player_id: string;
  player_name: string;
  play_type: string;
  play_description: string;
  points: number;
  time_remaining: number;
  period: string;
  team_one_score: number;
  team_two_score: number;
}

export function PlayByPlayDisplay({
  playByPlayByPeriod,
  gameTeamOneId,
  teamOneColor,
  teamTwoColor,
  activePeriod,
  hideControls = false,
}: {
  playByPlayByPeriod: Record<string, PlayByPlay[]>;
  gameTeamOneId: string;
  teamOneColor: string;
  teamTwoColor: string;
  activePeriod?: string;
  hideControls?: boolean;
}) {
  const periods = Object.keys(playByPlayByPeriod).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const [localActivePeriod, setLocalActivePeriod] = useState(periods[0] || "1");

  const currentPeriod = activePeriod || localActivePeriod;

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg overflow-hidden">
      {!hideControls && (
        <div className="bg-[#1a1a1a] px-4 py-2 flex gap-2 border-b border-neutral-800">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setLocalActivePeriod(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                currentPeriod === period
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {period === "1"
                ? "1st"
                : period === "2"
                ? "2nd"
                : period === "3"
                ? "3rd"
                : period === "4"
                ? "4th"
                : `OT${parseInt(period) - 4}`}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto">
        {periods.length > 0 && playByPlayByPeriod[currentPeriod] ? (
          <div className="divide-y divide-neutral-800">
            {playByPlayByPeriod[currentPeriod].map((play: PlayByPlay) => (
              <div key={play.play_id} className="px-6 py-4 flex items-start">
                <div className="w-16 text-neutral-400 font-mono">
                  {formatTime(play.time_remaining)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mr-3 border border-neutral-700/30"
                      style={{
                        backgroundColor:
                          Math.random() > 0.5 ? teamOneColor : teamTwoColor,
                      }}
                    ></div>
                    <span
                      className={`text-sm font-bold mr-3 ${
                        play.team_id === gameTeamOneId
                          ? "text-blue-400"
                          : "text-red-400"
                      }`}
                    >
                      {play.team_short}
                    </span>

                    <div>
                      <div className="font-medium">
                        {play.player_name ? play.player_name : "Team"} •{" "}
                        {play.play_type}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {play.play_description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <div className="font-medium">
                    {play.team_one_score} - {play.team_two_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-400">
            No play-by-play data available for this period.
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  seconds = seconds / 10;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
