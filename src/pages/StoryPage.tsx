import { Link } from 'react-router-dom';
import { ATELIER_HERO_IMAGE } from '../data/siteContent';
import { VERELLIS_TOKENS } from '../styles/tokens';

const VALUES = [
  {
    number: '01',
    title: 'Patience',
    body: 'Every bridge, bevel, and dial index is finished to its own clock rather than seasonal quotas, allowing watchmakers time to adjust each balance wheel without compromise.',
  },
  {
    number: '02',
    title: 'Precision',
    body: 'Octagonal symmetry leaves nowhere to hide. Case flanks, sapphire rims, and integrated bracelet links align to hundredths of a millimetre so light traces unbroken facets.',
  },
  {
    number: '03',
    title: 'Permanence',
    body: 'VERELLIS maintains three timeless editions built on serviceable mechanical architecture and enduring alloys rather than disposable seasonal trends.',
  },
] as const;

const MILESTONES = [
  {
    year: '2019',
    title: 'First Architectural Sketch',
    detail:
      'Founding drawings establish the forty-millimetre eight-sided bezel and integrated lug geometry above the Rue du Rhône.',
  },
  {
    year: '2021',
    title: 'Integrated Bracelet Tooling',
    detail:
      'Fourteen tapered flat links per side achieve seamless wrist drape with concealed cylindrical pins and twin-trigger clasp.',
  },
  {
    year: '2023',
    title: 'Five-Position Bench Standard',
    detail:
      'The Geneva regulating bench formalizes 240-hour chronometric verification and 100-metre wet-pressure sealing for every calibre.',
  },
  {
    year: '2026',
    title: 'The Permanent Trilogy',
    detail:
      'Argent, Aurum, and Noir launch together as VERELLIS’s foundational permanent collection across steel, 18k gold, and matte DLC.',
  },
] as const;

export default function StoryPage() {
  return (
    <main className="page-fade-enter bg-white pt-16">
      {/* Founding Story (~250 words) */}
      <section className="py-[clamp(56px,7vw,96px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">The Maison</p>
          <h1 className="mt-3 max-w-2xl font-serif text-[clamp(2.35rem,4.8vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-[#1A1A1A] text-balance">
            Time, made slowly.
          </h1>

          <div
            data-testid="founding-story-copy"
            className="mt-10 grid grid-cols-1 gap-8 min-[900px]:grid-cols-12"
          >
            <div className="min-[900px]:col-span-8 space-y-5 text-base font-light leading-[1.8] text-[#1A1A1A]/80">
              <p>
                VERELLIS began in a quiet third-floor workshop above the Rue du Rhône with a single
                architectural premise: a fine mechanical watch should rest naturally on the wrist
                without announcing itself across a room. Our two founders, a case engineer raised
                in Neuchâtel and a dial typographer trained in Basel, spent fourteen unhurried
                months refining one balanced eight-sided geometry. Every bevel was weighed against
                cuff clearance, natural wrist drape, and how longitudinal brushed grain converses
                with hand-lapped mirror chamfers under soft morning daylight.
              </p>
              <p>
                Rather than dispersing craft across dozens of fleeting seasonal references, the
                atelier committed early to one integrated silhouette expressed through three
                permanent finishes: Argent, Aurum, and Noir. Each forty-millimetre octagonal case
                flows seamlessly into fourteen tapering links machined to articulate smoothly around
                the wrist without pinch or rattle. Across the subtle sunburst dial, slender
                Arabic-Indic numerals honour centuries of Mediterranean astronomical instruments
                while leaving generous breathing room around bevelled hands. Nothing decorative
                survives unless it serves proportion, legibility, or tactile balance.
              </p>
              <p>
                From raw forged blank to final casing, a dedicated watchmaker guides each timepiece
                through two hundred and forty hours of five-position thermal regulation and strict
                wet-pressure testing. Because seasonal runs remain deliberately modest, patience at
                the bench replaces automated speed. When a collector closes the twin-trigger
                folding clasp, they feel honest metallic weight and quiet discipline engineered to
                remain serviceable, accurate, and composed through decades of everyday wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Photography */}
      <section className="pb-[clamp(56px,7vw,92px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#1A1A1A]/8 bg-[#FAF9F6]">
            <img
              src={ATELIER_HERO_IMAGE}
              alt="Inside the VERELLIS watchmaking atelier during hand assembly of an octagonal calibre"
              width={1376}
              height={768}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Three Values */}
      <section className="border-t border-[#1A1A1A]/8 py-[clamp(64px,8vw,100px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">Core Ethos</p>
          <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.4vw,2.65rem)] font-medium text-[#1A1A1A]">
            Three Guiding Values
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 min-[900px]:grid-cols-3">
            {VALUES.map((item) => (
              <article key={item.number} className="border-t border-[#1A1A1A]/12 pt-6">
                <span className="text-xs font-medium tracking-[0.14em] text-[#85662C] tabular-nums">
                  {item.number}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[#1A1A1A]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-[1.75] text-[#1A1A1A]/75">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Four-Milestone Timeline */}
      <section className="border-t border-[#1A1A1A]/8 bg-[#FAF9F6] py-[clamp(64px,8vw,100px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">Chronology</p>
          <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.4vw,2.65rem)] font-medium text-[#1A1A1A]">
            Atelier Milestones
          </h2>

          <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 min-[900px]:grid-cols-4">
            {MILESTONES.map((milestone) => (
              <li
                key={milestone.year}
                className="rounded-2xl border border-[#1A1A1A]/8 bg-white p-7"
              >
                <p className="font-serif text-3xl font-medium tabular-nums text-[#85662C]">
                  {milestone.year}
                </p>
                <h3 className="mt-3 font-serif text-xl font-medium text-[#1A1A1A]">
                  {milestone.title}
                </h3>
                <p className="mt-2.5 text-sm font-light leading-[1.7] text-[#1A1A1A]/75">
                  {milestone.detail}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link to="/craft" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
              Discover the Craft
            </Link>
            <Link to="/collection" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
              View the Collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
