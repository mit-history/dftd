<svelte:head>
  <title>Affiliated Projects</title>
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
      name: 'Comédie-Française Registers Project (Paris)',
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
      name: 'Theatre in Saint-Domingue',
      link: 'https://www.theatreinsaintdomingue.org/',
      ranges: [{ start: 1764, end: 1791 }],
      color: '#b07d62'
    }
  ];

  const minYear = 1600;
  const maxYear = 1950;
  const yearRange = maxYear - minYear;
</script>

<main class="affiliates-page">
  <!-- HERO SECTION -->
  <section class="hero" style="background-image: url('{base}/images/affiliated_projects_banner.jpg')">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1>Affiliated Projects</h1>
      </div>
    </div>
  </section>

  <section class="affiliates-section">
  <div class="projects-grid">

    <div class="project-card">
      <a href="https://artex.au.dk/" target="_blank" class="project-title">
      <img src={base + '/images/copen_theat.jpg'} alt="Copenhagen Theater">
      Artistic Exchanges (Copenhagen)</a>

      <p style="text-align: center;">
        Project Contact: Ulla Kallenbach 
        [<a href="mailto:ulla.kallenbach@uib.no" style="color: #335c67;">
          ulla.kallenbach@uib.no
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://www.vondel.humanities.uva.nl/onstage/" target="_blank" class="project-title">
      <img src={base + '/images/amsterdam_theater.jpeg'} alt="Amsterdam Theater">
      Onstage (Amsterdam)</a>
      
      <p style="text-align: center;">
        Project Contact: Frans Blom
        [<a href="mailto:f.r.e.blom@uva.nl" style="color: #335c67;">
          f.r.e.blom@uva.nl
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://www.cfregisters.org/#!/" target="_blank" class="project-title">
      <img src={base + '/images/2560px-Couronnement_de_Voltaire.jpg'} alt="Comédie-Française">
      Comédie-Française Registers Project (Paris)</a>

      <p style="text-align: center;">
        Project Contact: Sara Harvey
        [<a href="mailto:saraharvey@uvic.ca" style="color: #335c67;">
          saraharvey@uvic.ca
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://repcomit18.mesu.sorbonne-universite.fr/" target="_blank" class="project-title">
      <img src={base + '/images/comedie_italienne.jpg'} alt="Répertoire de la Comédie-Italienne de Paris">
      Répertoire de la Comédie-Italienne de Paris</a>

      <p style="text-align: center;">
        Project Contact: Emanuele DeLuca
        [<a href="mailto:Emanuele.De-Luca@univ-cotedazur.fr" style="color: #335c67;">
          Emanuele.De-Luca@univ-cotedazur.fr
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://www.theatronomics.com/" target="_blank" class="project-title">
      <img src={base + '/images/Theatronomics Map 2[21].jpg.jpeg'} alt="London Theater">
      Theatronomics (London)</a>

      <p style="text-align: center;">
        Project Contact: David O’Shaughnessy
        [<a href="mailto:david.oshaughnessy@universityofgalway.ie" style="color: #335c67;">
          david.oshaughnessy@universityofgalway.ie
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://londonstagedatabase.uoregon.edu/" target="_blank" class="project-title">
      <img src={base + '/images/london_stage_database.jpeg'} alt="London Stage Database">
      London Stage Database</a>

      <p style="text-align: center;">
        Project Contact: Mattie Burkert
        [<a href="mailto:mburkert@uoregon.edu" style="color: #335c67;">
          mburkert@uoregon.edu
        </a>]
      </p>
    </div>

    <div class="project-card">
      <a href="https://www.theatreinsaintdomingue.org/" target="_blank" class="project-title">
      <img src={base + '/images/pic for website.jpeg'} alt="Theatre in Saint-Domingue">
        Theatre in Saint-Domingue</a>

        <p style="text-align: center;">
        Project Contact: Julia Prest
        [<a href="mailto:jp22@st-andrews.ac.uk" style="color: #335c67;">
          jp22@st-andrews.ac.uk
        </a>]
      </p>
    </div>


  </div>
  </section>
</main>


<style>
  main.affiliates-page {
    background: #F6F3DE;
    min-height: 100vh;
  }

  /* === HERO FULL-BLEED === */
  .hero {
    position: relative;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    height: 45vh;
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
      #f5f5f4 100%
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

  @media (max-width: 700px) {
    .hero {
      height: 50vh;
    }
    .hero h1 {
      font-size: 2rem;
    }
  }

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
    height: 160px;
    object-fit: cover;
    object-position: center;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .project-title {
    display: block;
    text-align: center;
    font-size: 1.3rem;
    color: #3b6f6b;
    font-weight: bold;
    text-decoration: none;
  }

  .project-title:hover {
    text-decoration: underline;
  }

  .project-card p {
    font-size: 0.85rem;
    word-break: break-word;
    overflow-wrap: break-word;
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
