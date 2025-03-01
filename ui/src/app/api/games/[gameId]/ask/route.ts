import { NextRequest, NextResponse } from "next/server";
import { BasketballAnalyticsAgent } from "@/lib/agents/BasketballAnalytics";

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { question } = await request.json();
    // Await params before accessing gameId
    const resolvedParams = await params;
    const gameId = resolvedParams.gameId;

    // Input validation
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    // Create agent and get response
    const agent = new BasketballAnalyticsAgent();
    const startTime = Date.now();
    const response = await agent.answerQuestion(question, gameId);
    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      ...response,
      executionTime,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    );
  }
}
