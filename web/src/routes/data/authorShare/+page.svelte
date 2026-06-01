<svelte:head>
  <title>Author Shares • Explore the Data</title>
</svelte:head>

<script>
  const baseNotebookUrl = "https://transnationalstages.net/data";
  const notebookUrl = `${baseNotebookUrl}?viz=authorShare`;
  
  let showPopup = true;
</script>

{#if showPopup}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    id="author-share-popup" 
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: pointer;" 
    on:click={() => showPopup = false}
  >
    <div style="max-width: 700px; width: 90%; background: #fdfd96; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 2rem;">
      <h3 style="margin: 0 0 1rem 0; color: #333;">
        We have not yet standardized the names of playwrights who appear in more than one of our datasets.
        But you can use this tool to visualize the presence of an author in multiple venues.
        As an example, type in the name of Shakespeare, Molière, Voltaire, Mercier, or Holberg in the "Search and add author" bar.
        Add all spellings of the author's name that appear up to a total of three, and the graph
        will display performances of the author's plays in multiple datasets.
      </h3>
      <p style="margin: 0; color: #666; text-align: center;">Click anywhere to dismiss</p>
    </div>  
  </div>
{/if}


<main class="viz-page">
  <!-- <h1 class="title">Author Shares</h1> -->

  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">
        Percentage of each city’s repertoire accounted for by a selected author.
      </span>
    </div>
  </section> -->
<section class="viz-info">
  <div class="chip">Authors</div>
  <h1>Author Presence in Repertories - Bar Graph</h1>
</section>

  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Author Shares Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <!-- <section class="below-text">
    <p>
      This visualization shows how a particular playwright’s works contribute to each city’s
      repertoire over time. By normalizing each author's performances as a percentage of that
      city's total output, you can compare influence across Amsterdam, Copenhagen, and Paris even
      when their overall volumes differ dramatically.
    </p>
  </section> -->
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
