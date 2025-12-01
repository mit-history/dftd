<svelte:head>
  <title>Performances by Author • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/"; // TODO: update when deployed
</script>

<main class="viz-page">
  <h1 class="title">Performances by Author</h1>

  <!-- Dummy timeline -->
  <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – author presence across years)</span>
    </div>
  </section>

  <!-- Interactive visualization -->
  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Performances by Author Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <!-- Text below visualization -->
  <section class="below-text">
    <p>
      This view helps you trace how often individual authors appear in each repertoire over time.
      You might use it to compare local playwrights with international figures, identify periods
      when a particular author dominates the stage, or see how long an author’s works persist in
      a given city’s repertoire.
    </p>
  </section>
</main>

<style>

  :global(body) {
  background: #f5f5f4; /* warm light gray (Stone-100 from Tailwind palette) */
}

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

  .timeline {
    margin-bottom: 2rem;
  }

  .timeline-bar {
    position: relative;
    height: 36px;
    border-radius: 999px;
    background: linear-gradient(to right, #fef3c7, #bbf7d0);
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
