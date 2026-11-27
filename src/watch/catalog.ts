export type WatchEditionId = 'argent' | 'aurum' | 'noir';

export interface WatchEditionSpec {
  id: WatchEditionId;
  name: string;
  price: string;
  numericPrice: number;
  subtitle: string;
  caseSummary: string;
  dialSummary: string;
  movementSummary: string;
  caseColor: string;
  bezelColor: string;
  markerColor: string;
  metalness: number;
  roughness: number;
  polishedRoughness: number;
  clearcoat: number;
  anisotropy: number;
  dialBaseHex: string;
  dialHighlightHex: string;
  numeralHex: string;
  handHex: string;
  secondHandHex: string;
  hasSubDials: boolean;
  swatchHex: string;
}

export const WATCH_EDITIONS: WatchEditionSpec[] = [
  {
    id: 'argent',
    name: 'Argent',
    price: '$4,800',
    numericPrice: 4800,
    subtitle: 'Brushed 904L Steel · Silver Sunburst',
    caseSummary: 'Octagonal brushed steel case with mirror-chamfered bezel',
    dialSummary: 'Subtle silver sunburst with raised batons & Arabic-Indic numerals',
    movementSummary: 'Calibre V-01 automatic, 72-hour reserve',
    caseColor: '#B4BCC6',
    bezelColor: '#C8CFD8',
    markerColor: '#8F98A3',
    metalness: 1.0,
    roughness: 0.4,
    polishedRoughness: 0.22,
    clearcoat: 0.35,
    anisotropy: 0.9,
    dialBaseHex: '#DDE1E6',
    dialHighlightHex: '#EFF1F4',
    numeralHex: '#181B20',
    handHex: '#252930',
    secondHandHex: '#B8975A',
    hasSubDials: false,
    swatchHex: '#D6DBE0',
  },
  {
    id: 'aurum',
    name: 'Aurum',
    price: '$7,200',
    numericPrice: 7200,
    subtitle: '18k Yellow Gold · Champagne Twin-Register',
    caseSummary: 'Brushed & hand-polished 18k yellow gold octagonal architecture',
    dialSummary: 'Champagne sunburst with gold applied indices & twin sub-dials',
    movementSummary: 'Calibre V-02 twin-register automatic',
    caseColor: '#CEA44A',
    bezelColor: '#DEC06A',
    markerColor: '#B4862C',
    metalness: 1.0,
    roughness: 0.36,
    polishedRoughness: 0.2,
    clearcoat: 0.55,
    anisotropy: 0.85,
    dialBaseHex: '#E5CFA0',
    dialHighlightHex: '#F3E5C2',
    numeralHex: '#634814',
    handHex: '#9E7320',
    secondHandHex: '#1A1A1A',
    hasSubDials: true,
    swatchHex: '#D8B15D',
  },
  {
    id: 'noir',
    name: 'Noir',
    price: '$5,400',
    numericPrice: 5400,
    subtitle: 'DLC Matte Steel · Obsidian Sunburst',
    caseSummary: 'Satin-brushed DLC coated steel case with dark polished bevels',
    dialSummary: 'Deep obsidian dial with silver numerals, raised markers & hands',
    movementSummary: 'Calibre V-01 Noir blackened rotor automatic',
    caseColor: '#2B2E33',
    bezelColor: '#363A40',
    markerColor: '#E2E6EC',
    metalness: 0.96,
    roughness: 0.43,
    polishedRoughness: 0.26,
    clearcoat: 0.28,
    anisotropy: 0.82,
    dialBaseHex: '#181A1D',
    dialHighlightHex: '#282B30',
    numeralHex: '#E4E7EC',
    handHex: '#E8ECF1',
    secondHandHex: '#B8975A',
    hasSubDials: false,
    swatchHex: '#232528',
  },
];

export interface HeroChapter {
  id: number;
  start: number;
  end: number;
  title: string;
  subtitle?: string;
  hasCta?: boolean;
}

export const HERO_CHAPTERS: HeroChapter[] = [
  {
    id: 0,
    start: 0,
    end: 0.2,
    title: 'Precision begins in pieces.',
    subtitle: 'Swiss-inspired craftsmanship. Assembled by hand.',
  },
  {
    id: 1,
    start: 0.2,
    end: 0.5,
    title: 'Every part, placed with intent.',
  },
  {
    id: 2,
    start: 0.5,
    end: 0.8,
    title: 'Built to outlast the hour.',
  },
  {
    id: 3,
    start: 0.8,
    end: 1.0,
    title: 'VERELLIS',
    subtitle: 'Time, perfected.',
    hasCta: true,
  },
];

export interface CraftFeatureCard {
  id: string;
  title: string;
  detail: string;
  spec: string;
  floatClass: string;
}

export const CRAFT_FEATURES: CraftFeatureCard[] = [
  {
    id: 'sapphire',
    title: 'Sapphire Crystal',
    detail:
      'Domed synthetic corundum crystal ground to optical clarity with dual-sided anti-reflective treatment and a diamond-hard scratch threshold.',
    spec: '2,000 Vickers · Dual AR Coating',
    floatClass: 'craft-float-a',
  },
  {
    id: 'movement',
    title: 'Automatic Movement',
    detail:
      'In-house 28,800 vph mechanical calibre regulated across five positions, driven by a tungsten micro-weighted oscillating rotor.',
    spec: '72-Hour Reserve · 4 Hz Beat',
    floatClass: 'craft-float-b',
  },
  {
    id: 'warranty',
    title: '5-Year Warranty',
    detail:
      'Every numbered timepiece is pressure-tested, chronometrically certified, and backed by five years of atelier servicing and care.',
    spec: '100m Rated · Numbered Atelier Seal',
    floatClass: 'craft-float-c',
  },
];
