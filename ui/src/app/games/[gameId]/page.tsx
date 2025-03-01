import { getGameById, getPlayByPlayData } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaChartComponent } from "@/components/ui/area-chart";
import { GameAnalytics } from "@/components/GameAnalytics";

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
  // Await params before using its properties
  const { gameId } = await params;

  const game = await getGameById(gameId);

  if (!game) {
    notFound();
  }

  const playByPlay = await getPlayByPlayData(gameId);

  // Group play by play data by period
  const playByPlayByPeriod = playByPlay.reduce(
    (acc: Record<string, PlayByPlay[]>, play: PlayByPlay) => {
      const period = play.period;
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(play);
      return acc;
    },
    {}
  );

  // Generate randomized team colors instead of fixed blue/red
  const getRandomTeamColors = () => {
    const colorPairs = [
      ["#2563eb", "#dc2626"], // blue/red
      ["#7c3aed", "#ea580c"], // purple/orange
      ["#16a34a", "#db2777"], // green/pink
      ["#0284c7", "#ca8a04"], // sky blue/yellow
      ["#14b8a6", "#9f1239"], // teal/ruby
    ];

    // Select a random pair or shuffle the selected pair
    const randomPair =
      colorPairs[Math.floor(Math.random() * colorPairs.length)];
    // Randomly decide whether to swap the colors
    return Math.random() > 0.5 ? randomPair : [randomPair[1], randomPair[0]];
  };

  const [teamOneColor, teamTwoColor] = getRandomTeamColors();

  // Create chart data using actual game data
  const chartData = [
    { name: "Jan", [game.team_one_short]: 40, [game.team_two_short]: 24 },
    { name: "Feb", [game.team_one_short]: 30, [game.team_two_short]: 28 },
    { name: "Mar", [game.team_one_short]: 45, [game.team_two_short]: 35 },
    { name: "Apr", [game.team_one_short]: 50, [game.team_two_short]: 40 },
    { name: "May", [game.team_one_short]: 35, [game.team_two_short]: 30 },
    { name: "Jun", [game.team_one_short]: 45, [game.team_two_short]: 25 },
  ];

  // Use actual team names and colors for chart categories
  const chartCategories = [
    { name: game.team_one_short, color: teamOneColor },
    { name: game.team_two_short, color: teamTwoColor },
  ];

  return (
    <div className="min-h-screen pb-16 relative overflow-hidden">
      {/* Animated Background Blobs using team colors */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-gradient-slow absolute inset-0">
          {/* Team One Color Blobs */}
          <div
            className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ backgroundColor: `${teamOneColor}20` }} // Very low opacity
          ></div>
          <div
            className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] rounded-full blur-[170px]"
            style={{ backgroundColor: `${teamOneColor}15` }} // Even lower opacity
          ></div>

          {/* Team Two Color Blobs */}
          <div
            className="absolute top-2/3 left-1/4 w-[700px] h-[700px] rounded-full blur-[160px]"
            style={{ backgroundColor: `${teamTwoColor}20` }} // Very low opacity
          ></div>
          <div
            className="absolute bottom-1/4 right-1/3 w-[900px] h-[900px] rounded-full blur-[180px]"
            style={{ backgroundColor: `${teamTwoColor}15` }} // Even lower opacity
          ></div>

          {/* Additional mixed color blobs */}
          <div
            className="absolute top-[15%] right-[20%] w-[400px] h-[400px] rounded-full blur-[140px]"
            style={{ backgroundColor: `${teamOneColor}10` }} // Extremely subtle
          ></div>
          <div
            className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[160px]"
            style={{ backgroundColor: `${teamTwoColor}10` }} // Extremely subtle
          ></div>
        </div>
      </div>

      {/* Header section */}
      <header className="bg-[#121212]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 pt-4 pb-1">
          <Link
            href="/"
            className="inline-flex items-center px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-md text-neutral-300 hover:text-white text-sm font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
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
          <div className="bg-[#121212]/95 backdrop-blur-md border border-neutral-800 rounded-lg p-4 mb-1 mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex-1 text-center md:text-left flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 border border-neutral-700/30"
                  style={{ backgroundColor: `${teamOneColor}` }}
                ></div>
                <div>
                  <div className="text-3xl font-bold">
                    {game.team_one_short}
                  </div>
                  <div className="text-neutral-400 text-sm">
                    {game.team_one_name}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-bold">
                    {game.team_one_score}
                  </div>
                  <div className="text-xl text-neutral-500">-</div>
                  <div className="text-5xl font-bold">
                    {game.team_two_score}
                  </div>
                </div>
                <div className="text-sm text-neutral-400 mt-2">
                  {format(new Date(game.date), "MMMM d, yyyy")} • {game.season}{" "}
                  Season
                </div>
              </div>

              <div className="flex-1 text-center md:text-right flex items-center justify-end gap-3">
                <div>
                  <div className="text-3xl font-bold">
                    {game.team_two_short}
                  </div>
                  <div className="text-neutral-400 text-sm">
                    {game.team_two_name}
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 border border-neutral-700/30"
                  style={{ backgroundColor: `${teamTwoColor}` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 relative z-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Just the chart */}
          <div>
            <div className="bg-[#121212] border border-neutral-800 rounded-lg p-6 h-[650px] flex flex-col">
              <AreaChartComponent
                data={chartData}
                categories={chartCategories}
                index="name"
                title="Score Progression"
                subtitle={`${game.team_one_short} vs ${game.team_two_short}`}
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-neutral-400">
                  Trending up by 5.2% this month
                </div>
                <div className="text-neutral-500">January - June 2024</div>
              </div>
            </div>
          </div>

          {/* Right column - GameAnalytics with toggle */}
          <div>
            <GameAnalytics
              gameId={gameId}
              playByPlayByPeriod={playByPlayByPeriod}
              gameTeamOneId={game.team_one_id}
              teamOneColor={teamOneColor}
              teamTwoColor={teamTwoColor}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
