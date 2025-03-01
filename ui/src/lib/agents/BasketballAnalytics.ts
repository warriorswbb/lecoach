import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { pool } from "@/lib/db";
import { QueryUnderstandingAgent } from "@/lib/agents/QueryUnderstandingAgent";
import { SQLGenerationAgent } from "@/lib/agents/SQLGenerationAgent";
import { DataProcessingAgent } from "@/lib/agents/DataProcessingAgent";
import { ResponseGenerationAgent } from "@/lib/agents/ResponseGenerationAgent";

// Define tracking interfaces
export interface AgentStep {
  agent: string;
  input?: any;
  output?: any;
  startTime: number;
  endTime?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AnalyticsResponse {
  answer: string;
  confidence: number;
  executionTime: number;
  steps?: AgentStep[];
  totalTokens?: number;
}

// Base class for our basketball analytics system
export class BasketballAnalyticsAgent {
  private model: ChatOpenAI;
  private queryAgent: QueryUnderstandingAgent;
  private sqlAgent: SQLGenerationAgent;
  private dataAgent: DataProcessingAgent;
  private responseAgent: ResponseGenerationAgent;
  private steps: AgentStep[] = [];
  private totalTokens: number = 0;

  constructor() {
    // Initialize the model with appropriate settings
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });

