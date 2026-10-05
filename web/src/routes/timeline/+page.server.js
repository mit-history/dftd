import { csvParse } from 'd3-dsv';
import { datasets, axisOverrides } from './range-config.json';

export const prerender = true;

const sources = import.meta.glob([
  '../../../../src/data/dutch_data_1638_1940.csv',
  '../../../../src/data/danish-performances.csv',
  '../../../../src/data/london/formatted_london.json',
  '../../../../src/data/saint_domingue/formatted_saint_domingue.json',
  '../../../../src/data/new_orleans/new_orleans_totalperf.csv'
], {
  query: '?raw', import: 'default'
});
const sourceRoot = '../../../../src/data/';

function resolveRange(detected, config) {
  const range = {};
  for (const endpoint of ['start', 'end']) {
    range[endpoint] = config.overrides[endpoint] != null
      ? config.overrides[endpoint]
      : Number.isFinite(detected?.[endpoint]) ? detected[endpoint] : config.fallback[endpoint];
  }
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start > range.end) {
    throw new Error('Timeline years must be integers with start <= end. Check range-config.json.');
  }
  return range;
}

function yearRange(rows) {
  let start = Infinity;
  let end = -Infinity;
  for (const row of rows) {
    const match = /^(\d{4})-\d{2}-\d{2}(?:T|$)/.exec(row.date ?? '');
    if (!match || !Number.isFinite(Date.parse(row.date))) continue;
    const year = Number(match[1]);
    start = Math.min(start, year);
    end = Math.max(end, year);
  }
  return Number.isFinite(start) ? { start, end } : null;
}

export async function load() {
  const overrides = JSON.parse(process.env.TIMELINE_OVERRIDES || '{}');
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    throw new Error('TIMELINE_OVERRIDES must be a JSON object.');
  }
  for (const [key, bounds] of Object.entries(overrides)) {
    if (key !== 'axis' && !datasets.some(dataset => dataset.key === key)) {
      throw new Error(`Unknown TIMELINE_OVERRIDES dataset: ${key}`);
    }
    if (!bounds || typeof bounds !== 'object' || Array.isArray(bounds)) {
      throw new Error(`TIMELINE_OVERRIDES.${key} must contain start and/or end years.`);
    }
    for (const [endpoint, value] of Object.entries(bounds)) {
      if (!['start', 'end'].includes(endpoint) || (value !== null && !Number.isInteger(value))) {
        throw new Error(`Invalid TIMELINE_OVERRIDES.${key}.${endpoint}: use an integer year or null.`);
      }
    }
  }

  const files = new Map();
  async function detectRange(source) {
    if (!source) return null;
    if (!files.has(source.file)) {
      files.set(source.file, (async () => {
        const raw = await sources[sourceRoot + source.file]();
        return source.format === 'csv' ? csvParse(raw) : JSON.parse(raw);
      })());
    }
    let rows = await files.get(source.file);
    if (source.yearsInColumns) {
      const years = rows.columns.filter(column => /^\d{4}$/.test(column)).map(Number);
      return years.length ? { start: Math.min(...years), end: Math.max(...years) } : null;
    }
    if (source.place) rows = rows.filter(row => row.place === source.place);
    return yearRange(rows);
  }
  const results = await Promise.allSettled(datasets.map(dataset => detectRange(dataset.source)));
  return {
    axisOverrides: { ...axisOverrides, ...overrides.axis },
    ranges: Object.fromEntries(datasets.map((dataset, index) => {
      const result = results[index];
      if (result.status === 'rejected') {
        console.warn(`Timeline ${dataset.key}: using configured fallback`, result.reason);
      }
      const detected = result.status === 'fulfilled' ? result.value : null;
      return [dataset.key, resolveRange(detected, {
        ...dataset, overrides: { ...dataset.overrides, ...overrides[dataset.key] }
      })];
    }))
  };
}
