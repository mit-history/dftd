<script>
  import Footer from '$lib/nav.svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="layout-wrapper">
  <header class="top-bar">
    <div class="top-bar-container">
      <ul>
        <li><a href={base + '/'} class:active={$page.url.pathname === base + '/'}>Home</a></li>
        <li><a href={base + '/about'} class:active={$page.url.pathname === base + '/about'}>About</a></li>
        <li><a href={base + '/data'} class:active={$page.url.pathname === base + '/data'}>Explore the Data</a></li>
        <li><a href={base + '/timeline'} class:active={$page.url.pathname === base + '/timeline'}>Dataset Timelines</a></li>
        <li><a href={base + '/affiliates'} class:active={$page.url.pathname === base + '/affiliates'}>Affiliated Projects</a></li>
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
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  background-color: #F6F3DE;
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
  background-color: rgb(124, 149, 116);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  overflow-x: visible;
}

.top-bar-container {
  display: flex;
  /* justify-content: center; */
  justify-content: space-between;
  position: relative;
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

.top-bar.transparent-nav li a:hover,
.top-bar.transparent-nav li a.active {
  color: black;
}


ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 0 auto;
  padding: 0;
  align-items: center;
  justify-content: center;
}

li a {
  padding: 0.6rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  text-decoration: none;
  color: black;
  font-weight: bold;
  transition: color 0.2s ease, background-color 0.2s ease;
}

li a:hover,
li a:focus,
li a.active {
  color: rgb(255, 254, 254);
  background-color: rgba(0, 0, 0, 0.1);
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F6F3DE;
}

.page-content {
  flex-grow: 1;
}


@media (max-width: 768px) {
  ul {
    gap: 0.5rem;
  }

  li a {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
}
</style>
