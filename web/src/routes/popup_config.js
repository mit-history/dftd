import { ranges } from './timeline/range-cache.json';

const period = key => `${ranges[key].start}–${ranges[key].end}`;

export const datasetColors = {
  dutch: '#EFB119', french: '#FF725C', danish: '#4269D0',
  coventGarden: '#4DA011', druryLane: '#DF789A',
  madridCruz: '#97BBF5', madridPrincipe: '#9C6B4E',
  saintDomingue: '#6BC5B0', newOrleans: '#A855F7'
};

export const popupContent = {
  'paris': {
    title: 'Paris, France',
    description: `Performance data from the Comédie-Française, ${period('french')}.`,
  },
  'amsterdam': {
    title: 'Amsterdam, Netherlands',
    description: `Performance data for Schouwburg Theater, ${period('dutch')}.`,
  },
  'copenhagen': {
    title: 'Copenhagen, Denmark',
    description: `Performance data for the Royal Danish Theater, ${period('danish')}.`,
  },
  'madrid': {
    title: 'Madrid, Spain',
    description: `Performance data for Teatro de la Cruz, ${period('madridCruz')}.\nPerformance data for Teatro del Príncipe, ${period('madridPrincipe')}.`,
  },
  'london': {
    title: 'London, England',
    description: `Performance data for Drury Lane Theater, ${period('druryLane')}.\nPerformance data for Covent Garden Theater, ${period('coventGarden')}.`,
  },
  'saint-domingue': {
    title: 'Saint-Domingue',
    description: `Performance data for all theaters, ${period('saintDomingue')}.`,
  },
  'new orleans': {
    title: 'New Orleans, Louisiana',
    description: `Performance data for all theaters, ${period('newOrleans')}.`,
  }
  
};
