<script>
  import { onMount } from 'svelte';

  const titles = [
    { lang: 'en', text: 'Transnational Stages' },
    { lang: 'fr', text: 'Scènes transnationales' },
    { lang: 'es', text: 'Escenarios transnacionales' },
    { lang: 'nl', text: 'Transnationale podia' },
    { lang: 'da', text: 'Transnationale scener' }
  ];
  const characters = 'abcdefghijklmnopqrstuvwxyz-_/.';
  let titleElement;

  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let interval;
    let frame;
    function renderText(text) {
      titleElement.textContent = text;
    }

    function settle(title) {
      renderText(title.text);
      titleElement.lang = title.lang;
    }

    function measureLetters(text) {
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;inset:0;visibility:hidden;';
      probe.textContent = text;
      titleElement.append(probe);
      const bounds = titleElement.getBoundingClientRect();
      const range = document.createRange();
      const letters = [...text].map((character, i) => {
        range.setStart(probe.firstChild, i);
        range.setEnd(probe.firstChild, i + 1);
        const rect = range.getBoundingClientRect();
        return {
          character, x: rect.left + rect.width / 2 - bounds.left,
          y: rect.top - bounds.top, width: rect.width, height: rect.height
        };
      });
      probe.remove();
      return letters;
    }

    function nextTitle() {
      index = (index + 1) % titles.length;
      const target = titles[index];
      const letters = measureLetters(target.text);
      const started = performance.now();
      const duration = 800;
      const style = getComputedStyle(titleElement);
      const gap = parseFloat(style.letterSpacing) || 0;
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const widths = new Map([...characters].map(character => [character, context.measureText(character).width]));
      const elements = letters.map(letter => {
        const element = document.createElement('span');
        element.className = 'scramble-glyph';
        element.style.left = `${letter.x}px`;
        element.style.top = `${letter.y}px`;
        element.style.lineHeight = `${letter.height}px`;
        return element;
      });
      titleElement.replaceChildren(...elements);
      titleElement.lang = target.lang;
      let lastUpdate = -Infinity;

      function animate(now) {
        const progress = Math.min(1, (now - started) / duration);
        if (progress === 1) {
          settle(target);
          frame = undefined;
          return;
        }
        if (now - lastUpdate >= 30) {
          lastUpdate = now;
          const revealed = Math.floor(progress * letters.length);
          letters.forEach((letter, i) => {
            const scrambled = i >= revealed && letter.character !== ' ';
            const character = scrambled
              ? characters[Math.floor(Math.random() * characters.length)]
              : letter.character;
            const scale = scrambled ? Math.min(1, Math.max(0, letter.width - gap) / widths.get(character)) : 1;
            elements[i].textContent = character;
            elements[i].style.transform = `translateX(-50%) scaleX(${scale})`;
          });
        }
        frame = requestAnimationFrame(animate);
      }
      animate(started);
    }

    function updatePlayback() {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      settle(titles[index]);
      if (preference.matches) {
        index = 0;
        settle(titles[0]);
      } else if (!document.hidden) {
        interval = setInterval(nextTitle, 5000);
      }
    }

    updatePlayback();
    preference.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    window.addEventListener('resize', updatePlayback);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      window.removeEventListener('resize', updatePlayback);
    };
  });
</script>

<span class="scramble-title" aria-hidden="true">
  {#each titles as title}
    <span class="sizer" lang={title.lang}>{title.text}</span>
  {/each}
  <span class="current-title" bind:this={titleElement} lang="en">Transnational Stages</span>
</span>

<style>
  .scramble-title {
    display: inline-grid;
    max-width: 100%;
    text-align: center;
    letter-spacing: .025em;
    font-kerning: none;
  }
  .scramble-title > span { grid-area: 1 / 1; }
  .sizer { visibility: hidden; pointer-events: none; }
  .current-title { position: relative; contain: size; overflow: hidden; }
  .current-title :global(.scramble-glyph) {
    position: absolute;
    transform: translateX(-50%);
    white-space: pre;
  }
</style>
