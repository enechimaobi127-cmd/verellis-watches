import * as THREE from 'three';
import { WATCH_EDITIONS, type WatchEditionId, type WatchEditionSpec } from '../watch/catalog';

export interface SharedWatchAssets {
  dialTexSize: number;
  brushedNormalMap: THREE.DataTexture;
  brushedRoughnessMap: THREE.CanvasTexture;
  getDialTexture: (id: WatchEditionId) => THREE.CanvasTexture;
  contactShadowTex: THREE.CanvasTexture;
  sweepTex: THREE.CanvasTexture;
  release: () => void;
}

interface CacheEntry {
  refCount: number;
  maxAnisotropy: number;
  brushedNormalMap: THREE.DataTexture;
  brushedRoughnessMap: THREE.CanvasTexture;
  dialTextures: Partial<Record<WatchEditionId, THREE.CanvasTexture>>;
  contactShadowTex: THREE.CanvasTexture;
  sweepTex: THREE.CanvasTexture;
}

const assetCacheByTier = new Map<number, CacheEntry>();

function createBrushedNormalTexture(size: number, maxAnisotropy: number): THREE.DataTexture {
  const heightField = new Float32Array(size * size);

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y++) {
    const base = (120 + Math.floor(rand() * 16)) / 255;
    const rowOffset = y * size;
    heightField.fill(base, rowOffset, rowOffset + size);

    const streakCount = 4 + Math.floor(rand() * 5);
    for (let s = 0; s < streakCount; s++) {
      const sx = Math.floor(rand() * size);
      const sw = Math.floor(size * (0.28 + rand() * 0.65));
      const shade = (92 + Math.floor(rand() * 72)) / 255;
      for (let dx = 0; dx < sw; dx++) {
        const x = (sx + dx) % size;
        heightField[rowOffset + x] = heightField[rowOffset + x] * 0.52 + shade * 0.48;
      }
    }
  }

  const normalData = new Uint8Array(size * size * 4);
  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;

      const hL = heightField[y * size + xm];
      const hR = heightField[y * size + xp];
      const hD = heightField[ym * size + x];
      const hU = heightField[yp * size + x];

      const dx = (hL - hR) * strength;
      const dy = (hD - hU) * strength;
      const dz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idx = (y * size + x) * 4;
      normalData[idx] = Math.round(((dx / len) * 0.5 + 0.5) * 255);
      normalData[idx + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      normalData[idx + 2] = Math.round(((dz / len) * 0.5 + 0.5) * 255);
      normalData[idx + 3] = 255;
    }
  }

  const normalTex = new THREE.DataTexture(normalData, size, size, THREE.RGBAFormat);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(0.85, 0.85);
  normalTex.anisotropy = maxAnisotropy;
  normalTex.generateMipmaps = true;
  normalTex.minFilter = THREE.LinearMipmapLinearFilter;
  normalTex.magFilter = THREE.LinearFilter;
  normalTex.needsUpdate = true;
  return normalTex;
}

