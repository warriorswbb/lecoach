import { getGames } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import GamesList from "@/components/GamesList";

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

export default async function Home() {
  // Fetch games server-side
  const games = await getGames();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
      {/* Enhanced animated background with more blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-gradient-slow absolute inset-0">
          {/* Main blobs */}
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] bg-pink-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute top-2/3 left-1/4 w-[700px] h-[700px] bg-blue-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/3 w-[900px] h-[900px] bg-emerald-600/20 rounded-full blur-[100px]"></div>

          {/* Additional randomized blobs */}
          <div className="absolute top-[15%] right-[20%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] bg-rose-500/25 rounded-full blur-[130px]"></div>
          <div className="absolute top-[60%] right-[10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[110px]"></div>
          <div className="absolute top-[5%] left-[5%] w-[300px] h-[300px] bg-amber-500/15 rounded-full blur-[90px]"></div>
        </div>
      </div>

      {/* Content */}
      <main className="container relative z-10 mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 font-sans text-center md:text-left">
          College Basketball Games
        </h1>

        {/* Client component for interactive features */}
        <GamesList initialGames={games} />
      </main>
    </div>
  );
}
