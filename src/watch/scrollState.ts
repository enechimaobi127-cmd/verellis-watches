import { HERO_CHAPTERS, WATCH_EDITIONS, type WatchEditionId } from './catalog';

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Returns normalized 0..1 sub-progress within a timeline window [start, end],
 * eased with a smooth cubic curve.
 */
export function segmentProgress(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0;
  return smoothstep(start, end, clamp01(progress));
}

/**
 * Computes opacity (0..1) for each hero editorial title chapter across scroll progress 0..1.
 * Gaps between chapter fades ensure strictly one title is visible at any time.
 */
export function getHeroTitleOpacities(progress: number): number[] {
  const p = clamp01(progress);
  return HERO_CHAPTERS.map((chapter, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === HERO_CHAPTERS.length - 1;
    const fadeLen = 0.025;
    const gap = 0.008;

    if (isFirst) {
      const fadeEnd = chapter.end - gap;
      if (p <= fadeEnd - fadeLen) return 1;
      if (p >= fadeEnd) return 0;
      return 1 - smoothstep(fadeEnd - fadeLen, fadeEnd, p);
    }

    if (isLast) {
      const fadeStart = chapter.start + gap;
      if (p <= fadeStart) return 0;
      if (p >= fadeStart + fadeLen) return 1;
      return smoothstep(fadeStart, fadeStart + fadeLen, p);
    }

    const fadeStart = chapter.start + gap;
    const fadeEnd = chapter.end - gap;
    if (p <= fadeStart || p >= fadeEnd) return 0;
    if (p < fadeStart + fadeLen) {
      return smoothstep(fadeStart, fadeStart + fadeLen, p);
    }
    if (p > fadeEnd - fadeLen) {
      return 1 - smoothstep(fadeEnd - fadeLen, fadeEnd, p);
    }
    return 1;
  });
}

