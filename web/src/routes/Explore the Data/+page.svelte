<svelte:head>
  <title>Explore the Data</title>
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

<div class="explore-container">
  <h1>Explore the Data</h1>

  <section class="link">
    Check out our interactive visualization tools <a href="/data" target="_blank">here</a>.
  </section>

  <div class="image-gallery">
    <img src={base + '/images/Screenshot  3.png'} alt="London Theater">
    <img src={base + '/images/Screenshot 2.png'} alt="London Theater">
    <img src={base + '/images/Screenshot 3.png'} alt="London Theater">
  </div>

  <section class="link">
    Check out our interactive visualization tools <a href="/data" target="_blank">here</a> to explore further.
  </section>
</div>

<style>
.explore-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* centers everything horizontally */
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.link {
  margin: 1rem 0;
  font-size: 1.1rem;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem 0;
}

.image-gallery img {
  max-width: 90%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}


</style>>
