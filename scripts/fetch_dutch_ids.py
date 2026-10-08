import sys
import json
import os
import re
import csv
import io
import subprocess
import hashlib
from datetime import date, datetime, timezone
from pathlib import Path
import logging
from bs4 import BeautifulSoup
from functools import lru_cache
from urllib.parse import urlencode, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError

'Query made to https://lod.uba.uva.nl/CREATE/ONSTAGE/sparql'
'To run, execute `python3 scripts/fetch_dutch_ids.py` in terminal; add --restart flag to restart'

ENDPOINT = "https://api.lod.uba.uva.nl/datasets/CREATE/ONSTAGE/services/ONSTAGE/sparql"
HTML_CACHE_DIR = Path(".cache/dutch_html")
NO_AUTHOR_INDEX_PATH = Path("src/data/dutch_plays_without_authors.json")
CSV_FIELDS = ["id", "date", "playTitle", "authorName", "originalTitle", "originalAuthorName", "translatorName", "genre", "fullTitle"]


def inferred_translators(row):
    """Infer translators/adapters from creators only when original authors are known."""
    originals = {name.strip().casefold() for name in (row.get("originalAuthorName") or "").split(";") if name.strip()}
    if not originals:
        return None
    creators = {name.strip() for name in (row.get("authorName") or "").split(";") if name.strip()}
    return "; ".join(sorted(name for name in creators if name.casefold() not in originals)) or None


def backfill_translators(output_path, checkpoint_path, state):
    """Upgrade committed CSV rows and keep the resume byte offset in sync."""
    with output_path.open("rb") as source:
        committed = source.read(state["csv_bytes"]).decode("utf-8")
    committed_count = sum(1 for _ in csv.DictReader(io.StringIO(committed)))
    with output_path.open(encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        if "translatorName" in (reader.fieldnames or []):
            return
        rows = list(reader)
    temporary = output_path.with_suffix(output_path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=CSV_FIELDS)
        writer.writeheader()
        committed_bytes = output.tell()
        for index, row in enumerate(rows, 1):
            row["translatorName"] = inferred_translators(row)
            writer.writerow(row)
            if index == committed_count:
                committed_bytes = output.tell()
    temporary.replace(output_path)
    state["csv_bytes"] = committed_bytes
    save_checkpoint(checkpoint_path, state)
# static definition of number of show entries to update spreadsheet when running parser
BATCH_SIZE = 250
MAX_YEAR = 1815
# increments internal id starting from 1 for chronological purposes
QUERY = """
PREFIX schema: <https://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT ?show ?date ?performance ?work ?fullTitle ?authorName
       ?original ?originalTitle ?originalAuthorName
WHERE {
  {
    SELECT DISTINCT ?show WHERE {
      VALUES ?eventType { schema:TheatreEvent schema:TheaterEvent }
      ?show a ?eventType .
      ?show schema:startDate ?cutoffDate .
      FILTER(STR(?cutoffDate) < "__END_DATE__")
      FILTER(REGEX(STR(?show), "^https?://www[.]vondel[.]humanities[.]uva[.]nl/onstage/shows/[0-9]+$"))
      BIND(xsd:integer(REPLACE(STR(?show), "^.*/", "")) AS ?id)
      FILTER(?id > __LAST_ID__)
    }
    ORDER BY xsd:integer(REPLACE(STR(?show), "^.*/", ""))
    LIMIT __LIMIT__
  }
  OPTIONAL { ?show schema:startDate ?date . }
  OPTIONAL {
    ?show schema:subEvent ?performance .
    OPTIONAL {
      ?performance schema:workPerformed ?work .
      OPTIONAL { ?work schema:headline ?linkedTitle . }
      BIND(IF(isLiteral(?work), STR(?work), ?linkedTitle) AS ?fullTitle)
      OPTIONAL { ?work schema:creator/schema:name ?authorName . }
      OPTIONAL {
        ?work schema:isBasedOn ?original .
        OPTIONAL { ?original schema:headline ?originalTitle . }
        OPTIONAL { ?original schema:creator/schema:name ?originalAuthorName . }
      }
    }
  }
}
"""

# query on sparql endpoint
def request_csv(query):
    url = ENDPOINT + "?" + urlencode({"query": query})
    request = Request(url, headers={"Accept": "text/csv"})
    try:
        with urlopen(request, timeout=60) as response:
            encoding = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(encoding)
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"SPARQL HTTP {error.code}: {detail}") from error


