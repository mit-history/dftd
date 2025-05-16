<script>
    import Footer from '$lib/nav.svelte';
    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
    }
    import { base } from '$app/paths';
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>



<header class="top-bar">
  <div class="top-bar-container">
    <!-- <button class="hamburger" on:click={toggleMenu} aria-label="Toggle navigation">
      ☰
    </button> -->

    <ul class:open={isOpen}>
      <li><a href={base + '/'}>Home</a></li>
      <li><a href={base + '/About'}>About</a></li>
      <li><a href={base + '/Affiliates'}>Affiliates</a></li>
      <li><a href={base + '/Explore%20the%20Data'}>Explore the Data</a></li>
      <li><a href={base + '/Team'}>Team</a></li>
    </ul>


    <button class="search-icon" aria-label="Search">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>
  </div>
</header>


<slot />
<Footer />

<style>
  .top-bar {
    background-color: rgb(51, 168, 98);
    padding: 0.75rem 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    top: 0;
    width: 100%;
    z-index: 1000;
  }

  .top-bar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* .hamburger {
    font-size: 2rem;
    background: none;
    border: none;
    color: black;
    cursor: pointer;
    padding: 0.5rem;
  } */

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
        color: black;
        font-weight:bold;

    }

    li a:hover,
    li a:focus {
        /* background-color: rgba(255, 255, 255, 0.119); */
        color: rgb(255, 254, 254);
        transition: stroke 0.2s ease
    }

    .active a {
        background-color: rgba(255, 255, 255, 0.25);
        font-weight: 600;
      }


  </style>
