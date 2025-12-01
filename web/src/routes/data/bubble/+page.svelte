<svelte:head>
  <title>Author Bubble Map • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/"; // TODO: update when deployed
</script>

<main class="viz-page">
  <h1 class="title">Authors by Location</h1>

  <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Bubble visualization showing where authors appear across cities and time.
      </span>
    </div>
  </section>

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
  :global(body) { background: #f5f5f4; }

  .viz-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 4rem 1.5rem 4rem;
  }

  .title {
    font-size: 2.3rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .timeline { margin-bottom: 2rem; }

  .timeline-bar {
    height: 36px;
    border-radius: 999px;
    background: linear-gradient(to right, #e0f2fe, #ddd6fe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1f2933;
  }

  .timeline-label {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .viz-frame {
    border-radius: 14px;
    border: 1px solid #ddd;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .viz-frame iframe {
    width: 100%;
    height: 75vh;
    border: none;
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
    .viz-page { padding-top: 3rem; }
    .title { font-size: 1.9rem; }
    .viz-frame iframe { height: 65vh; }
  }
</style>
