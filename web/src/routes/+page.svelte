<svelte:head>
  <title>Transnational Stages</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';
  import mapSvg from './assets/interstage_world_map_empty.svg';
  import { markers } from './markers_config.js';
  import { fade } from 'svelte/transition';
  import { popupContent } from './popup_config.js';

  const ZOOM_SCALE = 2.4;
  let selectedMarkerId = null;

  $: selectedMarker = markers.find(m => m.id === selectedMarkerId);
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
    selectedMarkerId = null;
  }
</script>

<div class="page-wrapper" style="overflow-x: hidden;">
  <section class="hero-container">
    <div class="image-wrapper" style="position: relative;">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="map-container" 
           on:click={clearSelection}
           class:zoomed={!!selectedMarkerId}
      >
        <div class="map-content" style="transform: {activeTransform};">
          <img class="map-image" src={mapSvg} alt="Map of the Atlantic World" />
          {#each markers as marker}
            <div 
              class="marker {selectedMarkerId === marker.id ? 'selected' : ''}" 
              on:click={(e) => handleMarkerClick(marker.id, e)}
              style="
                width: {marker.width};
                top: {marker.top}; 
                left: {marker.left}; 
                -webkit-mask-image: url('{marker.src}'); 
                mask-image: url('{marker.src}');
                -webkit-clip-path: {marker.clipPath};
                clip-path: {marker.clipPath};
              "
            ></div>
          {/each}
        </div>
      </div>

      {#if selectedMarker}
        <div class="popup-panel {isRightSide ? 'left' : 'right'}" transition:fade={{ duration: 250 }}>
          <h2>{popupContent[selectedMarker.id]?.title || selectedMarker.name}</h2>
          <p class="description-text">{popupContent[selectedMarker.id]?.description || `Content for ${selectedMarker.name} coming soon.`}</p>
          <p style="font-size: 0.85rem; color: #666; margin-top: 1rem;"><i>Click anywhere on the map to zoom out.</i></p>
        </div>
      {/if}
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
    padding: 80px 50px 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1000px; /* Widened slightly to give the popup more breathing room */
    width: 100%;
    gap: 2rem;
  }

  .image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .map-container {
    position: relative;
    width: 100%;
    max-width: 780px; /* scaled up slightly for 100% zoom */
    z-index: 1;
    border-radius: 4px;
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
    height: 80px;
    scale: 78%;
    
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
    
    transform: translate(-53%, -100%);
    transition: transform 0.2s ease, background-color 0.2s ease, filter 0.2s ease;
    cursor: pointer;
  }

  .marker:hover, .marker.selected {
    transform: translate(-50%, -110%) scale(1.1);
    background-color: #fafafa;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
    z-index: 10;
  }

  .popup-panel {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 320px; 
    background: #F6F3DE;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    padding: 1.5rem;
    z-index: 100;
    box-sizing: border-box;
  }
  .popup-panel h2 {
    margin-top: 0;
    color: #2e332b;
  }
  .description-text {
    margin-top: 0.25rem;
    white-space: pre-line;
  }
  .popup-panel.left { left: 0; }
  .popup-panel.right { right: 0; }

  .hero-text {
    text-align: center;
  }

  .hero-text h1 {
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
    max-width: 850px;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 40px 15px;
    }
    
    .hero-container {
      gap: 2rem;
    }

    .hero-text h1 {
      font-size: 2.2rem;
    }
  }
</style>