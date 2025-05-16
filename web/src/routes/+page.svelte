<svelte:head>
  <title>Theatre Across Borders</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

  <!-- <div class="logos">
    <img src="/images/mit_lockup_std-three-line_rgb_mit-red.svg" alt="MIT logo" width="100" />
    <img src="/images/University_of_Bergen_emblem.svg" alt="University of Bergen logo" width="100" />
  </div> -->

  <div class="page-background">
    <section class="hero">
      <div class="page-wrapper hero-container">
        <img
          class="full_screen_pic"
          src="{base}/images/urop_home.png"
          alt="Map indicating mobility and showing the spread of European theater beyond the continent"
        />

        <div class="hero-text">
          <h1>The Transnational Stage</h1>
          <p class="subtitle">Theatrical Circulation and Exchange in the Atlantic World, 1680–1850</p>
        </div>
      </div>

      <p class="caption">
        Image from the web site <a href="https://artex.au.dk/">Artistic Exchanges</a>
      </p>

  <p class="intro">
      Theatre history from the seventeenth to the twentieth centuries is often studied in isolated national
      contexts. But performers, texts, and plays often crossed land boundaries and oceans in the period,
      creating new meanings and audience expectations as they did so. <strong>Theatre Across Borders</strong>
      offers users the opportunity to study national datasets via comparative visualization tools, thereby
      creating new insights into international theatrical trends in the Early Modern and Modern periods.
    </p>


    </section>
  </div>




<!-- <section class="filler">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
  <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
  <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.</p>

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
  <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
  <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.</p>


</section> -->

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
    background-color: #f5f5f5;
    border-radius: .4em;

}


  .hero-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.full_screen_pic {
  width: 100%;
  max-height: 80vh;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  border: 0.25em solid rgba(17, 1, 1, 0.2);
}

.hero-text {
  position: absolute;
  top: 15%;
  left: 33%;
  transform: translate(-50%, -50%);
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



.hero-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background: rgba(105, 104, 104, 0.3); */
  z-index: 1;
}

  .hero {
    text-align: center;
    padding: 2rem 1rem;
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

  .logos {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }


  .filler {
    /* max-width: 70%; */
    margin: 0 auto;
    padding: 0 1rem;
    line-height: 1.8;
    text-align: center;
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
