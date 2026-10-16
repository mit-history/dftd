<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>London Affiliated Projects</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="affiliates-page">
  <section class="affiliates-section" aria-label="London affiliated projects">
    <a href={base + '/timeline'}>Back to Dataset Timelines</a>
    <p class="intro-text">
      Our data for the Covent Garden and Drury Lane theaters in London has been generously donated by two of our affiliated partners,
      the London Stage Database at the University of Oregon and the Theatronomics Project at the University of Galway.
      For more on these projects, click on the links in the boxes below.
    </p>
    <div class="projects-grid">
    <div class="project-card" style="border-color: #DF789A;">
      <a href="https://www.theatronomics.com/" target="_blank" rel="noopener noreferrer" class="project-title">
      <img src={base + '/images/Theatronomics Map 2[21].jpg.jpeg'} alt="London Theater">
      Theatronomics (London)</a>

      <p style="text-align: center;">
        Project Contact: David O’Shaughnessy
        [<a href="mailto:david.oshaughnessy@universityofgalway.ie" style="color: #335c67;">
          david.oshaughnessy@universityofgalway.ie
        </a>]
      </p>
    </div>

    <div class="project-card" style="border-color: #4DA011;">
      <a href="https://londonstagedatabase.uoregon.edu/" target="_blank" rel="noopener noreferrer" class="project-title">
      <img src={base + '/images/london_stage_database.jpeg'} alt="London Stage Database">
      London Stage Database</a>

      <p style="text-align: center;">
        Project Contact: Mattie Burkert
        [<a href="mailto:mburkert@uoregon.edu" style="color: #335c67;">
          mburkert@uoregon.edu
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

  .intro-text {
    margin: 1.5rem 0 2rem;
    color: #333;
    font-size: 1.05rem;
    line-height: 1.7;
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
    border-style: solid;
    border-width: 3px;
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

</style>
