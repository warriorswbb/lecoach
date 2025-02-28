import { getGames } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";

interface Game {
  game_id: string;
  date: string;
  team_one_short: string;
  team_one_score: number;
  team_two_short: string;
  team_two_score: number;
  season: string;
}

export default async function Home() {
  const games = await getGames();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">College Basketball Games</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game: Game) => (
            <Link
              href={`/games/${game.game_id}`}
              key={game.game_id}
              className="group block"
            >
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                <div className="text-sm text-muted-foreground mb-4">
                  {format(new Date(game.date), "MMM d, yyyy")}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{game.team_one_short}</span>
                    <span className="text-xl font-bold">
                      {game.team_one_score}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{game.team_two_short}</span>
                    <span className="text-xl font-bold">
                      {game.team_two_score}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {game.season} Season
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
