import { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { HeroOverlay } from '../components/HeroOverlay';
import { CollectionOverlay } from '../components/CollectionOverlay';
import { ReservationModal } from '../components/ReservationModal';
import { HomeEditorialSections } from '../components/HomeEditorialSections';
import { EDITION_MEDIA } from '../data/siteContent';
import { WATCH_EDITIONS, type WatchEditionSpec } from '../watch/catalog';
import type { ScrollExperienceController } from '../three/scrollTimeline';

export default function HomePage() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const heroTriggerRef = useRef<HTMLElement | null>(null);
  const collectionTriggerRef = useRef<HTMLElement | null>(null);
  const watchZoneRef = useRef<HTMLDivElement | null>(null);
  const infoZoneRef = useRef<HTMLDivElement | null>(null);
  const afterCollectionTriggerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<ScrollExperienceController | null>(null);

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !new URLSearchParams(window.location.search).has('autostart');
  });
  const [canvasReady, setCanvasReady] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  const [titleOpacities, setTitleOpacities] = useState<number[]>([1, 0, 0, 0]);
  const [activeEditionIndex, setActiveEditionIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'hero' | 'collection' | 'craft'>('hero');
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationEdition, setReservationEdition] = useState<WatchEditionSpec>(
    WATCH_EDITIONS[0],
  );

  useEffect(() => {
    if (!isLoading) return;
    const capTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, 80);
    return () => window.clearTimeout(capTimer);
  }, [isLoading]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const heroEl = heroTriggerRef.current;
    const colEl = collectionTriggerRef.current;
    const watchZoneEl = watchZoneRef.current;
    const infoZoneEl = infoZoneRef.current;
    const afterColEl = afterCollectionTriggerRef.current;
    if (!mountEl || !heroEl || !colEl || !watchZoneEl || !infoZoneEl || !afterColEl) return;

    let cancelled = false;
    let controller: ScrollExperienceController | null = null;

    import('../three/scrollTimeline')
      .then(({ initWatchScrollExperience }) => {
        if (cancelled) return;
        controller = initWatchScrollExperience(
          mountEl,
          heroEl,
          colEl,
          watchZoneEl,
          infoZoneEl,
          afterColEl,
          {
            onReady: () => {
              if (!cancelled) {
                setCanvasReady(true);
                setIsLoading(false);
              }
            },
            onWebGLError: () => {
              if (!cancelled) {
                setWebglFallback(true);
                setCanvasReady(true);
                setIsLoading(false);
              }
            },
            onHeroProgress: (_progress, opacities) => {
              setTitleOpacities(opacities);
            },
            onCollectionChange: (editionIdx) => {
              setActiveEditionIndex((prev) => (prev === editionIdx ? prev : editionIdx));
            },
            onSectionPhase: (phase) => {
              setActiveSection((prev) => (prev === phase ? prev : phase));
            },
          },
        );
        controllerRef.current = controller;
      })
      .catch(() => {
        if (!cancelled) {
          setWebglFallback(true);
          setCanvasReady(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller?.dispose();
      controllerRef.current = null;
    };
  }, []);

  const handleNavigate = useCallback((selector: string) => {
    if (controllerRef.current) {
      controllerRef.current.scrollToSection(selector);
      return;
    }
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSelectEdition = useCallback((index: number) => {
    setActiveEditionIndex(index);
    controllerRef.current?.selectEditionPreview(index);
  }, []);

  const handleOpenReservation = useCallback(
    (edition?: WatchEditionSpec) => {
      setReservationEdition(edition ?? WATCH_EDITIONS[activeEditionIndex] ?? WATCH_EDITIONS[0]);
      setReservationOpen(true);
    },
    [activeEditionIndex],
  );

  const activeEdition = WATCH_EDITIONS[activeEditionIndex] ?? WATCH_EDITIONS[0];
  const fallbackMedia = EDITION_MEDIA[activeEdition.id];

  return (
    <div className="relative bg-white text-[#1A1A1A]">
      <LoadingScreen visible={isLoading} />

      {/* Fixed full-screen Three.js WebGL canvas (or clean static fallback if WebGL fails) behind Hero & Collection */}
      <div
        ref={canvasMountRef}
        data-testid="watch-canvas-container"
        aria-hidden="true"
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-300 ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {webglFallback && activeSection !== 'craft' && (
          <div
            data-testid="home-webgl-fallback"
            className={`flex h-full w-full items-center transition-opacity duration-300 ${
              activeSection === 'collection'
                ? 'justify-center pt-16 pb-[54dvh] min-[900px]:justify-start min-[900px]:pl-[6vw] min-[900px]:pb-10'
                : 'justify-center pb-36 sm:pb-40'
            }`}
          >
            <img
              src={fallbackMedia.image}
              alt={fallbackMedia.alt}
              width={1200}
              height={896}
              decoding="async"
              className={`object-contain transition-all duration-300 ${
                activeSection === 'collection'
                  ? 'h-[34dvh] max-h-[420px] min-[900px]:h-[62dvh] min-[900px]:w-[38vw] min-[900px]:max-h-[560px]'
                  : 'h-[48dvh] max-h-[520px] w-auto'
              }`}
            />
          </div>
        )}
      </div>

      <main
        data-section={activeSection}
        data-edition={activeEdition.id}
      >
        <HeroOverlay
          ref={heroTriggerRef}
          titleOpacities={titleOpacities}
          onExploreCollection={() => handleNavigate('#collection')}
        />

        <CollectionOverlay
          ref={collectionTriggerRef}
          activeEditionIndex={activeEditionIndex}
          watchZoneRef={watchZoneRef}
          infoZoneRef={infoZoneRef}
          onSelectEdition={handleSelectEdition}
          onReserveClick={handleOpenReservation}
        />

        {/* Trigger wrapper fades out the fixed 3D canvas as user enters below-collection content */}
        <div ref={afterCollectionTriggerRef} className="relative z-10 bg-white">
          <HomeEditorialSections />
        </div>
      </main>

      <ReservationModal
        open={reservationOpen}
        initialEdition={reservationEdition}
        onClose={() => setReservationOpen(false)}
      />
    </div>
  );
}
