<svelte:head>
  <title>Affiliates</title>
</svelte:head>

<script>
  import { base } from '$app/paths';

  const projects = [
    {
      name: 'Onstage (Amsterdam)',
      link: 'https://www.vondel.humanities.uva.nl/onstage/',
      ranges: [{ start: 1637, end: 1940 }],
      color: '#3b6f6b'
    },
    {
      name: 'Comédie-Française (Paris)',
      link: 'https://www.cfregisters.org/#!/',
      ranges: [
        { start: 1680, end: 1793 },
        { start: 1799, end: 1900 }
      ],
      color: '#a65e2e'
    },
    {
      name: 'Theatronomics (London)',
      link: 'https://www.theatronomics.com/',
      ranges: [{ start: 1732, end: 1809 }],
      color: '#335c67'
    },
    {
      name: 'Royal Danish Theatre (Copenhagen)',
      link: 'https://artex.au.dk/',
      ranges: [{ start: 1748, end: 1900 }],
      color: '#8c3f5d'
    },
    {
      name: 'Theatre in St Domingue',
      link: 'https://www.theatreinsaintdomingue.org/',
      ranges: [{ start: 1764, end: 1791 }],
      color: '#b07d62'
    }
  ];

  const minYear = 1600;
  const maxYear = 1950;
  const yearRange = maxYear - minYear;
</script>

<section class="affiliates-section">
  <h1>Affiliated Projects</h1>
  <hr />

  <div class="projects-grid">
    <div class="project-card">
      <img src={base + '/images/amsterdam_theater.jpeg'} alt="Amsterdam Theater">
      <hr />
      <a href="https://www.vondel.humanities.uva.nl/onstage/" target="_blank" class="project-title">Onstage (Amsterdam)</a>
      <p class="project-description">
        This is your address for questions about the repertoire, performances, popularity and revenues of the cultural program in Amsterdam’s public theatre during the period 1637 - 1772.
      </p>
    </div>

    <div class="project-card">
      <img src={base + '/images/lond_theat.jpg'} alt="London Theater">
      <hr />
      <a href="https://www.theatronomics.com/" target="_blank" class="project-title">Theatronomics (London)</a>
      <p class="project-description">
        Theatronomics offers an account of the eighteenth-century London stage. We tell the story of the commercial side of the entertainment industry to understand why some people made it…. and others did not.
      </p>
    </div>

    <div class="project-card">
      <img src={base + '/images/comed_fran.jpg'} alt="Comédie-Française">
      <hr />
      <a href="https://www.cfregisters.org/#!/" target="_blank" class="project-title">Comédie-Française (Paris)</a>
      <p class="project-description">
        Since its establishment in 1680, the Comédie-Française has produced and preserved daily registers documenting the company’s income and expenses, as well as the plays performed and their casting.
      </p>
    </div>

    <div class="project-card">
      <img src={base + '/images/perf_hait.jpg'} alt="Saint Domingue Theater">
      <hr />
      <a href="https://www.theatreinsaintdomingue.org/" target="_blank" class="project-title">Theatre in St Domingue</a>
      <p class="project-description">
        This website and database seek to make known the rich and varied culture of public theatre as documented in the local newspapers between 1764 and 1791.
      </p>
    </div>

    <div class="project-card">
      <img src={base + '/images/copen_theat.jpg'} alt="Copenhagen Theater">
      <hr />
      <a href="https://artex.au.dk/" target="_blank" class="project-title">Artistic Exchanges (Copenhagen)</a>
      <p class="project-description">
        Artistic Exchanges explores the transnational currents of Danish theatre. Follow the routes of travelling artists on the interactive mobility map, discover artists and their works, and delve into the repertoire of the Danish stage.
      </p>
    </div>
  </div>
</section>

<section class="timeline-section">
  <h2>Timeline of Projects</h2>
  <p class="subtitle">Each line corresponds to the duration of a project</p>

  <div class="timeline-container">
    <div class="year-labels">
      {#each Array.from({ length: (maxYear - minYear) / 25 + 1 }, (_, i) => minYear + i * 25) as year}
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

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .affiliates-section {
    max-width: 1000px;
    margin: 4rem auto;
    padding: 0 2rem;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .project-card {
    background-color: white;
    border-radius: 5px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .project-card img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .project-title {
    font-size: 1.3rem;
    color: #3b6f6b;
    font-weight: bold;
    text-decoration: none;
  }

  .project-title:hover {
    text-decoration: underline;
  }

  .project-description {
    margin-top: 0.8rem;
    font-size: 1rem;
    line-height: 1.6;
    color: #000000;
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
    left: 5em;
    transform: translateX(-105%);
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
