"use client";

import { useState, useEffect } from "react";
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
  
  // Animation states for circle values
  const [animatedValues, setAnimatedValues] = useState({
    pace: 0,
    offensiveEfficiency: 0,
    defensiveEfficiency: 0
  });
  
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
  
  // Animate values when team or period changes
  useEffect(() => {
    // Reset values to 0 for animation
    setAnimatedValues({
      pace: 0,
      offensiveEfficiency: 0,
      defensiveEfficiency: 0
    });
    
    // Animate to target values
    const timer = setTimeout(() => {
      setAnimatedValues({
        pace: currentMetrics.pace,
        offensiveEfficiency: currentMetrics.offensiveEfficiency,
        defensiveEfficiency: currentMetrics.defensiveEfficiency
      });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [activeTeam, activePeriod, currentMetrics]);
  
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
      <div className="bg-[#1a1a1a] px-4 py-2 flex gap-2 border-b border-neutral-800">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activePeriod === period
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
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
          
          {/* Team toggle with slider animation */}
          <div className="flex items-center gap-0 bg-neutral-800 rounded-full p-1 relative">
            {/* Animated background slider */}
            <div 
              className="absolute h-[80%] rounded-full transition-all duration-300 ease-in-out"
              style={{
                left: activeTeam === "team1" ? '4px' : '50%',
                right: activeTeam === "team2" ? '4px' : '50%',
                backgroundColor: activeTeam === "team1" 
                  ? `${teamOneColor}80` // 50% opacity
                  : `${teamTwoColor}80`  // 50% opacity
              }}
            ></div>
            
            <button
              onClick={() => setActiveTeam("team1")}
              className={`py-1 px-3 rounded-full text-sm transition-colors z-10 ${
                activeTeam === "team1"
                  ? `text-white`
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {teamOneShort}
            </button>
            <button
              onClick={() => setActiveTeam("team2")}
              className={`py-1 px-3 rounded-full text-sm transition-colors z-10 ${
                activeTeam === "team2"
                  ? `text-white`
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {teamTwoShort}
            </button>
          </div>
        </div>

        {/* Circle Charts */}
        <div className="flex justify-center items-center gap-4 flex-grow">
          <CircleChart 
            value={animatedValues.pace} 
            label="Pace" 
            color={currentTeam.color}
            size={140}
            animate={true}
          />
          <CircleChart 
            value={animatedValues.offensiveEfficiency} 
            label="Off Eff" 
            color={currentTeam.color}
            size={140} 
            animate={true}
          />
          <CircleChart 
            value={animatedValues.defensiveEfficiency} 
            label="Def Eff" 
            color={currentTeam.color}
            size={140}
            animate={true}
          />
        </div>
      </div>
    </div>
  );
} 