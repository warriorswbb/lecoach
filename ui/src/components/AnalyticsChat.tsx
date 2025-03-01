"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AnalyticsChat({ gameId }: { gameId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
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
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
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
            <div
              key={index}
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
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-neutral-800 text-white">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-150"></div>
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