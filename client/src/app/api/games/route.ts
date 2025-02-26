import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET() {
  try {
    // Get recent games with team names - modified query to handle potential schema differences
    const result = await pool.query(`
      SELECT 
        g.game_id, 
        g.date, 
        t1.team_name as team_one_name, 
        t2.team_name as team_two_name,
        g.team_one_score, 
        g.team_two_score,
        g.winning_team,
        g.location
      FROM games g
      LEFT JOIN teams t1 ON g.team_one = t1.team_id
      LEFT JOIN teams t2 ON g.team_two = t2.team_id
      ORDER BY g.date DESC
      LIMIT 20
    `);

    console.log("Games fetched:", result.rows.length);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
} 