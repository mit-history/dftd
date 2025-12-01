<svelte:head>
  <title>Performances Over Time • Explore the Data</title>
</svelte:head>

<script>
  // TODO: replace with deployed Observable URL when ready
  const notebookUrl = "http://localhost:3000/";
</script>

<main class="viz-page">
  <!-- Title -->
  <h1 class="title">Performances Over Time</h1>

  <!-- Dummy timeline -->
  <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – 1748 → 1798)</span>
    </div>
  </section>

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
  background: #f5f5f4; /* warm light gray (Stone-100 from Tailwind palette) */
}

  .viz-frame {
  width: 100vw;
  margin-left: calc(50% - 50vw); /* full-width trick */
  margin-top: 3rem;
  margin-bottom: 3rem;

  border-radius: 0; /* optional, can set to 12px if you want rounded corners */
  border: none;
}

.viz-frame iframe {
  width: 100%;
  height: 85vh; /* taller */
  border: none;
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

  .timeline {
    margin-bottom: 2rem;
  }

  .timeline-bar {
    position: relative;
    height: 36px;
    border-radius: 999px;
    background: linear-gradient(to right, #cbd5e1, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1f2933;
  }

  .timeline-label {
    font-size: 0.95rem;
    font-weight: 600;
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

    .viz-frame iframe {
      height: 65vh;
    }
  }
</style>
