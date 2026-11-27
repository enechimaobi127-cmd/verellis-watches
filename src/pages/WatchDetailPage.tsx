import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { WATCH_EDITIONS, type WatchEditionId } from '../watch/catalog';
import { EDITION_MEDIA, SIZE_GUIDE_ROWS } from '../data/siteContent';
import { useCart } from '../context/CartContext';
import { VERELLIS_TOKENS } from '../styles/tokens';

const WatchInteractiveCanvas = lazy(() =>
  import('../components/WatchInteractiveCanvas').then((m) => ({
    default: m.WatchInteractiveCanvas,
  })),
);

interface WatchDetailPageProps {
  forcedEditionId?: WatchEditionId;
}

type AccordionKey = 'specifications' | 'materials' | 'sizing' | 'care';

export default function WatchDetailPage({ forcedEditionId }: WatchDetailPageProps) {
  const params = useParams<{ editionId?: string }>();
  const navigate = useNavigate();
  const resolvedId = (forcedEditionId ?? params.editionId ?? 'argent') as WatchEditionId;
  const edition = WATCH_EDITIONS.find((e) => e.id === resolvedId) ?? WATCH_EDITIONS[0];
  const media = EDITION_MEDIA[edition.id];

  const { addItem } = useCart();
  const [hasDragged, setHasDragged] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>('specifications');

  useEffect(() => {
    // Keep Specifications open by default when switching edition
    setOpenAccordion('specifications');
  }, [edition.id]);

  const otherEditions = WATCH_EDITIONS.filter((item) => item.id !== edition.id);

  const toggleAccordion = (key: AccordionKey) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const specificationItems = [
    { label: 'Case', value: media.diameter },
    { label: 'Thickness', value: media.thickness },
    { label: 'Water Resistance', value: media.waterResistance },
    { label: 'Crystal', value: media.crystalSpec },
    { label: 'Movement', value: media.movementSpec },
    { label: 'Bracelet', value: media.braceletSpec },
    { label: 'Dial Finish', value: media.dialFinishSpec },
  ];

  return (
    <main className="page-fade-enter bg-white pt-16">
      <section className="py-[clamp(36px,5vw,68px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-xs text-[#1A1A1A]/65"
          >
            <Link to="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/collection" className="hover:text-[#1A1A1A] transition-colors">
              Collection
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[#1A1A1A]">{edition.name}</span>
          </nav>

          {/* Primary 2-Column Layout (Watch Top on Mobile, Left on Desktop) */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
            {/* Left Zone: Large Interactive 3D Watch + Finish Swatches + Drag Hint */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Suspense
                fallback={
                  <div className="aspect-[4/3] w-full rounded-2xl border border-[#1A1A1A]/8 bg-[#FAF9F6] flex flex-col items-center justify-center gap-3">
                    <span className="font-serif text-xl tracking-[0.2em] text-[#1A1A1A]">
                      VERELLIS
                    </span>
                    <p className="text-xs text-[#1A1A1A]/65">Preparing 3D timepiece…</p>
                  </div>
                }
              >
                <WatchInteractiveCanvas
                  editionId={edition.id}
                  onFirstInteract={() => setHasDragged(true)}
                />
              </Suspense>

              {/* Controls Row Below Canvas (Never Overlaps Watch) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div
                  role="group"
                  aria-label="Switch timepiece finish"
                  className="flex flex-wrap items-center gap-2.5"
                >
                  {WATCH_EDITIONS.map((item) => {
                    const active = item.id === edition.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(`/watch/${item.id}`)}
                        aria-pressed={active}
                        data-testid={`swatch-switch-${item.id}`}
                        className={`inline-flex min-h-[44px] items-center gap-2 rounded-sm border px-3.5 py-2 text-xs tracking-[0.06em] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A] ${
                          active
                            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-medium'
                            : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A]/75 hover:border-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-3 w-3 rounded-full border border-black/20"
                          style={{ backgroundColor: item.swatchHex }}
                        />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                <p
                  data-testid="drag-rotate-hint"
                  aria-hidden={hasDragged}
                  className={`text-xs tracking-[0.08em] text-[#1A1A1A]/65 transition-opacity duration-500 ${
                    hasDragged ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  Drag to rotate
                </p>
              </div>
            </div>

            {/* Right Zone: Product Purchase Module */}
            <div className="lg:col-span-5 flex flex-col">
              <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                VERELLIS · {media.referenceCode}
              </p>

              <div className="mt-2 flex items-baseline justify-between gap-4">
                <h1
                  data-testid="pdp-title"
                  className="font-serif text-[clamp(2.25rem,4vw,3.15rem)] font-medium leading-[1.08] tracking-tight text-[#1A1A1A]"
                >
                  {edition.name}
                </h1>
                <span
                  data-testid="pdp-price"
                  className="font-serif text-2xl font-medium tabular-nums text-[#1A1A1A]"
                >
                  {edition.price}
                </span>
              </div>

              <p className="mt-5 text-sm sm:text-[15px] font-light leading-[1.75] text-[#1A1A1A]/80">
                {media.twoSentenceDesc}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => addItem(edition.id, 1)}
                  data-testid="pdp-add-to-bag"
                  className={VERELLIS_TOKENS.surfaces.primaryButtonClass}
                >
                  Add to cart
                </button>

                <Link
                  to="/contact"
                  className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}
                >
                  Book a viewing
                </Link>
              </div>

              {/* Client Promise Items */}
              <ul className="mt-7 flex flex-col gap-3 rounded-xl border border-[#1A1A1A]/8 bg-[#FAF9F6] p-5 text-xs text-[#1A1A1A]/80">
                <li className="flex items-center gap-3">
                  <Truck className="h-4 w-4 shrink-0 text-[#85662C] stroke-[1.5]" aria-hidden="true" />
                  <span>Free insured shipping · {media.deliveryEstimate}</span>
                </li>
                <li className="flex items-center gap-3">
                  <RotateCcw className="h-4 w-4 shrink-0 text-[#85662C] stroke-[1.5]" aria-hidden="true" />
                  <span>30-day returns with complimentary courier pickup</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#85662C] stroke-[1.5]" aria-hidden="true" />
                  <span>5-year warranty covered at the Geneva atelier</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Accordion Sections Below (All Closed Except One by Default) */}
          <div className="mt-16 border-t border-[#1A1A1A]/10">
            {/* 1. Specifications (Open by default) */}
            <div className="border-b border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => toggleAccordion('specifications')}
                aria-expanded={openAccordion === 'specifications'}
                data-testid="accordion-btn-specifications"
                className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A] cursor-pointer"
              >
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  Specifications
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-200 ${
                    openAccordion === 'specifications' ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openAccordion === 'specifications' && (
                <div className="pb-6">
                  <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 text-sm">
                    {specificationItems.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 border-b border-[#1A1A1A]/[0.06] py-2.5"
                      >
                        <dt className="text-xs tracking-[0.06em] text-[#1A1A1A]/65">
                          {spec.label}
                        </dt>
                        <dd className="text-right font-light tabular-nums text-[#1A1A1A]">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* 2. Materials and Finish */}
            <div className="border-b border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => toggleAccordion('materials')}
                aria-expanded={openAccordion === 'materials'}
                data-testid="accordion-btn-materials"
                className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A] cursor-pointer"
              >
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  Materials and Finish
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-200 ${
                    openAccordion === 'materials' ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openAccordion === 'materials' && (
                <div className="pb-6 max-w-3xl text-sm font-light leading-[1.75] text-[#1A1A1A]/75">
                  {media.materialsProse}
                </div>
              )}
            </div>

            {/* 3. Size Guide */}
            <div className="border-b border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => toggleAccordion('sizing')}
                aria-expanded={openAccordion === 'sizing'}
                data-testid="accordion-btn-sizing"
                className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A] cursor-pointer"
              >
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  Size Guide
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-200 ${
                    openAccordion === 'sizing' ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openAccordion === 'sizing' && (
                <div className="pb-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full max-w-2xl border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#1A1A1A]/12 text-xs tracking-[0.06em] text-[#1A1A1A]/65">
                          <th className="py-2.5 pr-4 font-medium">Wrist Circumference</th>
                          <th className="py-2.5 px-4 font-medium">Recommended Fit</th>
                          <th className="py-2.5 pl-4 font-medium">Links Fitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]/[0.06] font-light text-[#1A1A1A]/80">
                        {SIZE_GUIDE_ROWS.map((row) => (
                          <tr key={row.wrist}>
                            <td className="py-2.5 pr-4 tabular-nums">{row.wrist}</td>
                            <td className="py-2.5 px-4">{row.fit}</td>
                            <td className="py-2.5 pl-4 tabular-nums">{row.links}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="max-w-2xl text-xs font-light leading-[1.65] text-[#1A1A1A]/70">
                    Complimentary resizing is performed by our watchmakers prior to dispatch. All
                    removed links and spare pins accompany your watch, and adjustments remain free
                    during your first 60 days.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Care */}
            <div className="border-b border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                aria-expanded={openAccordion === 'care'}
                data-testid="accordion-btn-care"
                className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A] cursor-pointer"
              >
                <span className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  Care
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#1A1A1A]/60 transition-transform duration-200 ${
                    openAccordion === 'care' ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openAccordion === 'care' && (
                <div className="pb-6 max-w-3xl text-sm font-light leading-[1.75] text-[#1A1A1A]/75">
                  {media.careProse}
                </div>
              )}
            </div>
          </div>

          {/* You May Also Like Row */}
          <section
            aria-labelledby="related-watches-heading"
            className="mt-16 pt-4"
          >
            <h2
              id="related-watches-heading"
              className="font-serif text-[clamp(1.75rem,3vw,2.35rem)] font-medium text-[#1A1A1A]"
            >
              You may also like
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {otherEditions.map((other) => {
                const otherMedia = EDITION_MEDIA[other.id];
                return (
                  <Link
                    key={other.id}
                    to={`/watch/${other.id}`}
                    data-testid={`related-watch-${other.id}`}
                    className="group flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-[#1A1A1A]/10 bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-14px_rgba(26,26,26,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    <div className="aspect-[4/3] sm:aspect-auto sm:w-44 shrink-0 overflow-hidden bg-[#FAF9F6]">
                      <img
                        src={otherMedia.image}
                        alt={otherMedia.alt}
                        width={1200}
                        height={896}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                            {other.name}
                          </h3>
                          <span className="text-sm font-normal tabular-nums text-[#1A1A1A]">
                            {other.price}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-light leading-[1.6] text-[#1A1A1A]/75">
                          {otherMedia.oneLineDesc}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-[#1A1A1A] group-hover:text-[#85662C] transition-colors">
                        <span>View watch</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
