import { useEffect, useRef, useState } from 'react';
import {
  initStandaloneWatchViewer,
  type WatchInteractiveController,
} from '../three/watchViewer';
import { EDITION_MEDIA } from '../data/siteContent';
import type { WatchEditionId } from '../watch/catalog';

interface WatchInteractiveCanvasProps {
  editionId: WatchEditionId;
  onFirstInteract?: () => void;
}

export function WatchInteractiveCanvas({
  editionId,
  onFirstInteract,
}: WatchInteractiveCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<WatchInteractiveController | null>(null);
  const interactCbRef = useRef(onFirstInteract);
  interactCbRef.current = onFirstInteract;

  const [isReady, setIsReady] = useState(false);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const ctrl = initStandaloneWatchViewer(el, editionId, {
      onFirstInteract: () => interactCbRef.current?.(),
      onReady: () => setIsReady(true),
      onWebGLError: () => setWebglError(true),
    });
    viewerRef.current = ctrl;
    return () => {
      ctrl.dispose();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setEdition(editionId);
  }, [editionId]);

  const media = EDITION_MEDIA[editionId];

  return (
    <div
      role="img"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#1A1A1A]/8 bg-gradient-to-b from-[#FAF9F6] to-white"
      aria-label={
        webglError
          ? media.alt
          : 'Interactive 3D timepiece viewer. Drag to rotate.'
      }
    >
      {(!isReady || webglError) && (
        <img
          src={media.image}
          alt={media.alt}
          width={1200}
          height={896}
          decoding="async"
          data-testid="pdp-static-fallback"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {!webglError && (
        <div
          ref={mountRef}
          className={`relative z-10 h-full w-full transition-opacity duration-200 ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          data-testid="pdp-3d-canvas"
        />
      )}
    </div>
  );
}
