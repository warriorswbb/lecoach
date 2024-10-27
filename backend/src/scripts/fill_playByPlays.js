import fs from "fs";
import path from "path";
import kx from "./config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "..","..","synergy", "src", "play_by_play_data");

const processPlayByPlayData = async () => {
  try {
    const files = fs.readdirSync(dataDir);

    const jsonFiles = files.filter((file) => path.extname(file) === ".json");

    console.log(`Found ${jsonFiles.length} JSON files in data directory.`);

    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      const rawData = fs.readFileSync(filePath, "utf8");

      try {
        const jsonData = JSON.parse(rawData);
        const plays = jsonData.result;
        for (const play of plays) {
          // Example: Logging key information from each play
          console.log("Processing play ID:", play.id);
          console.log("Description:", play.description);
          console.log("Period:", play.period);
          console.log("Home Score:", play.homeScore);
          console.log("Away Score:", play.awayScore);

          const offenseTeam = play.offense ? play.offense.name : "Unknown Team";
          const defenseTeam = play.defense ? play.defense.name : "Unknown Team";
          
          // Use knex to insert data if needed
          await kx("play_by_play").insert({
            play_id: play.id,
            description: play.description,
            period: play.period,
            home_score: play.homeScore,
            away_score: play.awayScore,
            offense_team: offenseTeam,
            defense_team: defenseTeam,
          });
        }
      } catch (parseError) {
        console.error(`Error parsing JSON file ${file}:`, parseError);
      }
    }
  } catch (error) {
    console.error("Error reading files or processing data:", error);
  } finally {
    await kx.destroy();
  }
};

// Run the script
processPlayByPlayData()
  .then(() => {
    console.log("Processing complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error in main function:", err);
    process.exit(1);
  });
