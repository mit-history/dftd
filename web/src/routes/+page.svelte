<svelte:head>
  <title>Transnational Stages</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import mapSvg from './assets/world_map_expanded_2.svg';
  import MapTimeline from '$lib/map-timeline.svelte';
  import TravelDots from '$lib/travel-dots.svelte';
  import MarkerHitbox from '$lib/marker-hitbox.svelte';
  import { markers } from './markers_config.js';
  import { cubicInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import { popupContent, datasetColors } from './popup_config.js';
  import { ranges } from './timeline/range-cache.json';

  const markerDatasets = {
    paris: ['french'], amsterdam: ['dutch'], copenhagen: ['danish'],
    madrid: ['madridCruz', 'madridPrincipe'], london: ['coventGarden', 'druryLane'],
    'saint-domingue': ['saintDomingue'], 'new orleans': ['newOrleans']
  };
  const startYears = Object.fromEntries(markers.map(marker => [
    marker.id, Math.min(...markerDatasets[marker.id].map(key => ranges[key].start))
  ]));
  let shownThroughYear = -Infinity;
  const markerRevealLeadYears = 3;
  const largeGapRevealLeadYears = 6;
  const startDates = [...new Set(Object.values(startYears))].sort((a, b) => a - b);
  const revealYears = Object.fromEntries(Object.entries(startYears).map(([id, year]) => {
    const previousYear = startDates[startDates.indexOf(year) - 1];
    const lead = previousYear !== undefined && year - previousYear > 100
      ? largeGapRevealLeadYears : markerRevealLeadYears;
    return [id, year - lead];
  }));
  // Edit this one crop: the map image, markers, and travel routes share these bounds.
  const mapBounds = { x: 20, y: 20, width: 600, height: 290 };
  const mapViewBox = `${mapBounds.x} ${mapBounds.y} ${mapBounds.width} ${mapBounds.height}`;
  const displayMarkers = markers.map(marker => ({
    ...marker,
    highlight: markerHighlight(marker.id),
    left: `${(parseFloat(marker.left) * 6.12 - mapBounds.x) / mapBounds.width * 100}%`,
    top: `${(parseFloat(marker.top) * 3 - mapBounds.y) / mapBounds.height * 100}%`
  }));

  function markerHighlight(id) {
    const colors = markerDatasets[id].map(dataset => datasetColors[dataset]);
    if (colors.length === 1) return colors[0];
    const stops = colors.map((color, index) =>
      `${color} ${index / colors.length * 100}% ${(index + 1) / colors.length * 100}%`
    );
    return `linear-gradient(135deg, ${stops.join(', ')})`;
  }
  const ZOOM_SCALE = 2.4;
  let selectedMarkerId = null;
  let isRightSide = false;
  let navigationHeight = 48;
  let mapContainer;
  let mapScale = 1;
  let reducedMotion = false;
  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion = preference.matches; };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });

  onMount(() => {
    const navigation = document.querySelector('.top-bar');
    if (!navigation) return;
    const updateHeight = () => {
      navigationHeight = navigation.getBoundingClientRect().height;
      mapScale = mapContainer.getBoundingClientRect().width / 780 * 612 / mapBounds.width;
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navigation);
    observer.observe(mapContainer);
    return () => observer.disconnect();
  });

  $: selectedMarker = displayMarkers.find(m => m.id === selectedMarkerId);
  $: popupTitle = selectedMarker ? popupContent[selectedMarker.id]?.title || selectedMarker.name : '';
  $: if (selectedMarker) isRightSide = parseFloat(selectedMarker.left) > 50;
  $: activeTransform = selectedMarker ? calculateTransform(selectedMarker) : 'translate(0%, 0%) scale(1)';

  function calculateTransform(m) {
    const px = parseFloat(m.left);
    const py = parseFloat(m.top);
    
    // Shift the focal point away from the data panel
    const targetX = (px > 50) ? 70 : 30;

    // centralize zoom to around shifted target
    let tx = targetX - (px * ZOOM_SCALE);
    let ty = 50 - (py * ZOOM_SCALE);
    
    // clamp within map borders
    const minTx = 100 - (100 * ZOOM_SCALE);
    const minTy = 100 - (100 * ZOOM_SCALE);
    
    tx = Math.max(minTx, Math.min(0, tx));
    ty = Math.max(minTy, Math.min(0, ty));
    
    return `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${ZOOM_SCALE})`;
  }

  function handleMarkerClick(id, event) {
    event.stopPropagation();
    selectedMarkerId = id;
  }

  const hoverReleaseDelay = 150;
  let hoveredMarkerIds = new Set();

  function bufferedHover(node, id) {
    let releaseTimer;
    const setHovered = (hovered) => {
      const next = new Set(hoveredMarkerIds);
      if (hovered) next.add(id);
      else next.delete(id);
      hoveredMarkerIds = next;
    };
    const enter = () => {
      clearTimeout(releaseTimer);
      setHovered(true);
    };
    const leave = () => {
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => setHovered(false), hoverReleaseDelay);
    };
    node.addEventListener('pointerenter', enter);
    node.addEventListener('pointerleave', leave);
    node.addEventListener('pointercancel', leave);
    return {
      destroy() {
        clearTimeout(releaseTimer);
        node.removeEventListener('pointerenter', enter);
        node.removeEventListener('pointerleave', leave);
        node.removeEventListener('pointercancel', leave);
      }
    };
  }

  function clearSelection() {
    if (!selectedMarkerId) return;
    selectedMarkerId = null;
  }

  function slidingDoor(node) {
    const direction = node.classList.contains('left') ? -1 : 1;
    return fly(node, {
      x: direction * node.offsetWidth,
      opacity: 1,
      duration: reducedMotion ? 0 : 450,
      easing: cubicInOut
    });
  }