# query on sparql endpoint
def query_sparql(last_id=0):
    query = QUERY.replace("__LIMIT__", str(BATCH_SIZE)).replace("__LAST_ID__", str(last_id)).replace("__END_DATE__", f"{MAX_YEAR + 1}-01-01")
    return request_csv(query)


def migrate_checkpoint(state):
    # recover the exact final show of the old batch
    last_id = 0
    if state["offset"]:
        query = """
PREFIX schema: <https://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT DISTINCT ?show WHERE {
  VALUES ?eventType { schema:TheatreEvent schema:TheaterEvent }
  ?show a ?eventType .
  FILTER(REGEX(STR(?show), "^https?://www[.]vondel[.]humanities[.]uva[.]nl/onstage/shows/[0-9]+$"))
}
ORDER BY xsd:integer(REPLACE(STR(?show), "^.*/", ""))
""" + f"LIMIT 1 OFFSET {state['offset'] - 1}"
        records = list(csv.DictReader(io.StringIO(request_csv(query))))
        if len(records) != 1:
            raise ValueError("Could not recover the old checkpoint's last show ID.")
        last_id = int(urlsplit(records[0]["show"]).path.rsplit("/", 1)[-1])
    return {**state, "version": 3, "last_id": last_id}

# extract webpage html from `vondel.humanities.uva.nl`
def fetch_webpage(url):
    """Reuse successful HTML downloads, including pages without author metadata."""
    # A fragment identifies a section of the same downloaded page.
    page_url = url.split("#", 1)[0]
    cache_path = HTML_CACHE_DIR / (hashlib.sha256(page_url.encode()).hexdigest() + ".html")
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--location",
         "--max-time", "30", "--header", "Accept: text/html", page_url],
        check=True, capture_output=True, encoding="utf-8",
    )
    HTML_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    temporary = cache_path.with_suffix(".tmp")
    temporary.write_text(result.stdout, encoding="utf-8")
    temporary.replace(cache_path)
    return result.stdout

# uses bs4 to parse html data on university page
def parse_metadata(html):
    soup = BeautifulSoup(html, "html.parser")
    date = soup.select_one('time[property~="schema:startDate"]')
    title = soup.select_one('[property~="schema:headline"]')
    links = {}
    for relation in ("schema:workPerformed", "schema:creator", "schema:isBasedOn"):
        links[relation] = [
            (anchor.get("href"), anchor.get_text(" ", strip=True) or None)
            for anchor in soup.select(f'a[rel~="{relation}"]')
        ]
    return {
        "date": (date.get("datetime") or None) if date else None,
        "title": title.get_text(" ", strip=True) or None if title else None,
        "line": date.sourceline if date else None,
        "links": links,
    }


def webpage_link(base, link):
    parts = urlsplit(urljoin(base, link))
    return urlunsplit(("https", parts.netloc, parts.path, parts.query, parts.fragment))


@lru_cache(maxsize=None)
def get_play_data(url):
    play_id = urlsplit(url).path.rstrip("/").rsplit("/", 1)[-1]
    entry = load_no_author_index().get(play_id)
    if entry:
        return entry["metadata"]
    return parse_metadata(fetch_webpage(url))


@lru_cache(maxsize=1)
def load_no_author_index():
    path = NO_AUTHOR_INDEX_PATH
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}

