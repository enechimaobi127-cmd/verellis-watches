import { Link } from 'react-router-dom';
import { ATELIER_HERO_IMAGE } from '../data/siteContent';
import { VERELLIS_TOKENS } from '../styles/tokens';

const CRAFT_STEPS = [
  {
    step: '01',
    title: 'Design',
    body: 'Every VERELLIS watch starts on vellum at 10:1 scale. We balance the forty-millimetre octagonal bezel against an 8.5 mm profile and tapered lug geometry so the watch hugs the wrist flatly beneath a cuff.',
    illustration: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-12 w-12 text-[#B8975A]"
        aria-hidden="true"
      >
        <polygon
          points="22,8 42,8 56,22 56,42 42,56 22,56 8,42 8,22"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle cx="32" cy="32" r="14" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="8" y1="32" x2="56" y2="32" stroke="#1A1A1A" strokeWidth="0.75" opacity="0.4" />
        <line x1="32" y1="8" x2="32" y2="56" stroke="#1A1A1A" strokeWidth="0.75" opacity="0.4" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Casing',
    body: 'Cold-forged blocks are CNC-milled to tight tolerances before artisans draw longitudinal satin brushing across the upper flats and lap thirty-two octagonal chamfers by hand on boxwood pegs.',
    illustration: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-12 w-12 text-[#B8975A]"
        aria-hidden="true"
      >
        <polygon
          points="23,10 41,10 54,23 54,41 41,54 23,54 10,41 10,23"
          stroke="#1A1A1A"
          strokeWidth="1.25"
        />
        <polygon
          points="25,16 39,16 48,25 48,39 39,48 25,48 16,39 16,25"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <rect x="24" y="4" width="16" height="6" stroke="#1A1A1A" strokeWidth="1" />
        <rect x="24" y="54" width="16" height="6" stroke="#1A1A1A" strokeWidth="1" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Dial and Hands',
    body: 'Brass dial blanks receive microscopic radial brushing before electroplating in silver, champagne, or obsidian. Applied baton markers, Arabic-Indic numerals, and bevelled hands are seated cleanly under laminar air.',
    illustration: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-12 w-12 text-[#B8975A]"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="22" stroke="#1A1A1A" strokeWidth="1.25" />
        <circle cx="32" cy="32" r="17" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="32" y1="32" x2="32" y2="18" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2="43" y2="27" stroke="#1A1A1A" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="27" y1="35" x2="45" y2="23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <circle cx="32" cy="32" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Assembly',
    body: 'One watchmaker oversees each movement and bracelet pairing—fitting Viton gaskets, lowering the domed sapphire crystal, aligning the knurled crown, and pinning the tapering integrated links.',
    illustration: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-12 w-12 text-[#B8975A]"
        aria-hidden="true"
      >
        <circle cx="28" cy="32" r="14" stroke="#1A1A1A" strokeWidth="1.25" />
        <circle cx="28" cy="32" r="5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="44" cy="22" r="8" stroke="currentColor" strokeWidth="1.15" />
        <line x1="28" y1="14" x2="28" y2="20" stroke="#1A1A1A" strokeWidth="1" />
        <line x1="28" y1="44" x2="28" y2="50" stroke="#1A1A1A" strokeWidth="1" />
        <line x1="10" y1="32" x2="16" y2="32" stroke="#1A1A1A" strokeWidth="1" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Testing',
    body: 'Completed watches undergo 240 hours of five-position thermal timing checks alongside 100-metre wet-pressure verification and clasp-cycle endurance inspection before earning a signed timing card.',
    illustration: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-12 w-12 text-[#B8975A]"
        aria-hidden="true"
      >
        <circle cx="32" cy="34" r="20" stroke="#1A1A1A" strokeWidth="1.25" />
        <line x1="27" y1="8" x2="37" y2="8" stroke="#1A1A1A" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="32" y1="8" x2="32" y2="14" stroke="#1A1A1A" strokeWidth="1.25" />
        <path d="M23 35 L29 41 L42 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

const MATERIALS = [
  {
    name: '316L Steel',
    tag: 'Case & Integrated Bracelet',
    description:
      'Surgical-grade 316L austenitic stainless steel forms the core structural frame, selected for skin hypoallergenicity, crisp edge machining, and high resistance to salt and daily corrosion.',
  },
  {
    name: 'Sapphire Crystal',
    tag: 'Optical Protection',
    description:
      'Synthetic corundum measuring 2,000 Vickers is diamond-ground into a subtle 2.1 mm dome and treated on both faces with multi-layer anti-reflective coatings for unclouded clarity.',
  },
  {
    name: 'PVD and DLC Coating',
    tag: 'Hardened Surface Finishes',
    description:
      'Physical Vapour Deposition and micro-blasted Diamond-Like Carbon bond at the molecular level over brushed steel, delivering rich low-glare black tones with elevated surface hardness.',
  },
  {
    name: '18k Gold Plating',
    tag: 'Warm Precious Accents',
    description:
      'Precision 18k yellow gold deposition builds uniform warm lustre over hand-burnished bevels, crown flutes, and dial indices without softening crisp octagonal edges.',
  },
] as const;

export default function CraftPage() {
  return (
    <main className="page-fade-enter bg-white pt-16">
      {/* Hero Section */}
      <section className="py-[clamp(56px,7vw,92px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
            Atelier Craftsmanship
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-[clamp(2.4rem,4.8vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-[#1A1A1A] text-balance">
            Every detail, by hand.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-light leading-[1.75] text-[#1A1A1A]/75">
            True horological finishing reveals itself both at arm&apos;s length and under a 10×
            loupe. Every VERELLIS watch passes through deliberate hand stages where brushed planes
            absorb glare and mirror chamfers trace architectural light.
          </p>

          <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#1A1A1A]/8 bg-[#FAF9F6]">
            <img
              src={ATELIER_HERO_IMAGE}
              alt="Watchmaker assembling a VERELLIS calibre beside an octagonal case on a pale oak workbench"
              width={1376}
              height={768}
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Five-Step Vertical Sequence */}
      <section className="border-t border-[#1A1A1A]/8 py-[clamp(64px,8vw,104px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              From Sketch to Wrist
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.4vw,2.65rem)] font-medium text-[#1A1A1A]">
              Five Stages at the Bench
            </h2>
          </div>

          <ol className="mt-12 divide-y divide-[#1A1A1A]/10 border-y border-[#1A1A1A]/10">
            {CRAFT_STEPS.map((item) => (
              <li
                key={item.step}
                className="grid grid-cols-1 gap-6 py-9 min-[900px]:grid-cols-12 min-[900px]:items-center min-[900px]:gap-10"
              >
                <div className="flex items-center gap-5 min-[900px]:col-span-4">
                  <span className="font-serif text-3xl font-light tabular-nums text-[#85662C]">
                    {item.step}
                  </span>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A]/8 bg-[#FAF9F6]">
                    {item.illustration}
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm sm:text-base font-light leading-[1.75] text-[#1A1A1A]/75 min-[900px]:col-span-8">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Materials Section */}
      <section className="border-t border-[#1A1A1A]/8 bg-[#FAF9F6] py-[clamp(64px,8vw,104px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              Alloys & Surfaces
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.4vw,2.65rem)] font-medium text-[#1A1A1A]">
              Materials Built to Endure
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 min-[900px]:grid-cols-2">
            {MATERIALS.map((mat) => (
              <article
                key={mat.name}
                className="rounded-2xl border border-[#1A1A1A]/8 bg-white p-8"
              >
                <p className="text-xs font-medium tracking-[0.12em] text-[#85662C]">{mat.tag}</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[#1A1A1A]">
                  {mat.name}
                </h3>
                <p className="mt-3 text-sm font-light leading-[1.75] text-[#1A1A1A]/75">
                  {mat.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link to="/collection" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
              Explore the Collection
            </Link>
            <Link to="/contact" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
              Book a Salon Viewing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
