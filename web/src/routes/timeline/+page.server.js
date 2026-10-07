import cache from './range-cache.json';
import { datasets, axisOverrides } from './range-config.json';

export const prerender = true;

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

export function load() {
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

  return {
    axisOverrides: { ...axisOverrides, ...overrides.axis },
    ranges: Object.fromEntries(datasets.map(dataset => {
      const detected = cache.ranges[dataset.key] ?? null;
      return [dataset.key, resolveRange(detected, {
        ...dataset, overrides: { ...dataset.overrides, ...overrides[dataset.key] }
      })];
    }))
  };
}