function createBrushedRoughnessTexture(size: number, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EAEAEA';
  ctx.fillRect(0, 0, size, size);

  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y++) {
    const v = 224 + Math.floor(rand() * 31);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.85, 0.85);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createDialTexture(
  spec: WatchEditionSpec,
  size: number,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.485;

  const baseGrad = ctx.createRadialGradient(cx, cy, r * 0.03, cx, cy, r);
  baseGrad.addColorStop(0, spec.dialHighlightHex);
  baseGrad.addColorStop(0.58, spec.dialBaseHex);
  baseGrad.addColorStop(1, spec.dialBaseHex);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(cx, cy);
  const rayCount = size <= 512 ? 260 : 420;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const alpha = (Math.sin(i * 7.3) * 0.5 + 0.5) * 0.02;
    ctx.strokeStyle =
      i % 2 === 0
        ? `rgba(255, 255, 255, ${alpha * 1.25})`
        : `rgba(0, 0, 0, ${alpha * 0.8})`;
    ctx.lineWidth = size / 520;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    ctx.stroke();
  }
  ctx.restore();

  const conic = ctx.createConicGradient(0.45, cx, cy);
  conic.addColorStop(0, 'rgba(255,255,255,0.055)');
  conic.addColorStop(0.25, 'rgba(0,0,0,0.035)');
  conic.addColorStop(0.5, 'rgba(255,255,255,0.065)');
  conic.addColorStop(0.75, 'rgba(0,0,0,0.035)');
  conic.addColorStop(1, 'rgba(255,255,255,0.055)');
  ctx.fillStyle = conic;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  const aoGrad = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.02);
  aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  aoGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.06)');
  aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0.24)');
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = spec.numeralHex;

  ctx.globalAlpha = 0.28;
  ctx.lineWidth = size * 0.0018;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.945, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.905, 0, Math.PI * 2);
  ctx.stroke();

  for (let s = 0; s < 240; s++) {
    const a = (s / 240) * Math.PI * 2 - Math.PI / 2;
    const isMinute = s % 4 === 0;
    const isHour = s % 20 === 0;
    const inner = r * (isHour ? 0.895 : isMinute ? 0.908 : 0.922);
    const outer = r * 0.945;
    ctx.globalAlpha = isHour ? 0.78 : isMinute ? 0.54 : 0.22;
    ctx.lineWidth = isHour ? size * 0.0036 : isMinute ? size * 0.0022 : size * 0.0011;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.17;
  ctx.lineWidth = size * 0.0018;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.54, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (spec.hasSubDials) {
    const subOffsets = [-r * 0.42, r * 0.42];
    const subRadius = r * 0.205;
    for (const sx of subOffsets) {
      ctx.save();
      ctx.translate(cx + sx, cy);

      const sg = ctx.createRadialGradient(0, 0, 1, 0, 0, subRadius);
      sg.addColorStop(0, 'rgba(184, 151, 90, 0.16)');
      sg.addColorStop(0.84, 'rgba(130, 98, 36, 0.12)');
      sg.addColorStop(1, 'rgba(72, 52, 16, 0.34)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, subRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = spec.numeralHex;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = size * 0.0016;
      for (const ringFactor of [0.46, 0.68, 0.94]) {
        ctx.beginPath();
        ctx.arc(0, 0, subRadius * ringFactor, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let t = 0; t < 12; t++) {
        const ta = (t / 12) * Math.PI * 2;
        ctx.globalAlpha = t % 3 === 0 ? 0.72 : 0.35;
        ctx.lineWidth = size * 0.002;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ta) * subRadius * 0.76, Math.sin(ta) * subRadius * 0.76);
        ctx.lineTo(Math.cos(ta) * subRadius * 0.94, Math.sin(ta) * subRadius * 0.94);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = spec.numeralHex;
      ctx.lineWidth = size * 0.0048;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(subRadius * 0.6, -subRadius * 0.36);
      ctx.stroke();

      ctx.fillStyle = spec.numeralHex;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const arabicIndic = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = spec.numeralHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.round(size * 0.056);
  ctx.font = `500 ${fontSize}px "Cormorant Garamond", "Noto Naskh Arabic", "DejaVu Sans", Georgia, serif`;

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const dist = spec.hasSubDials && (i === 3 || i === 9) ? r * 0.71 : r * 0.655;
    const nx = Math.cos(angle) * dist;
    const ny = Math.sin(angle) * dist;
    ctx.globalAlpha = spec.hasSubDials && (i === 3 || i === 9) ? 0.42 : 0.92;
    ctx.fillText(arabicIndic[i], nx, ny);
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = spec.numeralHex;
  ctx.globalAlpha = 0.85;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const brandPx = Math.round(size * 0.022);
  ctx.font = `500 ${brandPx}px "Inter", sans-serif`;
  ctx.fillText('V E R E L L I S', cx, cy - r * 0.31);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createContactShadowTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.04,
    size / 2,
    size / 2,
    size * 0.49,
  );
  grad.addColorStop(0, 'rgba(18, 20, 24, 0.34)');
  grad.addColorStop(0.28, 'rgba(18, 20, 24, 0.18)');
  grad.addColorStop(0.6, 'rgba(18, 20, 24, 0.06)');
  grad.addColorStop(1, 'rgba(18, 20, 24, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSweepTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.18)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.18)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'destination-in';
  const vGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, h * 0.5);
  vGrad.addColorStop(0, 'rgba(255,255,255,1)');
  vGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function disposeCacheEntry(entry: CacheEntry): void {
  entry.brushedNormalMap.dispose();
  entry.brushedRoughnessMap.dispose();
  entry.dialTextures.argent?.dispose();
  entry.dialTextures.aurum?.dispose();
  entry.dialTextures.noir?.dispose();
  entry.contactShadowTex.dispose();
  entry.sweepTex.dispose();
}

/**
 * Generates procedural canvas textures once per resolution tier and reuses them across
 * watch mounts; builds dial textures lazily per edition and disposes GPU texture memory
 * when the last consumer unmounts.
 */
export function acquireSharedWatchAssets(
  dialTexSize: number,
  maxAnisotropy: number,
): SharedWatchAssets {
  const tierKey = dialTexSize <= 512 ? 512 : 1024;
  let entry = assetCacheByTier.get(tierKey);

  if (!entry) {
    const brushTexSize = tierKey === 512 ? 128 : 256;
    const shadowTexSize = tierKey === 512 ? 256 : 512;
    entry = {
      refCount: 0,
      maxAnisotropy,
      brushedNormalMap: createBrushedNormalTexture(brushTexSize, maxAnisotropy),
      brushedRoughnessMap: createBrushedRoughnessTexture(brushTexSize, maxAnisotropy),
      dialTextures: {},
      contactShadowTex: createContactShadowTexture(shadowTexSize),
      sweepTex: createSweepTexture(),
    };
    assetCacheByTier.set(tierKey, entry);
  }

  entry.refCount += 1;
  let released = false;

  const getDialTexture = (id: WatchEditionId): THREE.CanvasTexture => {
    let tex = entry!.dialTextures[id];
    if (!tex) {
      const spec = WATCH_EDITIONS.find((e) => e.id === id) ?? WATCH_EDITIONS[0];
      tex = createDialTexture(spec, tierKey, entry!.maxAnisotropy);
      entry!.dialTextures[id] = tex;
    }
    return tex;
  };

  return {
    dialTexSize: tierKey,
    brushedNormalMap: entry.brushedNormalMap,
    brushedRoughnessMap: entry.brushedRoughnessMap,
    getDialTexture,
    contactShadowTex: entry.contactShadowTex,
    sweepTex: entry.sweepTex,
    release: () => {
      if (released) return;
      released = true;
      const current = assetCacheByTier.get(tierKey);
      if (!current) return;
      current.refCount = Math.max(0, current.refCount - 1);
      if (current.refCount === 0) {
        disposeCacheEntry(current);
        assetCacheByTier.delete(tierKey);
      }
    },
  };
}
