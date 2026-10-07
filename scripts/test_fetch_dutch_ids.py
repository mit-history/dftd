import csv
import json
import tempfile
import unittest
import subprocess
from pathlib import Path
from unittest.mock import patch

import fetch_dutch_ids as extraction


SHOW_URL = "https://www.vondel.humanities.uva.nl/onstage/shows/9999"
SHOW_HTML = '''<time property="schema:startDate" datetime="1752-09-23"></time>
<a rel="schema:workPerformed" href="../plays/476">Andromaché</a>'''


class ParsingTests(unittest.TestCase):
    def test_query_caps_shows_before_pagination_at_end_of_1800(self):
        with patch.object(extraction, "request_csv", return_value="show\n") as request:
            extraction.query_sparql(123)
        query = request.call_args.args[0]
        self.assertIn('FILTER(STR(?cutoffDate) < "1801-01-01")', query)
        self.assertLess(query.index('?show schema:startDate ?cutoffDate'), query.index('LIMIT 250'))
        self.assertIn('FILTER(?id > 123)', query)

    def test_additional_observed_genres(self):
        cases = [
            ("A play; tooneelspel", "A play", "tooneelspel"),
            ("A play, drama", "A play", "drama"),
            ("A play. Indisch blijspel", "A play", "indisch blijspel"),
            ("A play, Zangspel", "A play", "zangspel"),
            ("A play, nieuw groot ballet-pantomime", "A play", "nieuw groot ballet-pantomime"),
            ("A play, blyspel; met zang", "A play", "blyspel; met zang"),
            ("A play, of Stantvastige liefde", "A play, of Stantvastige liefde", None),
        ]
        for title, expected_title, expected_genre in cases:
            with self.subTest(title=title):
                self.assertEqual(extraction.split_genre(title), (expected_title, expected_genre))

    def test_normal_title(self):
        self.assertEqual(extraction.split_genre("Andromaché"), ("Andromaché", None))

    def test_missing_author(self):
        play = extraction.parse_metadata('<h1 property="schema:headline">Andromaché</h1>')
        with patch.object(extraction, "get_play_data", return_value=play), patch.object(extraction.logging, "warning") as warning:
            row = extraction.performance_rows(SHOW_URL, SHOW_HTML)[0]
        self.assertIsNone(row["authorName"])
        self.assertEqual(row["playTitle"], "Andromaché")
        self.assertEqual([call.args[-1] for call in warning.call_args_list], ["authorName"])

    def test_genre_suffix(self):
        self.assertEqual(extraction.split_genre("Andromaché. Treurspel"), ("Andromaché", "treurspel"))

    def test_genre_and_translation_suffix(self):
        self.assertEqual(extraction.split_genre("Andromaché. Treurspel [tr. by L. Meijer]"), ("Andromaché", "treurspel"))

    def test_translation_suffix_only(self):
        self.assertEqual(extraction.split_genre("Andromaché [tr. by L. Meijer]"), ("Andromaché", None))

    def test_title_punctuation_and_unknown_genre_are_preserved(self):
        for title in ["De dood van sultan Selim, Turksen keizer", "A title. Unknown genre", "A title; another part", "De toets der minnaars in het konstpaleis van Fenix"]:
            with self.subTest(title=title):
                self.assertEqual(extraction.split_genre(title), (title, None))

