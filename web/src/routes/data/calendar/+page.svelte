<svelte:head>
  <title>Global Theatre Calendar • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/?viz=calendar";
</script>


<main class="viz-page">
  <h1 class="title">Global Theatre Calendar</h1>

  <!-- Dummy timeline / context bar -->
  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Calendar view of performances across Amsterdam, Copenhagen, Paris, and New Orleans.
      </span>
    </div>
  </section> -->

  <!-- Interactive visualization -->
  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Global Theatre Calendar Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <!-- Text below visualization -->
  <section class="below-text">
    <p>
      This calendar visualization lets you browse performances day by day across multiple cities.
      You can adjust the date range, switch between monthly, weekly, or daily views, and filter by
      venue and dataset. Overlays for major historical events provide additional context for shifts
      in theatrical activity. It is designed to make it easier to see moments of intensive
      performance, periods of silence, and how New Orleans enters the transatlantic theatre network.
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
