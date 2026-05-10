<svelte:head>
  <title>About</title>
</svelte:head>

<script>
  import { base } from '$app/paths';
</script>

<main class="about-page">
  <!-- HERO SECTION -->
  <section class="hero" style="background-image: url('{base}/images/random_french_theater.jpg')">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1>About</h1>
      </div>
    </div>
  </section>

  <section class="about-section">
    <div class="about-container">

      <!-- Text -->
      <div class="about-text">

      <p>
        <u><strong>May 2026</strong></u>
      </p>

      <p>
        <strong>Transnational Stages</strong> is a digital humanities project that builds on the foundation of several extant theater history projects.
        Our aim is to create a way for theater historians, performance studies scholars, and others interested in theater in the eighteenth-century
        Atlantic world to compare performance practices in different theatrical venues, and to trace the mobility of authors, performers, and
        repertory across national boundaries.
      </p>

      <p>
        <u>History</u>
      </p>

      <p>
        The project began as a collaboration between Professor Ulla Kallenbach at the University of Bergen and Professors Jeff Ravel and Anne McCants at MIT.
        It was funded initially by an MIT Seed Funds grant, with supplemental support from the University of Bergen.
        The three collaborators have reached out to colleagues who have compiled datasets on theater performance in several venues in Europe and the Americas.
        Our goal to date has been to create visualizations that allow users to compare data on authors, genres, and performance frequency across the national boundaries in which theater history is traditionally studied.
        Our work began in Fall 2024 and has featured project planning meetings at MIT and the University of Bergen. In between these meetings, project partners have generously shared their datasets,
        allowing us to assemble them in our repository and link them to series of experimental visualizations, which you will find <a href="{base}/data" class="link">here</a>.
      </p>

      <p>
        <u>Current State</u>
      </p>

      <p>
        In Spring 2026, we are able to offer tools to visualize comparisons between theater venues in several European capitals and two venues in the Americas.
        The majority of this data derives from the second half of the eighteenth century; for a better sense of the current chronological scope of the project,
        see this <a href="{base}/timeline" class="link">timeline</a>. The tools we have created allow one to study the frequency of author performance within and across these different venues.
        They permit users to better understand the performance rates of different genres in various national settings.
        Finally, they allow researchers to get a sense of the frequency with which troupes on these stages performed across half a century.
        In all instances, we have created tools which we hope will allow researchers and others curious about the theater history and cultural history of the
        period to formulate questions that transcend national borders in this cosmopolitan age. The datasets we make available here do not contain the full amount
        of information compiled by our project partners on their <a href="{base}/affiliates" class="link">various web sites</a>. The heterogeneity of the historical record has forced us to focus on the most
        basic comparative categories. We urge our users, once they have explored our tools, to continue their investigations by digging deeper into the data our
        project partners have made available, and of course to explore other online and physical archives relevant to this history.
      </p>

      <p>
        Notes on specific datasets:
      </p>

      <ul>
        <li>
          <u>London</u>: Our data for the Covent Garden and Drury Lane theaters have been generously provided by the teams responsible for the London Stage Database and the Theatronomics  projects.  We are grateful to both teams, and to their project leads, Professors Mattie Burkert and David O'Shaughnessy, for sharing their work.
        </li>
        <li>
          <u>Madrid</u>: Our data for the Teatro de la Cruz and the Teatro del Principe are derived from a digital transcription of the print work <i>Cartelera teatral madrilena del siglo XVIII: 1708-1808</i>, eds. René Andioc and Mireille Coulon (Toulouse: Presses universitaires du Mirail, 1996).  We thank Professor Coulon for permission to use the data she and her deceased collaborator compiled.
        </li>
        <li>
          <u>New Orleans</u>: Our New Orleans data was generously provided by Professor Jeffery Leichman of Louisiana State University (LSU). He led a team of LSU students who extracted information regarding performances given in four New Orleans theaters in the early nineteenth century from the daily periodical <i>Le Moniteur de Louisane</i>."
        </li>
      </ul>

      <p>
        <u>Future Directions</u>
      </p>

      <p>
        Going forward, we plan to expand our project in several different ways. First, we hope to offer data from the first half of the eighteenth
        century in most of our venues. For various reasons we confined ourselves to making visible data from the second half of the century, but
        the data for the preceding period is, in most instances, readily available and will be added to our repertory as time and resources permit.
      </p>

      <p>
        Secondly, we would also like to add data from other eighteenth-century performance venues, both in Europe and the Americas. The historical record
        is substantively different in these two regions. In Europe, archival material has often been preserved that records many aspects of performance,
        receipts and expenditures, allowing for a more holistic view of the theatrical enterprise. In the Americas, the main source for performance history
        is usually local periodicals which contain announcements of plays about to be staged. This data is less reliable, in that we are unable to verify that
        the performance actually occurred, and more limited in that it does not contain information about the financial aspects of performance. Nevertheless,
        we are actively seeking to partner with colleagues who are compiling theater datasets in the period and would like to join the project. We acknowledge
        that we will never be able to provide an overview of all theatrical activity on both sides of the Atlantic in this period, but we are eager to create
        as a comprehensive a resource as the historical record and our resources will permit.
      </p>

      <p>
        Lastly, we intend to continue to refine our visualization tools to unlock more comparisons and sustain increasingly refined scholarly inquiry into the rich
        theatrical traditions of the Age of Enlightenment. We welcome your comments and suggestions about our work and invite to you to join us if you are interested.
        Please contact <a href="mailto:ravel@mit.edu" class="link">Jeff Ravel</a>, Professor Emeritus of History at MIT, to get involved.
      </p>
    </div>

    </div>
  </section>
</main>


  <style>
  main.about-page {
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
    background-position: center 30%;
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
    font-family: 'Inter', sans-serif;
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media (max-width: 700px) {
    .hero {
      height: 35vh;
    }
    .hero h1 {
      font-size: 2.2rem;
    }
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .about-section {
    max-width: 800px;
    margin: 3rem auto;
    padding: 0 2rem;
  }

  .about-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .about-text {
    width: 100%;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .caption {
    font-size: 0.9rem;
    color: #666;
    margin-top: 3rem;
    text-align: center;
  }

  a.link {
    color: #393ed7;
    text-decoration: underline;
    font-weight: bold;
  }

  a.link:hover {
    color: #a3c4e9;
  }
  </style>
