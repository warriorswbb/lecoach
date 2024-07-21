import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "./constants.js";
import { createObjectCsvWriter } from 'csv-writer';

// https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame

// cron.schedule('* * * * *', () => {
//     console.log('running every second');
// });

const baseUrl = "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=statgame";

async function fetch_team_data(team) {
  const url = baseUrl.replace("TEAM_NAME", team.city); // Adjust the field as necessary
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rows = [];

    $("br").each((index, element) => {
      const text = $(element).get(0).nextSibling.nodeValue;
      if (text) {
        const cleanedText = text.trim().replace(/;/g, ",");
        rows.push({ data: cleanedText }); // Store as object to fit CSV writer format
      }
    });

    if (rows.length === 0) {
      console.error(`No data found for ${team.fullTeamName}`);
    } else {
      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: `./${team.city}_data.csv`, // File path
        header: [
          { id: 'data', title: 'Data' },
        ],
      });

      // Write data to CSV
      await csvWriter.writeRecords(rows);
      console.log(`Data for ${team.fullTeamName} written to CSV.`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${team.fullTeamName}:`, error);
  }
}

async function fetch_all_teams_data() {
  const promises = teamNames.map((team) => fetch_team_data(team));
  await Promise.all(promises);
}

fetch_all_teams_data();