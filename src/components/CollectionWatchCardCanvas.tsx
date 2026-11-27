import { useEffect, useRef } from 'react';
import { initCardWatchPreview, type WatchPreviewController } from '../three/watchViewer';
import type { WatchEditionId } from '../watch/catalog';

interface CollectionWatchCardCanvasProps {
  editionId: WatchEditionId;
  hovered: boolean;
  onReady?: () => void;
  onWebGLError?: () => void;
}

export function CollectionWatchCardCanvas({
  editionId,
  hovered,
  onReady,
  onWebGLError,
}: CollectionWatchCardCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const ctrlRef = useRef<WatchPreviewController | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onWebGLError);
  onReadyRef.current = onReady;
  onErrorRef.current = onWebGLError;

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const ctrl = initCardWatchPreview(el, editionId, {
      onReady: () => onReadyRef.current?.(),
      onWebGLError: () => onErrorRef.current?.(),
    });
    ctrlRef.current = ctrl;
    return () => {
      ctrl.dispose();
      ctrlRef.current = null;
    };
  }, [editionId]);

  useEffect(() => {
    ctrlRef.current?.setHovered(hovered);
  }, [hovered]);

  return (
    <div
      ref={mountRef}
      role="img"
      data-testid={`collection-3d-canvas-${editionId}`}
      aria-label={`Interactive 3D preview of VERELLIS ${editionId}`}
      className="h-full w-full"
    />
  );
}
