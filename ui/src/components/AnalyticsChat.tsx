"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgentStep } from "@/lib/agents/BasketballAnalytics";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  steps?: AgentStep[];
  executionTime?: number;
  totalTokens?: number;
}

// Loading state messages for each step
const STEP_MESSAGES = {
  "Query Understanding": [
    "Analyzing your question...",
    "Identifying key entities...",
    "Determining question intent..."
  ],
  "SQL Generation": [
    "Formulating database query...",
    "Finding relevant game data...",
    "Building SQL statement..."
  ],
  "Data Processing": [
    "Processing raw data...",
    "Calculating relevant statistics...",
    "Analyzing game patterns..."
  ],
  "Response Generation": [
    "Generating insights...",
    "Preparing concise response...",
    "Formulating answer..."
  ]
};

export function AnalyticsChat({ gameId }: { gameId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Sequence through loading states
    const steps = ["Query Understanding", "SQL Generation", "Data Processing", "Response Generation"];
    let stepIndex = 0;
    
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1500); // Advance to next step every 1.5 seconds
    
    try {
      // Send request to API
      const response = await fetch(`/api/games/${gameId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      clearInterval(stepInterval);
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        steps: data.steps,
        executionTime: data.executionTime,
        totalTokens: data.totalTokens
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      clearInterval(stepInterval);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const toggleDetails = (index: number) => {
    if (showDetails === index) {
      setShowDetails(null);
    } else {
      setShowDetails(index);
    }
  };

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg overflow-hidden flex flex-col h-[500px]">
      <div className="bg-[#1a1a1a] px-6 py-3 font-medium border-b border-neutral-800">
        Basketball Analytics
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-400 mt-8">
            Ask a question about this game
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-900/30 text-white"
                      : "bg-neutral-800 text-white"
                  }`}
                >
                  {message.content}
                </div>
              </div>
              
              {/* Detail toggle button */}
              {message.role === "assistant" && message.steps && (
                <div className="flex justify-start">
                  <button
                    onClick={() => toggleDetails(index)}
                    className="text-xs text-neutral-400 hover:text-blue-400 flex items-center"
                  >
                    <svg 
                      className={`w-3 h-3 mr-1 transition-transform ${showDetails === index ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {showDetails === index ? "Hide details" : "View analytics process"}
                  </button>
                </div>
              )}
              
              {/* Detailed steps */}
              {showDetails === index && message.steps && (
                <div className="bg-neutral-900 rounded-lg p-3 text-xs space-y-3 mt-1">
                  <div className="text-neutral-400">
                    Total time: {(message.executionTime || 0) / 1000}s | 
                    Tokens used: {message.totalTokens || 0}
                  </div>
                  {message.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="border-l-2 border-blue-700 pl-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-400">{step.agent}</span>
                        <span className="text-neutral-500">
                          {((step.endTime || 0) - step.startTime) / 1000}s | 
                          {step.tokens?.total || 0} tokens
                        </span>
                      </div>
                      <div className="mt-1 text-neutral-300">
                        {step.agent === "SQL Generation" ? (
                          <div className="bg-neutral-800 p-2 rounded font-mono text-green-400 overflow-x-auto">
                            {step.output}
                          </div>
                        ) : (
                          <div className="text-neutral-400">
                            {step.agent === "Query Understanding" && 
                              `Intent: ${step.output?.intent}, Entities: ${Object.keys(step.output?.entities || {}).length}`
                            }
                            {step.agent === "Data Processing" && 
                              `Processed ${step.output?.rawCount || 0} records`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Advanced loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-neutral-800 text-white">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <div className="loading-dots mr-3">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="text-sm text-neutral-300">
                    {currentStep 
                      ? STEP_MESSAGES[currentStep as keyof typeof STEP_MESSAGES]?.[
                          Math.floor(Date.now() / 1000) % 3
                        ] 
                      : "Processing..."}
                  </div>
                </div>
                {currentStep && (
                  <div className="text-xs text-neutral-500 mt-1 ml-1">
                    Step: {currentStep}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about this game..."
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 