<script>
  import { base } from '$app/paths';

  const projects = [
    {
      name: 'Schouwburg Theater (Amsterdam)',
      link: 'https://www.vondel.humanities.uva.nl/onstage/',
      ranges: [{ start: 1748, end: 1798 }],
    },
    {
      name: 'Comédie-Française (Paris)',
      link: 'https://www.cfregisters.org/#!/',
      ranges: [
        { start: 1748, end: 1793 }],
    },
    {
      name: 'Royal Danish Theater (Copenhagen)',
      // link: '',
      ranges: [
        { start: 1748, end: 1798 }],
    },
    {
      name: 'Covent Garden (London)',
      // link: '',
      ranges: [{ start: 1766, end: 1800 }],
    },
    {
      name: 'Drury Lane (London)',
      // link: '',
      ranges: [{ start: 1766, end: 1800 }],
    },
    {
      name: 'Teatro de la Cruz (Madrid)',
      // link: '',
      ranges: [{ start: 1748, end: 1790 }],
    },
    {
      name: 'Teatro de la Principe (Madrid)',
      // link: '',
      ranges: [{ start: 1748, end: 1790 }],
    },
    {
      name: 'Saint-Domingue (All theaters)',
      link: 'https://www.theatreinsaintdomingue.org/',
      ranges: [{ start: 1764, end: 1791 }],
    },
    {
      name: 'New Orleans (All theaters)',
      // link: '',
      ranges: [{ start: 1805, end: 1812 }],
    },
  ];

  const allStarts = projects.flatMap(p => p.ranges.map(r => r.start));
  const allEnds = projects.flatMap(p => p.ranges.map(r => r.end));

  const earliestYear = Math.min(...allStarts);
  const latestYear = Math.max(...allEnds);

  const minYear = Math.floor(earliestYear / 5) * 5;
  const maxYear = Math.ceil(latestYear / 5) * 5;
  const yearRange = maxYear - minYear;
</script>

<svelte:head>
  <title>Data Timeline</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<main class="timeline-page">
  <!-- HERO SECTION -->
  <section class="hero" style="background-image: url('{base}/images/comparative_over_time_long.png')">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1>Dataset Timelines</h1>
        <p>
          Transnational Stages is a work-in-progress. 
          We ultimately plan to include datasets of the following duration for each theater accessible in our visualizations.
          The actual data currently accessible may be drawn from a shorter time span.
        </p>
      </div>
    </div>
  </section>

  <section class="timeline-section">
    <h2>Timeline of Projects</h2>
    <p class="subtitle">Each line corresponds to the duration of a project</p>

    <div class="timeline-container">
      <div class="year-labels">
        {#each Array.from({ length: Math.floor((maxYear - minYear) / 25) + 1 }, (_, i) => minYear + i * 25) as year}
          <div class="year" style="left: {(year - minYear) / yearRange * 100}%">{year}</div>
        {/each}
      </div>

      <div class="lines" style="height: {projects.length * 50}px">
        {#each projects as project, index}
          <div class="label" style="top: {index * 50}px;">
            <a href={project.link} target="_blank">{project.name} &#8599;</a>
          </div>
          {#each project.ranges as range}
            <div
              class="line tooltip"
              style="
                background-color: {project.color};
                top: {index * 50 + 20}px;
                left: {(range.start - minYear) / yearRange * 100}%;
                width: {(range.end - range.start) / yearRange * 100}%;
              "
            >
              <span class="tooltip-text">{project.name}: {range.start}–{range.end}</span>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </section>
</main>

<style>
  main.timeline-page {
    background: #F6F3DE;
    min-height: 100vh;
  }

  /* === HERO FULL-BLEED === */
  .hero {
    position: relative;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    height: 55vh;
    background-color: #d6d3d1;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 12px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      #ffffff 100%
    );
    pointer-events: none;
  }

  .hero-overlay {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(0, 0, 0, 0.45),
      rgba(0, 0, 0, 0.45)
    );
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-content {
    max-width: 900px;
    text-align: center;
    color: white;
    padding: 0 1.5rem;
    position: relative;
  }

  .hero h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hero p {
    max-width: 720px;
    margin: 0 auto;
    font-size: 1.15rem;
    line-height: 1.6;
  }

  @media (max-width: 700px) {
    .hero {
      height: 50vh;
    }
    .hero h1 {
      font-size: 2rem;
    }
    .hero p {
      font-size: 1rem;
    }
  }

  .timeline-section {
    max-width: 1000px;
    margin: 4rem auto;
    padding: 0 2rem;
  }

  .timeline-container {
      position: relative;
      border-top: 2px solid #ccc;
      padding-top: 2rem;
      overflow-x: visible;
  }

  .year-labels {
    position: relative;
    height: 2rem;
    margin-left: 280px;
  }

  .year {
    position: absolute;
    top: -1.5rem;
    transform: translateX(-50%);
    font-size: 0.9rem;
    color: #666;
  }

  .lines {
    position: relative;
    margin-top: 2rem;
    margin-left: 280px;
  }

  .line {
    position: absolute;
    height: 10px;
    border-radius: 5px;
    background-color: #999;
    cursor: pointer;
  }

  .tooltip-text {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    background-color: #333;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    top: -1.8rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    transition: opacity 0.2s;
  }

  .line:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  .label {
    position: absolute;
    right: 100%;
    margin-right: 1rem;
    font-size: 0.9rem;
    color: #333;
    white-space: nowrap;
  }

  .label a {
    text-decoration: none;
    color: #000000;
    font-weight: 500;
  }

  .label a:hover {
    color: rgb(167, 28, 28);
    font-weight: 600;
  }
</style>
