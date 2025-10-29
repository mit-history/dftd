// danish-performances.csv.js
// node script to join works + performances and write CSV with year column

import { csvFormat } from "d3-dsv";
import { readFile } from "fs";

readFile("src/data/danish-works.json", "utf8", (err, worksRaw) => {
  if (err) {
    console.error("Error reading danish-works.json:", err);
    return;
  }

  const workMap = new Map(JSON.parse(worksRaw).map(work => [work.id, work]));

  readFile("src/data/danish-performances.json", "utf8", (err2, perfRaw) => {
    if (err2) {
      console.error("Error reading danish-performances.json:", err2);
      return;
    }

    const collection = JSON.parse(perfRaw);

    const features = collection.map(f => {
      const dateObj = new Date(f.date);
      const work_objs = f.production.works.map(
        work => workMap.get(work.id.toString())
      );

      return {
        id: f.id,
        date: dateObj.toISOString(),          // keep full ISO timestamp
        year: dateObj.getFullYear(),          // <- this is what we'll filter on later
        title: f.production.works.map(work => work.title).join("; "),
        genre: work_objs.map(w => w?.genres?.[0]?.name ?? null).join("; "),
        place: f.place?.name ?? null,
        author: work_objs
          .map(w => w?.contributors?.map(c => c.person?.name).join("|"))
          .join("; ")
      };
    });

    // Debug so we can see the range in terminal
    const years = features.map(d => d.year).filter(y => !isNaN(y));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    console.error("YEAR RANGE:", minYear, "→", maxYear);

    // Write CSV to stdout
    process.stdout.write(csvFormat(features));
  });
});