# indexes and stores cached plays for faster runs
def compile_no_author_index():
    index = dict(load_no_author_index())
    checked = 0
    for path in HTML_CACHE_DIR.glob("*.html"):
        html = path.read_text(encoding="utf-8")
        match = re.search(r'<div\b[^>]*\bid=["\']kader["\'][^>]*\babout=["\']https?://(?:www\.)?vondel\.humanities\.uva\.nl/onstage/plays/(\d+)["\']', html)
        if not match:
            continue
        checked += 1
        metadata = parse_metadata(html)
        if not any(name for _, name in metadata["links"]["schema:creator"]):
            index[match[1]] = {
                "sourceUrl": f"https://www.vondel.humanities.uva.nl/onstage/plays/{match[1]}",
                "observedAt": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
                "metadata": metadata,
            }
        else:
            index.pop(match[1], None)
    output = NO_AUTHOR_INDEX_PATH
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    temporary.replace(output)
    load_no_author_index.cache_clear()
    get_play_data.cache_clear()
    print(f"Checked {checked} cached play pages; {len(index)} have no creator names. Saved to {output}")
    return index

# statically define genres to isolate from title
GENRES = (
    "treurspel", "blyspel", "blijspel", "kluchtspel", "klucht", "zinnespel",
    "tragedie", "tragédie", "comédie", "comedie", "pantomime", "ballet",
    "tooneelspel", "toneelspel", "drama", "indisch blijspel", "zangspel",
    "opera", "opéra", "operette", "komedie", "melodrama", "spel",
    "blyspél", "kluchtspél", "treurspél", "bly-spel", "treur-spel", "zang-spel",
    "bly-eyndend-treurspel", "bly-eyndigh treur-spel", "kluchtig blyspél",
    "blijspel met zang", "blyspel; met zang", "opera bouffon",
    "groote opera", "groote opéra", "groot melodrama",
    "oorspronkelijk tooneelspel", "historisch tooneelspel", "historisch drama",
    "geschiedkundig tooneelspel", "romantisch tooneelspel",
    "ballet-pantomime", "groot ballet-pantomime", "nieuw groot ballet-pantomime",
    "nieuw groot toover-ballet-pantomime", "komiek ballet-pantomime",
    "groot balletpantomime", "groot arlequinade-balletpantomime",
    "blijspel in vijf bedrijven", "tooneelspel in vijf bedrijven",
    "romantisch toneelspel in vier bedrijven, met dansen en koren",
)

# remove trailing `translated by` annotations and genre
def split_genre(title):
    if not title:
        return title, None
    title = re.sub(
        r"(?:\s*\[[^\[\]]*\bby\b[^\[\]]*\])+\s*$",
        "", title, flags=re.IGNORECASE,
    ).strip()
    genres = "|".join(re.escape(genre) for genre in sorted(GENRES, key=len, reverse=True))
    match = re.fullmatch(rf"(.+?)(?:\s*[.;,]\s*|\s+)({genres})\.?", title, re.IGNORECASE)
    if not match:
        return title, None
    name, genre = match.groups()
    return name.strip(), genre.lower()

# synthesize show entry
def performance_rows(link, html):
    show = parse_metadata(html)
    if show["date"] is None:
        logging.warning("%s: missing date (HTML line %s)", link, show["line"])
    if not show["links"]["schema:workPerformed"]:
        logging.warning("%s: no performed works found", link)
    rows = []
    for play_link, label in show["links"]["schema:workPerformed"]:
        play_url = webpage_link(link, play_link)
        play = get_play_data(play_url)
        full_title = play["title"] or label
        title, genre = split_genre(full_title)
        originals = play["links"]["schema:isBasedOn"] or [(None, None)]
        for original_link, original_label in originals:
            original = get_play_data(webpage_link(play_url, original_link)) if original_link else None
            row = {
                "id": int(urlsplit(link).path.rstrip("/").rsplit("/", 1)[-1]),
                "date": show["date"],
                "playTitle": title,
                "authorName": "; ".join(name for _, name in play["links"]["schema:creator"] if name) or None,
                "originalTitle": (original["title"] or original_label) if original else None,
                "originalAuthorName": ("; ".join(name for _, name in original["links"]["schema:creator"] if name) or None) if original else None,
                "genre": genre,
                "fullTitle": full_title,
            }
            for field, value in row.items():
                if field in ("originalTitle", "originalAuthorName") and not play["links"]["schema:isBasedOn"]:
                    continue
                if value is None and field != "genre":
                    logging.warning("%s (%s): missing %s", link, play_url, field)
            row["translatorName"] = inferred_translators(row)
            rows.append(row)
    return rows