    // Initialize all the specialized agents
    this.queryAgent = new QueryUnderstandingAgent();
    this.sqlAgent = new SQLGenerationAgent();
    this.dataAgent = new DataProcessingAgent();
    this.responseAgent = new ResponseGenerationAgent();
  }

  // Main method to answer basketball questions
  async answerQuestion(
    question: string,
    gameId: string
  ): Promise<AnalyticsResponse> {
    try {
      // Reset tracking for new question
      this.steps = [];
      this.totalTokens = 0;

      console.log(`Starting analysis for question: "${question}"`);

      // Get basic game data for context
      const gameData = await this.getGameData(gameId);
      const startTime = Date.now();

      // Step 1: Understand the query
      console.log("Step 1: Query Understanding");
      const queryStep: AgentStep = {
        agent: "Query Understanding",
        input: { question, gameData },
        startTime: Date.now(),
      };

      const queryAnalysis = await this.queryAgent.analyzeQuery(
        question,
        gameData
      );

      queryStep.endTime = Date.now();
      queryStep.output = queryAnalysis;
      queryStep.tokens = this.queryAgent.getLastTokenUsage();
      this.totalTokens += queryStep.tokens?.total || 0;
      this.steps.push(queryStep);

      console.log(`Query analyzed. Intent: ${queryAnalysis.intent}`);
      console.log(`Tokens used: ${queryStep.tokens?.total}`);

      if (queryAnalysis.complexity === "simple") {
        console.log("Simple question detected. Using optimized path.");

        // For simple questions, skip SQL generation and heavy processing
        const simpleResponse = await this.handleSimpleQuestion(
          question,
          queryAnalysis,
          gameData
        );

        const executionTime = Date.now() - startTime;

        return {
          answer: simpleResponse,
          confidence: 0.95,
          executionTime,
          steps: this.steps,
          totalTokens: this.totalTokens,
        };
      }

      // Step 2: Generate SQL
      console.log("Step 2: SQL Generation");
      const sqlStep: AgentStep = {
        agent: "SQL Generation",
        input: { queryAnalysis, gameId },
        startTime: Date.now(),
      };

      const sqlQuery = await this.sqlAgent.generateSQL(queryAnalysis, gameId);

      sqlStep.endTime = Date.now();
      sqlStep.output = sqlQuery;
      sqlStep.tokens = this.sqlAgent.getLastTokenUsage();
      this.totalTokens += sqlStep.tokens?.total || 0;
      this.steps.push(sqlStep);

      console.log(`SQL generated: ${sqlQuery.substring(0, 100)}...`);
      console.log(`Tokens used: ${sqlStep.tokens?.total}`);

      // Step 3: Execute SQL and process the data
      console.log("Step 3: Data Processing");
      const dataStep: AgentStep = {
        agent: "Data Processing",
        input: { sqlQuery },
        startTime: Date.now(),
      };

      const rawResults = await this.executeSQL(sqlQuery);
      const processedData = await this.dataAgent.processData(
        rawResults,
        queryAnalysis
      );

      dataStep.endTime = Date.now();
      dataStep.output = { rawCount: rawResults.length, processedData };
      dataStep.tokens = this.dataAgent.getLastTokenUsage();
      this.totalTokens += dataStep.tokens?.total || 0;
      this.steps.push(dataStep);

      console.log(`Data processed. ${rawResults.length} rows retrieved.`);
      console.log(`Tokens used: ${dataStep.tokens?.total}`);

      // Step 4: Generate the final response
      console.log("Step 4: Response Generation");
      const responseStep: AgentStep = {
        agent: "Response Generation",
        input: { question, processedData, gameData, queryAnalysis },
        startTime: Date.now(),
      };

      const response = await this.responseAgent.generateResponse(
        question,
        processedData,
        gameData,
        queryAnalysis
      );

      responseStep.endTime = Date.now();
      responseStep.output = { response: response.substring(0, 100) + "..." };
      responseStep.tokens = this.responseAgent.getLastTokenUsage();
      this.totalTokens += responseStep.tokens?.total || 0;
      this.steps.push(responseStep);

      console.log(`Response generated. Length: ${response.length} chars`);
      console.log(`Tokens used: ${responseStep.tokens?.total}`);

      const executionTime = Date.now() - startTime;
      console.log(`Total execution time: ${executionTime}ms`);
      console.log(`Total tokens used: ${this.totalTokens}`);

      return {
        answer: response,
        confidence: 0.9,
        executionTime,
        steps: this.steps,
        totalTokens: this.totalTokens,
      };
    } catch (error) {
      console.error("Error in BasketballAnalyticsAgent:", error);
      return {
        answer: "I encountered an error analyzing this game. Please try again.",
        confidence: 0,
        executionTime: 0,
        steps: this.steps,
        totalTokens: this.totalTokens,
      };
    }
  }

  // Get all tracking steps
  getSteps(): AgentStep[] {
    return this.steps;
  }

  // Helper method to execute SQL queries
  private async executeSQL(sqlQuery: string) {
    try {
      const result = await pool.query(sqlQuery);
      return result.rows;
    } catch (error: unknown) {
      console.error("SQL Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Error executing SQL: ${errorMessage}`);
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

  private async handleSimpleQuestion(
    question: string,
    queryAnalysis: any,
    gameData: any
  ): Promise<string> {
    console.log("Handling simple question directly");

    // Create a simpler prompt for basic questions
    const prompt = PromptTemplate.fromTemplate(`
      You are a basketball expert. Answer this simple question concisely:
      
      Game Information:
      Date: {date}
      Teams: {team1} ({team1_score}) vs {team2} ({team2_score})
      
      User Question: {question}
      
      Provide a very brief, direct answer in 1-2 sentences maximum.
    `);

    const chain = RunnableSequence.from([prompt, this.model]);

    const responseStep: AgentStep = {
      agent: "Simple Response",
      input: { question, gameData },
      startTime: Date.now(),
    };

    const response = await chain.invoke({
      date: gameData.date,
      team1: gameData.team_one_name,
      team1_score: gameData.team_one_score,
      team2: gameData.team_two_name,
      team2_score: gameData.team_two_score,
      question: question,
    });

    responseStep.endTime = Date.now();
    responseStep.output = {
      response: response.content.toString().substring(0, 100) + "...",
    };
    responseStep.tokens = { prompt: 200, completion: 50, total: 250 };
    this.totalTokens += responseStep.tokens.total;
    this.steps.push(responseStep);

    return response.content.toString();
  }
}
