<script>
  import Footer from '$lib/nav.svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  let isOpen = false;
  function toggleMenu() {
    isOpen = !isOpen;
  }

  const isHome = derived(page, $page => $page.url.pathname === base + '/');
</script>

<div class="layout-wrapper">
  <header class="top-bar" class:transparent-nav={$isHome}>
    <div class="top-bar-container">
      <ul class:open={isOpen}>
        <li><a href={base + '/'}>Home</a></li>
        <li><a href={base + '/About'}>About</a></li>
        <li><a href={base + '/Affiliates'}>Affiliates</a></li>
        <li><a href={base + '/Explore%20the%20Data'}>Explore the Data</a></li>
        <li><a href={base + '/Team'}>Team</a></li>
      </ul>
    </div>
  </header>

  <main class="page-content">
    <slot />
  </main>

  <Footer />
</div>

<style>

  :global(html, body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0; /* ensure no side scroll */
  width: 100%;
  z-index: 1000;
  padding: 0.75rem 1.5rem;
  background-color: rgb(51, 168, 98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  overflow-x: hidden;
}

.top-bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

  .top-bar.transparent-nav {
    background-color: transparent;
    box-shadow: none;
  }

  .top-bar.transparent-nav li a {
    color: white;
  }

  .top-bar.transparent-nav li a:hover {
    color: black;
  }


  ul {
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
    font-size: 1rem;
    text-decoration: none;
    color: black;
    font-weight: bold;
    transition: color 0.2s ease;
  }

  li a:hover,
  li a:focus {
    color: rgb(255, 254, 254);
  }

  .layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .page-content {
    flex-grow: 1;
  }
</style>