@lru_cache(maxsize=250)
def get_show_html(url):
    return fetch_webpage(url)


def fill_from_html(row, show_url, performance_url, work, original_url):
    soup = BeautifulSoup(get_show_html(show_url), "html.parser")
    fragment = urlsplit(performance_url or "").fragment
    anchor = None
    if fragment:
        node = soup.find(attrs={"resource": f"#{fragment}"}) or soup.find(attrs={"about": f"#{fragment}"})
        if node:
            anchor = node.select_one('a[rel~="schema:workPerformed"][href]')
    if anchor is None and not fragment:
        candidates = []
        for candidate in soup.select('a[rel~="schema:workPerformed"][href]'):
            if work.startswith(("http://", "https://")):
                matches = webpage_link(show_url, candidate["href"]) == webpage_link(show_url, work)
            else:
                matches = candidate.get_text(" ", strip=True) == work.strip()
            if matches:
                candidates.append(candidate)
        if len(candidates) == 1:
            anchor = candidates[0]
    if anchor is None:
        return
    play_url = webpage_link(show_url, anchor["href"])
    play = get_play_data(play_url)
    row["authorName"] = "; ".join(sorted({name for _, name in play["links"]["schema:creator"] if name})) or None
    if play["title"] and (not row["fullTitle"] or not work.startswith(("http://", "https://"))):
        row["fullTitle"] = play["title"]
        row["playTitle"], row["genre"] = split_genre(play["title"])
    originals = play["links"]["schema:isBasedOn"]
    if original_url:
        originals = [(link, label) for link, label in originals if link and webpage_link(play_url, link) == webpage_link(play_url, original_url)]
    if len(originals) == 1 and originals[0][0]:
        original_link, label = originals[0]
        original = get_play_data(webpage_link(play_url, original_link))
        row["originalTitle"] = row["originalTitle"] or original["title"] or label
        row["originalAuthorName"] = row["originalAuthorName"] or "; ".join(sorted({name for _, name in original["links"]["schema:creator"] if name})) or None


def parse_api_rows(records, html_fallback=False):
    grouped = {}
    for record in records:
        if not record.get("work"):
            logging.warning("%s: no performed work", record["show"])
            continue
        key = tuple(record.get(field) for field in ("show", "date", "performance", "work", "original", "fullTitle", "originalTitle"))
        if key not in grouped:
            title, genre = split_genre(record.get("fullTitle") or None)
            grouped[key] = {
                "id": int(urlsplit(record["show"]).path.rstrip("/").rsplit("/", 1)[-1]),
                "date": record.get("date") or None,
                "playTitle": title,
                "authorName": set(),
                "originalTitle": record.get("originalTitle") or None,
                "originalAuthorName": set(),
                "genre": genre,
                "fullTitle": record.get("fullTitle") or None,
            }
        for field in ("authorName", "originalAuthorName"):
            if record.get(field):
                grouped[key][field].add(record[field])
    rows = []
    for key, row in grouped.items():
        for field in ("authorName", "originalAuthorName"):
            row[field] = "; ".join(sorted(row[field])) or None
        if html_fallback and not row["authorName"]:
            try:
                fill_from_html(row, key[0], key[2], key[3], key[4])
            except (OSError, subprocess.CalledProcessError, UnicodeError) as error:
                logging.warning("show %s: HTML fallback failed: %s", row["id"], getattr(error, "stderr", None) or error)
        for field in ("date", "playTitle", "authorName"):
            if row[field] is None:
                logging.warning("show %s (%s): missing %s", row["id"], row["fullTitle"] or "untitled work", field)
        if key[4]:
            for field in ("originalTitle", "originalAuthorName"):
                if row[field] is None:
                    logging.warning("show %s (%s): missing %s", row["id"], row["fullTitle"] or "untitled work", field)
        row["translatorName"] = inferred_translators(row)
        rows.append(row)
    return rows


