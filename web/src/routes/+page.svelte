<svelte:head>
  <title>Transnational Stages</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>


  <div class="page-background">
    <section class="hero">

      <div class="hero-container">
        <img
                  class="full_screen_pic"
                  src="{base}/images/Screenshot 2025-05-16 at 2.03.38 PM.png"
                  alt="Map indicating mobility and showing the spread of European theater beyond the continent"
                />
        <div class="hero-text">
          <h1>Transnational Stages</h1>
          <p class="subtitle">Theatrical Circulation and Exchange in the Atlantic World, 1680–1850</p>
        </div>
        </div>


        <div class="page-wrapper">
      <p class="caption">
        Image from the web site <a href="https://artex.au.dk/">Artistic Exchanges</a>
      </p>

  <p class="intro">
      Theatre history from the seventeenth to the twentieth centuries is often studied in isolated national
      contexts. But performers, texts, and plays often crossed land boundaries and oceans in the period,
      creating new meanings and audience expectations as they did so. <strong>Transnational Stages</strong>
      offers users the opportunity to study national datasets via comparative visualization tools, thereby
      creating new insights into international theatrical trends in the Early Modern and Modern periods.
  </p>
</div>


    </section>
  </div>




<style>
  :global(body) {
    font-family: 'Inter', sans-serif;
    color: #000000;
    /* background-color: #f2f3f5; */
    margin: 0;
    padding: 0;

  }

  .page-background {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    /* background-color: #f5f5f5; */
    border-radius: .4em;

}


 .hero-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100vw;
    margin-left: calc(50% - 50vw); /* centers full-width container; */
    margin-top: 0;
    background-color: #f5f5f5; /* or #684c39 if you want */

}

.full_screen_pic {
  display: block;
  width: 100%;
  max-height: 80vh;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  /* border: 0.25em solid rgba(17, 1, 1, 0.2); */
}


.hero-text {
  position: absolute;
  top: 22%;
  left: 27%;
  /* transform: translate(-50%, -50%); */
  color: #684c39;
  text-align: center;
  max-width: 90%;
  z-index: 2;
  animation: fadeIn 1.5s ease-out forwards;
}

h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-style: italic;
  color: black;
  text-decoration: overline;
}




  .hero {
    text-align: center;
    padding: 0;
  }


  .page-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
}

  .caption {
    font-size: 0.9rem;
    color: #0f0101;
    margin-top: 1rem;
    margin-bottom: 2rem;

  }

  .intro {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 2rem;
  }



  @keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -60%); /* slightly higher */
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%); /* back to center */
  }
}

</style>
