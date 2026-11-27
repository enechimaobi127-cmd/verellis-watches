import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { buildWatchModel, type WatchRig } from './watchBuilder';
import { createStudioEnvironment } from './studioEnvironment';
import { getDeviceCapabilities, getOptimalPixelRatio } from './deviceCapabilities';
import type { WatchEditionId } from '../watch/catalog';

export type WatchViewerAngle = 'front' | 'profile' | 'three-quarter' | 'caseback';

export interface WatchInteractiveController {
  setEdition: (id: WatchEditionId) => void;
  setPresetAngle: (angle: WatchViewerAngle) => void;
  dispose: () => void;
}

export interface WatchPreviewController {
  setHovered: (hovered: boolean) => void;
  dispose: () => void;
}

const HOUR_1010_RAD = THREE.MathUtils.degToRad(55);
const MIN_1010_RAD = THREE.MathUtils.degToRad(-60);
const SEC_REST_RAD = THREE.MathUtils.degToRad(145);

function createSharedWatchScene(
  container: HTMLElement,
  editionId: WatchEditionId,
  baseScale: number,
  cameraZDesktop: number,
  cameraZMobile: number,
) {
  const caps = getDeviceCapabilities();
  if (!caps.hasWebGL) {
    throw new Error('WebGL unavailable');
  }

  const width = Math.max(200, container.clientWidth);
  const height = Math.max(200, container.clientHeight);

  const renderer = new THREE.WebGLRenderer({
    antialias: !caps.isSoftwareGl && !caps.isLowSpec,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(
    getOptimalPixelRatio({
      isSoftwareGl: caps.isSoftwareGl,
      isMobile: caps.isMobile,
      isLowSpec: caps.isLowSpec,
      saveData: caps.saveData,
    }),
  );
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const studioEnv = createStudioEnvironment(renderer, {
    skipHdrUpgrade: caps.saveData || caps.isSoftwareGl || caps.isLowSpec,
    skipRoomEnv: caps.isSoftwareGl,
  });
  scene.environment = studioEnv.initialEnvMap;

  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
  camera.position.set(0, 0, width < 480 ? cameraZMobile : cameraZDesktop);
  camera.lookAt(0, 0, 0);

  const lightMult = caps.isSoftwareGl ? 1.85 : 1;
  const hemiLight = new THREE.HemisphereLight(0xf4f6fa, 0xd8d3c9, 0.44 * lightMult);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ec, 1.32 * lightMult);
  keyLight.position.set(-5.6, 6.2, 6.8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe8effc, 0.66 * lightMult);
  fillLight.position.set(6.5, 1.2, 5.0);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.72 * lightMult);
  rimLight.position.set(0.5, 4.5, -6.5);
  scene.add(rimLight);

  if (!caps.isSoftwareGl && !caps.isLowSpec && !caps.saveData) {
    RectAreaLightUniformsLib.init();
    const leftStrip = new THREE.RectAreaLight(0xffffff, 4.0, 2.2, 9.5);
    leftStrip.position.set(-4.8, 1.4, 5.2);
    leftStrip.lookAt(0, 0, 0);
    scene.add(leftStrip);

    const rightStrip = new THREE.RectAreaLight(0xf4f7fc, 3.0, 2.0, 9.0);
    rightStrip.position.set(5.2, -0.4, 4.8);
    rightStrip.lookAt(0, 0, 0);
    scene.add(rightStrip);
  }

  const maxCap = caps.isLowSpec || caps.isMobile ? 4 : 8;
  const rig: WatchRig = buildWatchModel({
    isMobile: caps.isMobile,
    isLowSpec: caps.isLowSpec,
    saveData: caps.saveData,
    isSoftwareGl: caps.isSoftwareGl,
    maxAnisotropy: Math.min(maxCap, renderer.capabilities.getMaxAnisotropy()),
  });

  // Set assembled 10:10 pose immediately identical to homepage completed state
  rig.caseGroup.position.set(0, 0, 0);
  rig.caseGroup.rotation.set(0, 0, 0);
  rig.movementGroup.position.set(0, 0, 0);
  rig.movementGroup.rotation.set(0, 0, 0);
  rig.hourHand.position.set(0, 0, 0);
  rig.hourHand.rotation.set(0, 0, HOUR_1010_RAD);
  rig.minuteHand.position.set(0, 0, 0);
  rig.minuteHand.rotation.set(0, 0, MIN_1010_RAD);
  rig.secondHand.position.set(0, 0, 0);
  rig.secondHand.rotation.set(0, 0, SEC_REST_RAD);
  rig.crownGroup.position.set(0, 0, 0);
  rig.crownGroup.rotation.set(0, 0, 0);
  rig.crystalGroup.position.set(0, 0, 0);
  rig.crystalGroup.rotation.set(0, 0, 0);
  rig.sweepMaterial.opacity = 0;

  rig.topLinks.forEach((link) => {
    rig.poseBraceletElement(link, link.userData.assembledArcS as number);
  });
  rig.bottomLinks.forEach((link) => {
    rig.poseBraceletElement(link, link.userData.assembledArcS as number);
  });
  rig.poseBraceletElement(rig.topClaspGroup, rig.topClaspGroup.userData.assembledArcS as number);
  rig.poseBraceletElement(
    rig.bottomClaspGroup,
    rig.bottomClaspGroup.userData.assembledArcS as number,
  );
  rig.contactShadowMaterial.opacity = 0.28;
  rig.contactShadow.position.y = -4.22 * baseScale;
  rig.watchRoot.scale.setScalar(baseScale);
  rig.contactShadow.scale.setScalar(baseScale);
  rig.setEditionImmediate(editionId);

  scene.add(rig.watchRoot);
  scene.add(rig.contactShadow);

  return { renderer, scene, camera, studioEnv, rig, caps };
}