def save_checkpoint(path, state):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(state, indent=2), encoding="utf-8")
    temporary.replace(path)


# executes spreadsheet generation/update of parsed data
def name_output_by_year(output_path, checkpoint_path):
    years = []
    with output_path.open(encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            try:
                years.append(date.fromisoformat(row["date"]).year)
            except (ValueError, TypeError):
                continue
    if not years:
        return output_path
    target = output_path.with_name(f"dutch_data_{min(years)}_{max(years)}.csv")
    if target != output_path:
        if target.exists():
            raise FileExistsError(f"Refusing to overwrite existing dataset: {target}")
        output_path.rename(target)
    if checkpoint_path.exists():
        state = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        state["output_file"] = target.name
        save_checkpoint(checkpoint_path, state)
    return target


def main(output_path=Path("src/data/dutch_show_data.csv"), restart=False):
    automatic_name = output_path == Path("src/data/dutch_show_data.csv")
    checkpoint_path = output_path.with_suffix(".checkpoint.json")
    state = {"version": 3, "last_id": 0, "offset": 0, "row_count": 0, "csv_bytes": 0}
    resume = checkpoint_path.exists() and not restart
    if resume:
        state = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        if state.get("output_file"):
            output_path = output_path.with_name(state["output_file"])
        if state.get("version") == 2:
            state = migrate_checkpoint(state)
        elif state.get("version") != 3:
            raise ValueError("Old HTML checkpoint cannot be resumed with the new query. Run with --restart.")
        if not output_path.exists() or output_path.stat().st_size < state["csv_bytes"]:
            raise ValueError("CSV is missing or shorter than its checkpoint; restore it before resuming.")
        print(f"Resuming after {state['offset']} shows", file=sys.stderr)
    if resume:
        # Discard rows written after the last completed batch to avoid duplicates.
        with output_path.open("r+b") as output:
            output.truncate(state["csv_bytes"])
        backfill_translators(output_path, checkpoint_path, state)
    records = list(csv.DictReader(io.StringIO(query_sparql(state["last_id"]))))
    with output_path.open("a" if resume else "w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=CSV_FIELDS)
        if not resume:
            writer.writeheader()
            output.flush()
            os.fsync(output.fileno())
            state["csv_bytes"] = output_path.stat().st_size
            save_checkpoint(checkpoint_path, state)
        while records:
            rows = parse_api_rows(records, html_fallback=True)
            rows.sort(key=lambda row: row["id"])
            writer.writerows(rows)
            output.flush()
            os.fsync(output.fileno())
            state["row_count"] += len(rows)
            state["offset"] += len({record["show"] for record in records})
            state["last_id"] = max(int(urlsplit(record["show"]).path.rsplit("/", 1)[-1]) for record in records)
            state["csv_bytes"] = output_path.stat().st_size
            save_checkpoint(checkpoint_path, state)
            print(f"Saved {state['row_count']} performance rows; checked {state['offset']} shows", file=sys.stderr)
            records = list(csv.DictReader(io.StringIO(query_sparql(state["last_id"]))))
    if automatic_name:
        output_path = name_output_by_year(output_path, checkpoint_path)
    print(f"Finished: {output_path}", file=sys.stderr)


if __name__ == "__main__":
    if "--index-cache" in sys.argv[1:]:
        compile_no_author_index()
    elif "--rename-output" in sys.argv[1:]:
        output = Path("src/data/dutch_show_data.csv")
        checkpoint = output.with_suffix(".checkpoint.json")
        if checkpoint.exists():
            state = json.loads(checkpoint.read_text(encoding="utf-8"))
            output = output.with_name(state.get("output_file", output.name))
        print(name_output_by_year(output, checkpoint))
    else:
        main(restart="--restart" in sys.argv[1:])
