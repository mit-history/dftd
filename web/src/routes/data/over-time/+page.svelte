<svelte:head>
  <title>Performances Over Time • Explore the Data</title>
</svelte:head>

<script>
const baseNotebookUrl = "https://dftd.observablehq.cloud/dftd";
const notebookUrl = `${baseNotebookUrl}?viz=over-time#select-country-and-time-period`;

</script>


<main class="viz-page">
  <!-- Title -->
  <h1 class="title">Performances Over Time</h1>

  <!-- Dummy timeline -->
  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – 1748 → 1798)</span>
    </div>
  </section> -->

  <!-- Text below visualization -->
  <section class="below-text">
    <p>
      This view focuses on how performance counts change over time in each city’s repertoire.
      Use the filters in the visualization to narrow the date range, toggle cities, and explore
      periods of growth, decline, or disruption. This is especially useful for spotting shifts
      around major historical events or theatre reforms.
    </p>
  </section>

  <!-- Interactive visualization -->
  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Performances Over Time Visualization"
      loading="lazy"
    ></iframe>
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
