<svelte:head>
  <title>Author Bubble Map • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/?viz=bubble";
</script>


<main class="viz-page">
  <h1 class="title">Authors by Location</h1>

  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Bubble visualization showing where authors appear across cities and time.
      </span>
    </div>
  </section> -->

  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Author Bubble Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <section class="below-text">
    <p>
      This tool visualizes authors across Amsterdam, Copenhagen, and Paris using bubbles whose
      size corresponds to performance frequency. Adjustable time ranges and thresholds make it
      easy to identify which authors dominate a given city, which ones overlap across regions,
      and which appear only locally.
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
