import kx from "../config.js";
import Vorp from "./vorp.ts";

// set up job to scrape usporthoops

// set up job to fetch posessions from synergy data

const test = async () => {
  const player = new Vorp(1, "2023-2024");
  const bpm = await player.calculateBPM();
  const teamStats = await player.allTeamStats();

  console.log(`Calculated BPM: ${bpm}`);
  console.log(`Team Stats (JSON): ${JSON.stringify(teamStats, null, 2)}`);
};

test();
