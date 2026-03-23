import fs from "fs";

const performances = JSON.parse(fs.readFileSync("./danish-performances.json", "utf8"));
const productions = JSON.parse(fs.readFileSync("./danish-productions.json", "utf8"));
const works = JSON.parse(fs.readFileSync("./danish-works.json", "utf8"));
const genresRaw = JSON.parse(fs.readFileSync("./danish_genres.json", "utf8"));
const workContributors = JSON.parse(fs.readFileSync("./danish-work-contributors.json", "utf8"));

function attrs(obj) {
  return obj?.attributes || obj || {};
}

function rel(obj) {
  if (!obj) return null;
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data) return obj.data;
  return obj;
}

function arr(obj) {
  if (!obj) return [];
  return Array.isArray(obj) ? obj : [obj];
}

function getId(obj) {
  return obj?.id ?? null;
}

function getName(obj) {
  const a = attrs(obj);
  return (
    a.name ||
    a.title ||
    a.full_name ||
    a.fullName ||
    a.label ||
    a.formatted_title ||
    null
  );
}

function getDateValue(perf) {
  const a = attrs(perf);
  return a.date ?? a.performance_date ?? a.when ?? null;
}

function parseDateInfo(raw) {
  if (raw == null) return { date: null, year: null };

  if (typeof raw === "string") {
    const s = raw.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return { date: s, year: Number(s.slice(0, 4)) };
    }

    if (/^\d{4}$/.test(s)) {
      return { date: `${s}-01-01`, year: Number(s) };
    }

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return {
        date: d.toISOString().slice(0, 10),
        year: d.getUTCFullYear()
      };
    }
  }

  if (typeof raw === "number") {
    if (raw >= 1000 && raw <= 3000) {
      return { date: `${raw}-01-01`, year: raw };
    }
  }

  return { date: null, year: null };
}

function roleLooksLikeAuthor(role) {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes("author") ||
    r.includes("auteur") ||
    r.includes("writer") ||
    r.includes("playwright") ||
    r.includes("librettist") ||
    r.includes("forfatter")
  );
}

const worksById = new Map();

for (const work of works) {
  worksById.set(getId(work), {
    work_id: getId(work),
    work_title: getName(work),
    raw: work
  });
}

const productionsById = new Map();

for (const production of productions) {
  const a = attrs(production);

  const relatedWorks = arr(rel(a.works || a.work));
  const workIds = relatedWorks.map(getId).filter(Boolean);

  productionsById.set(getId(production), {
    production_id: getId(production),
    production_title: getName(production),
    work_ids: workIds,
    raw: production
  });
}

const contributorsByWorkId = new Map();

for (const row of workContributors) {
  const a = attrs(row);

  const work = rel(a.work || a.works);
  const person = rel(a.person || a.people || a.contributor);
  const roles = arr(rel(a.roles || a.role))
    .map(getName)
    .filter(Boolean);

  const workId = getId(work);
  if (!workId) continue;

  const entry = {
    person_name: getName(person),
    roles
  };

  if (!contributorsByWorkId.has(workId)) {
    contributorsByWorkId.set(workId, []);
  }

  contributorsByWorkId.get(workId).push(entry);
}

const genresByWorkId = new Map();

for (const genre of genresRaw) {
  const a = attrs(genre);
  const genreName = a.name || a.title || a.label || null;

  const relatedWorks = arr(rel(a.works || a.work));

  for (const work of relatedWorks) {
    const workId = getId(work);
    if (!workId || !genreName) continue;

    if (!genresByWorkId.has(workId)) {
      genresByWorkId.set(workId, new Set());
    }

    genresByWorkId.get(workId).add(genreName);
  }
}

const joined = [];

for (const perf of performances) {
  const a = attrs(perf);

  const rawDate = getDateValue(perf);
  const { date, year } = parseDateInfo(rawDate);

  if (year == null || year < 1748 || year > 1798) continue;

  const production = rel(a.production);
  const place = rel(a.place || a.venue || a.location);

  const productionId = getId(production);
  const productionInfo = productionsById.get(productionId) || null;

  const workIds =
    productionInfo?.work_ids?.length
      ? productionInfo.work_ids
      : [null];

  for (const workId of workIds) {
    const workInfo = workId ? worksById.get(workId) || null : null;
    const contributors = workId ? contributorsByWorkId.get(workId) || [] : [];
    const genres = workId ? Array.from(genresByWorkId.get(workId) || []) : [];

    const authors = contributors
      .filter(c => c.roles.some(roleLooksLikeAuthor))
      .map(c => c.person_name)
      .filter(Boolean);

    joined.push({
      performance_id: getId(perf),
      date,
      year,
      venue: getName(place),
      venue_id: getId(place),
      production_id: productionId,
      production_title: productionInfo?.production_title || getName(production),
      work_id: workInfo?.work_id || null,
      work_title: workInfo?.work_title || null,
      genres,
      contributors,
      authors
    });
  }
}

fs.writeFileSync(
  "./performances-1748-1798.json",
  JSON.stringify(joined, null, 2),
  "utf8"
);

console.log(`Wrote performances-1748-1798.json with ${joined.length} rows`);

function csvEscape(value) {
  if (value == null) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function flattenContributors(contributors) {
  return contributors
    .map(c => {
      const roles = (c.roles || []).join("|");
      return roles ? `${c.person_name} (${roles})` : c.person_name;
    })
    .join("; ");
}

const csvRows = [[
  "performance_id",
  "date",
  "year",
  "venue",
  "venue_id",
  "production_id",
  "production_title",
  "work_id",
  "work_title",
  "genres",
  "authors",
  "contributors"
].join(",")];

for (const row of joined) {
  csvRows.push([
    csvEscape(row.performance_id),
    csvEscape(row.date),
    csvEscape(row.year),
    csvEscape(row.venue),
    csvEscape(row.venue_id),
    csvEscape(row.production_id),
    csvEscape(row.production_title),
    csvEscape(row.work_id),
    csvEscape(row.work_title),
    csvEscape(row.genres.join("; ")),
    csvEscape(row.authors.join("; ")),
    csvEscape(flattenContributors(row.contributors))
  ].join(","));
}

fs.writeFileSync(
  "./performances-1748-1798.csv",
  csvRows.join("\n"),
  "utf8"
);

console.log("Wrote performances-1748-1798.csv");
