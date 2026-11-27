import argentStudioImg from '../assets/images/verellis_argent_front_1795617771442.webp';
import aurumStudioImg from '../assets/images/verellis_aurum_front_1795617771466.webp';
import noirStudioImg from '../assets/images/verellis_noir_front_1795617771816.webp';
import atelierCraftImg from '../assets/images/atelier_craft_macro_1795617754531.webp';
import type { WatchEditionId } from '../watch/catalog';

export const ATELIER_HERO_IMAGE = atelierCraftImg;

export const EDITION_MEDIA: Record<
  WatchEditionId,
  {
    image: string;
    alt: string;
    finishCategory: 'steel' | 'gold' | 'dlc';
    referenceCode: string;
    oneLineDesc: string;
    twoSentenceDesc: string;
    diameter: string;
    thickness: string;
    lugToLug: string;
    waterResistance: string;
    crystalSpec: string;
    movementSpec: string;
    braceletSpec: string;
    dialFinishSpec: string;
    materialsProse: string;
    careProse: string;
    weight: string;
    deliveryEstimate: string;
  }
> = {
  argent: {
    image: argentStudioImg,
    alt: 'VERELLIS Argent wristwatch in brushed 904L stainless steel with a silver sunburst dial',
    finishCategory: 'steel',
    referenceCode: 'VRL-01-AG',
    oneLineDesc: 'Brushed steel with silver sunburst dial.',
    twoSentenceDesc:
      'Cut from brushed 904L stainless steel with hand-chamfered octagonal bevels, Argent frames a fine silver sunburst dial set with Arabic-Indic numerals. Integrated tapering steel links articulate smoothly from the lugs to a twin-trigger folding clasp.',
    diameter: '40 mm octagonal',
    thickness: '8.5 mm',
    lugToLug: '46.2 mm',
    waterResistance: '100 m',
    crystalSpec: 'Sapphire crystal with anti-reflective coating',
    movementSpec: 'Automatic movement with 42-hour power reserve',
    braceletSpec: 'Integrated steel',
    dialFinishSpec: 'Silver sunburst with applied baton markers and Arabic-Indic numerals',
    materialsProse:
      'Milled from solid 904L steel billet for high corrosion resistance and crisp edge retention. Horizontal satin brushing runs across the case top and bracelet links, contrasted against mirror-polished bezel chamfers and bevelled hour hands with a warm gold second sweep.',
    careProse:
      'Ensure the knurled crown sits flush against the case before entering water. Rinse after saltwater immersion with lukewarm fresh water, wipe dry with a soft microfiber cloth, and schedule a seal check every 24 months.',
    weight: '138 g',
    deliveryEstimate: 'Ships insured within 5 business days',
  },
  aurum: {
    image: aurumStudioImg,
    alt: 'VERELLIS Aurum wristwatch in brushed 18k yellow gold with a champagne twin-register dial',
    finishCategory: 'gold',
    referenceCode: 'VRL-02-AU',
    oneLineDesc: 'Polished gold with champagne dial and two sub-dials.',
    twoSentenceDesc:
      'Crafted in warm 18k yellow gold with high-lustre bevels, Aurum pairs an architectural octagonal silhouette with a champagne sunburst dial featuring two balanced sub-dials. Its integrated tapering bracelet drapes smoothly around the wrist with crisp geometric link separation.',
    diameter: '40 mm octagonal',
    thickness: '8.5 mm',
    lugToLug: '46.2 mm',
    waterResistance: '100 m',
    crystalSpec: 'Sapphire crystal with anti-reflective coating',
    movementSpec: 'Automatic movement with 42-hour power reserve',
    braceletSpec: 'Integrated steel architecture in 18k yellow gold',
    dialFinishSpec: 'Champagne sunburst dial with two recessed sub-dials and gold indices',
    materialsProse:
      'Solid 18k yellow gold finished with alternating brushed flats and mirror-burnished chamfers along every facet of the bezel and case flanks. Applied gold batons, twin sub-dial rings, and bevelled hands create warm tonal depth under diffused light.',
    careProse:
      'Store separately inside the lined VERELLIS presentation pouch to protect polished 18k gold edges from contact marks. Clean gently with mild soapy water and pat dry without abrasive polishing cloths.',
    weight: '194 g',
    deliveryEstimate: 'Hand-regulated to order · 2 to 3 weeks',
  },
  noir: {
    image: noirStudioImg,
    alt: 'VERELLIS Noir wristwatch in satin-matte black DLC steel with an obsidian dial',
    finishCategory: 'dlc',
    referenceCode: 'VRL-01-NR',
    oneLineDesc: 'Matte black DLC steel with obsidian dial.',
    twoSentenceDesc:
      'Coated in micro-blasted matte black diamond-like carbon over hardened steel, Noir houses an obsidian sunburst dial accented by crisp silver hands and numerals. Subtle polished chamfers catch narrow architectural highlights along the dark octagonal bezel.',
    diameter: '40 mm octagonal',
    thickness: '8.5 mm',
    lugToLug: '46.2 mm',
    waterResistance: '100 m',
    crystalSpec: 'Sapphire crystal with anti-reflective coating',
    movementSpec: 'Automatic movement with 42-hour power reserve',
    braceletSpec: 'Integrated steel in matte black DLC finish',
    dialFinishSpec: 'Obsidian sunburst dial with silver numerals and soft gold sweep hand',
    materialsProse:
      'Vapour-deposited matte black DLC hardens the 40mm octagonal case and integrated steel links against micro-scratches while preserving the fine directional brushed texture beneath. Contrasting silver-rhodium hands and indices maximize legibility.',
    careProse:
      'Wipe fingerprint oils from matte black DLC surfaces using a damp soft lint-free cloth. Avoid chemical solvents or abrasive pastes, and confirm the screw crown is fully seated prior to swimming.',
    weight: '136 g',
    deliveryEstimate: 'Ships insured within 5 business days',
  },
};

