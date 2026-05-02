<svelte:head>
  <title>About</title>
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

<main class="about-page">
  <!-- HERO SECTION -->
  <section class="hero" style="background-image: url('{base}/images/random_french_theater.jpg')">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1>About</h1>
      </div>
    </div>
  </section>

  <section class="about-section">
    <div class="about-container">

      <!-- Text -->
      <div class="about-text">

      <p>
        December 2025
      </p>

      <p>
        <strong>Transnational Stages</strong> is a digital humanities project that builds on the foundation of several extant theater history projects. Our aim is to create a way for theater historians, performance studies scholars, and others interested in theater in the Atlantic world between 1680 and 1850 to compare performance practices in different theatrical venues, and to trace the mobility of authors, performers, and repertory across national boundaries.
      </p>

      <p>
        In the 2024-2025 academic year, funded by MIT and the University of Bergen, we compared the datasets created by these different national projects and assembled the current website. Its main feature is a set of visualizations that allows one to compare the frequency of performance and the types of genres found in the repertory of theaters in Amsterdam, Copenhagen, and Paris from 1748–1798.
      </p>

      <p>
        In the 2025-2026 academic year, we have already added to these visualizations and modified our web site design. By the end of the year, we hope to add data to our visualizations from theaters in London, Paris, Saint-Domingue (later Haiti), and New Orleans.
      </p>

      <p class="contact">
        If you have questions about this work, or would like to join or contribute, please contact Jeff Ravel
        <a href="mailto:ravel@mit.edu" class="link">here</a>.
      </p>

      <p class="caption">
        <em>Background Image: P. A. Wille, Interior of the Hôtel de Bourgogne Playhouse in Paris, 1767. Courtesy of Wikimedia Commons.</em>
      </p>
    </div>

    </div>
  </section>
</main>


  <style>
  main.about-page {
    background: #F6F3DE;
    min-height: 100vh;
  }

  /* === HERO FULL-BLEED === */
  .hero {
    position: relative;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    height: 45vh;
    background-color: #d6d3d1;
    background-size: cover;
    background-position: center 30%;
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
      #f5f5f4 100%
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
    font-family: 'Inter', sans-serif;
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media (max-width: 700px) {
    .hero {
      height: 35vh;
    }
    .hero h1 {
      font-size: 2.2rem;
    }
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .about-section {
    max-width: 800px;
    margin: 3rem auto;
    padding: 0 2rem;
  }

  .about-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .about-text {
    width: 100%;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .caption {
    font-size: 0.9rem;
    color: #666;
    margin-top: 3rem;
    text-align: center;
  }

  a.link {
    color: #393ed7;
    text-decoration: underline;
    font-weight: bold;
  }

  a.link:hover {
    color: #a3c4e9;
  }
  </style>
