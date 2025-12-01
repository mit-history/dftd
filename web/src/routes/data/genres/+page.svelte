<svelte:head>
  <title>Genres Across Cities • Explore the Data</title>
</svelte:head>

<script>
 const baseNotebookUrl = "https://dftd.observablehq.cloud/dftd";
const notebookUrl = `${baseNotebookUrl}?viz=genres#select-country-and-time-period`;

</script>


<main class="viz-page">
  <h1 class="title">Genres Across Cities</h1>

  <!-- Dummy timeline -->
  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – genre trends over time)</span>
    </div>
  </section> -->

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
</style>
