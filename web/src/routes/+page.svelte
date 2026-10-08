<svelte:head>
  <title>Transnational Stages</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import mapSvg from './assets/interstage_world_map_empty.svg';
  import MapTimeline from '$lib/MapTimeline.svelte';
  import { markers } from './markers_config.js';
  import { fade } from 'svelte/transition';
  import { popupContent } from './popup_config.js';
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
  const ZOOM_SCALE = 2.4;
  let selectedMarkerId = null;
  let navigationHeight = 48;
  let mapContainer;
  let mapScale = 1;

  onMount(() => {
    const navigation = document.querySelector('.top-bar');
    if (!navigation) return;
    const updateHeight = () => {
      navigationHeight = navigation.getBoundingClientRect().height;
      mapScale = mapContainer.getBoundingClientRect().width / 780;
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navigation);
    observer.observe(mapContainer);
    return () => observer.disconnect();
  });

  $: selectedMarker = markers.find(m => m.id === selectedMarkerId);
  $: popupTitle = selectedMarker ? popupContent[selectedMarker.id]?.title || selectedMarker.name : '';
  $: isRightSide = selectedMarker ? parseFloat(selectedMarker.left) > 50 : false;
  $: activeTransform = selectedMarker ? calculateTransform(selectedMarker) : 'translate(0%, 0%) scale(1)';

  function calculateTransform(m) {
    const px = parseFloat(m.left);
    const py = parseFloat(m.top);
    
    // Shift the focal point left or right to make room for the wider popup
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

  function clearSelection() {
    if (!selectedMarkerId) return;
    selectedMarkerId = null;
  }
</script>

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
          <img class="map-image" src={mapSvg} alt="Map of the Atlantic World" />
          {#each markers as marker}
            {#if shownThroughYear >= startYears[marker.id]}
            <div 
              class="marker {selectedMarkerId === marker.id ? 'selected' : ''}" 
              on:click={(e) => handleMarkerClick(marker.id, e)}
              style="
                width: calc({marker.width} * var(--map-scale));
                top: {marker.top}; 
                left: {marker.left}; 
              "
            >
              <span class="marker-shape" style="
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
        <div class="popup-panel {isRightSide ? 'left' : 'right'}" transition:fade={{ duration: 250 }}>
          <h2>{popupTitle}</h2>
          <p class="description-text">{popupContent[selectedMarker.id]?.description || `Content for ${selectedMarker.name} coming soon.`}</p>
          <p style="font-size: 0.85rem; color: #666; margin-top: 1rem;"><i>Click anywhere on the map to zoom out.</i></p>
        </div>
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
    padding: 0 300px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  .map-container {
    --popup-inset: 24px;
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
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: bottom center;
    mask-position: bottom center;
    
    background-color: #2e332b;
    
    -webkit-user-select: none;
    user-select: none;

    /* for debugging purposes */
    /* -webkit-mask-image: none !important;
    mask-image: none !important;
    background-color: rgba(255, 0, 0, 0.5) !important; */
    
    transform: scale(1);
    /* The pin is offset from the center of the artwork, which includes its label. */
    transform-origin: var(--pin-center-x) 100%;
    transition: transform 0.2s ease, background-color 0.2s ease, filter 0.2s ease;
  }

  .marker:hover, .marker.selected {
    z-index: 10;
  }

  .marker:hover .marker-shape, .marker.selected .marker-shape {
    transform: scale(1.1);
    background-color: #fafafa;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
  }

  @keyframes marker-arrival {
    from { opacity: 0; translate: 0 10px; }
    to { opacity: 1; translate: 0 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .marker { animation: none; }
  }

  .popup-panel {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: min(320px, calc(100% - 2 * var(--popup-inset)));
    max-height: calc(100% - 2 * var(--popup-inset));
    overflow-y: auto;
    background: #F6F3DE;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    padding: 1.5rem;
    z-index: 100;
    box-sizing: border-box;
  }
  .popup-panel h2 {
    position: relative;
    margin-top: 0;
    color: #2e332b;
  }
  .description-text {
    margin-top: 0.25rem;
    white-space: pre-line;
  }
  .popup-panel.left { left: var(--popup-inset); }
  .popup-panel.right { right: var(--popup-inset); }

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
      padding: 0 12px;
    }
    .hero-container {
      gap: 2rem;
    }

    .hero-text h1 {
      font-size: 2.2rem;
    }
  }
</style>
