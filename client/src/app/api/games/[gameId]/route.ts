import { NextResponse } from 'next/server';
import pool from '../../db';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;

  try {
    // Get game details
    const gameResult = await pool.query(`
      SELECT 
        g.game_id, 
        g.date, 
        g.season,
        t1.team_name as team_one_name, 
        t2.team_name as team_two_name,
        g.team_one_score, 
        g.team_two_score,
        g.winning_team,
        g.location,
        g.overtime
      FROM games g
      JOIN teams t1 ON g.team_one = t1.team_id
      JOIN teams t2 ON g.team_two = t2.team_id
      WHERE g.game_id = $1
    `, [gameId]);

    if (gameResult.rows.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get play-by-play data
    const pbpResult = await pool.query(`
      SELECT 
        id, 
        period, 
        time_remaining, 
        offense_team, 
        defense_team,
        winning_team,
        offense_player,
        play_type,
        play_result,
        description,
        home_score,
        away_score,
        is_home_offense,
        shot_quality,
        score_margin,
        run_team,
        run_points
      FROM play_by_play
      WHERE game_id = $1
      ORDER BY period ASC, time_remaining DESC
    `, [gameId]);

    // Combine game details with play-by-play data
    const gameData = {
      ...gameResult.rows[0],
      plays: pbpResult.rows
    };

    return NextResponse.json(gameData);
  } catch (error) {
    console.error(`Error fetching game ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch game data' }, { status: 500 });
  }
} 