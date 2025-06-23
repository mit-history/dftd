<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Transnational Stages</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>


<section class="intro-hero">
  <video
    class="intro-video"
    autoplay
    muted
    loop
    playsinline
  >
    <source src={base + '/images/looped_journeys.mov'} type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <div class="overlay"></div>

  <div class="hero-text">
    <h1>Transnational Stages</h1>
    <p class="subtitle">Theatrical Circulation and Exchange in the Atlantic World, 1680–1850</p>
  </div>
</section>

<p class="caption">Image from the web site <a href="https://artex.au.dk/">Artistic Exchanges</a></p>

<section class="content-wrapper">

  <p class="intro">
      Theatre history from the seventeenth to the twentieth centuries is often studied in isolated national
      contexts. But performers, texts, and plays often crossed land boundaries and oceans in the period,
      creating new meanings and audience expectations as they did so. <strong>Transnational Stages</strong>
      offers users the opportunity to study national datasets via comparative visualization tools, thereby
      creating new insights into international theatrical trends in the Early Modern and Modern periods.
  </p>
</section>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    color: #000;
  }

  .intro-hero {
    position: relative;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .intro-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    box-shadow: 0px 40px 60px -20px rgba(0, 0, 0, 0.4);
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
    pointer-events: none;
    z-index: 1;
  }

  .hero-text {
    position: absolute;
    top: 34%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(233, 233, 233);
    text-align: center;
    z-index: 2;
    max-width: 90%;
    padding: 0 1rem;
  }

  .hero-text h1 {
    font-family: 'Inter', sans-serif;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 1.3rem;
    font-style: italic;
    /* text-decoration: overline; */
    color: #f5f5f5;
  }

  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 6rem 1.5rem 3rem;
    text-align: center;
  }

  .caption {
    font-size: 0.9rem;
    color: #555;
    margin: 1.5rem;

  }

  .caption a {
    text-decoration: none;
    color: rgb(3, 29, 160);
  }

  .caption a:hover {
    color: rgb(159, 17, 17);
  }

  .intro {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 2rem;
  }

  a {
    color: #684c39;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
