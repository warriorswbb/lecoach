import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface GameCardProps {
  game: {
    game_id: string;
    date: string;
    team_one_name: string;
    team_two_name: string;
    team_one_score: number;
    team_two_score: number;
    winning_team: string;
    location: string;
  };
}

export default function GameCard({ game }: GameCardProps) {
  const isTeamOneWinner = game.winning_team === game.team_one_name;
  const isTeamTwoWinner = game.winning_team === game.team_two_name;
  
  return (
    <Link href={`/${game.game_id}`}>
      <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
        <div className="text-sm text-gray-400 mb-2">{formatDate(game.date)}</div>
        
        <div className="flex justify-between items-center mb-4">
          <div className={`font-semibold ${isTeamOneWinner ? 'text-green-400' : ''}`}>
            {game.team_one_name}
          </div>
          <div className="text-xl font-bold">
            {game.team_one_score} - {game.team_two_score}
          </div>
          <div className={`font-semibold ${isTeamTwoWinner ? 'text-green-400' : ''}`}>
            {game.team_two_name}
          </div>
        </div>
        
        <div className="text-sm text-gray-400">{game.location}</div>
      </div>
    </Link>
  );
} 