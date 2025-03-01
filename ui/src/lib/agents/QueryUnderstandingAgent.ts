import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

interface QueryAnalysis {
  intent: string;
  entities: {
    players: string[];
    teams: string[];
    statistics: string[];
  };
  timeframe: string;
  analysisType: string;
  complexity: "simple" | "medium" | "complex";
}

export class QueryUnderstandingAgent {
  private model: ChatOpenAI;
  private lastTokenUsage = { prompt: 0, completion: 0, total: 0 };

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });
  }

  async analyzeQuery(question: string, gameData: any): Promise<QueryAnalysis> {
    const prompt = PromptTemplate.fromTemplate(`
      You are a basketball query understanding expert. Analyze the following question about a basketball game:
      
      Game Information:
      Date: {date}
      Teams: {team1} ({team1_score}) vs {team2} ({team2_score})
      
      User Question: {question}
      
      Provide a structured analysis of this question including:
      1. Overall intent (what the user wants to know)
      2. Entities mentioned (players, teams, statistics)
      3. Time frame of interest (whole game, specific quarter, etc.)
      4. Type of analysis needed (simple lookup, statistical comparison, trend analysis, etc.)
      5. Complexity level: 
         - "simple" for basic questions like "Who won?" that only need game summary data
         - "medium" for questions requiring some statistical analysis
         - "complex" for questions needing detailed play-by-play or advanced analytics
      
      Return your analysis as a structured JSON object.
    `);

    const chain = RunnableSequence.from([prompt, this.model]);

    const response = await chain.invoke({
      date: gameData.date,
      team1: gameData.team_one_name,
      team1_score: gameData.team_one_score,
      team2: gameData.team_two_name,
      team2_score: gameData.team_two_score,
      question: question,
    });

    // Track token usage (this is a simplified example - in real use you'd need to
    // extract this information from the actual LLM response)
    this.lastTokenUsage = {
      prompt: 300, // For demonstration - in practice get these from the LLM response
      completion: 100,
      total: 400,
    };

    try {
      // Extract the JSON from the response (assuming it returns a proper JSON)
      let jsonStr = response.content.toString();

      // Try to clean up the JSON if it contains markdown code blocks
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
      }

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing query analysis JSON:", error);
      // Return a default analysis if parsing fails
      return {
        intent: "general_question",
        entities: {
          players: [],
          teams: [gameData.team_one_name, gameData.team_two_name],
          statistics: [],
        },
        timeframe: "whole_game",
        analysisType: "general_information",
        complexity: "simple",
      };
    }
  }

  getLastTokenUsage() {
    return this.lastTokenUsage;
  }
}
