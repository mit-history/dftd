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



/*
📜 RECORDS NOTE: How danish-performances.json was generated with up-to-date information
Data exported on November 2, 2025 via the Strapi admin console.

Steps:
 Open Strapi dashboard → Performances collection
 Open browser DevTools → Console
 Paste the export script (see below)
 File downloaded as 'performances-from-admin.json'

Script used:

  (async () => {
    const raw = localStorage.getItem('jwtToken');
    const TOKEN = raw ? JSON.parse(raw) : null;
    if (!TOKEN) return console.error('no token');

    const baseUrl = 'https://artex.au.dk/strapi';
    const uid = 'api::performance.performance';
    const pageSize = 100;
    let page = 1;
    let pageCount = 1;
    const all = [];

    while (page <= pageCount) {
      const url =
        `${baseUrl}/content-manager/collection-types/${encodeURIComponent(uid)}` +
        `?page=${page}` +
        `&pageSize=${pageSize}` +
        `&sort=date:ASC` +
        `&populate=*`;              // 👈 THIS is the key part

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/json'
        }
      });

      const json = await res.json();
      const items = json.results || json.data || [];
      const pagination = json.pagination || (json.meta && json.meta.pagination) || {};
      all.push(...items);
      pageCount = pagination.pageCount || pageCount;
      page++;
    }

    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'performances-populated.json';
    a.click();
  })();

  */
