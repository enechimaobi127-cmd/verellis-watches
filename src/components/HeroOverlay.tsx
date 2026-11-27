import { forwardRef } from 'react';
import { HERO_CHAPTERS } from '../watch/catalog';

interface HeroOverlayProps {
  titleOpacities: number[];
  onExploreCollection: () => void;
}

export const HeroOverlay = forwardRef<HTMLElement, HeroOverlayProps>(function HeroOverlay(
  { titleOpacities, onExploreCollection },
  ref,
) {
  return (
    <section
      id="story"
      ref={ref}
      aria-label="Timepiece Assembly Story"
      className="relative z-10 h-[400vh] w-full pointer-events-none"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-end px-6 pb-8 sm:pb-12 min-[900px]:px-16">
        <div className="relative h-44 sm:h-40 w-full max-w-[1200px]">
          {HERO_CHAPTERS.map((chapter, idx) => {
            const opacity = titleOpacities[idx] ?? 0;
            const isInteractive = opacity > 0.45 && Boolean(chapter.hasCta);

            return (
              <div
                key={chapter.id}
                style={{
                  opacity,
                  transform: `translate3d(0, ${(1 - opacity) * 14}px, 0)`,
                }}
                aria-hidden={opacity < 0.05}
                className={`absolute inset-x-0 bottom-0 flex flex-col items-center text-center transition-none ${
                  isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="max-w-xl px-4 py-3">
                  <h1
                    className={`font-serif font-medium text-[#1A1A1A] text-balance leading-[1.15] ${
                      chapter.hasCta
                        ? 'text-[clamp(2rem,4vw,3.35rem)] tracking-[0.2em]'
                        : 'text-[clamp(1.65rem,3.4vw,2.75rem)] tracking-tight'
                    }`}
                  >
                    {chapter.title}
                  </h1>

                  {chapter.subtitle && (
                    <p className="mt-3 text-[clamp(0.875rem,1.4vw,1rem)] font-light leading-[1.6] tracking-[0.03em] text-[#1A1A1A]/75">
                      {chapter.subtitle}
                    </p>
                  )}

                  {chapter.hasCta && (
                    <div className="mt-5">
                      <button
                        type="button"
                        tabIndex={isInteractive ? 0 : -1}
                        onClick={onExploreCollection}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-[#1A1A1A] px-8 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap cursor-pointer"
                      >
                        Explore the Collection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
