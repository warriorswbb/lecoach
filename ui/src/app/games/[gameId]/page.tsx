import { getGameById, getPlayByPlayData } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  // Await the params object before accessing its properties
  const resolvedParams = await params;
  const gameId = resolvedParams.gameId;

  const game = await getGameById(gameId);

  if (!game) {
    notFound();
  }

  const playByPlay = await getPlayByPlayData(gameId);

  // Group play-by-play by period
  const playByPlayByPeriod = playByPlay.reduce((acc, play) => {
    if (!acc[play.period]) {
      acc[play.period] = [];
    }
    acc[play.period].push(play);
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
      {/* Background glow effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-gradient-slow absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] bg-pink-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute top-2/3 left-1/4 w-[700px] h-[700px] bg-blue-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/3 w-[900px] h-[900px] bg-emerald-600/20 rounded-full blur-[100px]"></div>
        </div>
      </div>

      <main className="container relative z-10 mx-auto py-10 px-4">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-400 hover:text-white mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Games
        </Link>

        {/* Game Header */}
        <div className="bg-[#121212] border border-neutral-800 rounded-lg p-6 mb-8">
          <div className="text-sm text-neutral-400 mb-2">
            {format(new Date(game.date), "MMMM d, yyyy")} • {game.season} Season
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="text-3xl font-bold">{game.team_one_short}</div>
              <div className="text-neutral-400">{game.team_one_name}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{game.team_one_score}</div>
              <div className="text-xl text-neutral-500">-</div>
              <div className="text-5xl font-bold">{game.team_two_score}</div>
            </div>

            <div className="flex-1 text-center md:text-right">
              <div className="text-3xl font-bold">{game.team_two_short}</div>
              <div className="text-neutral-400">{game.team_two_name}</div>
            </div>
          </div>
        </div>

        {/* Play-by-Play */}
        <div className="bg-[#121212] border border-neutral-800 rounded-lg overflow-hidden">
          {Object.keys(playByPlayByPeriod).length > 0 ? (
            Object.keys(playByPlayByPeriod).map((period) => (
              <div key={period}>
                <div className="bg-[#1a1a1a] px-6 py-3 font-medium">
                  {period === "1"
                    ? "1st"
                    : period === "2"
                    ? "2nd"
                    : period === "3"
                    ? "3rd"
                    : period === "4"
                    ? "4th"
                    : `OT${parseInt(period) - 4}`}{" "}
                  Period
                </div>

                <div className="divide-y divide-neutral-800">
                  {playByPlayByPeriod[period].map((play) => (
                    <div
                      key={play.play_id}
                      className="px-6 py-4 flex items-start"
                    >
                      <div className="w-16 text-neutral-400 font-mono">
                        {formatTime(play.time_remaining)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                              play.team_id === game.team_one_id
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
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-400">
              No play-by-play data available for this game.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
