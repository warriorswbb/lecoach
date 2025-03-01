"use client";

import { useState } from "react";
import { PlayByPlayDisplay } from "./PlayByPlayDisplay";
import { AnalyticsChat } from "./AnalyticsChat";

type ViewMode = "play-by-play" | "chat";

export function GameAnalytics({
  gameId,
  playByPlayByPeriod,
  gameTeamOneId,
}: {
  gameId: string;
  playByPlayByPeriod: Record<string, any[]>;
  gameTeamOneId: string;
}) {
  // Default to play-by-play view
  const [activeView, setActiveView] = useState<ViewMode>("play-by-play");
  const periods = Object.keys(playByPlayByPeriod).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const [activePeriod, setActivePeriod] = useState(periods[0] || "1");

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header with quarters and toggle */}
      <div className="bg-[#1a1a1a] px-4 py-2 flex justify-between border-b border-neutral-800">
        {/* Quarter tabs */}
        <div className="flex">
          {activeView === "play-by-play" && periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
          ))}
        </div>

        {/* View toggle */}
        <div className="flex divide-x divide-neutral-700 border border-neutral-700 rounded-md overflow-hidden">
          <button
            onClick={() => setActiveView("play-by-play")}
            className={`px-3 py-1 text-xs font-medium ${
              activeView === "play-by-play"
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Play-by-Play
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`px-3 py-1 text-xs font-medium ${
              activeView === "chat"
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            AI Analytics
          </button>
        </div>
      </div>

      {/* Content area with consistent height */}
      <div className="h-[600px] overflow-y-auto">
        {activeView === "play-by-play" ? (
          <div className="h-full">
            {periods.length > 0 && playByPlayByPeriod[activePeriod] ? (
              <div className="divide-y divide-neutral-800">
                {playByPlayByPeriod[activePeriod].map((play: any) => (
                  <div key={play.play_id} className="px-6 py-4 flex items-start">
                    <div className="w-16 text-neutral-400 font-mono">
                      {formatTime(play.time_remaining)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                            play.team_id === gameTeamOneId
                              ? "bg-blue-900/30"
                              : "bg-red-900/30"
                          }`}
                        >
                          <span className="text-sm font-bold">
                            {play.team_short}
                          </span>
                        </div>

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
        ) : (
          <div className="h-full">
            <AnalyticsChat gameId={gameId} />
          </div>
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