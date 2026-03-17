<script>
  import Footer from '$lib/nav.svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  let isOpen = false;
  function toggleMenu() {
    isOpen = !isOpen;
  }

  function handleClickOutside(event) {
    isOpen = false;}


  function clickOutside(node) {

    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(
          new CustomEvent('click_outside', node)
        )
      }
    }

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    }
  }

  const isHome = derived(page, $page => $page.url.pathname === base + '/');

  $: if ($page) {
    isOpen = false;
  }
</script>

<div class="layout-wrapper">
  <header class="top-bar">
    <div class="top-bar-container" use:clickOutside on:click_outside={handleClickOutside}>
      <button
        class:visible={!$isHome}
        class="hamburger"
        class:active={isOpen}
        on:click={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class:visible={$isHome} class:open={isOpen} >
        <li><a href={base + '/'}>Home</a></li>
        <li><a href={base + '/About'}>About</a></li>
        <li><a href={base + '/Affiliates'}>Affiliated Projects</a></li>
        <li><a href={base + '/data'}>Explore the Data</a></li>
        <li><a href={base + '/Team'}>People</a></li>
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

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger.visible {
  display: flex;
}

.hamburger span {
  width: 2rem;
  height: 3px;
  background: black;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.hamburger.active span:first-child {
  transform: rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg);
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


ul.visible {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0 auto;
  padding: 0;
  align-items: center;
}

ul:not(.visible){
  display: none;
  position: absolute;
  top: calc(100% + 00.75rem);
  left: -1.5rem;
  right: -1.5rem;
  flex-direction: column;
  background-color: rgb(124, 149, 116);;
  width: calc(25% + 3rem);
  margin: 0;
  padding: 0;
  gap: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  z-index: 1002;
  transition: opacity 0.3s ease-out, padding 0.3s ease-out;
}

ul:not(.visible).open{
  display: flex;
  max-height: 500px;
  opacity: 1;
  padding: 1rem 0;
}


ul:not(.visible) li {
  width: 100%;
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

ul:not(.visible) li a {
  display: block;
  padding: 1rem 1.5rem;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

li a:hover,
li a:focus {
  color: rgb(255, 254, 254);
}

ul:not(.visible) li a:hover,
ul:not(.visible) li a:focus {
  background-color: rgba(0, 0, 0, 0.1);
}

ul:not(.visible) li:last-child a{
  border-bottom: none;
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
  .hamburger {
    display: flex; /* Show hamburger on mobile */
  }

  ul {
    display: none;
    position: absolute;
    top: calc(100% + 00.75rem);
    left: -1.5rem;
    right: -1.5rem;
    flex-direction: column;
    background-color: rgb(124, 149, 116);;
    width: calc(100% + 3rem);
    margin: 0;
    padding: 0;
    gap: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    z-index: 1002;
    transition: opacity 0.3s ease-out, padding 0.3s ease-out;
  }

  ul.open {
    display: flex;
    max-height: 500px;
    opacity: 1;
    padding: 1rem 0;
  }

  li {
    width: 100%;
  }

  li a {
    display: block;
    padding: 1rem 1.5rem;
    width: 100%;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  li:last-child a {
    border-bottom: none;
  }

  li a:hover,
  li a:focus {
    background-color: rgba(0, 0, 0, 0.1);
    color: rgb(255, 254, 254);
  }
}
</style>
