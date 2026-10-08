import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { csvParse } from 'd3-dsv';
import * as XLSX from 'xlsx';

// Run `npm run timeline:refresh in terminal for local debugging`

const cacheUrl = new URL('./range-cache.json', import.meta.url);
const exportUrl = new URL('../../../../src/data/timeline-ranges.json', import.meta.url);
const dataRoot = new URL('../../../../src/data/', import.meta.url);
const readData = file => readFile(new URL(file, dataRoot));

function yearRange(years) {
  const valid = years.filter(Number.isInteger);
  if (!valid.length) throw new Error('No valid years found.');
  return { start: Math.min(...valid), end: Math.max(...valid) };
}

function dateRange(rows) {
  return yearRange(rows.map(row => {
    const match = /^(\d{4})-\d{2}-\d{2}(?:T|$)/.exec(row.date ?? '');
    return match && Number.isFinite(Date.parse(row.date)) ? Number(match[1]) : NaN;
  }));
}

export async function refreshRanges(previous, { read = readData, fetchData = fetch, warn = console.warn } = {}) {
  const [dutch, danish, london, madrid, saintDomingue, newOrleans] = await Promise.all([
    read('dutch_data_1638_1815.csv'), read('danish-performances.json'),
    read('london/formatted_london.json'), read('madrid-database.xlsx'),
    read('saint_domingue/formatted_saint_domingue.json'),
    read('new_orleans/new_orleans_totalperf.csv')
  ]);
  const londonRows = JSON.parse(london.toString());
  const workbook = XLSX.read(madrid, { cellDates: true });
  function worksheetRange(sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Missing worksheet: ${sheetName}`);
    return yearRange(XLSX.utils.sheet_to_json(sheet).map(row => {
      const value = row['Performance Date'];
      if (value instanceof Date) return value.getUTCFullYear();
      const match = /^\d{1,2}\s+\S+\s+(\d{4})$/.exec(String(value ?? '').trim());
      return match ? Number(match[1]) : NaN;
    }));
  }
  const ranges = {
    dutch: dateRange(csvParse(dutch.toString())),
    danish: dateRange(JSON.parse(danish.toString())
      .map(row => ({ date: row.date?.replace(/ AD$/, '') }))
      .filter(row => row.date && row.date < '1816-01-01')),
    coventGarden: dateRange(londonRows.filter(row => row.place === 'Covent Garden')),
    druryLane: dateRange(londonRows.filter(row => row.place === 'Drury Lane')),
    madridCruz: worksheetRange('Teatro de la Cruz'),
    madridPrincipe: worksheetRange('Teatro del Príncipe'),
    saintDomingue: dateRange(JSON.parse(saintDomingue.toString())),
    newOrleans: yearRange(csvParse(newOrleans.toString()).columns.filter(column => /^\d{4}$/.test(column)).map(Number))
  };
  try {
    const dates = await Promise.all(['asc', 'desc'].map(async order => {
      const url = `https://api.cfregisters.org/performances?date=gt.1680-01-01&date=lt.1794-01-01&select=date&order=date.${order}&limit=1`;
      const response = await fetchData(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`API request failed (${response.status}): ${url}`);
      return dateRange(await response.json());
    }));
    ranges.french = { start: dates[0].start, end: dates[1].end };
    if (ranges.french.start > ranges.french.end) throw new Error('API returned reversed date bounds.');
  } catch (error) {
    if (!previous?.ranges?.french) throw error;
    ranges.french = previous.ranges.french;
    warn(`Keeping cached French range: ${error.message}`);
  }
  return { ranges };
}

async function main() {
  let previous;
  try {
    previous = JSON.parse(await readFile(cacheUrl, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const cache = await refreshRanges(previous);
  const content = JSON.stringify(cache, null, 2) + '\n';
  if (JSON.stringify(previous, null, 2) + '\n' !== content) {
    const temporary = new URL(cacheUrl.href + '.tmp');
    await writeFile(temporary, content);
    await rename(temporary, cacheUrl);
  }
  const temporaryExportPath = `${fileURLToPath(exportUrl)}.tmp`;
  const bounds = {
    minYear: Math.min(...Object.values(cache.ranges).map(range => range.start)),
    maxYear: Math.max(...Object.values(cache.ranges).map(range => range.end))
  };
  await writeFile(temporaryExportPath, JSON.stringify(bounds, null, 2) + '\n');
  await rename(temporaryExportPath, exportUrl);
  console.log(`Timeline cache refreshed (${Object.keys(cache.ranges).length} datasets).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
