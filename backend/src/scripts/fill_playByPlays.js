import fs from "fs";
import path from "path";
import kx from "./config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "synergy",
  "src",
  "play_by_play_data"
);

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
          // console.log("Processing play ID:", play.id);
          // console.log("Description:", play.description);

          const playData = {
            play_id: play.id,
            game_id: play.game.id,
            season: play.game.season.name,
            home_team: play.game.homeTeam.fullName,
            away_team: play.game.awayTeam.fullName,
            play_actor_team: play?.playActors[0]?.team?.abbr,
            play_actor_player: play?.playActors[0]?.player?.name,
            play_name: play?.name,
            description: play.description,
            shot: !!play.shot,
            shot_result:
              (play.shot2Attempt && play.shot2made) ||
              (play.shot3Attempt && play.shot3made)
                ? "made"
                : "missed",
            shot_quality: play?.shotQuality,
            shot_x: play?.shotX,
            shot_y: play?.shotY,
            quarter: play.period,
            clock: play.clock,
          };

          await kx("play_by_play")
            .insert(playData)
            .onConflict("play_id")
            .ignore();
        }
        console.log("Processed file:", file);
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

processPlayByPlayData()
  .then(() => {
    console.log("Processing complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error in main function:", err);
    process.exit(1);
  });
