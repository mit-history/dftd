<svelte:head>
  <title>Author Shares • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/"; // TODO: update when deployed
</script>

<main class="viz-page">
  <h1 class="title">Author Shares</h1>

  <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Percentage of each city’s repertoire accounted for by a selected author.
      </span>
    </div>
  </section>

  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Author Shares Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <section class="below-text">
    <p>
      This visualization shows how a particular playwright’s works contribute to each city’s
      repertoire over time. By normalizing each author's performances as a percentage of that
      city's total output, you can compare influence across Amsterdam, Copenhagen, and Paris even
      when their overall volumes differ dramatically.
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
