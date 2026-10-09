<script>
  import boat from '../routes/assets/boat.svg';
  export let viewBox = '0 0 612 300';

  // Traced from the supplied route sketch into the map's 612 × 300 coordinate space.
  // Paths describe illustrative circulation, rather than reconstructed individual voyages.
  const routes = [
    {
      id: 'north-atlantic-eastbound', duration: 17,
      path: 'M 208 127 C 289 106, 371 100, 428 101',
      dotPath: 'M 208 127 C 289 113, 371 107, 428 101'
    },
    {
      id: 'mid-atlantic-eastbound', duration: 21,
      path: 'M 111 193 C 205 149, 288 123, 350 103 C 375 101, 400 101, 428 101',
      dotPath: 'M 111 193 C 205 156, 288 130, 350 110 C 375 108, 400 108, 428 101'
    },
    {
      id: 'atlantic-caribbean-westbound', duration: 23,
      path: 'M 446 104 C 352 189, 259 234, 109 240',
      dotPath: 'M 446 104 C 352 181, 259 226, 109 240'
    },
    {
      id: 'europe-west-africa-southbound', duration: 22,
      path: 'M 446 113 C 393 166, 357 243, 367 300',
      dotPath: 'M 446 113 C 400 166, 364 243, 367 300'
    },
    {
      id: 'american-coast-southbound', duration: 11,
      path: 'M 144 149 C 166 177, 161 204, 139 221',
      dotPath: 'M 144 149 C 172 177, 167 204, 139 221'
    },
    {
      id: 'american-coast-northbound', duration: 12,
      path: 'M 108 235 C 136 217, 151 188, 133 157',
      dotPath: 'M 108 235 C 142 217, 157 188, 133 157'
    }
  ];
</script>

<svg class="travel-dots" {viewBox} aria-hidden="true">
  <defs>
    <filter id="travel-boat-color" color-interpolation-filters="sRGB">
      <feFlood flood-color="#B8B19D" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
  </defs>
  {#each routes as route, index (route.id)}
    {@const travelDuration = route.duration / 4}
    {@const cycleDuration = travelDuration + 5}
    {@const travelFraction = travelDuration / cycleDuration}
    {@const delay = -(index * 1.3)}
    <g visibility="hidden">
      <image href={boat} x="-3" y="-1.5" width="6" height="3" filter="url(#travel-boat-color)" />
      <animateMotion path={route.path} dur={`${cycleDuration}s`} begin={`${delay}s`}
        rotate="auto" repeatCount="indefinite" calcMode="spline" keyPoints="0;1;1"
        keyTimes={`0;${travelFraction};1`} keySplines="0.7 0 0.84 0;0 0 1 1" />
      <animate attributeName="visibility" values="visible;hidden;hidden" calcMode="discrete"
        keyTimes={`0;${travelFraction};1`}
        dur={`${cycleDuration}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </g>
    <circle r="1.5" fill="#B8B19D">
      <animateMotion path={route.dotPath} dur={`${route.duration}s`} begin={`${delay - 3}s`}
        repeatCount="indefinite" calcMode="linear" />
    </circle>
  {/each}
</svg>

<style>
  .travel-dots { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  @media (prefers-reduced-motion: reduce) { .travel-dots { display: none; } }
</style>
