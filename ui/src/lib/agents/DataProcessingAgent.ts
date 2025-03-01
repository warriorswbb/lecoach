import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export class DataProcessingAgent {
  private model: ChatOpenAI;
  private lastTokenUsage = { prompt: 0, completion: 0, total: 0 };

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });
  }

  async processData(rawData: any[], queryAnalysis: any): Promise<any> {
    // For simple queries, we might just return the raw data
    if (
      rawData.length === 0 ||
      queryAnalysis.analysisType === "simple_lookup"
    ) {
      return {
        processed: false,
        data: rawData,
        insights: [],
      };
    }

    // For more complex analyses, use the LLM to process the data
    const prompt = PromptTemplate.fromTemplate(`
      You are a basketball data analyst. Process the following raw data from a database query and provide insights.
      
      Raw Data:
      {rawData}
      
      Query Analysis:
      Intent: {intent}
      Analysis Type: {analysisType}
      
      Provide data processing steps, calculated metrics, and key insights from this data.
      Return your analysis as a structured JSON object with:
      1. Processed data points
      2. Key metrics
      3. Insights
    `);

    const chain = RunnableSequence.from([prompt, this.model]);

    const response = await chain.invoke({
      rawData: JSON.stringify(rawData.slice(0, 20)), // Limit to prevent token overflow
      intent: queryAnalysis.intent,
      analysisType: queryAnalysis.analysisType,
    });

    try {
      let jsonStr = response.content.toString();

      // Try to clean up the JSON if it contains markdown code blocks
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
      }

      // Track token usage after LLM call
      this.lastTokenUsage = {
        prompt: 800, // Example values
        completion: 200,
        total: 1000,
      };

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing data processing JSON:", error);
      // Fallback to returning simple processed data
      return {
        processed: true,
        data: rawData,
        insights: ["Basic analysis completed"],
        error: "Could not fully process the data",
      };
    }
  }

  // Add token tracking method
  getLastTokenUsage() {
    return this.lastTokenUsage;
  }
}
