import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false, // Required for many hosted PostgreSQL services
  },
});

export async function getGames(limit = 50) {
  const result = await pool.query(
    `
    SELECT 
      g.game_id, 
      g.date, 
      g.season,
      g.team_one_score, 
      g.team_two_score,
      t1.team_name as team_one_name,
      t2.team_name as team_two_name,
      t1.team_short as team_one_short,
      t2.team_short as team_two_short
    FROM games g
    JOIN teams t1 ON g.team_one = t1.team_id
    JOIN teams t2 ON g.team_two = t2.team_id
    ORDER BY g.date DESC
    LIMIT $1
  `,
    [limit]
  );

  return result.rows;
}

export async function getGameById(gameId: string) {
  const result = await pool.query(
    `
    SELECT 
      g.game_id, 
      g.date, 
      g.season,
      t1.team_id as team_one_id,
      t1.team_short as team_one_short,
      t1.team_name as team_one_name,
      g.team_one_score, 
      t2.team_id as team_two_id,
      t2.team_short as team_two_short,
      t2.team_name as team_two_name,
      g.team_two_score
    FROM games g
    JOIN teams t1 ON g.team_one = t1.team_id
    JOIN teams t2 ON g.team_two = t2.team_id
    WHERE g.game_id = $1
  `,
    [gameId]
  );

  return result.rows[0];
}

export async function getPlayByPlayData(gameId: string) {
  try {
    const result = await pool.query(
      `
      SELECT 
        pbp.id as play_id,
        pbp.game_id,
        pbp.offense_team as team_id,
        t1.team_short as team_short,
        t1.team_name as team_name,
        pbp.offense_player_id as player_id,
        pbp.offense_player as player_name,
        pbp.play_type,
        pbp.description as play_description,
        0 as points,
        pbp.time_remaining,
        pbp.period,
        pbp.home_score as team_one_score,
        pbp.away_score as team_two_score
      FROM play_by_play pbp
      LEFT JOIN teams t1 ON pbp.offense_team::text = t1.team_id::text
      WHERE pbp.game_id = $1
      ORDER BY pbp.period, pbp.time_remaining DESC
    `,
      [gameId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching play-by-play data:", error);
    return []; // Return empty array if table doesn't exist yet
  }
}
