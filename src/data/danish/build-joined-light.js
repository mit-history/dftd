// data/danish/build-joined-light.js
import fs from "node:fs";
import path from "node:path";

const asArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (Array.isArray(v.data)) return v.data; // Strapi sometimes wraps relations
  return [v];
};

const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const ROOT = process.cwd();
const DIR = path.join(ROOT, "data", "danish");

const performancesPath = path.join(DIR, "danish-performances.json");
const productionsPath = path.join(DIR, "danish-productions.json");
const workContribsPath = path.join(DIR, "danish-work-contributors.json");

// Read inputs
const performances = readJSON(performancesPath);
const productions = readJSON(productionsPath);
const workContribs = readJSON(workContribsPath);

// 1) production_id -> work_ids
const prodIdToWorkIds = new Map(
  productions.map((p) => [
    p.id,
    asArray(p.works).map((w) => w?.id).filter(Boolean),
  ])
);

// 2) work_id -> contributors
const workIdToContribs = new Map();
for (const wc of workContribs) {
  const workId = wc.work?.id;
  if (!workId) continue;

  const roleNames = asArray(wc.roles)
    .map((r) => r?.name || r?.title || r?.slug)
    .filter(Boolean);

  const entry = {
    wc_id: wc.id,
    person_id: wc.person?.id ?? null,
    person_name: wc.person?.name ?? null,
    role_names: roleNames,
  };

  if (!workIdToContribs.has(workId)) workIdToContribs.set(workId, []);
  workIdToContribs.get(workId).push(entry);
}

// 3) Build joined-light rows (1 per performance)
const joined = performances.map((p) => {
  const prodId = p.production?.id ?? null;
  const workIds = prodId ? prodIdToWorkIds.get(prodId) || [] : [];

  const contributors = workIds.flatMap((wid) =>
    (workIdToContribs.get(wid) || []).map((c) => ({ work_id: wid, ...c }))
  );

  return {
    performance_id: p.id,
    date: p.date,
    formatted_title: p.formatted_title,

    production_id: prodId,
    production_title: p.production?.formatted_title ?? null,

    place_id: p.place?.id ?? null,
    place_name: p.place?.name ?? null,

    performance_by_id: p.performance_by?.id ?? null,
    performance_by_name: p.performance_by?.name ?? null,

    // normalize tags so you never hit ".map is not a function"
    tag_ids: asArray(p.tags).map((t) => t?.id ?? null),
    tag_names: asArray(p.tags).map((t) => t?.name ?? null),

    work_ids: workIds,
    contributors,
  };
});

// Write output
const outPath = path.join(DIR, "danish-performances-joined-light.json");
fs.writeFileSync(outPath, JSON.stringify(joined));
console.log(
  `✅ Wrote ${path.relative(ROOT, outPath)} with ${joined.length} rows`
);

// Optional quick sanity stats
const hasContribs = joined.filter((r) => (r.contributors || []).length > 0).length;
console.log(`Contrib coverage: ${hasContribs}/${joined.length} performances have ≥1 contributor`);
