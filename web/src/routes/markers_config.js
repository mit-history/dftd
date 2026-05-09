import parisMarkerSvg from './assets/paris marker.svg';
import amsterdamMarkerSvg from './assets/amsterdam marker.svg';
import copenhagenMarkerSvg from './assets/copenhagen marker.svg';
import madridMarkerSvg from './assets/madrid marker.svg';
import saintDomingueMarkerSvg from './assets/saint-domingue marker.svg';
import londonMarkerSvg from './assets/london marker.svg';
import newOrleansMarkerSvg from './assets/new orleans marker.svg';

function generateClipPath(widthStr, isMirrored = false) {
  // measurements made manually through paris pin
  const width = parseInt(widthStr, 10);
  const scale = 60 / width;

  const points = [
    [-50, 38], [0, 43], [6, 37], [8, 36], [10, 35], [20, 34], [30, 35], [40, 38.5], [45, 44],
    [44.5, 55], [41, 60], [35, 70], [23, 83],
    [100, 85], [100, 100], [40, 100], [35, 95], [25, 100], [19, 100], [10, 90], [20, 83], [5, 65], [0, 55], [-50, 83]
  ];

  const scaledPoints = points.map(([x, y]) => {
    let scaledX = x === 100 ? 100 : (x * scale);
    if (isMirrored) {
      scaledX = 100 - scaledX; // Flips the X coordinate to the opposite side
    }
    return `${Number(scaledX.toFixed(1))}% ${y}%`;
  });

  return `polygon(
      ${scaledPoints.slice(0, 9).join(', ')},
      ${scaledPoints.slice(9, 13).join(', ')},
      ${scaledPoints.slice(13).join(', ')}
    )`;
}

export const markers = [
  {
    id: 'paris',
    name: 'Paris',
    src: parisMarkerSvg,
    top: '37.5%',
    left: '79.8%',
    width: '60px',
    clipPath: generateClipPath('60px'),
    popupImage: '/french_graph.png'
  },

  {
    id: 'amsterdam',
    name: 'Amsterdam',
    src: amsterdamMarkerSvg,
    top: '31.5%',
    left: '83.5%',
    width: '101px',
    clipPath: generateClipPath('101px')
  },

  {
    id: 'copenhagen',
    name: 'Copenhagen',
    src: copenhagenMarkerSvg,
    top: '25.5%',
    left: '86.4%',
    width: '106px', 
    clipPath: generateClipPath('106px')
  },

  {
    id: 'madrid',
    name: 'Madrid',
    src: madridMarkerSvg,
    top: '52%',
    left: '76%',
    width: '76px',
    clipPath: generateClipPath('76px')
  },

  {
    id: 'saint-domingue',
    name: 'saint-domingue',
    src: saintDomingueMarkerSvg,
    top: '86.9%',
    left: '25.8%',
    width: '134.3px',
    clipPath: generateClipPath('134.3px')
  },

  {
    id: 'new orleans',
    name: 'New Orleans',
    src: newOrleansMarkerSvg,
    top: '65%',
    left: '13.5%',
    width: '112px',
    clipPath: generateClipPath('112px')
  },

  {
    id: 'london',
    name: 'London',
    src: londonMarkerSvg,
    top: '32%',
    left: '73.4%',
    width: '76.9px',
    clipPath: generateClipPath('76.9px', true)
  },
];