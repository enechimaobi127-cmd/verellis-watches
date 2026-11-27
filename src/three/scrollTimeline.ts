import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { buildWatchModel, type WatchRig } from './watchBuilder';
import { createStudioEnvironment, type StudioEnvironmentHandle } from './studioEnvironment';
import { getDeviceCapabilities, getOptimalPixelRatio } from './deviceCapabilities';
import { WATCH_EDITIONS, type WatchEditionId } from '../watch/catalog';
import {
  computeWatchZoneFraming,
  getCollectionScrollState,
  getCrystalSweepAmount,
  getHeroTitleOpacities,
  type ZoneRect,
} from '../watch/scrollState';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollExperienceCallbacks {
  onReady: () => void;
  onWebGLError?: () => void;
  onHeroProgress: (progress: number, titleOpacities: number[]) => void;
  onCollectionChange: (editionIndex: number, progress: number) => void;
  onSectionPhase: (phase: 'hero' | 'collection' | 'craft') => void;
}

export interface ScrollExperienceController {
  scrollToSection: (selector: string) => void;
  selectEditionPreview: (editionIndex: number) => void;
  dispose: () => void;
}

const HOUR_1010_RAD = THREE.MathUtils.degToRad(55); // 10:10 hour position
const MIN_1010_RAD = THREE.MathUtils.degToRad(-60); // 10:10 minute position
const SEC_REST_RAD = THREE.MathUtils.degToRad(145); // Stationary second hand while scrolling

