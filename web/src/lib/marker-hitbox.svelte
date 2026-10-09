<script>
  import { onMount } from 'svelte';

  export let artwork;
  export let id;
  let container;

  // Keep the source SVG's font and path styles local to this marker.
  $: markup = artwork.replace(/\bcls-/g, `hit-${id.replace(/\W/g, '-')}-cls-`)
    .replace(/<\?xml[^>]*\?>/g, '');

  onMount(() => {
    const svg = container.querySelector('svg');
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    // The first closed contour is the pin's outer silhouette. Fill its interior
    // for hit testing so the cutouts and decorative details cannot interrupt hover.
    const pin = svg.querySelector('path');
    const outline = pin?.getAttribute('d')?.match(/^[\s\S]*?[zZ]/)?.[0];
    if (outline) {
      const silhouette = pin.cloneNode(false);
      silhouette.setAttribute('d', outline);
      pin.after(silhouette);
    }
    let disposed = false;

    const measureLabels = () => {
      if (disposed) return;
      svg.querySelectorAll('text').forEach(text => {
        const box = text.getBBox();
        let rect = text.nextElementSibling;
        if (!rect?.hasAttribute('data-label-hitbox')) {
          rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('data-label-hitbox', '');
          const transform = text.getAttribute('transform');
          if (transform) rect.setAttribute('transform', transform);
          text.after(rect);
        }
        for (const [key, value] of Object.entries({ x: box.x, y: box.y, width: box.width, height: box.height })) {
          rect.setAttribute(key, String(value));
        }
      });
    };

    measureLabels();
    document.fonts.ready.then(measureLabels);
    return () => { disposed = true; };
  });
</script>

<span class="hitbox" bind:this={container} aria-hidden="true">{@html markup}</span>

<style>
  .hitbox { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
  .hitbox :global(svg) { display: block; width: 100%; height: 100%; pointer-events: none; }
  .hitbox :global(path), .hitbox :global(rect), .hitbox :global(polygon),
  .hitbox :global(circle), .hitbox :global(ellipse) { pointer-events: visiblePainted; }
</style>
