import kx from "../config.js";
import Vorp from "./vorp.ts";

// set up job to scrape usporthoops

// set up job to fetch posessions from synergy data

const test = async () => {
  const team = new Vorp(1, "2023-2024");
  const bpm = await team.calculateBPM();
  const teamStats = await team.allTeamStats();
};

test()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
