<svelte:head>
  <title>Data Timeline</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<main class="timeline-page">
  <!-- HERO SECTION -->
  <section class="hero">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1>Dataset Timelines</h1>
        <p>
          Transnational Stages is a work-in-progress. We ultimately plan to include datasets of the following duration for each theater accessible in our visualizations. The actual data currently accessible may be drawn from a shorter time span.
        </p>
      </div>
    </div>
  </section>
</main>

<style>
  main.timeline-page {
    background: #f5f5f4;
    min-height: 100vh;
  }

  /* === HERO FULL-BLEED === */
  .hero {
    position: relative;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    height: 55vh;
    background-color: #d6d3d1; /* Placeholder square background color for future image */
    /* background-image: url('/images/temp_EXP.jpg'); Uncomment and change path to add the future image */
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 12px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      #ffffff 100%
    );
    pointer-events: none;
  }

  .hero-overlay {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(0, 0, 0, 0.45),
      rgba(0, 0, 0, 0.45)
    );
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-content {
    max-width: 900px;
    text-align: center;
    color: white;
    padding: 0 1.5rem;
    position: relative;
  }

  .hero h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hero p {
    max-width: 720px;
    margin: 0 auto;
    font-size: 1.15rem;
    line-height: 1.6;
  }

  @media (max-width: 700px) {
    .hero {
      height: 50vh;
    }
    .hero h1 {
      font-size: 2rem;
    }
    .hero p {
      font-size: 1rem;
    }
  }
</style>
