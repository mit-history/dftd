import { csvFormat } from "npm:d3-dsv";

export function frenchRows(rows) {
  return rows.filter(row => String(row.origin ?? row.group ?? "").toLowerCase() === "french");
}

// Count distinct performance dates, matching the line chart and heat map.
export function frenchPerformanceDays(rows, period = "year") {
  const periods = new Map();
  for (const row of frenchRows(rows)) {
    const date = new Date(row.performance_date || row.date);
    if (Number.isNaN(+date)) continue;
    const day = date.toISOString().slice(0, 10);
    const key = day.slice(0, period === "month" ? 7 : 4);
    if (!periods.has(key)) periods.set(key, new Set());
    periods.get(key).add(day);
  }
  return [...periods].sort(([a], [b]) => a.localeCompare(b)).map(([period, days]) => ({
    period, origin: "french", performance_days: days.size
  }));
}

export function frenchDownloadButton(rows, filename) {
  // Enforce the export restriction here as well as in each chart's data builder.
  const data = frenchRows(rows).map(row => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : value])
  ));
  if (!data.length) {
    const placeholder = document.createElement("span");
    placeholder.hidden = true;
    return placeholder;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Save CSV";
  button.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([csvFormat(data)], {type: "text/csv;charset=utf-8"}));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  return button;
}

export function frenchCalendarRows(events, mode, anchor) {
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));
  const end = new Date(start);
  if (mode === "Month") {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1, 1);
  } else if (mode === "Week") {
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    end.setTime(+start);
    end.setUTCDate(end.getUTCDate() + 7);
  } else {
    end.setUTCDate(end.getUTCDate() + 1);
  }
  return frenchRows(events).filter(event => event.date >= start && event.date < end);
}
