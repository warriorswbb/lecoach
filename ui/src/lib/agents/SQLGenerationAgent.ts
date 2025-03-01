import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { pool } from "@/lib/db";

export class SQLGenerationAgent {
  private model: ChatOpenAI;
  private lastTokenUsage = { prompt: 0, completion: 0, total: 0 };

  // Database schema for reference - will be used in the prompt
  private dbSchema = `
    Tables:
    - games (game_id, date, season, team_one, team_two, team_one_score, team_two_score, winning_team)
    - teams (team_id, team_name, team_short)
    - players (id, first_name, last_name, player_name, team_id)
    - player_game_stats (id, game_id, player_id, team_id, mins, fg3, fga3, fg2, fga2, ft, fta, points, assist, reb, steal, block, turn)
    - team_game_stats (id, game_id, team_id, team_name, mins, fg3, fga3, fg2, fga2, ft, fta, points, assist, reb, steal, block, turn)
    
    - play_by_play (
        id, 
        game_id, 
        period,                  -- Quarter/Period number
        time_remaining,          -- Time remaining in period (seconds * 10)
        offense_team,            -- Team ID on offense
        defense_team,            -- Team ID on defense
        offense_player,          -- Player name on offense
        offense_player_id,       -- Player ID on offense
        play_type,               -- e.g., "Shot", "Free Throw", "Turnover", "Rebound"
        play_result,             -- e.g., "Make 2 Pts", "Miss 2 Pts", "Free Throw", "Turnover"
        description,             -- Full text description of the play
        after_timeout,           -- Whether play occurred after a timeout
        shot_quality,            -- Rating of shot quality if applicable
        home_score,              -- Current home team score
        away_score,              -- Current away team score
        run_team,                -- Team currently on a scoring run
        run_points,              -- Points in current run
        score_margin,            -- Current score difference
        possession_number,       -- Which possession in the game
        seconds_remaining,       -- Total seconds remaining in game
        points_last_minute,      -- Points scored in last 60 seconds
        possessions_last_minute, -- Possessions in last 60 seconds
        lead_changes             -- Number of lead changes so far
      )
      NOTE: The play_by_play table is the most detailed source of information, containing every play with timestamps, scores, and contextual information. This is critical for possession-by-possession analysis, player interactions, and time-based trends.
  `;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });
  }

  async generateSQL(queryAnalysis: any, gameId: string): Promise<string> {
    // First, get game season information to determine available data
    const gameInfo = await this.getGameInfo(gameId);
    const is2023_24Season = this.is2023_24Season(gameInfo);

    // Check if play-by-play data exists
    const hasPlayByPlay = await this.checkPlayByPlayExists(gameId);

    // Build available tables information based on season
    const availableTables = this.getAvailableTables(
      is2023_24Season,
      hasPlayByPlay
    );

    const prompt = PromptTemplate.fromTemplate(`
      You are a SQL generation expert for basketball analytics. Generate a PostgreSQL query that will answer the user's question.
      
      Database Schema:
      ${this.dbSchema}
      
      IMPORTANT DATA AVAILABILITY CONSTRAINTS:
      ${availableTables}
      
      Query Analysis:
      Intent: {intent}
      Entities: {entities}
      Timeframe: {timeframe}
      Analysis Type: {analysisType}
      
      Game ID: {gameId}
      Game Season: {season}
      
      Generate a PostgreSQL query that will retrieve the necessary data to answer this question.
      Only use tables that are available according to the constraints above.
      Your query must work with the available data.
      Only return the SQL query without any additional explanations.
    `);

    const chain = RunnableSequence.from([prompt, this.model]);

    const response = await chain.invoke({
      intent: queryAnalysis.intent,
      entities: JSON.stringify(queryAnalysis.entities),
      timeframe: queryAnalysis.timeframe,
      analysisType: queryAnalysis.analysisType,
      gameId: gameId,
      season: gameInfo?.season || "unknown",
    });

    // Extract just the SQL query from the response
    let sql = response.content.toString();

    // Clean up the SQL if it contains markdown code blocks
    if (sql.includes("```sql")) {
      sql = sql.split("```sql")[1].split("```")[0].trim();
    } else if (sql.includes("```")) {
      sql = sql.split("```")[1].split("```")[0].trim();
    }

    // Track token usage after LLM call
    this.lastTokenUsage = {
      prompt: 500, // Example values - in production, get these from the LLM response
      completion: 150,
      total: 650,
    };

    return sql;
  }

  // Helper method to get game information
  private async getGameInfo(gameId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT game_id, date, season FROM games WHERE game_id = $1`,
        [gameId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching game info:", error);
      return null;
    }
  }

  // Helper method to determine if game is from 2023-24 season
  private is2023_24Season(gameInfo: any): boolean {
    if (!gameInfo) return false;

    // Check based on season field if available
    if (gameInfo.season && gameInfo.season === "2023-24") {
      return true;
    }

    // Alternatively check based on date
    if (gameInfo.date) {
      const gameDate = new Date(gameInfo.date);
      // Basketball season 2023-24 spans from October 2023 to June 2024
      return (
        gameDate >= new Date("2023-10-01") && gameDate <= new Date("2024-06-30")
      );
    }

    return false;
  }

  // Helper to check if play-by-play data exists for this game
  private async checkPlayByPlayExists(gameId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM play_by_play WHERE game_id = $1 LIMIT 1`,
        [gameId]
      );
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking play-by-play data:", error);
      return false;
    }
  }

  // Helper to generate available tables message
  private getAvailableTables(
    is2023_24Season: boolean,
    hasPlayByPlay: boolean
  ): string {
    let message = "";

    if (is2023_24Season) {
      message = `
        For this 2023-24 season game, you can use:
        - games table
        - teams table
        - players table
        - player_game_stats table (detailed player statistics)
        - team_game_stats table (detailed team statistics)
      `;

      if (hasPlayByPlay) {
        message += `- play_by_play table (THE MOST IMPORTANT TABLE for detailed analysis - contains every play event with context, scores, and timestamps)\n`;
      } else {
        message += `NOTE: play_by_play data is NOT available for this game\n`;
      }
    } else {
      message = `
        IMPORTANT: This game is NOT from the 2023-24 season. 
        The following tables are NOT available for this game:
        - player_game_stats
        - team_game_stats
        
        You can ONLY use:
        - games table
        - teams table
      `;

      if (hasPlayByPlay) {
        message += `- play_by_play table (THE MOST IMPORTANT TABLE - without player_game_stats, this table is your primary source for detailed game analysis)\n`;
      } else {
        message += `NOTE: play_by_play data is also NOT available for this game.
                   You are limited to very basic game information only.\n`;
      }
    }

    return message;
  }

  // Add token tracking method
  getLastTokenUsage() {
    return this.lastTokenUsage;
  }
}