export const SIZE_GUIDE_ROWS = [
  { wrist: '15.0 – 16.0 cm', fit: 'XS (3 links removed)', links: '11 links' },
  { wrist: '16.1 – 17.5 cm', fit: 'S / M (1–2 links removed)', links: '12–13 links' },
  { wrist: '17.6 – 18.8 cm', fit: 'M / L (Standard atelier fit)', links: '14 links' },
  { wrist: '18.9 – 20.5 cm', fit: 'L / XL (+1 spare link fitted)', links: '15 links' },
] as const;

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'VERELLIS — Time, Perfected',
    description:
      'Swiss-inspired architectural horology. Scroll-driven 3D timepiece assembly and the Argent, Aurum, and Noir collection.',
  },
  '/collection': {
    title: 'Collection — VERELLIS',
    description:
      'Explore the VERELLIS octagonal integrated-bracelet collection in interactive 3D: Argent, Aurum, and Noir.',
  },
  '/watch/argent': {
    title: 'VERELLIS Argent — Brushed Steel | VERELLIS',
    description:
      'Discover VERELLIS Argent: brushed steel 40mm octagonal case with silver sunburst dial and integrated steel bracelet.',
  },
  '/watch/aurum': {
    title: 'VERELLIS Aurum — Polished Gold | VERELLIS',
    description:
      'Discover VERELLIS Aurum: polished 18k yellow gold 40mm octagonal case with champagne twin-register dial.',
  },
  '/watch/noir': {
    title: 'VERELLIS Noir — Matte Black DLC | VERELLIS',
    description:
      'Discover VERELLIS Noir: matte black DLC steel 40mm octagonal case with obsidian dial and integrated bracelet.',
  },
  '/checkout': {
    title: 'Demo Checkout — VERELLIS',
    description:
      'Complete a demo atelier order request with contact details and shipping summary. No payment is taken.',
  },
  '/craft': {
    title: 'Craftsmanship — VERELLIS',
    description:
      'Inside the VERELLIS Geneva atelier: hand-chamfered octagonal bezels, optical sapphire crystal, and 100-metre pressure testing.',
  },
  '/story': {
    title: 'Our Story — VERELLIS',
    description:
      'Time, made slowly. The design philosophy, Arabic-Indic typographic heritage, and unhurried craft behind VERELLIS.',
  },
  '/contact': {
    title: 'Contact & Private Appointments — VERELLIS',
    description:
      'Book a private salon viewing in Geneva or speak virtually with a VERELLIS horological specialist.',
  },
  '/shipping-returns': {
    title: 'Shipping & Returns — VERELLIS',
    description:
      'Complimentary insured global courier delivery, signature handoff, and 30-day unworn return policy.',
  },
  '/warranty-care': {
    title: 'Warranty & Care — VERELLIS',
    description:
      'Five-year atelier warranty coverage, mechanical service intervals, and daily care guidance for your timepiece.',
  },
  '/faq': {
    title: 'Frequently Asked Questions — VERELLIS',
    description:
      'Answers regarding timepiece allocations, bracelet sizing, engraving, water resistance, and international servicing.',
  },
  '/privacy': {
    title: 'Privacy Policy — VERELLIS',
    description: 'How VERELLIS handles client consultation requests, site preferences, and privacy.',
  },
  '/terms': {
    title: 'Terms of Use — VERELLIS',
    description: 'Terms governing reservations, bespoke engraving requests, and warranty conditions at VERELLIS.',
  },
  '404': {
    title: 'Page Not Found — VERELLIS',
    description: 'The requested VERELLIS page could not be found.',
  },
};

