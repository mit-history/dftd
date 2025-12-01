// =============================================
//  Calendar.js — Month/Week/Day visualization
//  Global Theatre Calendar (Danish, French, Dutch, NOLA)
// =============================================

// Color map injected from index.md
export const ORIGIN_COLOR = new Map();

// -----------------------------------------------------
// injectCalendarStyles() — CSS
// -----------------------------------------------------
export function injectCalendarStyles() {
  if (document.getElementById("calendar-style-block")) return;

  const css = `
    .calendar-container {
      font-family: system-ui, sans-serif;
      width: 100%;
      margin-top: 1rem;
    }

    .cal-grid {
      display: grid;
      width: 100%;
      border: 1px solid #ddd;
      background: white;
    }

    .cal-header {
      font-weight: 600;
      padding: 6px;
      text-align: center;
      border-bottom: 1px solid #ccc;
      background: #f9fafb;
    }

    .cal-cell {
      min-height: 80px;
      border: 1px solid #eee;
      padding: 4px;
      overflow: hidden;
      position: relative;
    }

    .cal-date-num {
      font-size: 11px;
      opacity: 0.7;
      margin-bottom: 2px;
    }

    .cal-event {
      font-size: 11px;
      padding: 2px 4px;
      margin: 1px 0;
      border-radius: 3px;
      color: white;
      cursor: pointer;
      word-break: break-word;
    }

    .cal-overlay-event {
      font-size: 10px;
      padding: 1px 3px;
      margin: 2px 0;
      border-radius: 3px;
      background: #dbeafe;
      color: #1e3a8a;
    }

    .cal-legend {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      font-size: 13px;
      align-items: center;
    }
    .cal-key {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .cal-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }
  `;

  const style = document.createElement("style");
  style.id = "calendar-style-block";
  style.innerHTML = css;
  document.head.appendChild(style);
}

// -----------------------------------------------------
// buildEvents() — normalize event objects
// -----------------------------------------------------
export function buildEvents(rows, asDate, options = {}) {
  return rows
    .map(r => {
      const d = asDate(r.date);
      if (!d) return null;

      return {
        id: r.id,
        date: d,
        day: d.toISOString().slice(0, 10),
        title: r.title || "Untitled",
        origin: r.origin,
        venue: r.theater || r.place || "Unknown venue",
        city: r.city ?? null,
        color: ORIGIN_COLOR.get(r.origin) || "#999"
      };
    })
    .filter(Boolean);
}

// -----------------------------------------------------
// renderCalendar() — master switch
// -----------------------------------------------------
export function renderCalendar({ container, mode, anchor, events, overlays }) {
  const root = document.getElementById(container);
  if (!root) return;

  root.innerHTML = "";

  const box = document.createElement("div");
  box.className = "calendar-container";

  if (mode === "Month")      box.appendChild(renderMonth(anchor, events, overlays));
  else if (mode === "Week")  box.appendChild(renderWeek(anchor, events, overlays));
  else                       box.appendChild(renderDay(anchor, events, overlays));

  root.appendChild(box);
}

// -----------------------------------------------------
// Monthly View
// -----------------------------------------------------
function renderMonth(anchor, events, overlays) {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();

  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const startDay = first.getUTCDay();
  const days = last.getUTCDate();

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";

  // Headers
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => {
    const h = document.createElement("div");
    h.className = "cal-header";
    h.textContent = d;
    grid.appendChild(h);
  });

  // Leading blanks
  for (let i = 0; i < startDay; i++) {
    grid.appendChild(blankCell());
  }

  // Days
  for (let day = 1; day <= days; day++) {
    const d = new Date(Date.UTC(year, month, day));
    const key = d.toISOString().slice(0, 10);

    const cell = makeCell(day, d, events, overlays);
    grid.appendChild(cell);
  }

  return grid;
}

// -----------------------------------------------------
// Weekly View
// -----------------------------------------------------
function renderWeek(anchor, events, overlays) {
  const start = new Date(anchor);
  const offset = anchor.getUTCDay();
  start.setUTCDate(anchor.getUTCDate() - offset);

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";

  // Headers
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => {
    const h = document.createElement("div");
    h.className = "cal-header";
    h.textContent = d;
    grid.appendChild(h);
  });

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);

    const dayNum = d.getUTCDate() + " " + d.toLocaleString("default",{month:"short"});
    const key = d.toISOString().slice(0,10);

    const cell = makeCell(dayNum, d, events, overlays);
    grid.appendChild(cell);
  }

  return grid;
}

// -----------------------------------------------------
// Daily View
// -----------------------------------------------------
function renderDay(anchor, events, overlays) {
  const key = anchor.toISOString().slice(0, 10);

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  grid.style.gridTemplateColumns = "1fr";

  const head = document.createElement("div");
  head.className = "cal-header";
  head.textContent = anchor.toUTCString().slice(0, 16);
  grid.appendChild(head);

  const cell = makeCell("", anchor, events, overlays);
  grid.appendChild(cell);

  return grid;
}

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function blankCell() {
  const c = document.createElement("div");
  c.className = "cal-cell";
  return c;
}

function makeCell(label, dateObj, events, overlays) {
  const key = dateObj.toISOString().slice(0, 10);

  const cell = document.createElement("div");
  cell.className = "cal-cell";

  const dateLabel = document.createElement("div");
  dateLabel.className = "cal-date-num";
  dateLabel.textContent = label;
  cell.appendChild(dateLabel);

  // Events
  events.filter(e => e.day === key).forEach(ev => {
    const el = document.createElement("div");
    el.className = "cal-event";
    el.style.background = ev.color;
    el.textContent = ev.title;
    cell.appendChild(el);
  });

  // Overlays (major events)
  overlays.filter(o => o.date === key).forEach(o => {
    const el = document.createElement("div");
    el.className = "cal-overlay-event";
    el.textContent = o.name;
    cell.appendChild(el);
  });

  return cell;
}
