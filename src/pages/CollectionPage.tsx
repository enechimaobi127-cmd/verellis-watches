import { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw } from 'lucide-react';
import { WATCH_EDITIONS, type WatchEditionId } from '../watch/catalog';
import { EDITION_MEDIA } from '../data/siteContent';
import { getDeviceCapabilities } from '../three/deviceCapabilities';
import { VERELLIS_TOKENS } from '../styles/tokens';

const CollectionWatchCardCanvas = lazy(() =>
  import('../components/CollectionWatchCardCanvas').then((m) => ({
    default: m.CollectionWatchCardCanvas,
  })),
);

export default function CollectionPage() {
  const [active3dId, setActive3dId] = useState<WatchEditionId | null>(null);
  const [ready3dId, setReady3dId] = useState<WatchEditionId | null>(null);
  const [webglDisabled, setWebglDisabled] = useState(() => {
    const caps = getDeviceCapabilities();
    return !caps.hasWebGL || caps.saveData;
  });

  const activate3dPreview = (id: WatchEditionId) => {
    if (webglDisabled) return;
    setActive3dId(id);
  };

  return (
    <main className="page-fade-enter bg-white pt-16">
      <section className="py-[clamp(56px,8vw,96px)]">
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              The Octagonal Series
            </p>
            <h1 className="mt-2 font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-[#1A1A1A]">
              Collection
            </h1>
            <p className="mt-3 text-base font-light leading-[1.65] text-[#1A1A1A]/75">
              One architectural silhouette interpreted across three restrained horological finishes.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
            {WATCH_EDITIONS.map((edition) => {
              const media = EDITION_MEDIA[edition.id];
              const is3dActive = !webglDisabled && active3dId === edition.id;
              const is3dReady = is3dActive && ready3dId === edition.id;

              return (
                <article
                  key={edition.id}
                  data-testid={`collection-card-${edition.id}`}
                  onMouseEnter={() => activate3dPreview(edition.id)}
                  onMouseLeave={() => {
                    setActive3dId((prev) => (prev === edition.id ? null : prev));
                    setReady3dId((prev) => (prev === edition.id ? null : prev));
                  }}
                  className="group flex flex-col justify-between rounded-2xl border border-[#1A1A1A]/10 bg-white p-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(26,26,26,0.12)]"
                >
                  <div>
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#FAF9F6] to-white">
                      <Link
                        to={`/watch/${edition.id}`}
                        aria-label={`View ${edition.name}`}
                        className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C]"
                      >
                        <img
                          src={media.image}
                          alt={media.alt}
                          width={1200}
                          height={896}
                          decoding="async"
                          className={`h-full w-full object-cover transition-opacity duration-300 ${
                            is3dReady ? 'opacity-0' : 'opacity-100'
                          }`}
                        />

                        {is3dActive && (
                          <div
                            className={`absolute inset-0 transition-opacity duration-300 ${
                              is3dReady ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <Suspense fallback={null}>
                              <CollectionWatchCardCanvas
                                editionId={edition.id}
                                hovered={is3dActive}
                                onReady={() => setReady3dId(edition.id)}
                                onWebGLError={() => {
                                  setWebglDisabled(true);
                                  setActive3dId(null);
                                  setReady3dId(null);
                                }}
                              />
                            </Suspense>
                          </div>
                        )}
                      </Link>

                      {!webglDisabled && (
                        <button
                          type="button"
                          onClick={() => {
                            if (is3dActive) {
                              setActive3dId(null);
                              setReady3dId(null);
                            } else {
                              activate3dPreview(edition.id);
                            }
                          }}
                          aria-pressed={is3dActive}
                          aria-label={
                            is3dActive
                              ? `Pause 3D preview for ${edition.name}`
                              : `Inspect ${edition.name} in 3D`
                          }
                          data-testid={`collection-3d-toggle-${edition.id}`}
                          className="absolute right-3 bottom-3 z-10 inline-flex min-h-[36px] items-center gap-1.5 rounded-sm border border-[#1A1A1A]/15 bg-white/95 px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-[#1A1A1A] transition-colors hover:border-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] cursor-pointer"
                        >
                          <RotateCw className="h-3 w-3 stroke-[1.6]" aria-hidden="true" />
                          <span>{is3dActive ? 'Photo' : '3D'}</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-6 flex items-baseline justify-between gap-3">
                      <h2 className="font-serif text-[1.75rem] font-medium leading-tight text-[#1A1A1A]">
                        {edition.name}
                      </h2>
                      <span
                        data-testid={`collection-price-${edition.id}`}
                        className="text-base font-normal tabular-nums text-[#1A1A1A]"
                      >
                        {edition.price}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-light leading-[1.6] text-[#1A1A1A]/75">
                      {media.oneLineDesc}
                    </p>
                  </div>

                  <div className="mt-7 pt-5 border-t border-[#1A1A1A]/8">
                    <Link
                      to={`/watch/${edition.id}`}
                      data-testid={`view-watch-${edition.id}`}
                      className="inline-flex min-h-[48px] w-full items-center justify-between rounded-sm border border-[#1A1A1A]/15 bg-white px-5 text-xs font-medium tracking-[0.14em] text-[#1A1A1A] transition-colors duration-200 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C]"
                    >
                      <span>View watch</span>
                      <ArrowRight className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