class CacheTests(unittest.TestCase):
    def test_no_author_index_uses_play_record_and_reuses_metadata(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(extraction, "HTML_CACHE_DIR", Path(directory)), patch.object(extraction, "NO_AUTHOR_INDEX_PATH", Path(directory) / "shared.json"):
            path = Path(directory) / "play.html"
            path.write_text('''<div id="kader" about="https://www.vondel.humanities.uva.nl/onstage/plays/24"><h1 property="schema:headline">Play</h1></div>''')
            (Path(directory) / "show.html").write_text('''<div id="kader" about="https://www.vondel.humanities.uva.nl/onstage/shows/1"><a href="../plays/99">Play</a></div>''')
            extraction.load_no_author_index.cache_clear()
            extraction.get_play_data.cache_clear()
            try:
                index = extraction.compile_no_author_index()
                self.assertEqual(set(index), {"24"})
                path.unlink()
                with patch.object(extraction, "fetch_webpage") as fetch:
                    metadata = extraction.get_play_data("https://www.vondel.humanities.uva.nl/onstage/plays/24")
                self.assertEqual(metadata["title"], "Play")
                fetch.assert_not_called()
            finally:
                extraction.load_no_author_index.cache_clear()
                extraction.get_play_data.cache_clear()

    def test_page_without_author_is_downloaded_only_once(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(extraction, "HTML_CACHE_DIR", Path(directory)), patch.object(extraction.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, stdout='<h1 property="schema:headline">Play</h1>')) as download:
            first = extraction.fetch_webpage("https://example.com/plays/1")
            second = extraction.fetch_webpage("https://example.com/plays/1#location")
            self.assertEqual(first, second)
            self.assertEqual(extraction.parse_metadata(second)["links"]["schema:creator"], [])
            download.assert_called_once()

    def test_failed_download_is_not_cached(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(extraction, "HTML_CACHE_DIR", Path(directory)), patch.object(extraction.subprocess, "run", side_effect=[subprocess.CalledProcessError(22, "curl"), subprocess.CompletedProcess([], 0, stdout="HTML")]) as download:
            with self.assertRaises(subprocess.CalledProcessError):
                extraction.fetch_webpage("https://example.com/plays/1")
            self.assertEqual(list(Path(directory).iterdir()), [])
            self.assertEqual(extraction.fetch_webpage("https://example.com/plays/1"), "HTML")
            self.assertEqual(download.call_count, 2)


class ApiTests(unittest.TestCase):
    def test_missing_author_uses_exact_performance_html_link(self):
        record = {"show": SHOW_URL, "date": "1752-09-23", "performance": SHOW_URL + "#rank2", "work": "Sesostris", "fullTitle": "Sesostris"}
        show = '''<li resource="#rank1"><a rel="schema:workPerformed" href="../plays/1">Other play</a></li>
        <li resource="#rank2"><a rel="schema:workPerformed" href="../plays/766">Sesostris</a></li>'''
        play = extraction.parse_metadata('<h1 property="schema:headline">Sesostris, koning van Egipte, treurspel</h1><a rel="schema:creator" href="../persons/1">Author</a>')
        with patch.object(extraction, "get_show_html", return_value=show), patch.object(extraction, "get_play_data", return_value=play) as fetch:
            row = extraction.parse_api_rows([record], html_fallback=True)[0]
        fetch.assert_called_once_with("https://www.vondel.humanities.uva.nl/onstage/plays/766")
        self.assertEqual(row["authorName"], "Author")
        self.assertEqual(row["playTitle"], "Sesostris, koning van Egipte")
        self.assertEqual(row["genre"], "treurspel")

    def test_existing_author_skips_html_download(self):
        record = {"show": SHOW_URL, "date": "1752-09-23", "performance": "rank1", "work": "476", "fullTitle": "Play", "authorName": "Author"}
        with patch.object(extraction, "get_show_html") as fetch:
            extraction.parse_api_rows([record], html_fallback=True)
        fetch.assert_not_called()

    def test_missing_hyperlink_keeps_author_blank(self):
        record = {"show": SHOW_URL, "date": "1752-09-23", "performance": SHOW_URL + "#rank1", "work": "Play", "fullTitle": "Play"}
        with patch.object(extraction, "get_show_html", return_value='<li resource="#rank1">Play</li>'), patch.object(extraction, "get_play_data") as fetch, patch.object(extraction.logging, "warning"):
            row = extraction.parse_api_rows([record], html_fallback=True)[0]
        self.assertIsNone(row["authorName"])
        fetch.assert_not_called()

    def test_text_valued_work_keeps_title_without_inventing_author(self):
        record = {"show": "https://example.com/shows/41680", "date": "1810-04-21", "performance": "rank1", "work": "Sesostris", "fullTitle": "Sesostris"}
        with patch.object(extraction.logging, "warning"):
            row = extraction.parse_api_rows([record])[0]
        self.assertEqual(row["playTitle"], "Sesostris")
        self.assertEqual(row["fullTitle"], "Sesostris")
        self.assertIsNone(row["authorName"])

    def test_creators_are_combined_without_duplicate_performances(self):
        records = [
            {"show": SHOW_URL, "date": "1752-09-23", "performance": "rank1", "work": "476", "fullTitle": "Andromaché. Treurspel [tr. by L. Meijer]", "authorName": "Meijer, Lodewijk", "original": "477", "originalTitle": "Andromaque", "originalAuthorName": "Racine, Jean"},
            {"show": SHOW_URL, "date": "1752-09-23", "performance": "rank1", "work": "476", "fullTitle": "Andromaché. Treurspel [tr. by L. Meijer]", "authorName": "Nil Volentibus Arduum group", "original": "477", "originalTitle": "Andromaque", "originalAuthorName": "Racine, Jean"},
        ]
        rows = extraction.parse_api_rows(records)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["authorName"], "Meijer, Lodewijk; Nil Volentibus Arduum group")
        self.assertEqual(rows[0]["originalAuthorName"], "Racine, Jean")
        self.assertEqual(rows[0]["translatorName"], "Meijer, Lodewijk; Nil Volentibus Arduum group")
        self.assertEqual(rows[0]["playTitle"], "Andromaché")
        records.append(dict(records[0], performance="rank2"))
        self.assertEqual(len(extraction.parse_api_rows(records)), 2)

    def test_missing_authors_are_not_excluded(self):
        with patch.object(extraction.logging, "warning") as warning:
            rows = extraction.parse_api_rows([{"show": SHOW_URL, "date": "1752-09-23", "performance": "rank1", "work": "476", "fullTitle": "Play"}])
        self.assertEqual(len(rows), 1)
        self.assertIsNone(rows[0]["authorName"])
        self.assertEqual([call.args[-1] for call in warning.call_args_list], ["authorName"])


class ResumeTests(unittest.TestCase):
    def test_translators_exclude_originals_and_require_known_original(self):
        self.assertEqual(extraction.inferred_translators({"authorName": "Racine, Jean; Meijer, Lodewijk; Meijer, Lodewijk", "originalAuthorName": "Racine, Jean"}), "Meijer, Lodewijk")
        self.assertIsNone(extraction.inferred_translators({"authorName": "First; Second"}))
        self.assertIsNone(extraction.inferred_translators({"authorName": "Original", "originalAuthorName": "Original"}))

    def test_backfill_keeps_checkpoint_bytes_and_authors(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "shows.csv"
            output.write_text('id,authorName,originalAuthorName\n1,Original; Translator,Original\n')
            checkpoint = output.with_suffix(".checkpoint.json")
            state = {"version": 3, "last_id": 1, "csv_bytes": output.stat().st_size}
            extraction.backfill_translators(output, checkpoint, state)
            with output.open() as source:
                row = next(csv.DictReader(source))
            self.assertEqual(row["translatorName"], "Translator")
            self.assertEqual(row["authorName"], "Original; Translator")
            self.assertEqual(json.loads(checkpoint.read_text())["csv_bytes"], output.stat().st_size)

    def test_filename_uses_date_extremes_and_resume_finds_renamed_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "shows.csv"
            output.write_text("id,date\n1,1750-01-01\n2,1940-08-31\n3,1638-01-03\n4,\n")
            checkpoint = output.with_suffix(".checkpoint.json")
            checkpoint.write_text(json.dumps({"version": 3, "last_id": 4, "offset": 4, "row_count": 4, "csv_bytes": output.stat().st_size}))
            renamed = extraction.name_output_by_year(output, checkpoint)
            self.assertEqual(renamed.name, "dutch_data_1638_1940.csv")
            self.assertEqual(json.loads(checkpoint.read_text())["output_file"], renamed.name)
            with patch.object(extraction, "query_sparql", return_value="show\n") as query:
                extraction.main(output)
            query.assert_called_once_with(4)
            self.assertTrue(renamed.exists())

    def test_interrupted_batch_resumes_without_duplicate_rows(self):
        header = "show,date,performance,work,fullTitle,authorName\n"
        first = header + "https://example.com/shows/1,1750-01-01,rank1,play1,First,Author\n"
        second = header + "https://example.com/shows/42,1750-01-02,rank1,play2,Second,Author\n"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "shows.csv"
            with patch.object(extraction, "query_sparql", side_effect=[first, second]), patch.object(extraction, "parse_api_rows", side_effect=[[{"id": 1, "playTitle": "First"}], KeyboardInterrupt()]):
                with self.assertRaises(KeyboardInterrupt):
                    extraction.main(output)
            checkpoint = json.loads(output.with_suffix(".checkpoint.json").read_text())
            self.assertEqual(checkpoint["offset"], 1)
            with output.open("a") as file:
                file.write("uncommitted partial row\n")
            with patch.object(extraction, "query_sparql", side_effect=[second, header]) as query:
                extraction.main(output)
            self.assertEqual([call.args[0] for call in query.call_args_list], [1, 42])
            with output.open() as source:
                saved = list(csv.DictReader(source))
            self.assertEqual([row["id"] for row in saved], ["1", "42"])

    def test_old_checkpoint_recovers_last_id_at_server_limit(self):
        state = {"version": 2, "offset": 10000, "row_count": 17415, "csv_bytes": 123}
        with patch.object(extraction, "request_csv", return_value="show\nhttps://example.com/shows/10000\n") as request:
            updated = extraction.migrate_checkpoint(state)
        self.assertIn("LIMIT 1 OFFSET 9999", request.call_args.args[0])
        self.assertEqual(updated["last_id"], 10000)
        self.assertEqual(updated["version"], 3)
        self.assertEqual(updated["row_count"], 17415)

    def test_restart_overwrites_output_and_resets_offset(self):
        header = "show,date,performance,work,fullTitle,authorName\n"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "shows.csv"
            output.write_text("old data")
            output.with_suffix(".checkpoint.json").write_text('{"offset": 99}')
            with patch.object(extraction, "query_sparql", return_value=header) as query:
                extraction.main(output, restart=True)
            query.assert_called_once_with(0)
            with output.open() as source:
                self.assertEqual(list(csv.DictReader(source)), [])


if __name__ == "__main__":
    unittest.main()
