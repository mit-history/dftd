<svelte:head>
  <title>Genres Across Cities • Explore the Data</title>
</svelte:head>

<script>
  const baseNotebookUrl = "https://transnationalstages.net/data";
  const notebookUrl = `${baseNotebookUrl}?viz=genres`;
</script>


<main class="viz-page">
  <!-- <h1 class="title">Genres Across Cities</h1> -->

  <!-- Dummy timeline -->
  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – genre trends over time)</span>
    </div>
  </section> -->

  <section class="viz-info">
  <div class="chip">Genre Composition</div>
  <h1>Genre Trends Across Time</h1>

  <p>
    Explore how comedy, drama, ballet, and other genres evolved across different
    theatre cultures. The diverging bars visualize contrasting artistic priorities
    between traditions.
  </p>

  <ul class="keypoints">
    <li>Compare genre balance between Danish and French theatres.</li>
    <li>Identify years with strong domination of a single genre.</li>
    <li>Hover for exact genre percentages per year.</li>
  </ul>
</section>

  <!-- Interactive visualization -->
  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Genres Across Cities Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <!-- Text below visualization -->
  <section class="below-text">
    <p>
      This visualization highlights the balance of genres—such as comedy, drama, tragedy, and ballet—
      across each dataset. By comparing cities over time, you can see how tastes shift, when certain
      genres surge in popularity, and which repertoires foreground particular kinds of performance.
    </p>
  </section>
</main>

<style>
  :global(body) {
    background: #f5f5f4; /* warm light gray */
    margin: 0;
  }

  .viz-page {
    margin: 0 auto;
    padding: 4rem 1.5rem 4rem;
  }

  .title {
    font-size: 2.3rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .viz-frame {
    width: min(1100px, 94vw);      /* almost full-width */
    margin: 3rem auto;             /* center + vertical spacing */
    border-radius: 14px;
    border: 1px solid #e5e7eb;     /* unobtrusive border */
    background: #ffffff;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }

  .viz-frame iframe {
    width: 100%;
    height: 85vh;
    border: none;
    display: block;
  }

  .below-text p {
    max-width: 850px;
    margin: 0 auto;
    font-size: 1.02rem;
    line-height: 1.7;
    color: #444;
    text-align: left;
  }

  @media (max-width: 600px) {
    .viz-page {
      padding-top: 3rem;
    }

    .title {
      font-size: 1.9rem;
    }

    .viz-frame {
      margin: 2rem auto;
      border-radius: 10px;
    }

    .viz-frame iframe {
      height: 100vh;
    }
  }


.viz-info {
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 1.2rem 1.5rem;
  border-radius: 16px;
  background: #fefce8;
  border: 1px solid #facc15;
  box-shadow: 0 8px 26px rgba(0,0,0,0.06);
}

.chip {
  display: inline-block;
  padding: 2px 10px;
  background: #fde047;
  color: #713f12;
  border-radius: 999px;
  font-size: .7rem;
  margin-bottom: .4rem;
  text-transform: uppercase;
  letter-spacing: .1em;
}

.viz-info h1 {
  margin: 0 0 .5rem 0;
  font-size: 1.4rem;
}

.keypoints {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: .5rem;
}

.keypoints li {
  padding: .5rem .7rem;
  background: #fef9c3;
  border: 1px solid #fcd34d;
  border-radius: .7rem;
  font-size: .85rem;
}


</style>
