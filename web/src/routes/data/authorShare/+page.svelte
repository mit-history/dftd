<svelte:head>
  <title>Author Shares • Explore the Data</title>
</svelte:head>

<script>
  import { page } from "$app/stores";

  // Base URL of your notebook deployment
  const baseNotebookUrl = "https://dftd.observablehq.cloud/dftd";

  // reactive: whenever the route changes, this updates
  $: vizId = $page.params.viz;

  // full notebook embed URL
  $: notebookUrl = `${baseNotebookUrl}?viz=${vizId}`;
</script>



<main class="viz-page">
  <h1 class="title">Author Shares</h1>

  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Percentage of each city’s repertoire accounted for by a selected author.
      </span>
    </div>
  </section> -->

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
