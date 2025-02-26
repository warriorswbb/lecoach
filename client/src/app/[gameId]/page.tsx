import { notFound } from 'next/navigation';
import Link from 'next/link';
import PlayByPlay from '@/components/PlayByPlay';
import { formatDate } from '@/lib/utils';

async function getGameData(gameId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/games/${gameId}`, { cache: 'no-store' });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch game data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching game data:', error);
    return null;
  }
}

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const gameData = await getGameData(params.gameId);
  
  if (!gameData) {
    notFound();
  }
  
  const isTeamOneWinner = gameData.winning_team === gameData.team_one_name;
  const isTeamTwoWinner = gameData.winning_team === gameData.team_two_name;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6 px-4 bg-gray-800">
        <div className="container mx-auto">
          <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
            ← Back to all games
          </Link>
          <h1 className="text-3xl font-bold">
            {gameData.team_one_name} vs {gameData.team_two_name}
          </h1>
          <p className="text-gray-400">{formatDate(gameData.date)} • {gameData.location}</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h2 className={`text-2xl font-bold ${isTeamOneWinner ? 'text-green-400' : ''}`}>
                {gameData.team_one_name}
              </h2>
              <p className="text-4xl font-bold mt-2">{gameData.team_one_score}</p>
              {isTeamOneWinner && <p className="text-green-400 mt-1">Winner</p>}
            </div>
            
            <div className="text-center text-gray-400 text-xl">VS</div>
            
            <div className="text-center flex-1">
              <h2 className={`text-2xl font-bold ${isTeamTwoWinner ? 'text-green-400' : ''}`}>
                {gameData.team_two_name}
              </h2>
              <p className="text-4xl font-bold mt-2">{gameData.team_two_score}</p>
              {isTeamTwoWinner && <p className="text-green-400 mt-1">Winner</p>}
            </div>
          </div>
          
          {gameData.overtime && (
            <p className="text-center mt-4 text-yellow-400">Overtime</p>
          )}
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Play-by-Play</h2>
        <PlayByPlay plays={gameData.plays} />
      </main>
      
      <footer className="py-6 px-4 bg-gray-800 text-center text-gray-400">
        <p>© 2024 LeCoach Basketball Analytics</p>
      </footer>
    </div>
  );
} 