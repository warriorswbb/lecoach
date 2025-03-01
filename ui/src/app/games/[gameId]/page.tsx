import { getGameById, getPlayByPlayData } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaChartComponent } from "@/components/ui/area-chart";
import { PlayByPlayDisplay } from "@/components/PlayByPlayDisplay";
import { AnalyticsChat } from "@/components/AnalyticsChat";

// Add this interface for the server component
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

  // Then update your reduce function to use the interface
  const playByPlayByPeriod = playByPlay.reduce(
    (acc: Record<string, PlayByPlay[]>, play: PlayByPlay) => {
      if (!acc[play.period]) {
        acc[play.period] = [];
      }
      acc[play.period].push(play);
      return acc;
    },
    {}
  );

  // Sample data for the area chart
  const chartData = [
    { name: "Jan", Team1: 40, Team2: 24 },
    { name: "Feb", Team1: 30, Team2: 28 },
    { name: "Mar", Team1: 45, Team2: 35 },
    { name: "Apr", Team1: 50, Team2: 40 },
    { name: "May", Team1: 35, Team2: 30 },
    { name: "Jun", Team1: 45, Team2: 25 },
  ];

  const chartCategories = [
    { name: "Team1", color: "#4f46e5" },
    { name: "Team2", color: "#7c3aed" },
  ];

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

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Charts */}
          <div className="space-y-8">
            <div className="bg-[#121212] border border-neutral-800 rounded-lg p-6">
              <AreaChartComponent
                data={chartData}
                categories={chartCategories}
                index="name"
                title="Area Chart - Stacked Expanded"
                subtitle="Showing total visitors for the last 6 months"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-neutral-400">
                  Trending up by 5.2% this month
                </div>
                <div className="text-neutral-500">January - June 2024</div>
              </div>
            </div>

            <AnalyticsChat gameId={gameId} />

            {/* Additional charts can be added here */}
          </div>

          {/* Right column - Play-by-Play */}
          <PlayByPlayDisplay
            playByPlayByPeriod={playByPlayByPeriod}
            gameTeamOneId={game.team_one_id}
          />
        </div>
      </main>
    </div>
  );
}