export const CLIENT_PROMISES = [
  {
    id: 'shipping',
    title: 'Free insured shipping',
    detail: 'Door-to-door armored courier',
  },
  {
    id: 'returns',
    title: '30-day returns',
    detail: 'Complimentary collection pickup',
  },
  {
    id: 'warranty',
    title: '5-year warranty',
    detail: 'Atelier-certified coverage',
  },
  {
    id: 'engraving',
    title: 'Complimentary engraving',
    detail: 'Bespoke caseback inscription',
  },
] as const;

export const SAMPLE_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'The transition from brushed flat facets to mirror bevels catches light cleanly without feeling loud. On a 17 cm wrist the integrated links drape like silk.',
    author: 'Clara M.',
    edition: 'VERELLIS Argent',
    note: 'Sample content',
  },
  {
    id: 't2',
    quote:
      'Aurum wears noticeably slimmer than expected for solid gold. Watching the calibre come together online matched the precision when the presentation box arrived.',
    author: 'Henrik L.',
    edition: 'VERELLIS Aurum',
    note: 'Sample content',
  },
  {
    id: 't3',
    quote:
      'Noir reads completely restrained in dim rooms, then reveals the sunburst grain and Arabic-Indic numerals in daylight. Sizing took less than five minutes.',
    author: 'Sadia R.',
    edition: 'VERELLIS Noir',
    note: 'Sample content',
  },
] as const;

export const CRAFT_STAGES = [
  {
    step: '01',
    title: 'Octagonal Case Architecture',
    summary:
      'Each middle case and eight-faceted bezel starts from a cold-forged block, CNC-milled to 0.01 mm tolerances before every bevel is lapped by hand on boxwood pegs.',
    spec: '32 individual hand-chamfered edges',
  },
  {
    step: '02',
    title: 'Linear Brushed Bracelet',
    summary:
      'Seven tapered flat links per side follow a balanced wrist curvature, held by precision cylindrical pins and finished with longitudinal satin grain.',
    spec: '80% lug-to-clasp taper · zero play',
  },
  {
    step: '03',
    title: 'Dual-AR Domed Sapphire',
    summary:
      'Cambered synthetic corundum rated at 2,000 Vickers is ground to match the octagonal lip and treated internally and externally to erase glare.',
    spec: '2.1 mm domed profile · diamond-polished',
  },
  {
    step: '04',
    title: 'Five-Position Regulation',
    summary:
      'Every Calibre V-01 and V-02 movement is regulated across five thermal and spatial positions for 240 hours prior to casing and 100-metre wet-pressure testing.',
    spec: '-2 / +4 seconds per day tolerance',
  },
] as const;

