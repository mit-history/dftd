<script>
    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
    }
    import { base } from '$app/paths';
  </script>

  <footer class="footer">
    <!-- <div class="page-wrapper"> -->
      <div class="nav-container">

        <div class="logos">
          <a href="https://web.mit.edu/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/mit_lockup_std-three-line_rgb_silver-gray.png" alt="MIT logo" width="142" /></a>

          <a href="https://www4.uib.no/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/UiB_NegativEmblem.png" alt="University of Bergen logo" width="90" /></a>

          <a href="https://www.st-andrews.ac.uk/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/04-standard-monochrome-all-white.jpg" alt="University of St Andrews logo" width="142" /></a>

          <a href="https://www.uva.nl/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/university_of_amsterdam.svg" alt="University of Amsterdam logo" width="202" /></a>

          <a href="https://www.universityofgalway.ie/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/university_of_galway.svg" alt="University of Galway logo" width="100" /></a>

          <a href="https://www.uoregon.edu/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/university_of_oregon.svg" alt="University of Oregon logo" width="55" /></a>

          <a href="https://www.uvic.ca/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/university_of_victoria.svg" alt="University of Victoria logo" width="100" /></a>

          <a href="https://lsu.edu/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/louisiana_state_university.svg" alt="Louisiana State University logo" width="85" /></a>

          <a href="https://www.parisnanterre.fr/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/universite_paris_nanterre.svg" alt="Universite Paris Nanterre logo" width="100" /></a>
            
          <a href="https://www.sorbonne-universite.fr/" target="_blank" rel="noopener noreferrer">
            <img src="{base}/images/sorbonne_universite.svg" alt="Sorbonne Universite logo" width="100" /></a>
        </div>

      </div>
  <!-- </div> -->
</footer>

  <style>
    .footer {
        padding: 1rem 2rem;
        background-color: black;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1); /* slight top shadow  */
        position: relative;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
}

    .nav-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    /* .page-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      width: 100%;
} */

    .logos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 30px;
      width: 100%;
    }

    .logos img {
      height: auto;
      object-fit: contain;
      transform: translateY(-10px);
      max-width: 100%;
}

    .logos a {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* manually set whitespace for first three images due to jpg, png inconsistency */
    .logos a:nth-child(1) { 
      margin-right: -15px; 
    }
    .logos a:nth-child(2) { 
      margin-left: 4.5px; 
      margin-right: 4.5px; 
    }
    .logos a:nth-child(3) { 
      margin-left: -19.5px; 
    }

    /* mobile styling */
    @media (max-width: 768px) {
      .logos a:nth-child(1) { margin-right: 0; }
      .logos a:nth-child(2) { margin-left: 0; margin-right: 0; }
      .logos a:nth-child(3) { margin-left: 0; }
    }

  </style>
