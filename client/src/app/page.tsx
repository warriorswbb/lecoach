import GameCard from "@/components/GameCard";

// Define a proper type for the game object
interface Game {
  game_id: string;
  date: string;
  team_one_name: string;
  team_two_name: string;
  team_one_score: number;
  team_two_score: number;
  winning_team: string;
  location: string;
}

async function getGames() {
  // Use server-side fetch for the API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/games`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch games");
  }

  return res.json() as Promise<Game[]>;
}

export default async function Home() {
  const games = await getGames();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6 px-4 bg-gray-800">
        <h1 className="text-3xl font-bold text-center">
          LeCoach Basketball Analytics
        </h1>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Recent Games</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))}
        </div>
      </main>

      <footer className="py-6 px-4 bg-gray-800 text-center text-gray-400">
        <p>© 2024 LeCoach Basketball Analytics</p>
      </footer>
    </div>
  );
}