export function initWatchScrollExperience(
  canvasMount: HTMLElement,
  heroTriggerEl: HTMLElement,
  collectionTriggerEl: HTMLElement,
  watchZoneEl: HTMLElement,
  collectionInfoEl: HTMLElement,
  footerTriggerEl: HTMLElement,
  callbacks: ScrollExperienceCallbacks,
): ScrollExperienceController {
  const caps = getDeviceCapabilities();
  const { isSoftwareGl, isMobile, isLowSpec, saveData, reducedMotion, hasWebGL } = caps;

  // -------------------------------------------------------------------------
  // 1. THREE.JS RENDERER, SCENE, CAMERA & STUDIO IBL (WITH SAFE WEBGL FALLBACK)
  // -------------------------------------------------------------------------
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let studioEnv: StudioEnvironmentHandle | null = null;
  let watchRigRef: WatchRig | null = null;

  let currentCollectionShift = 0;
  let currentWatchScale = 1;
  const poseState = { heroScale: 1, editionScale: 1 };
  const stickyShellEl = watchZoneEl.closest('.sticky') as HTMLElement | null;

  const measureWatchZoneRect = (): ZoneRect => {
    const zoneRect = watchZoneEl.getBoundingClientRect();
    let adjustedTop = zoneRect.top;
    if (stickyShellEl) {
      const stickyTop = stickyShellEl.getBoundingClientRect().top;
      if (stickyTop > 0) {
        adjustedTop = zoneRect.top - stickyTop;
      }
    }
    return {
      left: zoneRect.left,
      top: adjustedTop,
      width: zoneRect.width,
      height: zoneRect.height,
    };
  };

  const syncWatchTransformScale = () => {
    if (!watchRigRef) return;
    const baseScale = currentWatchScale * poseState.heroScale;
    watchRigRef.watchRoot.scale.setScalar(baseScale * poseState.editionScale);
    watchRigRef.contactShadow.position.y = -4.22 * baseScale;
    watchRigRef.contactShadow.scale.setScalar(baseScale);
  };

  const applyCameraFraming = () => {
    if (!camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const framing = computeWatchZoneFraming(
      w,
      h,
      measureWatchZoneRect(),
      currentCollectionShift,
    );
    camera.aspect = w / Math.max(1, h);
    camera.position.set(0, 0, framing.cameraZ);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(w, h, framing.offsetX, framing.offsetY, w, h);
    camera.updateProjectionMatrix();
    currentWatchScale = framing.watchScale;
    syncWatchTransformScale();
  };

  if (hasWebGL) {
    try {
      const nextRenderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl && !isLowSpec,
        alpha: true,
        powerPreference: 'high-performance',
      });
      nextRenderer.outputColorSpace = THREE.SRGBColorSpace;
      nextRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      nextRenderer.toneMappingExposure = 1.05;
      nextRenderer.setPixelRatio(
        getOptimalPixelRatio({ isSoftwareGl, isMobile, isLowSpec, saveData }),
      );
      nextRenderer.setSize(window.innerWidth, window.innerHeight);
      nextRenderer.setClearColor(0xffffff, 0);
      canvasMount.appendChild(nextRenderer.domElement);

      const nextScene = new THREE.Scene();
      const nextStudioEnv = createStudioEnvironment(nextRenderer, {
        skipHdrUpgrade: saveData || isSoftwareGl || isLowSpec,
        skipRoomEnv: isSoftwareGl,
      });
      nextScene.environment = nextStudioEnv.initialEnvMap;

      const nextCamera = new THREE.PerspectiveCamera(
        34,
        window.innerWidth / Math.max(1, window.innerHeight),
        0.1,
        100,
      );

      renderer = nextRenderer;
      scene = nextScene;
      camera = nextCamera;
      studioEnv = nextStudioEnv;
    } catch {
      renderer = null;
      scene = null;
      camera = null;
      studioEnv = null;
    }
  }

  if (!renderer || !scene || !camera) {
    callbacks.onWebGLError?.();
  } else {
    applyCameraFraming();
  }

  if (renderer && scene && camera) {
    // Studio 3-point lighting + two tall strip softbox RectAreaLights for elongated steel highlights
    const lightMult = isSoftwareGl ? 1.85 : 1;
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

    if (!isSoftwareGl && !isLowSpec && !saveData) {
      RectAreaLightUniformsLib.init();
      const leftStripLight = new THREE.RectAreaLight(0xffffff, 4.0, 2.2, 9.5);
      leftStripLight.position.set(-4.8, 1.4, 5.2);
      leftStripLight.lookAt(0, 0, 0);
      scene.add(leftStripLight);

      const rightStripLight = new THREE.RectAreaLight(0xf4f7fc, 3.0, 2.0, 9.0);
      rightStripLight.position.set(5.2, -0.4, 4.8);
      rightStripLight.lookAt(0, 0, 0);
      scene.add(rightStripLight);
    }

    const maxCap = isLowSpec || isMobile ? 4 : 8;
    const watchRig: WatchRig = buildWatchModel({
      isMobile,
      isLowSpec,
      saveData,
      isSoftwareGl,
      maxAnisotropy: Math.min(maxCap, renderer.capabilities.getMaxAnisotropy()),
    });
    watchRigRef = watchRig;
    scene.add(watchRig.watchRoot);
    scene.add(watchRig.contactShadow);
    syncWatchTransformScale();

    if (!isSoftwareGl && !saveData) {
      renderer.compile(scene, camera);
    }
  }

  // -------------------------------------------------------------------------
  // 2. ON-DEMAND / PAUSED (OFFSCREEN + HIDDEN TAB) RENDER SCHEDULER
  // -------------------------------------------------------------------------
  let frameId = 0;
  let renderBusy = false;
  let renderDirty = false;
  let isDisposed = false;
  let isTabHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  let isMountIntersecting = true;
  let isCanvasFadedOut = false;
  let needsRenderOnResume = false;

  const isRenderAllowed = () =>
    Boolean(renderer && scene && camera) &&
    !isDisposed &&
    !isTabHidden &&
    isMountIntersecting &&
    !isCanvasFadedOut;

  const afterDraw = (cb: () => void) => {
    if (isDisposed || !renderer) return;
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 64);
        }
      };
      frameId = window.setTimeout(poll, 5);
    } else {
      frameId = window.setTimeout(cb, 64);
    }
  };

  const requestRender = () => {
    if (isDisposed || !renderer || !scene || !camera) return;
    if (!isRenderAllowed()) {
      needsRenderOnResume = true;
      return;
    }
    if (renderBusy) {
      renderDirty = true;
      return;
    }
    renderBusy = true;
    frameId = window.requestAnimationFrame(() => {
      if (isDisposed || !renderer || !scene || !camera) return;
      if (!isRenderAllowed()) {
        renderBusy = false;
        needsRenderOnResume = true;
        return;
      }
      renderDirty = false;
      renderer.render(scene, camera);
      const done = () => {
        renderBusy = false;
        if (renderDirty && isRenderAllowed()) requestRender();
      };
      if (isSoftwareGl) {
        afterDraw(done);
      } else {
        done();
      }
    });
  };

  let hdrTimerId = 0;
  if (!saveData && !isSoftwareGl && !isLowSpec) {
    hdrTimerId = window.setTimeout(() => {
      if (isDisposed) return;
      studioEnv?.loadHdrIntoScene((hdrEnvMap) => {
        if (!isDisposed && scene) {
          scene.environment = hdrEnvMap;
          requestRender();
        }
      });
    }, 600);
  }

  // -------------------------------------------------------------------------
  // 3. EXPLODED & ASSEMBLED WATCH STATE POSES
  // -------------------------------------------------------------------------
  const setAssembledRestingPose = () => {
    const watchRig = watchRigRef;
    if (!watchRig) return;
    watchRig.caseGroup.position.set(0, 0, 0);
    watchRig.caseGroup.rotation.set(0, 0, 0);
    watchRig.caseGroup.scale.set(1, 1, 1);

    watchRig.movementGroup.position.set(0, 0, 0);
    watchRig.movementGroup.rotation.set(0, 0, 0);
    watchRig.movementGroup.scale.set(1, 1, 1);

    watchRig.handsGroup.position.set(0, 0, 0);
    watchRig.handsGroup.rotation.set(0, 0, 0);
    watchRig.hourHand.position.set(0, 0, 0);
    watchRig.hourHand.rotation.set(0, 0, HOUR_1010_RAD);
    watchRig.minuteHand.position.set(0, 0, 0);
    watchRig.minuteHand.rotation.set(0, 0, MIN_1010_RAD);
    watchRig.secondHand.position.set(0, 0, 0);
    watchRig.secondHand.rotation.set(0, 0, SEC_REST_RAD);

    watchRig.crownGroup.position.set(0, 0, 0);
    watchRig.crownGroup.rotation.set(0, 0, 0);

    watchRig.crystalGroup.position.set(0, 0, 0);
    watchRig.crystalGroup.rotation.set(0, 0, 0);
    watchRig.sweepMaterial.opacity = 0;

    watchRig.topLinks.forEach((link) => {
      watchRig.poseBraceletElement(link, link.userData.assembledArcS as number);
    });
    watchRig.bottomLinks.forEach((link) => {
      watchRig.poseBraceletElement(link, link.userData.assembledArcS as number);
    });
    watchRig.poseBraceletElement(
      watchRig.topClaspGroup,
      watchRig.topClaspGroup.userData.assembledArcS as number,
    );
    watchRig.poseBraceletElement(
      watchRig.bottomClaspGroup,
      watchRig.bottomClaspGroup.userData.assembledArcS as number,
    );

    watchRig.watchRoot.position.set(0, 0, 0);
    watchRig.watchRoot.rotation.set(0, 0, 0);
    poseState.heroScale = 1;
    syncWatchTransformScale();
    watchRig.contactShadowMaterial.opacity = 0.34;
  };

  // Initial exploded start coordinates (calm, balanced, evenly spaced)
  const explodedOffsets = {
    casePos: [-1.85, 0.2, -0.5] as [number, number, number],
    caseRot: [0.22, -0.34, 0.12] as [number, number, number],
    movementPos: [0.45, 0.1, 1.45] as [number, number, number],
    movementRot: [-0.12, 0.28, -0.14] as [number, number, number],
    hourPos: [-1.1, 1.35, 2.05] as [number, number, number],
    hourRot: [0.16, -0.22, 1.25] as [number, number, number],
    minutePos: [1.85, 0.85, 2.25] as [number, number, number],
    minuteRot: [-0.18, 0.24, -1.35] as [number, number, number],
    secondPos: [1.25, -0.95, 2.35] as [number, number, number],
    secondRot: [0.12, 0.14, 2.45] as [number, number, number],
    crownPos: [2.85, 0.05, 0.45] as [number, number, number],
    crownRot: [0.65, 0.22, 0.12] as [number, number, number],
    crystalPos: [-2.15, 1.05, 2.75] as [number, number, number],
    crystalRot: [-0.24, -0.22, 0.1] as [number, number, number],
  };

  const setExplodedStartPose = () => {
    const watchRig = watchRigRef;
    if (!watchRig) return;
    watchRig.caseGroup.position.set(...explodedOffsets.casePos);
    watchRig.caseGroup.rotation.set(...explodedOffsets.caseRot);

    watchRig.movementGroup.position.set(...explodedOffsets.movementPos);
    watchRig.movementGroup.rotation.set(...explodedOffsets.movementRot);

    watchRig.hourHand.position.set(...explodedOffsets.hourPos);
    watchRig.hourHand.rotation.set(...explodedOffsets.hourRot);

    watchRig.minuteHand.position.set(...explodedOffsets.minutePos);
    watchRig.minuteHand.rotation.set(...explodedOffsets.minuteRot);

    watchRig.secondHand.position.set(...explodedOffsets.secondPos);
    watchRig.secondHand.rotation.set(...explodedOffsets.secondRot);

    watchRig.crownGroup.position.set(...explodedOffsets.crownPos);
    watchRig.crownGroup.rotation.set(...explodedOffsets.crownRot);

    watchRig.crystalGroup.position.set(...explodedOffsets.crystalPos);
    watchRig.crystalGroup.rotation.set(...explodedOffsets.crystalRot);
    watchRig.sweepMaterial.opacity = 0;

    watchRig.topLinks.forEach((link) => {
      watchRig.poseBraceletElement(link, link.userData.explodedArcS as number);
    });

    watchRig.bottomLinks.forEach((link) => {
      watchRig.poseBraceletElement(link, link.userData.explodedArcS as number);
    });

    watchRig.poseBraceletElement(
      watchRig.topClaspGroup,
      watchRig.topClaspGroup.userData.explodedArcS as number,
    );
    watchRig.poseBraceletElement(
      watchRig.bottomClaspGroup,
      watchRig.bottomClaspGroup.userData.explodedArcS as number,
    );

    watchRig.watchRoot.position.set(0, 0, 0);
    watchRig.watchRoot.rotation.set(0, 0, 0);
    poseState.heroScale = 0.92;
    syncWatchTransformScale();
    watchRig.contactShadowMaterial.opacity = 0.05;
  };

  // -------------------------------------------------------------------------
  // 4. LENIS + GSAP SCROLLTRIGGER SETUP
  // -------------------------------------------------------------------------
  let currentEditionIndex = 0;
  let activeTransitionTween: gsap.core.Tween | null = null;
  let activeEditionTransitionTarget: WatchEditionId = WATCH_EDITIONS[0].id;

  const triggerEditionTransition = (targetIndex: number) => {
    if (targetIndex === currentEditionIndex) return;
    const fromId = WATCH_EDITIONS[currentEditionIndex].id;
    const toId = WATCH_EDITIONS[targetIndex].id;
    currentEditionIndex = targetIndex;
    activeEditionTransitionTarget = toId;

    const watchRig = watchRigRef;
    if (!watchRig) return;

    if (activeTransitionTween) {
      activeTransitionTween.kill();
    }

    if (reducedMotion) {
      watchRig.setEditionImmediate(toId);
      requestRender();
      return;
    }

    const transitionState = { progress: 0 };
    activeTransitionTween = gsap.to(transitionState, {
      progress: 1,
      duration: 0.28,
      ease: 'power2.inOut',
      onUpdate: () => {
        const t = transitionState.progress;
        poseState.editionScale = 1 - 0.075 * Math.sin(Math.PI * t);
        syncWatchTransformScale();
        watchRig.applyEditionBlend(fromId, toId, t);
        requestRender();
      },
      onComplete: () => {
        poseState.editionScale = 1;
        syncWatchTransformScale();
        watchRig.setEditionImmediate(activeEditionTransitionTarget);
        requestRender();
      },
    });
  };

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reducedMotion,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  let lenisTickerActive = false;
  let lenisIdleFrames = 0;

  const tickLenis = (time: number) => {
    if (isDisposed || isTabHidden) return;
    lenis.raf(time * 1000);
    if (!lenis.isScrolling && Math.abs(lenis.velocity) < 0.005) {
      lenisIdleFrames += 1;
      if (lenisIdleFrames >= 4) {
        lenisTickerActive = false;
        gsap.ticker.remove(tickLenis);
      }
    } else {
      lenisIdleFrames = 0;
    }
  };

  const startLenisTicker = () => {
    if (isDisposed || reducedMotion) return;
    lenisIdleFrames = 0;
    if (!lenisTickerActive) {
      lenisTickerActive = true;
      gsap.ticker.add(tickLenis);
    }
  };

  const onScrollKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === ' ' ||
      e.key === 'PageDown' ||
      e.key === 'PageUp' ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      startLenisTicker();
    }
  };

  window.addEventListener('wheel', startLenisTicker, { passive: true });
  window.addEventListener('touchstart', startLenisTicker, { passive: true });
  window.addEventListener('touchmove', startLenisTicker, { passive: true });
  window.addEventListener('scroll', startLenisTicker, { passive: true });
  window.addEventListener('keydown', onScrollKeyDown);
  gsap.ticker.lagSmoothing(0);

  const ctx = gsap.context(() => {
    if (reducedMotion) {
      setAssembledRestingPose();
      watchRigRef?.setEditionImmediate('argent');
      callbacks.onHeroProgress(1, [0, 0, 0, 1]);
      callbacks.onCollectionChange(0, 0);

      ScrollTrigger.create({
        trigger: collectionTriggerEl,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          currentCollectionShift = 1;
          isCanvasFadedOut = false;
          canvasMount.style.opacity = '1';
          applyCameraFraming();
          callbacks.onSectionPhase('collection');
          requestRender();
        },
        onLeaveBack: () => {
          currentCollectionShift = 0;
          isCanvasFadedOut = false;
          canvasMount.style.opacity = '1';
          applyCameraFraming();
          callbacks.onSectionPhase('hero');
          requestRender();
        },
        onLeave: () => {
          currentCollectionShift = 0;
          isCanvasFadedOut = true;
          canvasMount.style.opacity = '0';
          applyCameraFraming();
          callbacks.onSectionPhase('craft');
        },
        onEnterBack: () => {
          currentCollectionShift = 1;
          isCanvasFadedOut = false;
          canvasMount.style.opacity = '1';
          applyCameraFraming();
          callbacks.onSectionPhase('collection');
          requestRender();
        },
      });
      requestRender();
      return;
    }

    setExplodedStartPose();

    // -----------------------------------------------------------------------
    // SECTION 1: HERO ASSEMBLY MASTER TIMELINE (400vh, scrub: 1)
    // -----------------------------------------------------------------------
    const watchRig = watchRigRef;
    const heroTl = gsap.timeline({
      onUpdate: () => {
        if (!watchRig) return;
        const p = heroTl.progress();
        const sweep = getCrystalSweepAmount(p);
        watchRig.sweepMesh.position.x = sweep.position;
        watchRig.sweepMaterial.opacity = sweep.intensity * 0.72;
        requestRender();
      },
      scrollTrigger: {
        trigger: heroTriggerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onEnter: () => {
          callbacks.onSectionPhase('hero');
          if (currentEditionIndex !== 0) {
            triggerEditionTransition(0);
            callbacks.onCollectionChange(0, 0);
          }
        },
        onEnterBack: () => {
          callbacks.onSectionPhase('hero');
          if (currentEditionIndex !== 0) {
            triggerEditionTransition(0);
            callbacks.onCollectionChange(0, 0);
          }
        },
        onUpdate: (self) => {
          const p = self.progress;
          const opacities = getHeroTitleOpacities(p);
          callbacks.onHeroProgress(p, opacities);
          requestRender();
        },
      },
    });

    if (watchRig) {
      // 0.00 -> 0.25: Case stabilizes & dial/movement glide in with gentle seat overshoot
      heroTl.to(
        poseState,
        {
          heroScale: 1,
          duration: 0.25,
          ease: 'power2.out',
          onUpdate: syncWatchTransformScale,
        },
        0,
      );
      heroTl.to(
        watchRig.caseGroup.position,
        { x: 0, y: 0, z: 0, duration: 0.24, ease: 'power2.out' },
        0,
      );
      heroTl.to(
        watchRig.caseGroup.rotation,
        { x: 0, y: 0, z: 0, duration: 0.24, ease: 'power2.out' },
        0,
      );
      heroTl.to(
        watchRig.movementGroup.position,
        { x: 0, y: 0, z: -0.04, duration: 0.21, ease: 'power2.inOut' },
        0,
      );
      heroTl.to(
        watchRig.movementGroup.position,
        { z: 0, duration: 0.04, ease: 'power2.out' },
        0.21,
      );
      heroTl.to(
        watchRig.movementGroup.rotation,
        { x: 0, y: 0, z: 0, duration: 0.24, ease: 'power3.inOut' },
        0,
      );

      // 0.25 -> 0.50: Hands seat to 10:10 with mechanical back-ease overshoot; crown clicks home
      heroTl.to(
        watchRig.hourHand.position,
        { x: 0, y: 0, z: 0, duration: 0.14, ease: 'back.out(1.4)' },
        0.25,
      );
      heroTl.to(
        watchRig.hourHand.rotation,
        { x: 0, y: 0, z: HOUR_1010_RAD, duration: 0.14, ease: 'back.out(1.6)' },
        0.25,
      );
      heroTl.to(
        watchRig.minuteHand.position,
        { x: 0, y: 0, z: 0, duration: 0.14, ease: 'back.out(1.4)' },
        0.29,
      );
      heroTl.to(
        watchRig.minuteHand.rotation,
        { x: 0, y: 0, z: MIN_1010_RAD, duration: 0.14, ease: 'back.out(1.6)' },
        0.29,
      );
      heroTl.to(
        watchRig.secondHand.position,
        { x: 0, y: 0, z: 0, duration: 0.14, ease: 'back.out(1.35)' },
        0.33,
      );
      heroTl.to(
        watchRig.secondHand.rotation,
        { x: 0, y: 0, z: SEC_REST_RAD, duration: 0.14, ease: 'back.out(1.5)' },
        0.33,
      );
      heroTl.to(
        watchRig.crownGroup.position,
        { x: -0.028, y: 0, z: 0, duration: 0.105, ease: 'power2.inOut' },
        0.37,
      );
      heroTl.to(
        watchRig.crownGroup.position,
        { x: 0, duration: 0.03, ease: 'power2.out' },
        0.475,
      );
      heroTl.to(
        watchRig.crownGroup.rotation,
        { x: 0, y: 0, z: 0, duration: 0.13, ease: 'back.out(1.4)' },
        0.37,
      );

      // 0.50 -> 0.70: Domed sapphire crystal lowers cleanly with subtle gasket seat ease
      heroTl.to(
        watchRig.crystalGroup.position,
        { x: 0, y: 0, z: -0.024, duration: 0.145, ease: 'power2.inOut' },
        0.5,
      );
      heroTl.to(
        watchRig.crystalGroup.position,
        { z: 0, duration: 0.04, ease: 'power2.out' },
        0.645,
      );
      heroTl.to(
        watchRig.crystalGroup.rotation,
        { x: 0, y: 0, z: 0, duration: 0.18, ease: 'power2.inOut' },
        0.5,
      );

      // 0.70 -> 0.90: Bracelet links & mirrored clasps slide along the Y-Z curve from case outward
      const slideAlongCurve = (element: THREE.Object3D, startTime: number, duration: number) => {
        const startS = element.userData.explodedArcS as number;
        const endS = element.userData.assembledArcS as number;
        const state = { t: 0 };
        heroTl.to(
          state,
          {
            t: 1,
            duration,
            ease: 'power3.out',
            onUpdate: () => {
              watchRig.poseBraceletElement(element, THREE.MathUtils.lerp(startS, endS, state.t));
            },
          },
          startTime,
        );
      };

      watchRig.topLinks.forEach((link, idx) => {
        slideAlongCurve(link, 0.7 + idx * 0.015, 0.1);
      });

      watchRig.bottomLinks.forEach((link, idx) => {
        slideAlongCurve(link, 0.7 + idx * 0.015, 0.1);
      });

      slideAlongCurve(watchRig.topClaspGroup, 0.805, 0.095);
      slideAlongCurve(watchRig.bottomClaspGroup, 0.805, 0.095);

      heroTl.to(
        watchRig.contactShadowMaterial,
        { opacity: 0.34, duration: 0.25, ease: 'power2.out' },
        0.7,
      );

      // 0.90 -> 1.00: Hold finished watch centered & still (showing 10:10)
      heroTl.to(watchRig.watchRoot.rotation, { x: 0, y: 0, z: 0, duration: 0.1 }, 0.9);
    }

    // Smoothly move watch from Hero center -> measured Zone A center, and fade/slide Zone B in
    gsap.set(collectionInfoEl, { opacity: 0, y: 28 });

    ScrollTrigger.create({
      trigger: collectionTriggerEl,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        currentCollectionShift = self.progress;
        isCanvasFadedOut = false;
        canvasMount.style.opacity = '1';
        applyCameraFraming();
        requestRender();
      },
    });

    ScrollTrigger.create({
      trigger: collectionTriggerEl,
      start: 'top 72%',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        const infoP = self.progress;
        gsap.set(collectionInfoEl, {
          opacity: infoP,
          y: (1 - infoP) * 28,
        });
      },
    });

    // -----------------------------------------------------------------------
    // SECTION 2: COLLECTION 360 ROTATION & FINISH SWITCHING (400vh)
    // -----------------------------------------------------------------------
    ScrollTrigger.create({
      trigger: collectionTriggerEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onEnter: () => {
        currentCollectionShift = 1;
        isCanvasFadedOut = false;
        canvasMount.style.opacity = '1';
        gsap.set(collectionInfoEl, { opacity: 1, y: 0 });
        applyCameraFraming();
        callbacks.onSectionPhase('collection');
        setAssembledRestingPose();
        requestRender();
      },
      onEnterBack: () => {
        currentCollectionShift = 1;
        isCanvasFadedOut = false;
        canvasMount.style.opacity = '1';
        gsap.set(collectionInfoEl, { opacity: 1, y: 0 });
        applyCameraFraming();
        callbacks.onSectionPhase('collection');
        setAssembledRestingPose();
        requestRender();
      },
      onLeave: () => {
        callbacks.onSectionPhase('craft');
      },
      onLeaveBack: () => {
        callbacks.onSectionPhase('hero');
        if (watchRigRef) {
          watchRigRef.watchRoot.rotation.y = 0;
        }
        if (currentEditionIndex !== 0) {
          triggerEditionTransition(0);
        }
        requestRender();
      },
      onUpdate: (self) => {
        const state = getCollectionScrollState(self.progress);
        if (watchRigRef) {
          watchRigRef.watchRoot.rotation.y = state.rotationY;
          watchRigRef.secondHand.rotation.z = SEC_REST_RAD;
        }

        if (state.editionIndex !== currentEditionIndex) {
          triggerEditionTransition(state.editionIndex);
        }

        callbacks.onCollectionChange(state.editionIndex, self.progress);
        requestRender();
      },
    });

    // -----------------------------------------------------------------------
    // SECTION 3 / FOOTER EXIT: Keep watch tracked inside Zone A & pause WebGL once faded out
    // -----------------------------------------------------------------------
    ScrollTrigger.create({
      trigger: footerTriggerEl,
      start: 'top bottom',
      end: 'top 48%',
      scrub: true,
      onEnter: () => callbacks.onSectionPhase('craft'),
      onLeaveBack: () => {
        isCanvasFadedOut = false;
        callbacks.onSectionPhase('collection');
        requestRender();
      },
      onUpdate: (self) => {
        const p = self.progress;
        currentCollectionShift = 1;
        applyCameraFraming();
        const fade = Math.max(0, 1 - p / 0.55);
        if (watchRigRef) {
          watchRigRef.contactShadowMaterial.opacity = 0.34 * fade;
        }
        canvasMount.style.opacity = String(fade);
        isCanvasFadedOut = fade <= 0.005;
        if (!isCanvasFadedOut) {
          requestRender();
        }
      },
    });
  });

  const onVisibilityChange = () => {
    isTabHidden = document.visibilityState === 'hidden';
    if (isTabHidden) {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      renderBusy = false;
    } else if (needsRenderOnResume && isRenderAllowed()) {
      needsRenderOnResume = false;
      requestRender();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextIntersecting = Boolean(entry?.isIntersecting);
        if (nextIntersecting === isMountIntersecting) return;
        isMountIntersecting = nextIntersecting;
        if (!isMountIntersecting) {
          window.cancelAnimationFrame(frameId);
          window.clearTimeout(frameId);
          renderBusy = false;
        } else if (needsRenderOnResume && isRenderAllowed()) {
          needsRenderOnResume = false;
          requestRender();
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvasMount);
  }

  const onContextLost = (event: Event) => {
    event.preventDefault();
    isDisposed = true;
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(frameId);
    callbacks.onWebGLError?.();
  };
  renderer?.domElement.addEventListener('webglcontextlost', onContextLost);

  let lastWinW = window.innerWidth;
  let lastWinH = window.innerHeight;
  let lastZoneW = watchZoneEl.clientWidth;
  let lastZoneH = watchZoneEl.clientHeight;

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === lastWinW && h === lastWinH) return;
    lastWinW = w;
    lastWinH = h;
    applyCameraFraming();
    if (renderer) {
      renderer.setPixelRatio(
        getOptimalPixelRatio({
          isSoftwareGl,
          isMobile: w < 768,
          isLowSpec,
          saveData,
        }),
      );
      renderer.setSize(w, h);
    }
    ScrollTrigger.refresh();
    requestRender();
  };
  const onOrientationChange = () => {
    window.setTimeout(onResize, 120);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onOrientationChange);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      if (isDisposed) return;
      const rect = entries[0]?.contentRect;
      if (rect) {
        const rw = Math.round(rect.width);
        const rh = Math.round(rect.height);
        if (rw === lastZoneW && rh === lastZoneH) return;
        lastZoneW = rw;
        lastZoneH = rh;
      }
      applyCameraFraming();
      requestRender();
    });
    resizeObserver.observe(watchZoneEl);
  }

  let initialFrameId = 0;
  initialFrameId = window.requestAnimationFrame(() => {
    if (isDisposed) return;
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    callbacks.onReady();
  });

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (isDisposed) return;
      const rw = Math.round(watchZoneEl.clientWidth);
      const rh = Math.round(watchZoneEl.clientHeight);
      if (rw === lastZoneW && rh === lastZoneH) return;
      lastZoneW = rw;
      lastZoneH = rh;
      applyCameraFraming();
      ScrollTrigger.refresh();
      requestRender();
    });
  }

  const scrollToSection = (selector: string) => {
    if (selector === '#craft') {
      const targetY = collectionTriggerEl.offsetTop + 40;
      if (reducedMotion) {
        window.scrollTo(0, targetY);
      } else {
        startLenisTicker();
        lenis.scrollTo(targetY, { duration: 1.3 });
      }
      return;
    }
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    if (reducedMotion) {
      target.scrollIntoView({ behavior: 'auto' });
      return;
    }
    startLenisTicker();
    lenis.scrollTo(target, { offset: 0, duration: 1.3 });
  };

  const selectEditionPreview = (editionIndex: number) => {
    const clamped = Math.max(0, Math.min(WATCH_EDITIONS.length - 1, editionIndex));
    if (reducedMotion) {
      triggerEditionTransition(clamped);
      callbacks.onCollectionChange(clamped, clamped / WATCH_EDITIONS.length);
      return;
    }
    const colTop = collectionTriggerEl.offsetTop;
    const colScrollable = Math.max(1, collectionTriggerEl.offsetHeight - window.innerHeight);
    const targetScrollY = colTop + colScrollable * ((clamped + 0.08) / WATCH_EDITIONS.length);
    startLenisTicker();
    lenis.scrollTo(targetScrollY, { duration: 1.25 });
  };

  const dispose = () => {
    isDisposed = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    intersectionObserver?.disconnect();
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onOrientationChange);
    window.removeEventListener('wheel', startLenisTicker);
    window.removeEventListener('touchstart', startLenisTicker);
    window.removeEventListener('touchmove', startLenisTicker);
    window.removeEventListener('scroll', startLenisTicker);
    window.removeEventListener('keydown', onScrollKeyDown);
    resizeObserver?.disconnect();
    window.cancelAnimationFrame(initialFrameId);
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(frameId);
    window.clearTimeout(hdrTimerId);
    if (activeTransitionTween) activeTransitionTween.kill();
    lenisTickerActive = false;
    gsap.ticker.remove(tickLenis);
    lenis.destroy();
    ctx.revert();
    watchRigRef?.dispose();
    studioEnv?.dispose();
    renderer?.dispose();
    if (renderer && renderer.domElement.parentElement === canvasMount) {
      canvasMount.removeChild(renderer.domElement);
    }
  };

  return {
    scrollToSection,
    selectEditionPreview,
    dispose,
  };
}
