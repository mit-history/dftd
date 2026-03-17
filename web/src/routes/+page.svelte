<script>
  import { base } from '$app/paths';
  import mapSvg from './assets/interstage_world_map.svg';
</script>

<div class="page-wrapper">
  <section class="hero-container">
    <div class="image-wrapper">
      <img class="map-image" src={mapSvg} alt="Map of the Atlantic World" />
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
    gap: 1rem;
  }

  .image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .map-image {
    width: 100%;
    max-width: 700px;
    height: auto;
    display: block;
    border-radius: 4px;
    box-shadow: 0px 20px 50px -20px rgba(0, 0, 0, 0.3);
    transform: translateY(-20px);
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
    transform: translateY(-30px);
  }

  .subtitle {
    font-style: italic;
    font-weight: 500;
    font-size: 1.25rem;
    margin-top: 0.25rem;
    margin-bottom: 1.5rem;
    color: #333;
    transform: translateY(-30px);
  }

  .intro {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #222;
    margin: 0 auto;
    transform: translateY(-40px);
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