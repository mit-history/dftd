# Data Documentation

- This file is meant to help keep track of how we're sourcing and/or keeping track of each of the datasets
and associated files.

## Dutch Data
- Source: SPARQL query
    - The query and the link to the api are in data/dutch/dutch_source.md
- File: data/dutch/dutch_performances.csv
- Columns:
  - date
  - title
  - author
  - originalTitle
  - originalAuthor

## French Data
- Generated via script
- File: data/french/french-performances.json

## Danish Data
- Pre-joined dataset

- genres script, get token by pasting this script into console:
- Object.keys(localStorage).forEach((key) => {
  if (/auth|token|jwt|admin/i.test(key)) {
    console.log(key, localStorage.getItem(key));
  }
})
- genres generating
(async () => {
  const BASE = "https://artex.au.dk/strapi";
  const UID = "api::work-genre.work-genre";
  const TOKEN = "PASTE_YOUR_JWTTOKEN_HERE";

  async function fetchAll(label) {
    let page = 1;
    let pageCount = 1;
    const results = [];

    while (page <= pageCount) {
      const url =
        `${BASE}/content-manager/collection-types/${UID}` +
        `?page=${page}&pageSize=100&sort=name:ASC`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Authorization": `Bearer ${TOKEN}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed ${label} page ${page}: ${res.status}\n${text}`);
      }

      const json = await res.json();
      results.push(...(json.results || []));
      pageCount = json.pagination?.pageCount || 1;
      page++;
    }

    return results;
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const rows = await fetchAll("genres");
  console.log("Downloaded rows:", rows.length);
  console.log("First rows:", rows.slice(0, 3));
  downloadJSON(rows, "genres-raw.json");
})();
