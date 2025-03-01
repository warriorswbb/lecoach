"use client";

import { useState } from "react";
import { CircleChart } from "@/components/ui/circle-chart";

interface TeamMetricsProps {
  teamOneShort: string;
  teamTwoShort: string;
  teamOneColor: string;
  teamTwoColor: string;
}

export function TeamMetrics({
  teamOneShort,
  teamTwoShort,
  teamOneColor,
  teamTwoColor,
}: TeamMetricsProps) {
  const [activeTeam, setActiveTeam] = useState<"team1" | "team2">("team1");
  const [activePeriod, setActivePeriod] = useState("full");
  const periods = ["1", "2", "3", "4", "full"];
  
  // Generate different metrics for each period
  const generateMetricsData = () => {
    const quarterData = {};
    
    // Generate data for each period
    periods.forEach(period => {
      // For each team
      quarterData[period] = {
        team1: {
          pace: Math.floor(Math.random() * 20 + 70), // Random between 70-90
          offensiveEfficiency: Math.floor(Math.random() * 25 + 60), // Random between 60-85
          defensiveEfficiency: Math.floor(Math.random() * 25 + 60), // Random between 60-85
        },
        team2: {
          pace: Math.floor(Math.random() * 20 + 70),
          offensiveEfficiency: Math.floor(Math.random() * 25 + 60),
          defensiveEfficiency: Math.floor(Math.random() * 25 + 60),
        }
      };
    });
    
    return quarterData;
  };
  
  // Generate metrics once when component mounts
  const [metricsData] = useState(generateMetricsData());

  // Get current team data and metrics
  const currentTeam = activeTeam === "team1" 
    ? { short: teamOneShort, color: teamOneColor }
    : { short: teamTwoShort, color: teamTwoColor };
  
  const currentMetrics = metricsData[activePeriod][activeTeam];
  
  // Labels for period display
  const periodLabels = {
    "1": "1st Quarter",
    "2": "2nd Quarter",
    "3": "3rd Quarter",
    "4": "4th Quarter",
    full: "Full Game",
  };

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg flex flex-col h-[284px]">
      {/* Period tabs */}
      <div className="bg-[#1a1a1a] px-4 py-1.5 flex border-b border-neutral-800">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activePeriod === period
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {period === "full"
              ? "Full Game"
              : period === "1"
              ? "1st"
              : period === "2"
              ? "2nd"
              : period === "3"
              ? "3rd"
              : "4th"}
          </button>
        ))}
      </div>
      
      <div className="p-6 flex-grow flex flex-col justify-between">
        {/* Header with team toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Team Metrics</h3>
            <span className="text-sm text-neutral-400">• {periodLabels[activePeriod]}</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 rounded-full p-1">
            <button
              onClick={() => setActiveTeam("team1")}
              className={`py-1 px-3 rounded-full text-sm transition-colors ${
                activeTeam === "team1"
                  ? `text-white bg-opacity-90`
                  : "text-neutral-400 hover:text-white"
              }`}
              style={activeTeam === "team1" ? { backgroundColor: teamOneColor } : {}}
            >
              {teamOneShort}
            </button>
            <button
              onClick={() => setActiveTeam("team2")}
              className={`py-1 px-3 rounded-full text-sm transition-colors ${
                activeTeam === "team2"
                  ? `text-white bg-opacity-90`
                  : "text-neutral-400 hover:text-white"
              }`}
              style={activeTeam === "team2" ? { backgroundColor: teamTwoColor } : {}}
            >
              {teamTwoShort}
            </button>
          </div>
        </div>

        {/* Circle Charts */}
        <div className="flex justify-center items-center gap-4 flex-grow">
          <CircleChart 
            value={currentMetrics.pace} 
            label="Pace" 
            color={currentTeam.color}
            size={140}
          />
          <CircleChart 
            value={currentMetrics.offensiveEfficiency} 
            label="Off. Efficiency" 
            color={currentTeam.color}
            size={140} 
          />
          <CircleChart 
            value={currentMetrics.defensiveEfficiency} 
            label="Def. Efficiency" 
            color={currentTeam.color}
            size={140}
          />
        </div>
      </div>
    </div>
  );
} 