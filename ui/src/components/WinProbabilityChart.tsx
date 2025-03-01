"use client";

import { useState } from "react";
import { AreaChartComponent } from "@/components/ui/area-chart";

interface WinProbabilityChartProps {
  winProbabilityData: Record<string, any[]>;
  teamOneShort: string;
  teamTwoShort: string;
  teamOneColor: string;
  teamTwoColor: string;
}

export function WinProbabilityChart({
  winProbabilityData,
  teamOneShort,
  teamTwoShort,
  teamOneColor,
  teamTwoColor,
}: WinProbabilityChartProps) {
  const periods = ["1", "2", "3", "4", "full"];
  const [activePeriod, setActivePeriod] = useState("full");
  
  const periodLabels = {
    "1": "1st Quarter",
    "2": "2nd Quarter",
    "3": "3rd Quarter",
    "4": "4th Quarter",
    full: "Full Game",
  };

  // Generate improved X-axis data with game clock format
  const improvedData = winProbabilityData[activePeriod].map((point, index, array) => {
    // For each period, show time remaining from 10:00 down to 0:00
    // For full game, show 4 quarters from 40:00 down to 0:00
    const totalPoints = array.length;
    const minutesPerPeriod = activePeriod === "full" ? 40 : 10;
    const minutesRemaining = minutesPerPeriod * (1 - index / (totalPoints - 1));
    const mins = Math.floor(minutesRemaining);
    const secs = Math.floor((minutesRemaining - mins) * 60);
    
    return {
      ...point,
      // Replace 'time' with a more meaningful label
      time: `${mins}:${secs.toString().padStart(2, '0')}`
    };
  });

  // Use actual team names and colors for chart categories
  const chartCategories = [
    { name: teamOneShort, color: teamOneColor },
    { name: teamTwoShort, color: teamTwoColor },
  ];

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-lg h-[600px] flex flex-col">
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

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Win Probability</h3>
          <span className="text-sm text-neutral-400">{periodLabels[activePeriod]} | {teamOneShort} vs {teamTwoShort}</span>
        </div>
        <AreaChartComponent
          data={improvedData}
          categories={chartCategories}
          index="time"
          showXAxis={true}
          showYAxis={true}
          height={480} // Reduced height to make more room for x-axis
          stacked={true}
          // Don't show title since we're showing it above
          title=""
          subtitle=""
        />
      </div>
    </div>
  );
} 