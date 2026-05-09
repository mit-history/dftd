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
          <img src="{base}/images/mit_lockup_std-three-line_rgb_silver-gray.png" alt="MIT logo" width="142" />
          <img src="{base}/images/UiB_NegativEmblem.png" alt="University of Bergen logo" width="90" />
          <img src="{base}/images/04-standard-monochrome-all-white.jpg" alt="University of St Andrews logo" width="142" />
          <img src="{base}/images/university_of_amsterdam.svg" alt="University of Amsterdam logo" width="202" />
          <img src="{base}/images/university_of_galway.svg" alt="University of Galway logo" width="90" />
          <img src="{base}/images/university_of_oregon.svg" alt="University of Oregon logo" width="37" />
          <img src="{base}/images/university_of_victoria.svg" alt="University of Victoria logo" width="90" />
          <img src="{base}/images/louisiana_state_university.svg" alt="Louisiana State University logo" width="90" />
          <img src="{base}/images/universite_paris_nanterre.svg" alt="Universite Paris Nanterre logo" width="90" />
          <img src="{base}/images/sorbonne_universite.svg" alt="Sorbonne Universite logo" width="90" />
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
}

    .nav-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      margin: 0;
    }

    /* .page-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      width: 100%;
} */

    .logos {
      display: flex;
      align-items: center;
      gap: 30px;
      transform: translateX(-30px);
    }

    .logos img {
      height: 13vh;
      object-fit: contain;
      transform: translateY(-10px);
}

    /* manually set whitespace for first three images due to jpg, png inconsistency */
    .logos img:nth-child(1) { 
      margin-right: -15px; 
    }
    .logos img:nth-child(2) { 
      margin-left: 4.5px; 
      margin-right: 4.5px; 
    }
    .logos img:nth-child(3) { 
      margin-left: -19.5px; 
    }

    /* mobile styling */
    @media (max-width: 768px) {
    }

  </style>
