import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { pool } from "@/lib/db";

// Base class for our basketball analytics system
export class BasketballAnalyticsAgent {
  private model: ChatOpenAI;

  constructor() {
    // Initialize the model with appropriate settings
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });
  }

  // Simple method to answer basketball questions
  async answerQuestion(question: string, gameId: string) {
    try {
      // Get game data for context
      const gameData = await this.getGameData(gameId);

      // Create a simple prompt for our initial prototype
      const prompt = PromptTemplate.fromTemplate(`
        You are a basketball analytics expert. Answer the following question about a basketball game.
        
        Game Information:
        Date: {date}
        Teams: {team1} ({team1_score}) vs {team2} ({team2_score})
        
        Question: {question}
        
        Provide a detailed and insightful answer based on basketball analytics principles.
      `);

      // Create a simple chain
      const chain = RunnableSequence.from([prompt, this.model]);

      // Run the chain
      const response = await chain.invoke({
        date: gameData.date,
        team1: gameData.team_one_name,
        team1_score: gameData.team_one_score,
        team2: gameData.team_two_name,
        team2_score: gameData.team_two_score,
        question: question,
      });

      return {
        answer: response.content,
        confidence: 0.8, // Placeholder
        executionTime: 0, // Placeholder
      };
    } catch (error) {
      console.error("Error in BasketballAnalyticsAgent:", error);
      return {
        answer: "I encountered an error analyzing this game. Please try again.",
        confidence: 0,
        executionTime: 0,
      };
    }
  }

  // Helper method to get game data
  private async getGameData(gameId: string) {
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
}
