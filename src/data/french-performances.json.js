import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/french-plays.json");

export async function load() {
  try {
    // console.log("🟢 Running loadPlays.js...");

    // Fetch data
    const response = await fetch(
      "https://api.cfregisters.org/performances?date=gt.%221748-01-01%22&date=lt.%221779-01-01%22"
    );
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    const performances = await response.json();

    // Extract title, author, and genre
    const formattedPlays = performances.map((p) => ({
      title: p.title,
      author: p.author_name,
      genre: p.genre,
      date: new Date(p.date),
      year: new Date(p.date).getFullYear(),
    }));

    // filter to get one performance per day
    const dates = new Set();

    const filteredPlays = formattedPlays.filter((play) => {
      if (dates.has(play.date.getTime())) {
        return false;
      }

      dates.add(play.date.getTime());
      return true;
    });

    // console.log("✅ Formatted Plays (First 5 Records):", formattedPlays.slice(0, 5));
    return filteredPlays;
  } catch (error) {
    console.error("❌ Error loading plays:", error);
    return [];
  }
}

// Run the function to load data
const plays = await load();

// Write the processed data to a JSON file that can be imported into markdown files
process.stdout.write(JSON.stringify(plays));
