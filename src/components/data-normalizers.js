// src/components/data-normalizers.js
// Canonical normalization for dataset-specific schemas.
// Goal: every visualization can rely on the same fields.
//
// Canonical performance shape (what we return):
// {
//   id: string,
//   date: Date,
//   year: number,
//   title: string|null,
//   genre: string|null,
//   author: string|null,     // "Name1 ; Name2" or null
//   place: string|null,      // venue / city / place name where available
// }

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function pickFirst(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== "") return v;
  return null;
}

function safeStr(x) {
  return (x === undefined || x === null) ? null : String(x);
}

// -----------------------------
// French
// -----------------------------
export function normalizeFrench(raw, asDate) {
  // raw can be either:
  // - french-performances.json (already fairly normalized)
  // - french-plays.json (older shape)
  if (!Array.isArray(raw)) return [];

  return raw.map((r, i) => {
    const d = asDate(pickFirst(r.date, r.startDate, r.start_date, r.performance_date));
    if (!d || isNaN(+d)) return null;

    const year = pickFirst(r.year, d.getUTCFullYear());
    const title = pickFirst(
      r.title,
      r.headline,
      r.playTitle,
      r.production?.formatted_title,
      r.formatted_title
    );

    // Author fields vary; keep as a single string, later split by " ; " where needed.
    const author = pickFirst(
      r.author,
      r.authorName,
      r.originalAuthorName,
      r.original_author,
      r.playAuthor
    );

    const genre = pickFirst(
      r.genre,
      r.genre_name,
      r.category,
      r.type
    );

    const place = pickFirst(
      r.place?.name,
      r.place,
      r.theater,
      r.venue,
      r.city
    );

    return {
      id: safeStr(pickFirst(r.id, `french-${i}`)),
      date: d,
      year: +year,
      title: safeStr(title),
      genre: safeStr(genre),
      author: safeStr(author),
      place: safeStr(place)
    };
  }).filter(Boolean);
}

// -----------------------------
// Dutch
// -----------------------------
export function normalizeDutch(rawRows, asDate) {
  if (!Array.isArray(rawRows)) return [];

  return rawRows.map((r, i) => {
    const d = asDate(pickFirst(
      r.date, r.Date, r.performance_date, r.start_date, r.startDate
    ));
    if (!d || isNaN(+d)) return null;

    const year = pickFirst(r.year, r.Year, d.getUTCFullYear());
    const title = pickFirst(r.title, r.Title, r.originalTitle, r.playTitle, r.play, r.Play);
    const author = pickFirst(r.author, r.authorName, r.originalAuthorName, r.original_author);

    const genre = pickFirst(r.genre, r.Genre, r.category, r.type);

    const place = pickFirst(
      r.place, r.Place, r.theater, r.Theater, r.venue, r.Venue, r.city, r.City
    );

    return {
      id: safeStr(pickFirst(r.id, r.ID, `dutch-${i}`)),
      date: d,
      year: +year,
      title: safeStr(title),
      genre: safeStr(genre),
      author: safeStr(author),
      place: safeStr(place)
    };
  }).filter(Boolean);
}

// -----------------------------
// Danish (joined-light pipeline)
// -----------------------------
// Expects:
// - performances: danish-performances.json
// - works: danish-works.json
// - joined: danish-performances-joined-light.json (output of build-joined-light.js)
//
// joined rows contain:
// { performance_id, work_ids: [...], contributors: [{ person_name, role_names:[...] }, ...] }
export function normalizeDanishJoinedLight({ performances, works, joined }, asDate) {
  if (!Array.isArray(performances) || !Array.isArray(works) || !Array.isArray(joined)) return [];

  const perfIdToJoined = new Map(joined.map(r => [String(r.performance_id), r]));

  // workId -> { title, genres: [...] }
  const workMeta = new Map(
    works.map(w => [
      String(w.id),
      {
        title: pickFirst(w.title, w.formatted_title),
        genres: (w.genres ?? []).map(g => pickFirst(g?.name, g?.title)).filter(Boolean)
      }
    ])
  );

  function joinedAuthors(joinedRow) {
    // Adjust these keywords if your role list changes.
    const AUTHOR_ROLE_WORDS = ["composer", "playwright", "librettist", "writer", "forfatter", "author"];
    const names = (joinedRow?.contributors ?? [])
      .filter(c => (c.role_names ?? []).some(r =>
        AUTHOR_ROLE_WORDS.some(w => String(r).toLowerCase().includes(w))
      ))
      .map(c => c.person_name)
      .filter(Boolean);

    return uniq(names);
  }

  return performances.map((perf, i) => {
    const d = asDate(perf.date);
    if (!d || isNaN(+d)) return null;

    const joinedRow = perfIdToJoined.get(String(perf.id));
    const workIds = (joinedRow?.work_ids ?? []).map(String);

    const metas = workIds.map(id => workMeta.get(id)).filter(Boolean);
    const allGenres = metas.flatMap(m => m.genres ?? []);
    const titleFromWorks = metas.map(m => m.title).filter(Boolean).join("; ");

    const authors = joinedAuthors(joinedRow);

    return {
      id: safeStr(pickFirst(perf.id, `danish-${i}`)),
      date: d,
      year: d.getUTCFullYear(),
      title: safeStr(pickFirst(
        titleFromWorks,
        perf.formatted_title,
        perf.production?.formatted_title
      )),
      genre: safeStr(allGenres.length ? allGenres[0] : null),
      author: safeStr(authors.length ? authors.join(" ; ") : null),
      place: safeStr(pickFirst(perf.place?.name, perf.theater, perf.venue))
    };
  }).filter(Boolean);
}

// -----------------------------
// Helpers for UI (optional)
// -----------------------------
export function splitAuthorString(author) {
  if (!author) return [];
  return String(author).split(" ; ").map(s => s.trim()).filter(Boolean);
}
