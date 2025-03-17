import plays from "./data/plays.js";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 JavaScript is running!");

  // ✅ Render Play List
  const playList = document.getElementById("play-list");
  if (!playList) {
    console.error("❌ Could not find #play-list in the document!");
    return;
  }

  try {
    console.log("✅ Loaded Plays:", plays);

    playList.innerHTML = ""; // Clear placeholder text

    plays.forEach(play => {
      const li = document.createElement("li");
      li.innerText = `${play.title} by ${play.author} (Genre: ${play.genre})`;
      playList.appendChild(li);
    });

    console.log("✅ Play list successfully updated!");
  } catch (error) {
    console.error("❌ Error loading plays:", error);
    playList.innerText = "❌ Failed to load plays.";
  }

  // ✅ Render Chart
  const chartContainer = document.getElementById("chart-container");
  if (!chartContainer) {
    console.error("❌ Chart container not found!");
    return;
  }

  console.log("✅ Rendering chart...");

  function countByGenre(data) {
    const genreCounts = {};
    data.forEach(play => {
      const genre = play.genre || "Unknown";
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    return Object.entries(genreCounts).map(([genre, count]) => ({ genre, count }));
  }

  function genrePlot(data) {
    return Plot.plot({
      title: "Number of Plays by Genre",
      width: 600,
      height: 400,
      x: { label: "Genre" },
      y: { label: "Count" },
      marks: [
        Plot.barY(countByGenre(data), { x: "genre", y: "count", fill: "steelblue" })
      ]
    });
  }

  try {
    const chart = genrePlot(plays);
    chartContainer.innerHTML = ""; // Clear placeholder
    chartContainer.appendChild(chart);
    console.log("✅ Chart displayed successfully!");
  } catch (error) {
    console.error("❌ Chart rendering error:", error);
  }
});

  // Chart of the number of authors' works
  function countByAuthor(data) {
    const authorCounts = {};
    data.forEach(play => {
      const author = play.author || "Unknown";
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    });
    return Object.entries(authorCounts).map(([author, count]) => ({ author, count }));
  }

  const authorContainer = document.getElementById("author-chart");
  if (authorContainer) {
    try {
      const authorChart = Plot.plot({
        title: "Number of Plays by Author",
        width: 600,
        height: 400,
        x: { label: "Author" },
        y: { label: "Count" },
        marks: [
          Plot.barY(countByAuthor(plays), { x: "author", y: "count", fill: "darkorange" })
        ]
      });
      authorContainer.innerHTML = "";
      authorContainer.appendChild(authorChart);
    } catch (error) {
      console.error("❌ Author chart error:", error);
    }
  }

  // Distribution of plays with or without a prologue.
function countByPrologue(data) {
  const result = { "With Prologue": 0, "Without Prologue": 0 };
  data.forEach(play => {
    if (play.prologue) {
      result["With Prologue"] += 1;
    } else {
      result["Without Prologue"] += 1;
    }
  });
  return Object.entries(result).map(([prologue, count]) => ({ prologue, count }));
}

const prologueContainer = document.getElementById("prologue-chart");
if (prologueContainer) {
  try {
    const prologueChart = Plot.plot({
      title: "Plays with/without Prologue",
      width: 600,
      height: 400,
      x: { label: "Prologue" },
      y: { label: "Count" },
      marks: [
        Plot.barY(countByPrologue(plays), { x: "prologue", y: "count", fill: "purple" })
      ]
    });
    prologueContainer.innerHTML = "";
    prologueContainer.appendChild(prologueChart);
  } catch (error) {
    console.error("❌ Prologue chart error:", error);
  }
}

// Distribution of plays with or without musique/danse/machine effects.
function countByMusique(data) {
  const result = { "With Musique/Danse/Machine": 0, "Without": 0 };
  data.forEach(play => {
    if (play.musique_danse_machine) {
      result["With Musique/Danse/Machine"] += 1;
    } else {
      result["Without"] += 1;
    }
  });
  return Object.entries(result).map(([type, count]) => ({ type, count }));
}

const musiqueContainer = document.getElementById("musique-chart");
if (musiqueContainer) {
  try {
    const musiqueChart = Plot.plot({
      title: "Plays with Musique/Danse/Machine Effects",
      width: 600,
      height: 400,
      x: { label: "Type" },
      y: { label: "Count" },
      marks: [
        Plot.barY(countByMusique(plays), { x: "type", y: "count", fill: "teal" })
      ]
    });
    musiqueContainer.innerHTML = "";
    musiqueContainer.appendChild(musiqueChart);
  } catch (error) {
    console.error("❌ Musique chart error:", error);
  }
}
