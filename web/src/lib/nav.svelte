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
        <a class="logo" href="/"></a>
        <!-- <button class="hamburger" on:click={toggleMenu} aria-label="Toggle navigation">
          ☰
        </button> -->

        <div class="logos">
          <img src="{base}/images/mit_lockup_std-three-line_rgb_silver-gray.png" alt="MIT logo" width="190" />
          <img src="{base}/images/UiB_NegativEmblem.png" alt="University of Bergen logo" width="120" />
        </div>

        <!-- <ul class:open={isOpen}>
          <li><a href="/">Home</a></li>
          <li><a href="/About">About</a></li>
          <li><a href="/Affiliates">Affiliates</a></li>
          <li><a href="/Search and Visualization Tool">Search and Visualization Tool</a></li>
          <li><a href="/Team">Team</a></li>
        </ul> -->

        <!-- <button class="search-icon" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button> -->
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



    ul {
        transition: max-height 0.3s ease;
        overflow: hidden;
        list-style: none;
        display: flex;
        gap: 1.5rem;
        margin: 0 auto;
        padding: 0;
        align-items: center;
    }
    li a {
        padding: 0.6rem 1rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
        font-size: 1rem;
        text-decoration: none;
        color: white;
        font-weight:bold;

    }

    li a:hover,
    li a:focus {
        /* background-color: rgba(255, 255, 255, 0.119); */
        color: rgb(159, 158, 158);
        transition: stroke 0.2s ease
    }

    .active a {
        background-color: rgba(255, 255, 255, 0.25);
        font-weight: 600;
      }


.search-icon:hover .icon {
  stroke: #ccc;
}

.top-bar {
  background-color: rgb(197, 206, 251);
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

/* .top-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Reuse your button styles */

.hamburger {
  font-size: 2rem;
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  padding: 0.5rem;
}
/*
.search-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.search-icon .icon {
  stroke: black;
  width: 1.5rem;
  height: 1.5rem;
  transition: stroke 0.2s ease;
}

.search-icon:hover .icon {
  stroke: #555;
} */

    /* mobile styling */

    @media (max-width: 768px) {
    ul {
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        flex-direction: column;
        background-color: #3B6F6B;
        max-height: 0;
    }

    ul.open {
        max-height: 500px;
    }

    li {
        padding: 1rem;
        text-align: center;
    }
    }


  </style>
