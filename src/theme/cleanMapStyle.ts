// Custom Minimalist & High-Legibility Map Style for Sumayni
// Completely removes third-party commercial POIs, transit icons, and clutter.
// Ensures crystal-clear road and street labels with high-contrast text and clean white halos.

export const CLEAN_NEIGHBORHOOD_MAP_STYLE = [
  // 1. Omit all commercial icons and noise
  {
    featureType: 'all',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },

  // 2. Base text halo (stroke) across map: crisp white outline for legibility
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }, { weight: 3.5 }, { visibility: 'on' }],
  },

  // 3. Neighborhood & sector labels
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1E5E45' }],
  },

  // 4. Landscape / Background
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F8F9FA' }],
  },

  // 5. Hide external business/transit POIs
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },

  // 6. Parks & Green areas
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#E5EFEA' }, { visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2E5946' }, { visibility: 'on' }],
  },

  // 7. Roads geometry: crisp white with subtle gray stroke
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E2E6EB' }, { weight: 1.2 }],
  },

  // 8. Street names: high-contrast dark charcoal (#1A1D20) with white halo stroke (#FFFFFF)
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1A1D20' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }, { weight: 3.5 }, { visibility: 'on' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#23272F' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }, { weight: 3.5 }],
  },

  // 9. Water features: soft pastel blue
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#E3EBF3' }],
  },
];
