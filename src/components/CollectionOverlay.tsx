import { forwardRef, type RefObject } from 'react';
import { CRAFT_FEATURES, WATCH_EDITIONS, type WatchEditionSpec } from '../watch/catalog';

interface CollectionOverlayProps {
  activeEditionIndex: number;
  watchZoneRef: RefObject<HTMLDivElement | null>;
  infoZoneRef: RefObject<HTMLDivElement | null>;
  onSelectEdition: (index: number) => void;
  onReserveClick: (edition: WatchEditionSpec) => void;
}

export const CollectionOverlay = forwardRef<HTMLElement, CollectionOverlayProps>(
  function CollectionOverlay(
    { activeEditionIndex, watchZoneRef, infoZoneRef, onSelectEdition, onReserveClick },
    ref,
  ) {
    const edition = WATCH_EDITIONS[activeEditionIndex] ?? WATCH_EDITIONS[0];

    return (
      <section
        id="collection"
        ref={ref}
        aria-label="Timepiece Collection Showcase"
        className="relative z-10 h-[400vh] w-full pointer-events-none"
      >
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          <div className="collection-grid-shell mx-auto grid h-full w-full max-w-[1680px] grid-cols-1 grid-rows-[calc(42dvh-88px)_minmax(0,1fr)] gap-y-5 px-6 pt-[88px] pb-5 min-[900px]:grid-cols-[45fr_55fr] min-[900px]:grid-rows-1 min-[900px]:gap-x-16 min-[900px]:gap-y-0 min-[900px]:px-16 min-[900px]:pt-20 min-[900px]:pb-16">
            {/* ZONE A: Empty Watch Zone measured via getBoundingClientRect() */}
            <div
              ref={watchZoneRef}
              data-testid="collection-watch-zone"
              aria-hidden="true"
              className="collection-zone-a h-full w-full min-h-0 min-w-0 pointer-events-none"
            />

            {/* ZONE B: Edition Info, Reserve CTA & Container-Query Frosted Glass Cards */}
            <div
              ref={infoZoneRef}
              data-testid="collection-info-zone"
              className="collection-zone-b relative flex h-full w-full min-h-0 min-w-0 max-w-full flex-col justify-center pointer-events-auto"
            >
              <div className="collection-zone-b-stack">
                {/* Edition Selector */}
                <div
                  role="tablist"
                  aria-label="Select watch edition"
                  className="collection-tabs-row flex w-full min-w-0 items-center gap-2 border-b border-[#1A1A1A]/8 pb-2.5"
                >
                  {WATCH_EDITIONS.map((item, idx) => {
                    const active = idx === activeEditionIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onSelectEdition(idx)}
                        className={`inline-flex min-h-[44px] min-[900px]:min-h-[38px] items-center gap-2 rounded-md px-3 py-1.5 text-xs tracking-[0.05em] transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] ${
                          active
                            ? 'bg-[#1A1A1A] text-white font-medium'
                            : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/[0.04]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full border border-black/15"
                          style={{ backgroundColor: item.swatchHex }}
                        />
                        {item.name}
                      </button>
                    );
                  })}
                </div>

                {/* Active Edition Name, Price & Subtitle */}
                <div
                  data-testid="collection-edition-card"
                  data-edition={edition.id}
                  className="relative z-10 flex w-full min-w-0 flex-col gap-1"
                >
                  <p className="collection-edition-kicker hidden min-[900px]:block text-xs tracking-[0.16em] text-[#85662C] font-medium">
                    Edition {activeEditionIndex + 1} of {WATCH_EDITIONS.length}
                  </p>

                  <div className="flex w-full min-w-0 items-baseline justify-between gap-4">
                    <h2
                      data-testid="collection-edition-name"
                      className="font-serif text-[clamp(1.4rem,3.4dvh,2.6rem)] font-medium text-[#1A1A1A] tracking-tight leading-[1.1] whitespace-nowrap"
                    >
                      {edition.name}
                    </h2>
                    <span
                      data-testid="collection-edition-price"
                      className="text-[clamp(1rem,2.1dvh,1.35rem)] font-normal tabular-nums text-[#1A1A1A] whitespace-nowrap"
                    >
                      {edition.price}
                    </span>
                  </div>

                  <p className="collection-edition-subtitle text-xs sm:text-sm leading-[1.5] text-[#1A1A1A]/70 tracking-[0.01em]">
                    {edition.subtitle}
                  </p>
                </div>

                {/* Reserve CTA */}
                <div className="w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => onReserveClick(edition)}
                    className="collection-reserve-btn inline-flex w-full min-[900px]:w-auto min-[900px]:min-w-[220px] items-center justify-center rounded-sm bg-[#1A1A1A] px-7 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap cursor-pointer"
                  >
                    Reserve Yours
                  </button>
                </div>

                {/* Frosted Glass Craft Cards (Stably Mounted, Container-Query Grid) */}
                <div id="craft" className="relative w-full min-w-0">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_24%_35%,rgba(184,151,90,0.22),transparent_62%),radial-gradient(ellipse_at_78%_70%,rgba(188,200,218,0.28),transparent_64%)] blur-xl"
                  />

                  <div
                    data-testid="collection-cards-track"
                    className="collection-cards-grid relative z-10"
                  >
                    {CRAFT_FEATURES.map((card, index) => (
                      <article
                        key={card.id}
                        data-testid={`craft-card-${card.id}`}
                        className={`craft-glass-card ${card.floatClass} rounded-2xl`}
                      >
                        <span className="craft-card-num font-medium tracking-[0.14em] text-[#85662C]">
                          0{index + 1}
                        </span>
                        <h3 className="craft-card-title font-serif font-medium text-[#1A1A1A]">
                          {card.title}
                        </h3>
                        <p className="craft-card-detail font-light text-[#1A1A1A]/75">
                          {card.detail}
                        </p>
                        <p className="craft-card-spec text-[11px] tracking-[0.05em] text-[#1A1A1A]/65">
                          {card.spec}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