export const FAQ_ITEMS = [
  {
    categoryId: 'sizing-fit',
    category: 'Sizing & Fit',
    question: 'How should I choose the right bracelet size before ordering?',
    answer:
      'Measure your wrist circumference snugly just above the wrist bone with a soft tape. Enter that measurement in centimetres in your appointment or checkout note, and our watchmakers will fit the integrated bracelet prior to dispatch.',
  },
  {
    categoryId: 'sizing-fit',
    category: 'Sizing & Fit',
    question: 'What happens if the bracelet needs adjustment after arrival?',
    answer:
      'Every watch ships with all removed links and spare cylindrical pins in a lined pouch. Within your first 60 days, we provide complimentary return-courier resizing at our atelier or ship extra links free of charge.',
  },
  {
    categoryId: 'orders-payment',
    category: 'Ordering & Payment',
    question: 'What payment methods does VERELLIS accept?',
    answer:
      'Salon and private allocations accept major cards, Swiss and international bank wire transfers, and insured escrow clearance. This online preview runs a demo checkout where no payment is taken or card data stored.',
  },
  {
    categoryId: 'orders-payment',
    category: 'Ordering & Payment',
    question: 'Can I book a private viewing before committing to a finish?',
    answer:
      'Yes. You may schedule an unhurried private appointment in our Geneva salon or request a high-definition virtual walk-through to compare Argent, Aurum, and Noir side by side.',
  },
  {
    categoryId: 'shipping-returns',
    category: 'Shipping & Returns',
    question: 'How long does delivery take after my allocation is confirmed?',
    answer:
      'Argent and Noir pieces undergo final wrist sizing and five-position chronometric verification before leaving Geneva within 5 business days. Solid 18k gold Aurum editions are hand-regulated to order and ship within 2 to 3 weeks.',
  },
  {
    categoryId: 'shipping-returns',
    category: 'Shipping & Returns',
    question: 'How do 30-day returns and refunds work?',
    answer:
      'You may inspect your timepiece indoors for 30 days. Provided the watch remains unworn with protective clasp films intact and full kit included, our concierge arranges complimentary insured courier collection for a full refund.',
  },
  {
    categoryId: 'craft-authenticity',
    category: 'Craft & Authenticity',
    question: 'How is each VERELLIS timepiece authenticated?',
    answer:
      'Every caseback carries an individual serial number matched to a signed Geneva timing certificate recording five-position rate stability, amplitude, and 100-metre wet-pressure test results.',
  },
  {
    categoryId: 'craft-authenticity',
    category: 'Craft & Authenticity',
    question: 'What is included with bespoke caseback engraving?',
    answer:
      'We offer complimentary diamond-tip engraving of up to 24 characters along the solid perimeter ring framing the sapphire exhibition caseback. Custom-engraved watches retain full five-year mechanical warranty coverage.',
  },
  {
    categoryId: 'craft-authenticity',
    category: 'Craft & Authenticity',
    question: 'How durable is the matte black DLC coating on VERELLIS Noir?',
    answer:
      'Diamond-like carbon is applied via vapour deposition at elevated temperature, creating a surface hardness substantially higher than bare steel to resist everyday desk wear while preserving satin-brushed grain.',
  },
  {
    categoryId: 'servicing-warranty',
    category: 'Servicing & Warranty',
    question: 'How often should a VERELLIS mechanical calibre be serviced?',
    answer:
      'We recommend a complete movement overhaul every 5 years to clean, re-lubricate, and regulate the automatic escapement, paired with a quick gasket water-resistance check every 24 months if worn regularly in water.',
  },
  {
    categoryId: 'servicing-warranty',
    category: 'Servicing & Warranty',
    question: 'What does the 5-year atelier warranty cover?',
    answer:
      'Our five-year transferable warranty covers mechanical accuracy, automatic winding components, dial indices, and water-resistance gaskets against any manufacturing defect, including insured shipping to and from Geneva.',
  },
] as const;
