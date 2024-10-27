import fs from "fs";
import csv from "csv-parser";
import kx from "./config.js";
import Papa from "papaparse"; // Use PapaParse to handle CSV parsing in this case

const findMissingGameIds = async () => {
  const gameIdsInCsv = new Set();
  const csvFilePath = "ids_with_game_id.csv";

  try {
    // Read the file content as a string
    const csvData = fs.readFileSync(csvFilePath, "utf8");

    // Parse CSV data with headers
    Papa.parse(csvData, {
      header: true, // Use headers
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row) => {
          const gameId = row.GameID_DB; // Access by column name
          if (gameId) {
            gameIdsInCsv.add(gameId);
          }
        });
      },
    });

    // console.log("CSV Game IDs:", gameIdsInCsv);

    console.log(`Total game IDs found in CSV: ${gameIdsInCsv.size}`);
    console.log("Querying database for game IDs...");
    const gameIdsInDb = await kx("games").pluck("game_id");

    console.log(`Total game IDs found in database: ${gameIdsInDb.length}`);
    console.log("Database Game IDs:", gameIdsInDb);

    const missingGameIds = gameIdsInDb.filter(
      (gameId) => !gameIdsInCsv.has(gameId)
    );

    console.log(`Total missing game IDs: ${missingGameIds.length}`);

    console.log(
      "Game IDs in the database without a corresponding row in the CSV:"
    );
    if (missingGameIds.length > 0) {
      missingGameIds.forEach((gameId) => console.log(gameId));
    } else {
      console.log("No missing game IDs found.");
    }
  } catch (error) {
    console.error("Error reading CSV file or querying the database:", error);
  } finally {
    await kx.destroy();
  }
};

findMissingGameIds()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error in main function:", err);
    process.exit(1);
  });
