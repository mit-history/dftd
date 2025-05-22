<svelte:head>
  <title>Explore the Data</title>
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

<div class="explore-container">
  <h1>Explore the Data</h1>

  <section class="link">
    To view interactive versions of these visualizations, click <a href="/data" target="_blank">here.</a>.
  </section>

  <p class="desc">
    Our ultimate goal is to allow users to explore multiple datasets simultaneously across the 1680-1750 period.
    The search and visualization tools we provide at this time allow access to data from playhouses in Amsterdam,
    Copenhagen, and Paris from 1748 to 1778. We plan to expand the both the chronological and geographical scope of
    our data as we move forward.
    As an example, at present you can compare the number of annual performances in each of these three venues from 1748 to
    1778 in a bar graph:
  </p>

  <div class="image-gallery">
    <div class="image-block">
      <img src={base + '/images/Screenshot  3.png'} alt="London Theater">
    </div>
    <p>You can also compare this data via a twinned line graph and heat map:</p>
    <div class="image-block">
      <img src={base + '/images/Screenshot 2.png'} alt="London Theater">
    </div>
    <p>We also provide a way to visualize the proportionality of various theatrical genres in our datasets:</p>
    <div class="image-block">
      <img src={base + '/images/Screenshot 3.png'} alt="London Theater">
    </div>
  </div>

  <section class="link">
    To view interactive versions of these visualizations, click <a href="/data" target="_blank">here.</a>.
  </section>
</div>

<style>
  .explore-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
  }


  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .link {
    margin: 1.5rem 0;
    font-size: 1.1rem;
  }

  .link a {
    color: #3b6f6b;
    text-decoration: none;
    font-weight: 600;
  }

  .link a:hover {
    text-decoration: underline;
  }

  .desc {
    max-width: 750px;
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 1.5rem 0;
    color: #333;
  }

  .image-gallery {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin: 2rem 0;
    width: 100%;
  }

  .image-block {
    width: 90%;
    max-width: 800px;
  }

  .image-gallery img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  .image-gallery p {
    max-width: 750px;
    margin-top: 1.2rem;
    font-size: 1rem;
    color: #444;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 2rem;
    }

    .desc, .image-gallery p {
      font-size: 0.95rem;
    }
  }
</style>
