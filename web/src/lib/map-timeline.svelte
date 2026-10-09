<script>
  import { onMount } from 'svelte';
  import artwork from '../routes/assets/map_timeline.png';
  import { ranges } from '../routes/timeline/range-cache.json';
  export let onYear = () => {};
  export let targetYear = null;
  export let leftCorner = false;

  const datasetStarts = Object.values(ranges).map(range => range.start);
  const firstYear = Math.floor(Math.min(...datasetStarts) / 5) * 5;
  const lastYear = Math.ceil(Math.max(...Object.values(ranges).map(range => range.end)) / 5) * 5;
  const dates = Array.from({ length: (lastYear - firstYear) / 5 + 1 }, (_, index) => firstYear + index * 5);
  const stickCount = dates.length;
  const labels = dates.map((year, index) => ({ year, position: index + 0.5 }));
  let container;
  let image;
  let loaded = false;
  let visible = false;
  let frame;
  let reportedYear = firstYear;
  let focused = false;
  let focusAnimations = [];

  $: if (targetYear !== null) focused = true;
  $: if (focused) transitionToYear(targetYear ?? lastYear);

  function transitionToYear(year) {
    cancelAnimationFrame(frame);
    const tracks = [...container.querySelectorAll('.track')];
    // Capture the current position before cancelling an intro or an interrupted transition.
    const from = tracks.map(track => getComputedStyle(track).transform);
    focusAnimations.forEach(animation => animation.cancel());
    const step = container.clientWidth / 3;
    const offset = (1 - (year - firstYear) / 5) * step;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750;
    focusAnimations = tracks.map((track, index) => track.animate([
      { transform: from[index] },
      { transform: `translate3d(${offset}px, 0, 0)` }
    ], { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }));
    onYear(year);
  }

  function reportScroll(track) {
    cancelAnimationFrame(frame);
    function tick() {
      const offset = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
      const step = container.clientWidth / 3;
      const year = Math.min(lastYear, Math.floor(firstYear + (1 - offset / step) * 5));
      if (year !== reportedYear) { reportedYear = year; onYear(year); }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  function finishScroll() {
    cancelAnimationFrame(frame);
    reportedYear = lastYear;
    onYear(lastYear);
  }

  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => { if (preference.matches) finishScroll(); };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    loaded = image.complete && image.naturalWidth > 0;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        visible = true;
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      focusAnimations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', updatePreference);
    };
  });
</script>

{#snippet track(report = false)}
  <div class="track" on:animationstart={(event) => { if (report) reportScroll(event.currentTarget); }}
    on:animationend={() => { if (report) finishScroll(); }}>
    {#each Array(stickCount) as _}<span class="stick"></span>{/each}
    <span class="ending"></span>
    {#each labels as label}
      <span class="date" style="left: calc(var(--step) * {label.position});">{label.year}</span>
    {/each}
  </div>
{/snippet}

<div class="map-timeline" bind:this={container} class:left-corner={leftCorner} class:scrolling={loaded && visible && !focused} class:focused aria-hidden="true"
  style="--artwork: url('{artwork}'); --sections-to-scroll: {stickCount - 3 + 0.6}; --focus-step: {1 - ((targetYear ?? lastYear) - firstYear) / 5};">
  <img class="preload" bind:this={image} src={artwork} alt="" on:load={() => { loaded = true; }} />
  <div class="viewport">
    <div class="layer sharp">{@render track(true)}</div>
    <div class="layer blurred">{@render track()}</div>
  </div>
</div>

<style>
  .map-timeline {
    position: absolute;
    right: 6px;
    bottom: 6px;
    z-index: 20;
    width: min(280px, calc(100% - 32px));
    container-type: inline-size;
    transform: scale(0.5);
    transform-origin: bottom right;
    pointer-events: none;
  }
  .map-timeline.left-corner {
    left: 6px;
    right: auto;
    transform-origin: bottom left;
  }
  .preload { display: none; }
  .viewport {
    --step: calc(100cqw / 3);
    --tail: calc(var(--step) * 59.5 / 129);
    --scroll-end: calc((var(--step) * var(--sections-to-scroll) + var(--tail)) * -1);
    --date-height: 22px;
    height: calc(var(--date-height) + var(--step) * 107 / 129);
    position: relative;
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
  }
  .layer { position: absolute; inset: 0; }
  .sharp {
    mask-image: linear-gradient(to right, transparent, black 35%, black 65%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 35%, black 65%, transparent);
  }
  .blurred {
    filter: blur(4px);
    mask-image: linear-gradient(to right, black, transparent 38%, transparent 62%, black);
    -webkit-mask-image: linear-gradient(to right, black, transparent 38%, transparent 62%, black);
  }
  .track { position: relative; display: flex; width: max-content; height: 100%; transform: translate3d(0, 0, 0); }
  .stick, .ending {
    position: relative;
    display: block;
    flex: none;
    height: 100%;
    background-image: var(--artwork);
    background-repeat: no-repeat;
    background-size: calc(var(--step) * 763 / 129) calc(var(--step) * 107 / 129);
  }
  /* A 129px slice centered on the third stick, including the small ticks beside it. */
  .stick { width: var(--step); background-position: calc(var(--step) * -317.5 / 129) var(--date-height); }
  .date { position: absolute; top: 0; width: 48px; transform: translateX(-50%); text-align: center; color: #f6f3de; font-size: 0.85rem; line-height: 18px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  /* The arrow occupies only the last slice, after the last repeated stick. */
  .ending { width: var(--tail); background-position: calc(var(--step) * -703.5 / 129) var(--date-height); }
  .scrolling .track { animation: scroll-timeline 2s cubic-bezier(0.2, 0, 0.8, 1) forwards; }
  .focused .track { transform: translate3d(calc(var(--step) * var(--focus-step)), 0, 0); }
  @keyframes scroll-timeline {
    from { transform: translate3d(0, 0, 0); }
    to { transform: translate3d(var(--scroll-end), 0, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .scrolling .track { animation: none; transform: translate3d(var(--scroll-end), 0, 0); }
  }
</style>
