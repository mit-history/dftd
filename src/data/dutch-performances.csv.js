// taken from https://observablehq.com/framework/data-loaders

import {csvFormat} from "d3-dsv";
import {readFile} from "fs";
import {parse} from "csv-parse/sync";

readFile("src/data/dutch_data.csv", "utf8", (err, data) => {
    const parsed = parse(data, { columns: true });
    const transformed = parsed.map((record) => ({
        year: (new Date(record.date)).getFullYear(),
        date: record.date,
        title: record.originalTitle || record.playTitle,
        author: record.originalAuthorName || record.authorName
    }))
    process.stdout.write(csvFormat(transformed));
});