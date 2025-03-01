"use client";

import { useState, useEffect, useRef } from "react";
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
    "Determining question intent...",
  ],
  "SQL Generation": [
    "Formulating database query...",
    "Finding relevant game data...",
    "Building SQL statement...",
  ],
  "Data Processing": [
    "Processing raw data...",
    "Calculating relevant statistics...",
    "Analyzing game patterns...",
  ],
  "Response Generation": [
    "Generating insights...",
    "Preparing concise response...",
    "Formulating answer...",
  ],
  "Simple Response": [
    "Processing simple question...",
    "Finding direct answer...",
    "Preparing response...",
  ],
};

// Sample prompts that will rotate with typing animation
const SAMPLE_PROMPTS = [
  "Who scored the most points in this game?",
  "What was the shooting percentage in the 3rd quarter?",
  "How many turnovers did the home team have?",
  "Which player had the best plus/minus?",
  "How did the teams perform in fast break points?",
  "What was the biggest lead in the game?",
  "Who had the most assists tonight?",
  "Compare the bench scoring between both teams",
];

// Updated rotating square component with slower rotation and pauses
const RotatingSquare = ({ size = "w-16 h-16", marginClass = "mb-6" }) => (
  <div className={`${marginClass} ${size} relative`}>
    <div
      className="w-full h-full bg-gradient-to-br from-neutral-500 to-white animate-rotate-square-pause"
      style={{
        transformOrigin: "center",
      }}
    ></div>
  </div>
);

// Define a type for the step names
type StepName = keyof typeof STEP_MESSAGES;

