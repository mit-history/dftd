<script>
  import { onMount } from 'svelte';
  import artwork from '../routes/assets/map_timeline2.svg';
  import { ranges } from '../routes/timeline/range-cache.json';

  export let onYear = () => {};
  export let selectedRange = null;
  export let panelSide = null;

  const minimumYear = Math.min(...Object.values(ranges).map(range => range.start));
  const maximumYear = Math.max(...Object.values(ranges).map(range => range.end));
  const firstYear = Math.floor(minimumYear / 5) * 5;
  const lastYear = Math.ceil(maximumYear / 5) * 5;
  const span = lastYear - firstYear;
  // Each artwork segment contains five intervals: one small tick every five years.
  const segmentYears = 25;
  const segments = Array.from({ length: Math.ceil(span / segmentYears) }, (_, index) => index);
  const labels = Array.from({ length: Math.ceil(span / segmentYears) }, (_, index) => firstYear + index * segmentYears);
  if (labels.at(-1) !== lastYear) {
    if (lastYear - labels.at(-1) < segmentYears / 2) labels.pop();
    labels.push(lastYear);
  }

  let container;
  let currentYear = minimumYear;
  let running = false;
  let frame;
  $: displayedRange = selectedRange ?? { start: minimumYear, end: currentYear };
  $: combinedLabel = displayedRange.end - displayedRange.start <= segmentYears * 2;
  const position = year => Math.max(0, Math.min(100, (year - firstYear) / span * 100));

  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      cancelAnimationFrame(frame);
      running = false;
      currentYear = maximumYear;
      onYear(maximumYear);
    };
    const updatePreference = () => { if (preference.matches) finish(); };
    let reportedYear;
    const start = () => {
      if (preference.matches) { finish(); return; }
      running = true;
      const startedAt = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - startedAt) / 2000);
        const eased = progress * progress * (3 - 2 * progress);
        currentYear = minimumYear + (maximumYear - minimumYear) * eased;
        const year = Math.floor(currentYear);
        if (year !== reportedYear) { reportedYear = year; onYear(year); }
        if (progress < 1) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.25 });
    observer.observe(container);
    preference.addEventListener('change', updatePreference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', updatePreference);
    };
  });
</script>

<div class="map-timeline" bind:this={container} class:running={running && !selectedRange}
  class:panel-open={panelSide !== null}
  class:panel-left={panelSide === 'left'} class:panel-right={panelSide === 'right'}
  role="img" aria-label={`Dataset range: ${Math.floor(displayedRange.start)}–${Math.floor(displayedRange.end)}`}>
  <div class="timeline-scale" class:combined-label={combinedLabel}>
    {#if combinedLabel}
      <span class="range-label" style="left: {Math.max(10, Math.min(90, position((displayedRange.start + displayedRange.end) / 2)))}%;">
        {Math.floor(displayedRange.start)}–{Math.floor(displayedRange.end)}
      </span>
    {/if}
    <div class="range-pointer start" style="left: {position(displayedRange.start)}%;">
      <span>{Math.floor(displayedRange.start)}</span><i></i>
    </div>
    <div class="range-pointer end" style="left: {position(displayedRange.end)}%;">
      <span>{Math.floor(displayedRange.end)}</span><i></i>
    </div>
    <svg class="ticks" viewBox={`0 0 ${span} 12`} preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="11.5" x2={span} y2="11.5" stroke="#585B52" stroke-width="0.5" />
      {#each segments as index}
        <image href={artwork} x={index * segmentYears - 0.905 / 66.99 * segmentYears}
          y="0" width={68.8 / 66.99 * segmentYears} height="12" preserveAspectRatio="none" />
      {/each}
      <rect x={span - 0.25} y="0" width="0.25" height="12" fill="#585B52" />
    </svg>
    {#each labels as year, index}
      <span class="date" class:minor-label={index % 2 !== 0 && year !== lastYear}
        style="left: {position(year)}%;">{year}</span>
    {/each}
  </div>
</div>

<style>
  .map-timeline {
    position: absolute;
    bottom: 6px;
    left: 10%;
    right: 10%;
    height: 64px;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 110;
    pointer-events: none;
    transition: left 0.45s cubic-bezier(0.65, 0, 0.35, 1), right 0.45s cubic-bezier(0.65, 0, 0.35, 1);
  }
  .timeline-scale { position: relative; height: 100%; }
  .map-timeline.panel-left { left: calc(min(360px, 48%) + 4%); right: 4%; }
  .map-timeline.panel-right { right: calc(min(360px, 48%) + 4%); left: 4%; }
  .ticks { position: absolute; top: 40px; width: 100%; height: 13px; overflow: hidden; }
  .date { position: absolute; top: 24px; transform: translateX(-50%); font-size: 10px; color: #585B52; font-variant-numeric: tabular-nums; }
  .range-pointer { position: absolute; top: 2px; transform: translateX(-50%); text-align: center; transition: left 0.75s cubic-bezier(0.4, 0, 0.2, 1); }
  .range-pointer span { display: block; color: #585B52; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .combined-label .range-pointer span { visibility: hidden; }
  .range-label { position: absolute; top: 2px; transform: translateX(-50%); color: #585B52; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; transition: left 0.75s cubic-bezier(0.4, 0, 0.2, 1); }
  .range-pointer i { display: block; margin: 2px auto 0; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid #585B52; }
  .panel-open .ticks { filter: brightness(0) invert(1); }
  .panel-open .date, .panel-open .range-pointer span, .panel-open .range-label { color: #fff; }
  .panel-open .range-pointer i { border-top-color: #fff; }
  .running .range-pointer, .running .range-label { transition: none; }
  @media (max-width: 768px) {
    .map-timeline.panel-left { left: 14%; right: 6%; }
    .map-timeline.panel-right { left: 6%; right: 14%; }
  }
  @media (max-width: 600px) {
    .map-timeline { padding-inline: 14px; }
    .minor-label { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .map-timeline, .range-pointer, .range-label { transition: none; }
  }
</style>
