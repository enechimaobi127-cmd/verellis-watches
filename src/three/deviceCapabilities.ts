export interface WebGLProbeResult {
  hasWebGL: boolean;
  isSoftwareGl: boolean;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowSpec: boolean;
  saveData: boolean;
  reducedMotion: boolean;
  hasWebGL: boolean;
  isSoftwareGl: boolean;
  pixelRatio: number;
}

interface NavigatorWithDeviceInfo extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

let cachedWebGLProbe: WebGLProbeResult | null = null;

export function probeWebGLCapabilities(): WebGLProbeResult {
  if (cachedWebGLProbe) {
    return cachedWebGLProbe;
  }

  if (typeof document === 'undefined') {
    cachedWebGLProbe = { hasWebGL: false, isSoftwareGl: true };
    return cachedWebGLProbe;
  }

  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);

    if (!gl) {
      cachedWebGLProbe = { hasWebGL: false, isSoftwareGl: true };
      return cachedWebGLProbe;
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    cachedWebGLProbe = { hasWebGL: true, isSoftwareGl };
    return cachedWebGLProbe;
  } catch {
    cachedWebGLProbe = { hasWebGL: false, isSoftwareGl: true };
    return cachedWebGLProbe;
  }
}

export function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithDeviceInfo;
  return nav.connection?.saveData === true;
}

export function isLowSpecDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithDeviceInfo;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const lowCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
  return lowMemory || lowCores;
}

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getOptimalPixelRatio(options?: {
  isSoftwareGl?: boolean;
  isMobile?: boolean;
  isLowSpec?: boolean;
  saveData?: boolean;
}): number {
  if (typeof window === 'undefined') return 1;
  const isSoftwareGl = options?.isSoftwareGl ?? probeWebGLCapabilities().isSoftwareGl;
  const saveData = options?.saveData ?? isSaveDataEnabled();
  if (isSoftwareGl || saveData) return 1;

  const isMobile = options?.isMobile ?? window.innerWidth < 768;
  const isLowSpec = options?.isLowSpec ?? isLowSpecDevice();
  const dpr = window.devicePixelRatio || 1;

  return isMobile || isLowSpec ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
}

export function getDeviceCapabilities(): DeviceCapabilities {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isLowSpec = isLowSpecDevice();
  const saveData = isSaveDataEnabled();
  const reducedMotion = isReducedMotionPreferred();
  const { hasWebGL, isSoftwareGl } = probeWebGLCapabilities();

  return {
    isMobile,
    isLowSpec,
    saveData,
    reducedMotion,
    hasWebGL,
    isSoftwareGl,
    pixelRatio: getOptimalPixelRatio({ isSoftwareGl, isMobile, isLowSpec, saveData }),
  };
}
