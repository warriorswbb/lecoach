import kx from "../config.js";
import Vorp from "./vorp.ts";
import ShotDistribution from "./shotDistributions.ts";

// set up job to scrape usporthoops

// set up job to fetch posessions from synergy data

const testVorp = async () => {
  const team = new Vorp(1, "2023-2024");
  // const bpm = await team.calculateBPM();
  const teamStats = await team.getTeamStats();
  const playerStats = await team.getPlayerStats();
  const shootingStats = await team.getTeamShootingContextStats();
  const positions = await team.estimatePlayerPositions();

  const offrole = await team.estimateOffensiveRoles();

  const bpmCoeff = await team.calculateBPMCoefficients();

  const bpmRaw = await team.calculateRawBPM();

  const bpmVorp = await team.calculateBpmVorp();
};

const testShotDistribution = async () => {
  const shotDist = new ShotDistribution();
  const dist = await shotDist.getTeamShotDistribution("2023-2024", "CAR");
  console.log(dist);
};

testShotDistribution()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