function paceSoftwareDraw(
  renderer: THREE.WebGLRenderer,
  isDisposed: () => boolean,
  onDone: () => void,
): number {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (gl && typeof gl.fenceSync === 'function') {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    let timer = 0;
    const poll = () => {
      if (isDisposed()) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        timer = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        timer = window.setTimeout(onDone, 64);
      }
    };
    timer = window.setTimeout(poll, 5);
    return timer;
  }
  return window.setTimeout(onDone, 64);
}

/**
 * Interactive 3D viewer for /watch/:id pages:
 * drag-to-rotate with smooth inertia damping, preset camera angles,
 * offscreen/hidden tab pausing, on-demand rendering, and WebGL fallback callback.
 */
export function initStandaloneWatchViewer(
  container: HTMLElement,
  initialEdition: WatchEditionId,
  options?: {
    onFirstInteract?: () => void;
    onReady?: () => void;
    onWebGLError?: () => void;
  },
): WatchInteractiveController {
  let shared: ReturnType<typeof createSharedWatchScene>;
  try {
    shared = createSharedWatchScene(container, initialEdition, 0.76, 12.2, 13.8);
  } catch {
    options?.onWebGLError?.();
    return {
      setEdition: () => {},
      setPresetAngle: () => {},
      dispose: () => {},
    };
  }

  const { renderer, scene, camera, studioEnv, rig, caps } = shared;

  let currentRotY = -0.32;
  let currentRotX = 0.08;
  let velY = 0;
  let velX = 0;
  let presetTarget: { x: number; y: number } | null = null;
  let isDragging = false;
  let hasInteracted = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastMoveTime = performance.now();
  let lastFrameTime = performance.now();
  let disposed = false;
  let frameId = 0;
  let renderBusy = false;
  let renderDirty = false;
  let isInViewport = true;
  let isTabHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  let needsRenderOnResume = false;
  let lastWidth = Math.max(220, container.clientWidth);
  let lastHeight = Math.max(220, container.clientHeight);
  let hdrTimerId = 0;

  const canRenderNow = () => !disposed && isInViewport && !isTabHidden;

  const updateViewportSizing = () => {
    if (disposed) return;
    const w = Math.max(220, container.clientWidth);
    const h = Math.max(220, container.clientHeight);
    if (w === lastWidth && h === lastHeight) return;
    lastWidth = w;
    lastHeight = h;
    camera.aspect = w / h;
    camera.position.z = w < 480 ? 13.8 : 12.2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(
      getOptimalPixelRatio({
        isSoftwareGl: caps.isSoftwareGl,
        isMobile: window.innerWidth < 768,
        isLowSpec: caps.isLowSpec,
        saveData: caps.saveData,
      }),
    );
    renderer.setSize(w, h);
    requestRender();
  };

  const stepFrame = () => {
    if (!canRenderNow()) {
      renderBusy = false;
      needsRenderOnResume = true;
      return;
    }

    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.004, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    let keepAnimating = false;

    if (presetTarget && !isDragging) {
      if (caps.reducedMotion) {
        currentRotX = presetTarget.x;
        currentRotY = presetTarget.y;
        presetTarget = null;
      } else {
        currentRotX = THREE.MathUtils.damp(currentRotX, presetTarget.x, 8, dt);
        currentRotY = THREE.MathUtils.damp(currentRotY, presetTarget.y, 8, dt);
        if (
          Math.abs(currentRotX - presetTarget.x) < 0.001 &&
          Math.abs(currentRotY - presetTarget.y) < 0.001
        ) {
          currentRotX = presetTarget.x;
          currentRotY = presetTarget.y;
          presetTarget = null;
        } else {
          keepAnimating = true;
        }
      }
    } else if (!isDragging && !caps.reducedMotion) {
      if (Math.abs(velY) > 0.0005 || Math.abs(velX) > 0.0005) {
        currentRotY += velY * dt * 60;
        currentRotX = THREE.MathUtils.clamp(currentRotX + velX * dt * 60, -0.58, 0.58);
        const decay = Math.exp(-5.2 * dt);
        velY *= decay;
        velX *= decay;
        if (Math.abs(velY) <= 0.0005) velY = 0;
        if (Math.abs(velX) <= 0.0005) velX = 0;
        keepAnimating = velY !== 0 || velX !== 0;
      }
    } else if (isDragging) {
      keepAnimating = true;
    }

    rig.watchRoot.rotation.set(currentRotX, currentRotY, 0);
    renderer.render(scene, camera);

    const finish = () => {
      renderBusy = false;
      if (disposed) return;
      if (keepAnimating || renderDirty) {
        renderDirty = false;
        requestRender();
      }
    };

    if (caps.isSoftwareGl) {
      frameId = paceSoftwareDraw(renderer, () => disposed, finish);
    } else {
      finish();
    }
  };

  function requestRender() {
    if (disposed) return;
    if (!canRenderNow()) {
      needsRenderOnResume = true;
      return;
    }
    if (renderBusy) {
      renderDirty = true;
      return;
    }
    renderBusy = true;
    lastFrameTime = performance.now();
    frameId = window.requestAnimationFrame(stepFrame);
  }

  if (!caps.saveData && !caps.isSoftwareGl && !caps.isLowSpec) {
    hdrTimerId = window.setTimeout(() => {
      if (disposed) return;
      studioEnv.loadHdrIntoScene((hdrEnvMap) => {
        if (!disposed) {
          scene.environment = hdrEnvMap;
          requestRender();
        }
      });
    }, 600);
  }

  const canvasEl = renderer.domElement;
  canvasEl.style.touchAction = 'pan-y';
  canvasEl.style.cursor = 'grab';

  const onContextLost = (event: Event) => {
    event.preventDefault();
    disposed = true;
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(frameId);
    options?.onWebGLError?.();
  };
  canvasEl.addEventListener('webglcontextlost', onContextLost);

  const notifyFirstInteract = () => {
    if (!hasInteracted) {
      hasInteracted = true;
      options?.onFirstInteract?.();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    presetTarget = null;
    velX = 0;
    velY = 0;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    lastMoveTime = performance.now();
    canvasEl.style.cursor = 'grabbing';
    canvasEl.setPointerCapture?.(e.pointerId);
    notifyFirstInteract();
    requestRender();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    const elapsed = Math.max(8, now - lastMoveTime);
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    lastMoveTime = now;

    const deltaRotY = dx * 0.011;
    const deltaRotX = dy * 0.007;
    currentRotY += deltaRotY;
    currentRotX = THREE.MathUtils.clamp(currentRotX + deltaRotX, -0.58, 0.58);

    const scaleFactor = 16 / elapsed;
    velY = THREE.MathUtils.clamp(deltaRotY * scaleFactor, -0.14, 0.14);
    velX = THREE.MathUtils.clamp(deltaRotX * scaleFactor, -0.08, 0.08);
    requestRender();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    canvasEl.style.cursor = 'grab';
    canvasEl.releasePointerCapture?.(e.pointerId);
    if (performance.now() - lastMoveTime > 90) {
      velX = 0;
      velY = 0;
    }
    requestRender();
  };

  const onVisibilityChange = () => {
    isTabHidden = document.visibilityState === 'hidden';
    if (isTabHidden) {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      renderBusy = false;
    } else if (needsRenderOnResume && isInViewport) {
      needsRenderOnResume = false;
      requestRender();
    }
  };

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextInViewport = Boolean(entry?.isIntersecting);
        if (nextInViewport === isInViewport) return;
        isInViewport = nextInViewport;
        if (!isInViewport) {
          window.cancelAnimationFrame(frameId);
          window.clearTimeout(frameId);
          renderBusy = false;
        } else if (needsRenderOnResume && !isTabHidden) {
          needsRenderOnResume = false;
          requestRender();
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(container);
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  canvasEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateViewportSizing);
    resizeObserver.observe(container);
  }
  window.addEventListener('resize', updateViewportSizing);

  const initialFrameId = window.requestAnimationFrame(() => {
    if (disposed) return;
    rig.watchRoot.rotation.set(currentRotX, currentRotY, 0);
    renderer.render(scene, camera);
    options?.onReady?.();
  });

  return {
    setEdition: (id: WatchEditionId) => {
      rig.setEditionImmediate(id);
      requestRender();
    },
    setPresetAngle: (angle: WatchViewerAngle) => {
      velX = 0;
      velY = 0;
      if (angle === 'front') {
        presetTarget = { x: 0, y: 0 };
      } else if (angle === 'three-quarter') {
        presetTarget = { x: 0.08, y: -0.38 };
      } else if (angle === 'profile') {
        presetTarget = { x: 0.04, y: Math.PI * 0.5 };
      } else {
        presetTarget = { x: 0.04, y: Math.PI };
      }
      requestRender();
    },
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(initialFrameId);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.clearTimeout(hdrTimerId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver?.disconnect();
      canvasEl.removeEventListener('webglcontextlost', onContextLost);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', updateViewportSizing);
      resizeObserver?.disconnect();
      rig.dispose();
      studioEnv.dispose();
      renderer.dispose();
      if (canvasEl.parentElement === container) {
        container.removeChild(canvasEl);
      }
    },
  };
}

