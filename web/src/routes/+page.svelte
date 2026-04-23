<script>
  import { base } from '$app/paths';
  import mapSvg from './assets/interstage_world_map_empty.svg';
  import { markers } from './markers_config.js';
</script>

<div class="page-wrapper">
  <section class="hero-container">
    <div class="image-wrapper">
      <div class="map-container">
        <img class="map-image" src={mapSvg} alt="Map of the Atlantic World" />
        <!-- Map markers generated dynamically from markers.js -->
        {#each markers as marker}
          <div 
            class="marker" 
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

    <div class="hero-text">
      <h1>Transnational Stages</h1>
      <h3 class="subtitle">Theatrical Circulation and Exchange in the Atlantic World, 1680–1850</h3>
      <p class="intro">
        From the seventeenth to the twentieth centuries in the Atlantic World plays and performers often crossed
        land boundaries and oceans, creating new meanings and audience expectations as they did so.
        <strong>Transnational Stages</strong> offers users the opportunity to study national datasets via
        comparative visualization tools, thereby creating new insights into international theatrical trends
        in the Early Modern and Modern periods.
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
    justify-content: center;
    padding: 80px 50px 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 900px;
    width: 100%;
    transform: translateY(-30px);
  }

  .image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .map-container {
    position: relative;
    width: 100%;
    max-width: 700px; /* map size */
    margin-bottom: 1rem; /* height of text below map */
    transform: translateY(10px);
  }

  .map-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
    box-shadow: 0px 20px 50px -20px rgba(0, 0, 0, 0.3);
  }

  .marker {
    position: absolute;
    height: 80px; /* Modify this value to set your desired height */
    scale: 78%;
    
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: bottom center;
    mask-position: bottom center;
    
    background-color: #2e332b; /* default marker color */
    
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

  .marker:hover {
    transform: translate(-50%, -110%) scale(1.1);
    background-color: #fafafa; /* Exact hex color on hover (blue) */
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
    z-index: 10;
  }

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
    margin-bottom: 0.5rem; /* Reduced to pull the paragraph up */
    color: #333;
  }

  .intro {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #222;
    margin: 0 auto;
    transform: translateY(6px);
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