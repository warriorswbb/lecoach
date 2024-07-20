import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "./constants.js";
// https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame

// cron.schedule('* * * * *', () => {
//     console.log('running every second');
// });

const url =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame";

const baseUrl =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=statgame";

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
        rows.push(cleanedText);
      }
    });

    if (rows.length === 0) {
      console.error(`No data found for ${team.fullTeamName}`);
    }
    //   console.log(`Data for ${team.fullTeamName}:`, rows);
  } catch (error) {
    console.error(`Error fetching data for ${team.fullTeamName}:`, error);
  }
}

async function fetch_all_teams_data() {
  const promises = teamNames.map((team) => fetch_team_data(team));
  await Promise.all(promises);
}

//   No data found for Wilfrid Laurier Golden Hawks
// No data found for St. Francis Xavier X-Women
// No data found for Bishop's Gaiters
// No data found for Queen's Gaels
// No data found for TMU Bold

fetch_all_teams_data();
