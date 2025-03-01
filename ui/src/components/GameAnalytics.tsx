"use client";

import { useState } from "react";
import { AnalyticsChat } from "./AnalyticsChat";
import { PlayByPlayDisplay } from "./PlayByPlayDisplay";

type ViewMode = "play-by-play" | "chat";

// Add the missing interface
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

export function GameAnalytics({
  gameId,
  playByPlayByPeriod,
  gameTeamOneId,
  teamOneColor,
  teamTwoColor,
}: {
  gameId: string;
  playByPlayByPeriod: Record<string, PlayByPlay[]>;
  gameTeamOneId: string;
  teamOneColor: string;
  teamTwoColor: string;
}) {
  // Default to play-by-play view
  const [activeView, setActiveView] = useState<ViewMode>("play-by-play");
  const periods = Object.keys(playByPlayByPeriod).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const [activePeriod, setActivePeriod] = useState(periods[0] || "1");

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg overflow-hidden h-[650px] flex flex-col">
      {/* Header with quarters and toggle - fixed height */}
      <div className="bg-[#1a1a1a] px-4 py-1.5 flex justify-between border-b border-neutral-800 items-center">
        {/* Quarter tabs */}
        <div className="flex h-9">
          {activeView === "play-by-play" ? (
            periods.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-4 h-full text-sm font-medium rounded-md transition-colors ${
                  activePeriod === period
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
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
            ))
          ) : (
            <div className="text-sm text-neutral-400 flex items-center">
              Basketball AI Assistant
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView("play-by-play")}
            className={`rounded-full px-5 py-2 font-medium text-sm transition-colors ${
              activeView === "play-by-play"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            Play-by-Play
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`rounded-full px-5 py-2 font-medium text-sm transition-colors ${
              activeView === "chat"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            AI Chat
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-grow overflow-y-auto">
        {activeView === "play-by-play" ? (
          <PlayByPlayDisplay
            playByPlayByPeriod={playByPlayByPeriod}
            gameTeamOneId={gameTeamOneId}
            teamOneColor={teamOneColor}
            teamTwoColor={teamTwoColor}
            activePeriod={activePeriod}
            hideControls={true} // Hide the duplicate controls
          />
        ) : (
          <AnalyticsChat gameId={gameId} />
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
