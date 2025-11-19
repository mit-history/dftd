<script>
  import { base } from "$app/paths";

  const visualizations = [
    {
      id: "over-time",
      title: "Performances Over Time",
      description:
        "Compare annual performance counts across Amsterdam, Copenhagen, and Paris within the selected date range."
    },
    {
      id: "genres",
      title: "Genres Across Cities",
      description:
        "Explore how comedy, drama, ballet, and other genres shift across repertoires over time."
    },
    {
      id: "authors",
      title: "Performances by Author",
      description:
        "See how frequently different playwrights appear in each dataset, and compare author influence across cities."
    },
    {
      id: "days",
      title: "Days with Performances",
      description:
        "View daily patterns of performances, highlighting seasonality and repertoire activity across the year."
    }
  ];
</script>

<svelte:head>
  <title>Explore the Data</title>
</svelte:head>

<main class="explore">

  <!-- HERO SECTION -->
  <section class="hero">
    <div class="hero-overlay">
      <div class="hero-content">
        <div class="accent-bar"></div>
        <h1>Explore the Data</h1>
        <p>
          Examine 18th-century performance data across Amsterdam, Copenhagen, and Paris.
          Discover trends across genres, authors, and seasons, and explore interactive
          visualizations from our digital theatre dataset.
        </p>
      </div>
    </div>
  </section>

  <!-- CONTENT BELOW HERO -->
  <section class="content">

    <section class="header">
      <h2>Explore the Data</h2>
      <p class="overview">
        Examine performances from Amsterdam, Copenhagen, and Paris using a collection of interactive data visualizations.
        Choose a view below to open a detailed page containing a description and the interactive visualization with default settings.
      </p>
    </section>

    <section class="menu-grid">
      {#each visualizations as viz}
        <a href={base + "/data/" + viz.id} class="card">
          <h3>{viz.title}</h3>
          <p>{viz.description}</p>
          <span class="arrow">Open visualization →</span>
        </a>
      {/each}
    </section>

  </section>
</main>

<style>
  /* === HERO FULL-BLEED === */
  .hero {
    position: relative;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    height: 55vh;
    background-image: url('/images/temp_EXP.jpg'); /* Place image in web/static/images/ */
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

  .accent-bar {
    width: 6px;
    height: 40px;
    background-color: #f7d300; /* NatGeo yellow */
    margin: 0 auto 1.3rem auto;
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


  /* === CONTENT BELOW HERO === */
  .content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
    text-align: center;
  }


  /* === PAGE TITLE + OVERVIEW === */
  .header h2 {
    font-size: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .overview {
    max-width: 750px;
    margin: 0 auto 3rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #444;
  }


  /* === GRID OF VISUALIZATIONS === */
  .menu-grid {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.8rem;
    text-align: left;
  }


  /* === INDIVIDUAL CARD === */
  .card {
    display: flex;
    flex-direction: column;
    padding: 1.75rem 1.5rem;
    border-radius: 14px;
    text-decoration: none;
    border: 1px solid #e4e4e4;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
    color: inherit;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .card p {
    margin: 0 0 1rem;
    color: #555;
    font-size: 0.97rem;
    line-height: 1.5;
  }

  .card .arrow {
    margin-top: auto;
    font-size: 0.95rem;
    font-weight: 600;
    color: #2b6cb0;
  }

  .card:hover,
  .card:focus-visible {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);
    border-color: #2b6cb0;
  }

  @media (max-width: 600px) {
    .header h2 {
      font-size: 2rem;
    }
    .overview {
      font-size: 1rem;
    }
  }
</style>
