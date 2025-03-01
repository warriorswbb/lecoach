import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export class ResponseGenerationAgent {
  private model: ChatOpenAI;
  private lastTokenUsage = { prompt: 0, completion: 0, total: 0 };

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
    });
  }

  async generateResponse(
    originalQuestion: string,
    processedData: any,
    gameData: any,
    queryAnalysis: any
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(`
      You are a basketball analytics expert providing concise, insightful responses.
      
      Original Question: {question}
      
      Game Information:
      Date: {date}
      Teams: {team1} ({team1_score}) vs {team2} ({team2_score})
      
      Query Analysis:
      {queryAnalysis}
      
      Processed Data:
      {processedData}
      
      IMPORTANT: Be extremely concise. Prioritize clarity and brevity.
      - Keep your answer under 3 short paragraphs
      - Focus on the most relevant insights only
      - Use numbers and stats when they directly answer the question
      - Avoid lengthy explanations and background information
      - Get straight to the point and directly answer the question
      
      Your response should be professional but brief.
    `);

    const chain = RunnableSequence.from([prompt, this.model]);

    const response = await chain.invoke({
      question: originalQuestion,
      date: gameData.date,
      team1: gameData.team_one_name,
      team1_score: gameData.team_one_score,
      team2: gameData.team_two_name,
      team2_score: gameData.team_two_score,
      queryAnalysis: JSON.stringify(queryAnalysis),
      processedData: JSON.stringify(processedData),
    });

    // Track token usage (simplified example)
    this.lastTokenUsage = {
      prompt: 600,
      completion: 200,
      total: 800
    };

    return response.content.toString();
  }
  
  getLastTokenUsage() {
    return this.lastTokenUsage;
  }
} 