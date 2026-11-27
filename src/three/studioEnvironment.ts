import * as THREE from 'three';
import { HDRLoader as RGBELoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Encodes linear RGB float channels into a 4-byte Radiance RGBE pixel.
 */
function encodeRGBE(r: number, g: number, b: number): [number, number, number, number] {
  const v = Math.max(r, g, b);
  if (v < 1e-32) return [0, 0, 0, 0];
  const e = Math.ceil(Math.log2(v));
  const scale = Math.pow(2, -e) * 256;
  return [
    Math.min(255, Math.max(0, Math.floor(r * scale))),
    Math.min(255, Math.max(0, Math.floor(g * scale))),
    Math.min(255, Math.max(0, Math.floor(b * scale))),
    Math.min(255, Math.max(0, e + 128)),
  ];
}

function smoothRect(u: number, v: number, cu: number, cv: number, hw: number, hh: number, soft: number): number {
  let du = Math.abs(u - cu);
  if (du > 0.5) du = 1.0 - du;
  const dv = Math.abs(v - cv);
  const sx = 1 - THREE.MathUtils.smoothstep(du, Math.max(0, hw - soft), hw + soft);
  const sy = 1 - THREE.MathUtils.smoothstep(dv, Math.max(0, hh - soft), hh + soft);
  return sx * sy;
}

/**
 * Synthesizes an uncompressed Radiance RGBE (.hdr) buffer representing a bright
 * neutral watch-photography studio tent with crisp softbox strips and negative-fill contrast.
 */
function buildNeutralStudioHdrBuffer(width = 256, height = 128): ArrayBuffer {
  const headerStr = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`;
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(headerStr);
  const pixelBytes = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    // v = 1 at top (zenith), 0 at bottom (nadir)
    const v = 1 - y / (height - 1);
    for (let x = 0; x < width; x++) {
      const u = x / width;

      // High-contrast watch studio tent: rich neutral charcoal surround so steel/gold
      // catches deep metallic contrast against pure white background
      let lum = THREE.MathUtils.lerp(0.08, 0.38, Math.pow(v, 1.1));

      // Deep negative-fill flags along sides & lower rim for sculptural metallic edges
      const negLeft = smoothRect(u, v, 0.12, 0.48, 0.08, 0.38, 0.04);
      const negRight = smoothRect(u, v, 0.88, 0.48, 0.08, 0.38, 0.04);
      const negFrontLow = smoothRect(u, v, 0.5, 0.26, 0.18, 0.2, 0.05);
      lum *= 1 - 0.78 * Math.max(negLeft, negRight) - 0.55 * negFrontLow;

      // Overhead diffused studio scrim
      const overhead = smoothRect(u, v, 0.5, 0.91, 0.38, 0.08, 0.03);
      // Tall crisp vertical strip softboxes left & right for long link/bevel highlights
      const stripLeft = smoothRect(u, v, 0.34, 0.58, 0.038, 0.32, 0.015);
      const stripRight = smoothRect(u, v, 0.67, 0.56, 0.036, 0.3, 0.015);
      // Crisp rim light strip behind
      const rimStrip = smoothRect(u, v, 0.19, 0.72, 0.06, 0.16, 0.025);
      // Focused upper-front catchlight for crystal & hand bevel sparkle
      const catchLight = smoothRect(u, v, 0.45, 0.74, 0.055, 0.09, 0.02);

      const r =
        lum * 1.0 +
        overhead * 3.4 +
        stripLeft * 7.8 +
        stripRight * 5.6 +
        rimStrip * 4.4 +
        catchLight * 7.0;
      const g =
        lum * 1.0 +
        overhead * 3.38 +
        stripLeft * 7.7 +
        stripRight * 5.65 +
        rimStrip * 4.45 +
        catchLight * 6.95;
      const b =
        lum * 1.03 +
        overhead * 3.44 +
        stripLeft * 7.55 +
        stripRight * 5.9 +
        rimStrip * 4.55 +
        catchLight * 6.9;

      const [er, eg, eb, ee] = encodeRGBE(r, g, b);
      const idx = (y * width + x) * 4;
      pixelBytes[idx] = er;
      pixelBytes[idx + 1] = eg;
      pixelBytes[idx + 2] = eb;
      pixelBytes[idx + 3] = ee;
    }
  }

  const combined = new Uint8Array(headerBytes.length + pixelBytes.length);
  combined.set(headerBytes, 0);
  combined.set(pixelBytes, headerBytes.length);
  return combined.buffer;
}

export interface StudioEnvironmentHandle {
  initialEnvMap: THREE.Texture | null;
  loadHdrIntoScene: (onLoaded: (hdrEnvMap: THREE.Texture) => void) => void;
  dispose: () => void;
}

/**
 * Initializes bright neutral studio IBL via PMREMGenerator.
 * Immediately supplies RoomEnvironment as baseline, then loads the studio HDRI
 * via RGBELoader + PMREMGenerator, cleanly falling back to RoomEnvironment on error.
 */
export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  options?: { skipHdrUpgrade?: boolean; skipRoomEnv?: boolean },
): StudioEnvironmentHandle {
  if (options?.skipRoomEnv) {
    return {
      initialEnvMap: null,
      loadHdrIntoScene: () => {},
      dispose: () => {},
    };
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  if (!options?.skipHdrUpgrade) {
    pmremGenerator.compileEquirectangularShader();
  }

  const roomEnv = new RoomEnvironment();
  const initialEnvRT = pmremGenerator.fromScene(roomEnv, 0.035);
  roomEnv.dispose();

  let hdrEnvRT: THREE.WebGLRenderTarget | null = null;
  let disposed = false;

  const loadHdrIntoScene = (onLoaded: (hdrEnvMap: THREE.Texture) => void) => {
    if (options?.skipHdrUpgrade || disposed) {
      return;
    }
    try {
      const hdrBuffer = buildNeutralStudioHdrBuffer(256, 128);
      const blob = new Blob([hdrBuffer], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(blob);

      const loader = new RGBELoader();
      loader.load(
        blobUrl,
        (equirectTex) => {
          URL.revokeObjectURL(blobUrl);
          if (disposed) {
            equirectTex.dispose();
            return;
          }
          equirectTex.mapping = THREE.EquirectangularReflectionMapping;
          hdrEnvRT = pmremGenerator.fromEquirectangular(equirectTex);
          equirectTex.dispose();
          onLoaded(hdrEnvRT.texture);
        },
        undefined,
        () => {
          URL.revokeObjectURL(blobUrl);
          // Fallback already active via RoomEnvironment
        },
      );
    } catch {
      // Fallback already active via RoomEnvironment
    }
  };

  const dispose = () => {
    disposed = true;
    initialEnvRT.dispose();
    if (hdrEnvRT) hdrEnvRT.dispose();
    pmremGenerator.dispose();
  };

  return {
    initialEnvMap: initialEnvRT.texture,
    loadHdrIntoScene,
    dispose,
  };
}