/**
 * Collection card 3D watch preview:
 * uses identical watch model & studio IBL; rotates lightly on hover or active mobile turn,
 * pauses immediately when offscreen, tab hidden, Save-Data, or reduced motion.
 */
export function initCardWatchPreview(
  container: HTMLElement,
  editionId: WatchEditionId,
  options?: {
    onReady?: () => void;
    onWebGLError?: () => void;
  },
): WatchPreviewController {
  let shared: ReturnType<typeof createSharedWatchScene>;
  try {
    shared = createSharedWatchScene(container, editionId, 0.72, 12.8, 12.8);
  } catch {
    options?.onWebGLError?.();
    return {
      setHovered: () => {},
      dispose: () => {},
    };
  }

  const { renderer, scene, camera, studioEnv, rig, caps } = shared;

  let isHovered = false;
  let isMobileViewport = window.innerWidth < 900;
  let currentRotY = -0.26;
  let currentRotX = 0.06;
  let lastTime = performance.now();
  let disposed = false;
  let frameId = 0;
  let running = false;
  let isInViewport = true;
  let isTabHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  let lastW = Math.max(200, container.clientWidth);
  let lastH = Math.max(200, container.clientHeight);
  let hdrTimerId = 0;

  const canTurn = () =>
    !caps.reducedMotion && !caps.saveData && (isHovered || isMobileViewport);
  const canRender = () => !disposed && isInViewport && !isTabHidden;

  const stopLoop = () => {
    running = false;
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(frameId);
  };

  const renderOnce = () => {
    if (!canRender()) return;
    rig.watchRoot.rotation.set(currentRotX, currentRotY, 0);
    renderer.render(scene, camera);
  };

  const tick = () => {
    if (!canRender()) {
      stopLoop();
      return;
    }

    const now = performance.now();
    const dt = Math.min(0.08, Math.max(0.004, (now - lastTime) / 1000));
    lastTime = now;

    if (isHovered && !caps.reducedMotion && !caps.saveData) {
      currentRotY += dt * 0.55;
      currentRotX = THREE.MathUtils.damp(currentRotX, 0.1, 6, dt);
    } else if (isMobileViewport && !caps.reducedMotion && !caps.saveData) {
      currentRotY += dt * 0.28;
      currentRotX = THREE.MathUtils.damp(currentRotX, 0.06, 4, dt);
    } else {
      currentRotY = THREE.MathUtils.damp(currentRotY, -0.26, 4.5, dt);
      currentRotX = THREE.MathUtils.damp(currentRotX, 0.06, 4.5, dt);
    }

    renderOnce();

    const settling =
      !canTurn() &&
      (Math.abs(currentRotY - -0.26) > 0.002 || Math.abs(currentRotX - 0.06) > 0.002);

    if (canTurn() || settling) {
      if (caps.isSoftwareGl) {
        frameId = paceSoftwareDraw(renderer, () => disposed || !canRender(), () => {
          if (canRender()) frameId = window.requestAnimationFrame(tick);
          else stopLoop();
        });
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    } else {
      running = false;
    }
  };

  const ensureLoop = () => {
    if (!running && canRender()) {
      running = true;
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(tick);
    }
  };

  const handleResize = () => {
    if (disposed) return;
    const w = Math.max(200, container.clientWidth);
    const h = Math.max(200, container.clientHeight);
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    isMobileViewport = window.innerWidth < 900;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(
      getOptimalPixelRatio({
        isSoftwareGl: caps.isSoftwareGl,
        isMobile: window.innerWidth < 768,
        isLowSpec: caps.isLowSpec,
        saveData: caps.saveData,
      }),
    );
    renderer.setSize(w, h);
    renderOnce();
    if (canTurn()) ensureLoop();
  };

  const onVisibilityChange = () => {
    isTabHidden = document.visibilityState === 'hidden';
    if (isTabHidden) {
      stopLoop();
    } else if (isInViewport) {
      renderOnce();
      if (canTurn()) ensureLoop();
    }
  };

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextInViewport = Boolean(entry?.isIntersecting);
        if (nextInViewport === isInViewport) return;
        isInViewport = nextInViewport;
        if (!isInViewport) {
          stopLoop();
        } else if (!isTabHidden) {
          renderOnce();
          if (canTurn()) ensureLoop();
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(container);
  }

  const onContextLost = (event: Event) => {
    event.preventDefault();
    disposed = true;
    stopLoop();
    options?.onWebGLError?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  if (!caps.saveData && !caps.isSoftwareGl && !caps.isLowSpec) {
    hdrTimerId = window.setTimeout(() => {
      if (disposed) return;
      studioEnv.loadHdrIntoScene((hdrEnvMap) => {
        if (!disposed) {
          scene.environment = hdrEnvMap;
          renderOnce();
        }
      });
    }, 600);
  }

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('resize', handleResize);

  const initialCardFrameId = window.requestAnimationFrame(() => {
    if (disposed) return;
    renderOnce();
    options?.onReady?.();
    if (canTurn()) {
      ensureLoop();
    }
  });

  return {
    setHovered: (hovered: boolean) => {
      isHovered = hovered;
      if (!caps.reducedMotion && !caps.saveData) {
        ensureLoop();
      }
    },
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(initialCardFrameId);
      window.clearTimeout(hdrTimerId);
      stopLoop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      rig.dispose();
      studioEnv.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
