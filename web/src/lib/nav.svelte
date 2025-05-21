<script>
    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
    }
    import { base } from '$app/paths';
  </script>





  <footer class="footer">
    <div class="page-wrapper">
      <div class="nav-container">

        <div class="logos">
          <img src="{base}/images/mit_lockup_std-three-line_rgb_silver-gray.png" alt="MIT logo" width="190" />
          <img src="{base}/images/UiB_NegativEmblem.png" alt="University of Bergen logo" width="120" />
        </div>

      </div>
  </div>
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
      justify-content: space-between;
      align-items: center;
      padding: 0;
      margin: 0;
    }

    .page-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      width: 100%;
}

    .logos {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logos img {
      height: 13vh;
      object-fit: contain;
}




    /* mobile styling */

    @media (max-width: 768px) {

    }


  </style>
