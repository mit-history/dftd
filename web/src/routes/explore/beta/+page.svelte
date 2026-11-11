<script>
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { base } from "$app/paths";

  const dataUrl = dev ? "/data/explore" : "https://transnationalstages.net/data/explore";
  let dataFrame;
  let loading = true;
  let loadingSlow = false;
  let embedHeight;

  onMount(() => {
    const expectedOrigin = new URL(dataUrl, window.location.href).origin;
    function handleReady(event) {
      if (event.source !== dataFrame?.contentWindow || event.origin !== expectedOrigin) return;
      if (event.data?.type === "observable-ready") loading = false;
      if (event.data?.type === "observable-height" && Number.isFinite(event.data.height) && event.data.height > 0) {
        embedHeight = Math.ceil(event.data.height);
      }
    }
    window.addEventListener("message", handleReady);
    const timeout = window.setTimeout(() => { loadingSlow = true; }, 20000);
    return () => {
      window.removeEventListener("message", handleReady);
      window.clearTimeout(timeout);
    };
  });
</script>

<svelte:head>
  <title>Explore the Data · Beta</title>
</svelte:head>

<main class="explore-page">
  <section class="hero" style="background-image: url('{base}/images/explore_data_header.png')">
    <div class="hero-overlay">
      <h1>Explore the Data</h1>
    </div>
  </section>

  <section class="data-window" style:--embed-height={embedHeight ? `${embedHeight}px` : undefined} aria-label="Interactive data visualizations" aria-busy={loading}>
    {#if loading}
      <div class="loading-overlay" role="status" aria-live="polite">
        <span class="loading-spinner" aria-hidden="true"></span>
        <p>Loading visualizations…</p>
        {#if loadingSlow}
          <p class="loading-hint">The data is taking a little longer to load.</p>
          <button type="button" onclick={() => { loading = false; }}>Show visualizations</button>
        {/if}
      </div>
    {/if}
    <iframe bind:this={dataFrame} class:loading src={dataUrl} title="Explore the Data" loading="eager" tabindex={loading ? -1 : 0}></iframe>
  </section>
</main>

<style>
  .explore-page {
    background: #F6F3DE;
  }

  .hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 45vh;
    margin-left: calc(50% - 50vw);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .hero::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 12px;
    background: linear-gradient(to bottom, transparent, #F6F3DE);
    content: "";
    pointer-events: none;
  }

  .hero-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45));
  }

  .hero h1 {
    margin: 0 0 1rem;
    color: white;
    font-size: 2.8rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .data-window {
    position: relative;
    width: min(1440px, 94vw);
    height: clamp(16rem, var(--embed-height, 78vh), min(78vh, 900px));
    margin: 2rem auto 0;
    overflow: hidden;
    border: 1px solid #F6F3DE;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .data-window iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .data-window iframe.loading { visibility: hidden; }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .75rem;
    background: #faf9f3;
    color: #454331;
  }

  .loading-overlay p { margin: 0; }
  .loading-hint { font-size: .85rem; }
  .loading-overlay button {
    padding: .5rem .75rem;
    border: 1px solid #d6d3c8;
    border-radius: 4px;
    background: #fff;
    color: inherit;
    cursor: pointer;
  }
  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #dedbd2;
    border-top-color: #66634b;
    border-radius: 50%;
    animation: loading-spin .8s linear infinite;
  }
  @keyframes loading-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner { animation: none; }
  }

  @media (max-width: 700px) {
    .hero {
      height: 35vh;
    }

    .hero h1 {
      padding: 0 1rem;
      font-size: 2rem;
    }

    .data-window {
      width: 96vw;
      margin-top: 1rem;
    }
  }
</style>
