<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>New Orleans Affiliated Project</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="affiliates-page">
  <section class="affiliates-section" aria-label="New Orleans affiliated project">
    <a href={base + '/timeline'}>Back to Dataset Timelines</a>
    <p class="intro-text">
      Our New Orleans data was generously provided by Professor Jeffery Leichman of Louisiana State University (LSU).
      He led a team of LSU students who extracted information regarding performances given in all New Orleans theaters
      in the early nineteenth century from the periodical Le Moniteur de la Louisiane.
    </p>
    <div class="image-gallery">
        <a href={base + '/images/new-orleans-img1.jpg'} target="_blank" rel="noopener noreferrer" aria-label="View the Théâtre Saint-Philippe illustration at full size">
          <img src={base + '/images/new-orleans-img1.jpg'} alt="Historical illustration of the Théâtre Saint-Philippe façade, captioned 1810" />
        </a>
        <a href={base + '/images/new-orleans-img2.png'} target="_blank" rel="noopener noreferrer" aria-label="View the New Orleans playhouse proposal at full size">
          <img src={base + '/images/new-orleans-img2.png'} alt="Bilingual French and English proposal for a playhouse in New Orleans" />
        </a>
    </div>
  </section>
</main>

<style>
  .affiliates-page {
    background: #F6F3DE;
    min-height: 100vh;
    padding: 4rem 0 2rem;
  }

  .affiliates-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .intro-text {
    margin: 1.5rem 0 2rem;
    color: #333;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .image-gallery {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .image-gallery a {
    display: flex;
    justify-content: center;
    min-width: 0;
  }

  .image-gallery img {
    display: block;
    width: auto;
    height: min(30rem, 52vw);
    max-width: 100%;
    object-fit: contain;
  }

  @media (max-width: 700px) {
    .affiliates-page { padding-top: 6rem; }
    .affiliates-section { padding: 0 1rem; }
    .image-gallery { flex-direction: column; }
    .image-gallery img { height: min(30rem, 100vw); }
  }
</style>
