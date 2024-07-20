import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";

// https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame

// cron.schedule('* * * * *', () => {
//     console.log('running every second');
// });
const url =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame";

async function fetch_demo() {
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

    rows.forEach((row) => console.log(row));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetch_demo();
