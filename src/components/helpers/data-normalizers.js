// Canonical performance shape (what we return):
// {
//   id: string,
//   date: Date,
//   year: number,
//   title: string|null,
//   genre: string|null,
//   author: string|null,     // "Name1 ; Name2" or null
//   place: string|null,      // venue / city / place name where available
//   origin: string           // "french" | "dutch" | "danish"
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
      place: safeStr(place),
      origin: "french"
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
      place: safeStr(place),
      origin: "dutch",
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
  if (!Array.isArray(joined)) return [];

  const perfMeta = new Map(
    Array.isArray(performances)
      ? performances.map(p => [String(p.id), p])
      : []
  );

  const workMeta = new Map(
    Array.isArray(works)
      ? works.map(w => [
          String(w.id),
          {
            title: pickFirst(w.title, w.formatted_title),
            genres: Array.isArray(w.genres)
              ? w.genres.map(g => pickFirst(g?.name, g?.title)).filter(Boolean)
              : []
          }
        ])
      : []
  );

  function joinedAuthors(joinedRow) {
    const AUTHOR_ROLE_WORDS = ["playwright", "librettist", "writer", "forfatter", "author"];
    return uniq(
      (joinedRow?.contributors ?? [])
        .filter(c =>
          (c.role_names ?? []).some(r =>
            AUTHOR_ROLE_WORDS.some(w => String(r).toLowerCase().includes(w))
          )
        )
        .map(c => c.person_name)
        .filter(Boolean)
    );
  }

  return joined.map((row, i) => {
    const perf = perfMeta.get(String(row.performance_id)) ?? {};

    const d = asDate(pickFirst(row.date, perf.date));
    if (!d || isNaN(+d)) return null;

    const workIds = (row.work_ids ?? []).map(String);
    const metas = workIds.map(id => workMeta.get(id)).filter(Boolean);

    const allGenres = uniq(metas.flatMap(m => m.genres ?? []));
    const titleFromWorks = metas.map(m => m.title).filter(Boolean).join("; ");
    const authors = joinedAuthors(row);

    return {
      id: safeStr(pickFirst(row.performance_id, perf.id, `danish-${i}`)),
      date: d,
      year: d.getUTCFullYear(),
      title: safeStr(
        pickFirst(
          row.formatted_title,
          titleFromWorks,
          perf.formatted_title,
          perf.production?.formatted_title
        )
      ),
      genre: safeStr(allGenres[0] ?? null),
      author: safeStr(authors.length ? authors.join(" ; ") : null),
      place: safeStr(
        pickFirst(
          row.place_name,
          perf.place?.name,
          perf.theater,
          perf.venue
        )
      ),
      origin: "danish"
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