export function AnalyticsChat({ gameId }: { gameId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepName | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fixed typing animation effect
  useEffect(() => {
    if (messages.length > 0) return;

    // Clear any existing timeout to prevent conflicts
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    const currentPrompt = SAMPLE_PROMPTS[currentPromptIndex];

    if (isTyping) {
      if (displayText.length < currentPrompt.length) {
        // Type the next character
        typingTimeout.current = setTimeout(() => {
          setDisplayText(currentPrompt.substring(0, displayText.length + 1));
        }, 70); // typing speed
      } else {
        // Finished typing, pause before deleting
        typingTimeout.current = setTimeout(() => {
          setIsDeleting(true);
          setIsTyping(false);
        }, 2000); // pause after typing
      }
    } else if (isDeleting) {
      if (displayText.length > 0) {
        // Delete the last character
        typingTimeout.current = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 35); // delete speed (faster than typing)
      } else {
        // Finished deleting, move to next prompt
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentPromptIndex((prev) => (prev + 1) % SAMPLE_PROMPTS.length);
        // Pause before typing next prompt
        typingTimeout.current = setTimeout(() => {}, 500);
      }
    }

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [displayText, isTyping, isDeleting, currentPromptIndex, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Sequence through loading states
    const steps: StepName[] = [
      "Query Understanding",
      "SQL Generation",
      "Data Processing",
      "Response Generation",
    ];
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
        totalTokens: data.totalTokens,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Error sending message:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your question.",
        },
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
            {/* Simple rotating square */}
            <RotatingSquare />

            {/* Typing animation for prompts */}
            <p className="text-neutral-400 mt-3 max-w-sm leading-relaxed h-16">
              <span className="text-neutral-300 italic">
                "{displayText}
                <span className="animate-blink">|</span>"
              </span>
            </p>
            <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent"></div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.role === "user" ? "ml-auto" : ""}`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-neutral-700 text-white ml-auto"
                    : "bg-neutral-800 text-white"
                }`}
              >
                <div className="mb-2">{message.content}</div>

                {/* Only show "Show Thinking" for AI messages with steps */}
                {message.role === "assistant" && message.steps && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setShowDetails(showDetails === index ? null : index)
                      }
                      className="text-xs bg-white text-black rounded-full px-3 py-1 transition-colors hover:bg-neutral-200"
                    >
                      {showDetails === index
                        ? "Hide Thinking"
                        : "Show Thinking"}
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced thinking process display */}
              {showDetails === index && message.steps && (
                <div className="bg-neutral-900 rounded-lg p-4 text-sm space-y-4 mt-2 border border-neutral-800">
                  <div className="flex justify-between items-center">
                    <div className="text-neutral-300 font-medium">
                      Analysis Process
                    </div>
                    <div className="text-neutral-400">
                      Response time:{" "}
                      {((message.executionTime || 0) / 1000).toFixed(1)}s
                    </div>
                  </div>

                  {message.steps.map((step, stepIdx) => (
                    <div
                      key={stepIdx}
                      className="border-l-2 border-neutral-600 pl-4 pb-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">
                          {step.agent}
                        </span>
                        <span className="text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded text-xs">
                          {((step.endTime || 0) - step.startTime) / 1000}s
                        </span>
                      </div>

                      {/* Show step's thinking process with improved formatting */}
                      <div className="mt-2">
                        {step.agent === "SQL Generation" ? (
                          <div className="bg-neutral-800 p-3 rounded font-mono text-neutral-200 overflow-x-auto whitespace-pre">
                            {step.output}
                          </div>
                        ) : step.agent === "Query Understanding" ? (
                          <div className="bg-neutral-800 p-3 rounded">
                            {/* If output is a string, display it directly */}
                            {typeof step.output === "string" ? (
                              <div className="text-neutral-200">
                                {step.output}
                              </div>
                            ) : /* If output has the expected fields, display them structured */
                            step.output?.intent || step.output?.analysisType ? (
                              <div className="space-y-2">
                                {step.output?.intent && (
                                  <div className="flex">
                                    <span className="text-neutral-400 w-24">
                                      Intent:
                                    </span>
                                    <span className="text-neutral-200">
                                      {step.output.intent}
                                    </span>
                                  </div>
                                )}
                                {step.output?.analysisType && (
                                  <div className="flex">
                                    <span className="text-neutral-400 w-24">
                                      Analysis:
                                    </span>
                                    <span className="text-neutral-200">
                                      {step.output.analysisType}
                                    </span>
                                  </div>
                                )}
                                {step.output?.complexity && (
                                  <div className="flex">
                                    <span className="text-neutral-400 w-24">
                                      Complexity:
                                    </span>
                                    <span className="text-neutral-200">
                                      {step.output.complexity}
                                    </span>
                                  </div>
                                )}
                                {step.output?.entities && (
                                  <div className="flex">
                                    <span className="text-neutral-400 w-24">
                                      Entities:
                                    </span>
                                    <span className="text-neutral-200">
                                      {JSON.stringify(step.output.entities)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Otherwise, display the raw JSON for the entire output */
                              <div>
                                <div className="text-neutral-400 mb-2">
                                  Analysis output:
                                </div>
                                <pre className="whitespace-pre-wrap text-xs max-h-52 overflow-y-auto text-neutral-200">
                                  {JSON.stringify(step.output, null, 2) ||
                                    "No output data available"}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : step.agent === "Data Processing" ? (
                          <div className="bg-neutral-800 p-3 rounded">
                            <div className="text-neutral-300 mb-2">
                              Processed{" "}
                              {step.output?.rawCount ||
                                step.output?.data?.length ||
                                0}{" "}
                              records
                            </div>
                            <div className="text-neutral-400 text-xs max-h-36 overflow-y-auto">
                              {step.output?.data && (
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(
                                    step.output.data.slice(0, 5),
                                    null,
                                    2
                                  )}
                                  {step.output.data.length > 5 && "..."}
                                </pre>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-neutral-800 p-3 rounded text-neutral-300">
                            <pre className="whitespace-pre-wrap text-xs max-h-36 overflow-y-auto">
                              {typeof step.output === "object"
                                ? JSON.stringify(step.output, null, 2)
                                : step.output || "Processing completed"}
                            </pre>
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

        {/* Loading indicator with better spacing */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-lg px-4 py-3 bg-neutral-800 text-white">
              <div className="flex items-center">
                {/* Smaller rotating square with more right margin */}
                <RotatingSquare size="w-5 h-5" marginClass="mr-4" />

                <div className="text-sm text-neutral-300">
                  {currentStep
                    ? STEP_MESSAGES[currentStep]?.[
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

      {/* Input area with rounded input box */}
      <div className="border-t border-neutral-700 p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about this game..."
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-0 focus:border-neutral-600"
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