export function getActiveHeroChapterIndex(progress: number): number {
  const opacities = getHeroTitleOpacities(progress);
  let bestIndex = 0;
  let bestVal = -1;
  for (let i = 0; i < opacities.length; i++) {
    if (opacities[i] > bestVal) {
      bestVal = opacities[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}

/**
 * Computes the crystal specular sweep normalized position (-1 to +1)
 * active between progress 0.54 and 0.72.
 */
export function getCrystalSweepAmount(progress: number): {
  position: number;
  intensity: number;
} {
  const p = clamp01(progress);
  if (p < 0.54 || p > 0.74) {
    return { position: -1.4, intensity: 0 };
  }
  const t = (p - 0.54) / 0.2;
  const intensity = Math.sin(Math.PI * t);
  return {
    position: -1.3 + t * 2.6,
    intensity: Math.max(0, intensity),
  };
}

export interface CameraFramingResult {
  cameraZ: number;
  offsetX: number;
  offsetY: number;
  isDesktopSplit: boolean;
}

export interface ZoneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface WatchZoneFramingResult {
  cameraZ: number;
  offsetX: number;
  offsetY: number;
  watchScale: number;
  projectedCoverageW: number;
  projectedCoverageH: number;
}

const CAMERA_FOV_DEG = 34;
const TAN_HALF_FOV = Math.tan((CAMERA_FOV_DEG * Math.PI) / 360);
// Full rotated watch envelope at scale = 1 (crown/bevel radial envelope across 0..360 deg + clasp/bracelet height)
const WATCH_ROTATED_WIDTH = 3.84;
const WATCH_ROTATED_HEIGHT = 8.4;
const WATCH_MAX_FORWARD_Z = 1.92;
const ZONE_MAX_FILL_RATIO = 0.82; // Safely inside 85% max width & height

/**
 * Computes Three.js camera position, view-offset, and watch scale from Zone A's
 * measured bounding rectangle so the full 360-degree rotating silhouette fits
 * inside <= 85% of Zone A's width and height with zero overlap against Zone B.
 */
export function computeWatchZoneFraming(
  viewportW: number,
  viewportH: number,
  zoneRect: ZoneRect | null,
  shiftToCollection: number,
): WatchZoneFramingResult {
  const safeW = Math.max(320, viewportW);
  const safeH = Math.max(320, viewportH);
  const aspect = safeW / safeH;
  const s = clamp01(shiftToCollection);
  const isWide = safeW >= 900;

  // Hero centered framing
  const heroZ = isWide
    ? Math.max(17.6, 8.5 / (2 * TAN_HALF_FOV * 0.72))
    : Math.max(21.5, 4.2 / (2 * TAN_HALF_FOV * aspect * 0.7), 8.5 / (2 * TAN_HALF_FOV * 0.68));
  const heroOffsetX = 0;
  const heroOffsetY = safeH * (isWide ? 0.045 : 0.05);
  const heroScale = 1.0;

  // Fallback Zone A estimate if DOM rect is unavailable
  const rect: ZoneRect =
    zoneRect && zoneRect.width > 10 && zoneRect.height > 10
      ? zoneRect
      : isWide
        ? {
            left: 64,
            top: 80,
            width: (safeW - 192) * 0.45,
            height: safeH - 144,
          }
        : {
            left: 24,
            top: 64,
            width: safeW - 48,
            height: Math.max(140, safeH * 0.42 - 64),
          };

  const colZ = heroZ;
  const zoneCenterX = rect.left + rect.width * 0.5;
  const zoneCenterY = rect.top + rect.height * 0.5;
  const colOffsetX = safeW * 0.5 - zoneCenterX;
  const colOffsetY = safeH * 0.5 - zoneCenterY;

  const worldViewportH = 2 * colZ * TAN_HALF_FOV;
  const worldPerPx = worldViewportH / safeH;
  const zoneWorldW = rect.width * worldPerPx;
  const zoneWorldH = rect.height * worldPerPx;

  const perspFactor = colZ / Math.max(4, colZ - WATCH_MAX_FORWARD_Z);
  const maxScaleW = (ZONE_MAX_FILL_RATIO * zoneWorldW) / (WATCH_ROTATED_WIDTH * perspFactor);
  const maxScaleH = (ZONE_MAX_FILL_RATIO * zoneWorldH) / (WATCH_ROTATED_HEIGHT * perspFactor);
  const colScale = Math.max(0.18, Math.min(1.25, Math.min(maxScaleW, maxScaleH)));

  const projectedCoverageW = (WATCH_ROTATED_WIDTH * colScale * perspFactor) / Math.max(0.001, zoneWorldW);
  const projectedCoverageH = (WATCH_ROTATED_HEIGHT * colScale * perspFactor) / Math.max(0.001, zoneWorldH);

  return {
    cameraZ: heroZ + (colZ - heroZ) * s,
    offsetX: heroOffsetX + (colOffsetX - heroOffsetX) * s,
    offsetY: heroOffsetY + (colOffsetY - heroOffsetY) * s,
    watchScale: heroScale + (colScale - heroScale) * s,
    projectedCoverageW,
    projectedCoverageH,
  };
}

/**
 * Legacy helper retained for backward-compatible unit tests.
 */
export function computeCameraFraming(
  width: number,
  height: number,
  shiftToCollection: number,
): CameraFramingResult {
  const safeW = Math.max(320, width);
  const safeH = Math.max(320, height);
  const aspect = safeW / safeH;
  const s = clamp01(shiftToCollection);
  const isDesktopSplit = safeW >= 900;

  const tanHalfFov = TAN_HALF_FOV;
  const watchWorldHeight = 8.5;
  const watchWorldWidth = 3.5;

  if (isDesktopSplit) {
    const heroZ = Math.max(17.2, watchWorldHeight / (2 * tanHalfFov * 0.72));
    const minZForLeftZone = watchWorldWidth / (2 * tanHalfFov * aspect * 0.26);
    const colZ = Math.max(17.2, minZForLeftZone);

    const colOffsetX = safeW * 0.2;
    const heroOffsetY = safeH * 0.045;

    return {
      cameraZ: heroZ + (colZ - heroZ) * s,
      offsetX: colOffsetX * s,
      offsetY: heroOffsetY * (1 - s),
      isDesktopSplit: true,
    };
  }

  const heroZForWidth = 4.2 / (2 * tanHalfFov * aspect * 0.7);
  const heroZForHeight = watchWorldHeight / (2 * tanHalfFov * 0.68);
  const heroZ = Math.max(21.5, heroZForWidth, heroZForHeight);
  const heroOffsetY = safeH * 0.06;

  const topBound = 64 + 24;
  const bottomBound = safeH * 0.45 - 24;
  const availablePx = Math.max(120, bottomBound - topBound);
  const heightFraction = availablePx / safeH;
  const colZForTopZone = watchWorldHeight / (2 * tanHalfFov * heightFraction);
  const colZForWidth = watchWorldWidth / (2 * tanHalfFov * aspect * 0.68);
  const colZ = Math.max(colZForTopZone, colZForWidth);

  const centerTargetY = topBound + availablePx * 0.5;
  const colOffsetY = safeH * 0.5 - centerTargetY;

  return {
    cameraZ: heroZ + (colZ - heroZ) * s,
    offsetX: 0,
    offsetY: heroOffsetY + (colOffsetY - heroOffsetY) * s,
    isDesktopSplit: false,
  };
}

export interface CollectionScrollState {
  editionIndex: number;
  editionId: WatchEditionId;
  /** Target Y rotation in radians: 1 full 2*PI revolution per edition (3 * 2*PI total) */
  rotationY: number;
  /** Local normalized progress inside the current 100vh edition band */
  localProgress: number;
}

/**
 * Maps Section 2 normalized scroll progress (0..1 across 300vh) to
 * edition index (0 = Argent, 1 = Aurum, 2 = Noir) and continuous Y rotation.
 */
export function getCollectionScrollState(progress: number): CollectionScrollState {
  const p = clamp01(progress);
  const totalEditions = WATCH_EDITIONS.length; // 3
  const scaled = p * totalEditions;
  const editionIndex = Math.min(totalEditions - 1, Math.floor(scaled));
  const localProgress = p >= 1 ? 1 : scaled - editionIndex;
  const rotationY = p * Math.PI * 2 * totalEditions;

  return {
    editionIndex,
    editionId: WATCH_EDITIONS[editionIndex].id,
    rotationY,
    localProgress,
  };
}

export interface ReservationInput {
  fullName: string;
  email: string;
  editionId: WatchEditionId;
  boutiqueNote?: string;
}

export interface ReservationValidationResult {
  valid: boolean;
  errors: Partial<Record<'fullName' | 'email', string>>;
}

export function validateReservationInput(
  input: ReservationInput,
): ReservationValidationResult {
  const errors: Partial<Record<'fullName' | 'email', string>> = {};
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim();

  if (trimmedName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
