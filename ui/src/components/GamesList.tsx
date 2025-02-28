'use client';

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface Game {
  game_id: string;
  date: string;
  team_one_short: string;
  team_one_name: string;
  team_one_score: number;
  team_two_short: string;
  team_two_name: string;
  team_two_score: number;
  season: string;
}

export default function GamesList({ initialGames }: { initialGames: Game[] }) {
  const [games] = useState(initialGames);
  const [visibleGames, setVisibleGames] = useState(12);
  const [loading, setLoading] = useState(false);

  const loadMoreGames = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleGames((prev) => prev + 12);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.slice(0, visibleGames).map((game: Game) => (
          <Link
            href={`/games/${game.game_id}`}
            key={game.game_id}
            className="group block"
          >
            <div className="rounded-lg border border-neutral-800 bg-[#121212] overflow-hidden p-4 transition-all duration-300 hover:border-neutral-700 hover:bg-[#1a1a1a]">
              {/* Date and season header */}
              <div className="flex justify-between text-xs mb-3">
                <div className="text-neutral-400 font-mono">
                  {format(new Date(game.date), "MMM d, yyyy")}
                </div>
                <div className="text-neutral-500">{game.season} Season</div>
              </div>

              {/* Team scores */}
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">{game.team_one_short}</div>
                    <div className="text-xs text-neutral-400 self-center">
                      {game.team_one_name}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {game.team_one_score}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">{game.team_two_short}</div>
                    <div className="text-xs text-neutral-400 self-center">
                      {game.team_two_name}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {game.team_two_score}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {visibleGames < games.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMoreGames}
            disabled={loading}
            className="bg-white text-black font-medium rounded-full px-6 py-2 text-sm transition-all hover:bg-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </>
  );
} 