<svelte:head>
  <title>About</title>
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

<h1>About</h1>

<hr />
<section class="about-section">
  <div class="about-container">

    <!-- Left: Text -->
    <div class="about-text">

      <p>
        <strong>Transnational Stages</strong> is a digital humanities project that builds on the foundation of several extant theater history projects. Our aim is to create a way for theater historians, performance studies scholars, and others interested in theater in the Atlantic world between 1680 and 1850 to compare performance practices in different theatrical venues, and to trace the mobility of performers and repertory across national boundaries.
      </p>

      <p>
        In the 2024-2025 academic year, funded by MIT and the University of Bergen, we compared the datasets created by these different national projects and assembled the current website. Its main feature is a tool that allows one to compare the frequency of performance and the types of genres found in the repertory of theaters in Amsterdam, Copenhagen, and Paris from 1748–1778.
      </p>

      <p>
        Based on this prototype, we intend to expand the chronological range to 1680–1850, and add data from London and Saint-Domingue.. Later, we'll include other theatrical venues from Europe and the Atlantic world and refine our search and visualization tools.
      </p>

      <p class="contact">
        If you have questions about this work, or would like to join or contribute, please contact Jeff Ravel
        <a href="https://outlook.office.com/mail/id/AAQkAGVjMTk5MTI0LWY4YTItNGIzOC04YjRiLTljMDc2YzQ3OTE0ZgAQANI9JbENZDxCl9ykRXnagnY%3D?actSwt=true#:~:text=you!%C2%A0%20Please%20contact-,Jeff%20Ravel,-." class="link">here</a>.
      </p>
    </div>

   <!-- Right: Image with caption -->
  <div class="about-image">
    <div class="image-wrapper">
      <img src="{base}/images/random_french_theater.jpg" alt="random French Theatre Illustration" />
      <p class="caption">
        P. A. Wille, Interior of the Hôtel de Bourgogne Playhouse in Paris, 1767. Courtesy of Wikimedia Commons.
      </p>
    </div>
  </div>

</section>


  <style>
.image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.caption {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.5rem;
  max-width: 500px;
}


  :global(body) {
    font-family: 'Inter', sans-serif;
    color: #000000;
    /* background-color: #f2f3f5; */
    margin: 0;
    /* padding: 0; */
    /* max-width: 70%; */
    /* margin: 3rem auto; */
    /* padding: 0 1rem; */
    line-height: 1.8;

  }


  h1 {
    font-family: 'Inter', sans-serif;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    margin-top: 4rem;
    text-align: center;
  }


  .about-section {
    padding: 3rem 1rem;
}

.about-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.about-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.7;
}

.about-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-image img {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
a.link {
  color: #393ed7;
  text-decoration: underline;
  font-weight: bold;
}

a.link:hover {
  color: #a3c4e9;
}


/* Make it responsive */
@media (max-width: 768px) {
  .about-container {
    flex-direction: column;
    align-items: center;
  }

  .about-image {
    margin-top: 2rem;
  }
}





  </style>