</script>

<svelte:window on:keydown={(event) => { if (event.key === 'Escape') clearSelection(); }} />

<div class="page-wrapper" style="overflow-x: hidden; --navigation-height: {navigationHeight}px; --map-scale: {mapScale};">
  <section class="hero-container">
    <div class="image-wrapper" style="position: relative;">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="map-container" 
           bind:this={mapContainer}
           on:click={clearSelection}
           class:zoomed={!!selectedMarkerId}
      >
        <div class="map-content" style="transform: {activeTransform};">
          <svg class="map-image" viewBox={mapViewBox} role="img" aria-label="Map of the Atlantic World"
            style="aspect-ratio: {mapBounds.width} / {mapBounds.height};">
            <image href={mapSvg} x="-74.25" y="-90.73" width="810.03" height="480.15" />
          </svg>
          <TravelDots viewBox={mapViewBox} />
          {#each displayMarkers as marker}
            {#if shownThroughYear >= revealYears[marker.id]}
            <div 
              class="marker {selectedMarkerId === marker.id ? 'selected' : ''}" 
              class:hovered={hoveredMarkerIds.has(marker.id)}
              use:bufferedHover={marker.id}
              on:click={(e) => handleMarkerClick(marker.id, e)}
              style="
                width: calc({marker.width} * var(--map-scale));
                top: {marker.top}; 
                left: {marker.left}; 
              "
            >
              <MarkerHitbox artwork={marker.artwork} id={marker.id} />
              <span class="marker-shape" style="
                --marker-highlight: {marker.highlight};
                --pin-center-x: calc({marker.pinCenterX} * var(--map-scale));
                -webkit-mask-image: url('{marker.src}');
                mask-image: url('{marker.src}');
                -webkit-clip-path: {marker.clipPath};
                clip-path: {marker.clipPath};
              "></span>
            </div>
            {/if}
          {/each}
        </div>
      <MapTimeline targetYear={selectedMarkerId ? startYears[selectedMarkerId] : null}
        onYear={(year) => { shownThroughYear = Math.max(shownThroughYear, year); }} />
      {#if selectedMarker}
        {#key isRightSide}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <aside class="marker-panel {isRightSide ? 'left' : 'right'}" aria-labelledby="marker-panel-title"
            on:click|stopPropagation
            transition:slidingDoor|global>
            <div class="panel-content">
              <h2 id="marker-panel-title">{popupTitle}<span class="dataset-dots" aria-hidden="true">
                {#each markerDatasets[selectedMarker.id] as dataset}
                  <span class="dataset-dot" style="background-color: {datasetColors[dataset]};"></span>
                {/each}
              </span></h2>
            <p class="description-text">{popupContent[selectedMarker.id]?.description || `Content for ${selectedMarker.name} coming soon.`}</p>
            <a class="panel-link" href="{base}/data">Check Out Visualizations</a>
            <p class="panel-hint"><i>Click anywhere on the map to zoom out.</i></p>
            </div>
          </aside>
        {/key}
      {/if}
      </div>
    </div>

    <div class="hero-text">
      <h1>Transnational Stages</h1>
      <h3 class="subtitle">Theatrical Circulation and Exchange in the Eighteenth-Century Atlantic World</h3>
      <p class="intro">
        In the eighteenth-century Atlantic World, plays and performers often moved from one polity to the next across land and sea,
        creating new meanings and audience expectations as they did so.
        <strong>Transnational Stages</strong> offers users the opportunity <a href="{base}/data" class="link">to study national performance datasets via comparative visualization tools</a>,
        thereby creating new insights into international theatrical trends in the Early Modern and Modern periods.
        Our project relies on the foundational work of our <a href="{base}/affiliates" class="link">affiliated project</a> partners. Learn more about our work <a href="{base}/about" class="link">here</a>.
      </p>
    </div>
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    color: #000;
  }

  .page-wrapper {
    background-color: #F6F3DE;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: var(--navigation-height) 0 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }

  .image-wrapper {
    width: 100%;
    padding: 0 280px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  .map-container {
    position: relative;
    width: 100%;
    z-index: 1;
    border-radius: 0;
    box-shadow: 0px 20px 50px -20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .map-content {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .map-container.zoomed {
    z-index: 5;
  }

  .map-image {
    width: 100%;
    height: auto;
    display: block;
    overflow: hidden;
  }

  .marker {
    position: absolute;
    height: calc(80px * var(--map-scale));
    scale: 78%;
    transform: translate(-53%, -100%);
    pointer-events: none;
    cursor: pointer;
    animation: marker-arrival 350ms ease-out both;
  }

  .marker-shape {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: bottom center;
    mask-position: bottom center;
    
    background-color: #2e332b;
    
    -webkit-user-select: none;
    user-select: none;

    transform: scale(1);
    /* The pin is offset from the center of the artwork, which includes its label. */
    transform-origin: var(--pin-center-x) 100%;
    transition: transform 0.2s ease, background-color 0.2s ease, filter 0.2s ease;
  }

  .marker.hovered, .marker.selected {
    z-index: 10;
  }

  .marker.hovered .marker-shape, .marker.selected .marker-shape {
    transform: scale(1.1);
    background-color: #fff;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
  }

  .marker-shape::before, .marker-shape::after {
    content: '';
    position: absolute;
    left: var(--pin-center-x);
    top: 34%;
    width: calc(27px * var(--map-scale));
    height: 49%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .marker-shape::before {
    background: #2e332b;
  }

  .marker-shape::after {
    background: var(--marker-highlight);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .marker.hovered .marker-shape::after, .marker.selected .marker-shape::after {
    opacity: 1;
  }

  @keyframes marker-arrival {
    from { opacity: 0; translate: 0 10px; }
    to { opacity: 1; translate: 0 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .marker, .marker-shape { animation: none; }
    .marker-shape::after { transition: none; }
  }

  .marker-panel {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    bottom: 0;
    width: min(360px, 48%);
    overflow-y: auto;
    background: #F6F3DE;
    box-shadow: 0 0 30px rgba(0,0,0,0.15);
    padding: 1.5rem;
    z-index: 100;
    box-sizing: border-box;
  }
  .marker-panel.left { left: 0; border-right: 1px solid #2e332b22; }
  .marker-panel.right { right: 0; border-left: 1px solid #2e332b22; }
  .marker-panel h2 { margin: 0; font-size: 1.5rem; color: #2e332b; }
  .panel-content { margin-block: auto; flex-shrink: 0; }
  .dataset-dots { display: inline-flex; gap: 0.35rem; margin-left: 0.6rem; vertical-align: middle; }
  .dataset-dot { width: 10px; height: 10px; border-radius: 50%; }
  .description-text { margin-top: 0.75rem; white-space: pre-line; line-height: 1.6; }
  .panel-link { color: #2e332b; text-underline-offset: 3px; }
  .panel-hint { margin-top: 1.5rem; font-size: 0.85rem; color: #666; }
  @media (max-width: 768px) { .marker-panel { width: min(360px, 85%); padding: 1rem; } }

  .hero-text {
    text-align: center;
    padding: 0 12px;
  }

  .hero-text h1 {
    position: relative;
    text-align: center;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    letter-spacing: 0em;
  }

  .subtitle {
    font-style: italic;
    font-weight: 500;
    font-size: 1.25rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .intro {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #222;
    margin: 0 auto;
    max-width: 1000px;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .image-wrapper {
      padding: 0;
    }
    .hero-container {
      gap: 2rem;
    }

    .hero-text h1 {
      font-size: 2.2rem;
    }
  }
</style>
