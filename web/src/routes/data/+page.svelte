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
    },
    {
      id: "calendar",
      title: "Global Theatre Calendar",
      description:
        "Browse a calendrical view of performances across Amsterdam, Copenhagen, Paris, and New Orleans, with filters for date range, venue, and historical overlays."
    },
    {
      id: "authorShare",
      title: "Author Share",
      description:
        "Compare how much of each city’s repertoire is accounted for by a chosen author, using percentage-based stacked bar charts over time."
    },
    {
      id: "bubble",
      title: "Author Bubble",
      description:
        "Explore where authors are performed with bubble visualizations by city, time window, and frequency thresholds."
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

   <section class="desc-box">
    <h2 class="desc-title">About These Tools</h2>
    <p>
      Our goal is to provide users with an intuitive way to explore centuries of European theatre performance data.
      At present, you can compare information from Amsterdam, Copenhagen, and Paris between 1748 and 1798.
      Visualizations allow you to examine annual trends, genre differences, author prominence, and seasonal patterns.
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



  main.explore {
    background: #f5f5f4; /* warm light gray (Stone-100 from Tailwind palette) */
    min-height: 100vh;
  }

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
  /* === DESCRIPTION TEXT === */
.desc {
  max-width: 850px;
  margin: 3rem auto 2.5rem;
  font-size: 1.15rem;
  line-height: 1.75;
  color: #333;
  text-align: left;
  padding: 0 0.5rem;
}

/* Optional: first-line emphasis */
.desc::first-line {
  font-weight: 600;
}

/* Optional: smooth fade-in on scroll */
.desc {
  opacity: 0;
  transform: translateY(12px);
  animation: fadeUp 0.7s ease-out forwards;
}

/* === OVERVIEW / DESCRIPTION BOX === */
.desc-box {
  max-width: 900px;
  margin: 3rem auto;
  padding: 2rem 2.2rem;

  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 4px 18px rgba(0,0,0,0.06);

  text-align: left;
  animation: fadeUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(12px);
}

.desc-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #2a2a2a;
}

.desc-box p {
  font-size: 1.12rem;
  line-height: 1.7;
  color: #444;
  margin: 0;
}

/* fade animation */
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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


<!-- text from old explore the data page -->
  <!-- <p class="desc">
    Our ultimate goal is to allow users to explore multiple datasets simultaneously across the 1680-1750 period.
    The search and visualization tools we provide at this time allow access to data from playhouses in Amsterdam,
    Copenhagen, and Paris from 1748 to 1778. We plan to expand both the chronological and geographical scope of
    our data as we move forward.
    As an example, at present you can compare the number of annual performances in each of these three venues from 1748 to
    1778 in a bar graph:
  </p>

  <div class="image-gallery">
    <div class="image-block">
      <img src={base + '/images/Screenshot  3.png'} alt="London Theater">
    </div>
    <p>You can also compare this data via a twinned line graph and heat map:</p>
    <div class="image-block">
      <img src={base + '/images/Screenshot 2.png'} alt="London Theater">
    </div>
    <p>We also provide a way to visualize the proportionality of various theatrical genres in our datasets:</p>
    <div class="image-block">
      <img src={base + '/images/Screenshot 3.png'} alt="London Theater">
    </div>
  </div>

  <section class="link">
    To view interactive versions of these visualizations, click <a href="/data" target="_blank">here.</a>
  </section>
</div> -->
