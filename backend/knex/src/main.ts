import kx from "../config.js";
import PlayerStats from "./vorp.ts";

// set up job to scrape usporthoops

// set up job to fetch posessions from synergy data

const test = async () => {
  const player = new PlayerStats(10);
  const bpm = await player.calculateBPM();

  console.log(`Calculated BPM: ${bpm}`);
};

test();