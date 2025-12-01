<svelte:head>
  <title>Days with Performances • Explore the Data</title>
</svelte:head>

<script>
  const notebookUrl = "http://localhost:3000/?viz=days"; // matches vizLabelById["days"]
</script>


<main class="viz-page">
  <!-- <h1 class="title">Days with Performances</h1> -->

  <!-- Dummy timeline -->
  <!-- <section class="timeline">
    <div class="timeline-bar">
      <span class="timeline-label">Timeline (placeholder – performance activity across the calendar)</span>
    </div>
  </section> -->

  <section class="viz-info">
  <div class="chip">Days with Performances</div>
  <h1>Daily Rhythms of Theatrical Activity</h1>

  <p>
    Examine how frequently performances occurred throughout each year. The animated
    line and heatmap views reveal seasonal patterns, holiday gaps, and annual cycles
    across theatre cultures.
  </p>

  <ul class="keypoints">
    <li>Compare daily activity across countries using grouped lines.</li>
    <li>Use the heatmap to identify high or low performance-density periods.</li>
    <li>Filter by genre to explore specific artistic traditions.</li>
  </ul>
</section>

  <!-- Interactive visualization -->
  <section class="viz-frame">
    <iframe
      src={notebookUrl}
      title="Days with Performances Visualization"
      loading="lazy"
    ></iframe>
  </section>

  <!-- Text below visualization
  <section class="below-text">
    <p>
      This visualization focuses on the calendar rhythm of performances: which parts of the year are
      most active, how seasons differ between cities, and where there are gaps in the record. It is
      especially useful for examining holidays, theatrical seasons, and long-term patterns in when
      performances actually take place.
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
