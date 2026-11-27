import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Layers, ShieldCheck } from 'lucide-react';
import { CLIENT_PROMISES, SAMPLE_TESTIMONIALS } from '../data/siteContent';
import { VERELLIS_TOKENS } from '../styles/tokens';

const CRAFTSMANSHIP_POINTS = [
  {
    id: 'cases',
    title: 'Hand-finished cases',
    description:
      'Every octagonal bezel edge is hand-chamfered on boxwood pegs to separate crisp brushed facets from mirror bevels.',
    Icon: Layers,
  },
  {
    id: 'sapphire',
    title: 'Sapphire crystal',
    description:
      'Domed synthetic corundum ground to optical flatness with dual anti-reflective coating for effortless legibility.',
    Icon: ShieldCheck,
  },
  {
    id: 'water',
    title: 'Tested to 100 metres',
    description:
      'Twin Viton gaskets and a screw-down fluted crown keep every numbered calibre sealed against daily elements.',
    Icon: Droplets,
  },
] as const;

export function HomeEditorialSections() {
  return (
    <div className="border-t border-[#1A1A1A]/8 bg-white">
      {/* 1. Brand Story Strip */}
      <section aria-labelledby="home-story-heading" className="py-[clamp(64px,9vw,108px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-12 min-[900px]:gap-12">
            <div className="min-[900px]:col-span-5">
              <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                Geneva Maison
              </p>
              <h2
                id="home-story-heading"
                className="mt-3 font-serif text-[clamp(2.1rem,4vw,3.25rem)] font-medium leading-[1.12] tracking-tight text-[#1A1A1A] text-balance"
              >
                Time, made slowly.
              </h2>
            </div>

            <div className="min-[900px]:col-span-7 flex flex-col items-start justify-center gap-5">
              <p className="max-w-xl text-base font-light leading-[1.7] text-[#1A1A1A]/75">
                Every VERELLIS timepiece begins as raw 904L steel or solid 18k gold billet, shaped
                through thirty-two patient hand-finishing stages before a single dial is seated.
              </p>
              <p className="max-w-xl text-base font-light leading-[1.7] text-[#1A1A1A]/75">
                We produce small numbered runs each quarter so our watchmakers can regulate every
                mechanical calibre across five positions rather than rushing a quota.
              </p>
              <Link
                to="/story"
                className="mt-1 inline-flex min-h-[44px] items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#1A1A1A] underline decoration-[#85662C] underline-offset-4 transition-colors hover:text-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C]"
              >
                <span>Our story</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Craftsmanship Teaser */}
      <section
        aria-labelledby="home-craft-heading"
        className="border-t border-[#1A1A1A]/[0.06] py-[clamp(64px,9vw,108px)]"
      >
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                Atelier Standards
              </p>
              <h2
                id="home-craft-heading"
                className="mt-2 font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.15] text-[#1A1A1A]"
              >
                Built without shortcuts
              </h2>
            </div>
            <Link
              to="/craft"
              className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#1A1A1A] underline decoration-[#85662C] underline-offset-4 transition-colors hover:text-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C]"
            >
              <span>Discover the craft</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 min-[900px]:grid-cols-3">
            {CRAFTSMANSHIP_POINTS.map(({ id, title, description, Icon }) => (
              <div
                key={id}
                className="flex flex-col items-start border-t border-[#1A1A1A]/10 pt-6"
              >
                <Icon className="h-5 w-5 text-[#85662C] stroke-[1.4]" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-2xl font-medium text-[#1A1A1A]">{title}</h3>
                <p className="mt-2 text-sm font-light leading-[1.65] text-[#1A1A1A]/75">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Client Promise Bar */}
      <section
        aria-label="Client Promises"
        className="border-t border-[#1A1A1A]/[0.06] py-[clamp(44px,6vw,68px)]"
      >
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 min-[900px]:grid-cols-4">
            {CLIENT_PROMISES.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <p className="font-serif text-xl font-medium text-[#1A1A1A]">{item.title}</p>
                <p className="text-xs font-light tracking-[0.02em] text-[#1A1A1A]/65">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Concierge Strip */}
      <section
        aria-labelledby="home-concierge-heading"
        className="border-y border-[#1A1A1A]/[0.06] bg-[#FAF9F6] py-[clamp(56px,8vw,96px)]"
      >
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="flex flex-col items-start justify-between gap-6 min-[900px]:flex-row min-[900px]:items-center">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                Private Salon & Virtual Viewings
              </p>
              <h2
                id="home-concierge-heading"
                className="mt-2 font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-medium leading-[1.15] text-[#1A1A1A]"
              >
                Speak with a watch specialist
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-sm bg-[#1A1A1A] px-8 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap"
            >
              Book a private appointment
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Sample Testimonials */}
      <section
        aria-labelledby="home-testimonials-heading"
        className="py-[clamp(64px,9vw,108px)]"
      >
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              Collector Notes
            </p>
            <h2
              id="home-testimonials-heading"
              className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.15] text-[#1A1A1A]"
            >
              Impressions on the wrist
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 min-[900px]:grid-cols-3">
            {SAMPLE_TESTIMONIALS.map((entry) => (
              <article
                key={entry.id}
                className="craft-glass-card flex flex-col justify-between rounded-2xl p-7"
              >
                <div>
                  <p className="text-[11px] tracking-[0.06em] text-[#1A1A1A]/65">
                    {entry.note}
                  </p>
                  <blockquote className="mt-4 text-sm font-light leading-[1.7] text-[#1A1A1A]/85">
                    “{entry.quote}”
                  </blockquote>
                </div>
                <footer className="mt-6 border-t border-[#1A1A1A]/8 pt-4 flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium text-[#1A1A1A]">{entry.author}</span>
                  <span className="font-light text-[#1A1A1A]/65">{entry.edition}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
