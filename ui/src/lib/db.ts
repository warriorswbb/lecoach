import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false, // Required for AWS RDS SSL connections
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
    FROM public.games g
    JOIN public.teams t1 ON g.team_one = t1.team_id
    JOIN public.teams t2 ON g.team_two = t2.team_id
    ORDER BY g.date DESC
    LIMIT $1
  `,
    [limit]
  );

  return result.rows;
}
