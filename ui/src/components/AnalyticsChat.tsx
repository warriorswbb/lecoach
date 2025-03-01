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
  ],
  "Simple Response": [
    "Processing simple question...",
    "Finding direct answer...",
    "Preparing response..."
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
      clearInterval(stepInterval);
      console.error("Error sending message:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your question." }
      ]);
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto pb-4 px-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="mb-2 p-4 rounded-full bg-blue-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Basketball Analytics AI</h3>
            <p className="text-neutral-400 mt-1 max-w-sm">
              Ask a question about this game, player stats, or team performance.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === "user" ? "ml-auto" : ""}`}>
              <div className={`max-w-[90%] rounded-lg px-4 py-3 ${
                message.role === "user" 
                  ? "bg-blue-600 text-white ml-auto" 
                  : "bg-neutral-800 text-white"
              }`}>
                {message.content}
                
                {/* Only show "Show Thinking" for AI messages with steps */}
                {message.role === "assistant" && message.steps && (
                  <button
                    onClick={() => setShowDetails(showDetails === index ? null : index)}
                    className="mt-2 text-xs bg-white text-black rounded-full px-3 py-1 transition-colors hover:bg-neutral-200"
                  >
                    {showDetails === index ? "Hide Thinking" : "Show Thinking"}
                  </button>
                )}
              </div>
              
              {/* Thinking process display */}
              {showDetails === index && message.steps && (
                <div className="bg-neutral-900 rounded-lg p-3 text-xs space-y-3 mt-1 border border-neutral-800">
                  <div className="text-neutral-400">
                    Response time: {((message.executionTime || 0) / 1000).toFixed(1)}s
                  </div>
                  
                  {message.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="border-l-2 border-blue-700 pl-3 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-400">{step.agent}</span>
                        <span className="text-neutral-500">
                          {((step.endTime || 0) - step.startTime) / 1000}s
                        </span>
                      </div>
                      
                      {/* Show step's thinking process */}
                      <div className="mt-1">
                        {step.agent === "SQL Generation" ? (
                          <div className="bg-neutral-800 p-2 rounded font-mono text-green-400 overflow-x-auto text-xs">
                            {step.output}
                          </div>
                        ) : step.agent === "Query Understanding" ? (
                          <div className="text-neutral-400">
                            <span className="text-neutral-300">Intent:</span> {step.output?.intent}<br/>
                            <span className="text-neutral-300">Analysis:</span> {step.output?.analysisType}
                            {step.output?.complexity && <><br/><span className="text-neutral-300">Complexity:</span> {step.output?.complexity}</>}
                          </div>
                        ) : step.agent === "Data Processing" ? (
                          <div className="text-neutral-400">
                            Processed {step.output?.rawCount || step.output?.data?.length || 0} records
                          </div>
                        ) : (
                          <div className="text-neutral-400">
                            {step.output ? JSON.stringify(step.output).substring(0, 100) + "..." : "Processing completed"}
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
            <div className="max-w-[90%] rounded-lg px-4 py-3 bg-neutral-800 text-white">
              <div className="flex items-center space-x-3">
                <div className="loading-dots">
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
                <div className="text-xs text-neutral-500 mt-2">
                  Current step: {currentStep}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t border-neutral-700 p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about this game..."
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-white text-black rounded-full px-5 py-2 font-medium text-sm disabled:opacity-50 transition-colors hover:bg-neutral-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 