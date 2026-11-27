import * as THREE from 'three';
import { WATCH_EDITIONS, type WatchEditionId } from '../watch/catalog';
import { acquireSharedWatchAssets } from './watchAssetCache';

export interface WatchBuilderOptions {
  isMobile: boolean;
  isLowSpec?: boolean;
  saveData?: boolean;
  isSoftwareGl: boolean;
  maxAnisotropy: number;
}

export interface WatchRig {
  watchRoot: THREE.Group;
  caseGroup: THREE.Group;
  movementGroup: THREE.Group;
  handsGroup: THREE.Group;
  hourHand: THREE.Group;
  minuteHand: THREE.Group;
  secondHand: THREE.Group;
  crownGroup: THREE.Group;
  crystalGroup: THREE.Group;
  sweepMesh: THREE.Mesh;
  sweepMaterial: THREE.MeshBasicMaterial;
  braceletGroup: THREE.Group;
  topLinks: THREE.Group[];
  bottomLinks: THREE.Group[];
  topClaspGroup: THREE.Group;
  bottomClaspGroup: THREE.Group;
  poseBraceletElement: (element: THREE.Object3D, arcDistance: number) => void;
  contactShadow: THREE.Mesh;
  contactShadowMaterial: THREE.MeshBasicMaterial;
  getDialTexture: (id: WatchEditionId) => THREE.CanvasTexture;
  dialPrimaryMat: THREE.MeshStandardMaterial;
  dialFadeMat: THREE.MeshStandardMaterial;
  dialFadeMesh: THREE.Mesh;
  subDialRingsGroup: THREE.Group;
  caseMaterial: THREE.MeshStandardMaterial;
  bezelMaterial: THREE.MeshStandardMaterial;
  polishedMaterial: THREE.MeshStandardMaterial;
  markerMaterial: THREE.MeshStandardMaterial;
  accentMetalMaterial: THREE.MeshStandardMaterial;
  handMaterial: THREE.MeshStandardMaterial;
  secondHandMaterial: THREE.MeshStandardMaterial;
  setEditionImmediate: (id: WatchEditionId) => void;
  applyEditionBlend: (fromId: WatchEditionId, toId: WatchEditionId, mix: number) => void;
  dispose: () => void;
}

function createOctagonShape(radius: number, stretchY = 1.0): THREE.Shape {
  const shape = new THREE.Shape();
  const sides = 8;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * stretchY;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  shape.closePath();
  return shape;
}

function createTaperedLugShape(topWidth: number, bottomWidth: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hwTop = topWidth / 2;
  const hwBot = bottomWidth / 2;
  const hh = height / 2;
  const r = Math.min(radius, hwBot * 0.4, hh * 0.4);

  shape.moveTo(-hwBot + r, -hh);
  shape.lineTo(hwBot - r, -hh);
  shape.quadraticCurveTo(hwBot, -hh, hwBot, -hh + r);
  shape.lineTo(hwTop, hh - r);
  shape.quadraticCurveTo(hwTop, hh, hwTop - r, hh);
  shape.lineTo(-hwTop + r, hh);
  shape.quadraticCurveTo(-hwTop, hh, -hwTop, hh - r);
  shape.lineTo(-hwBot, -hh + r);
  shape.quadraticCurveTo(-hwBot, -hh, -hwBot + r, -hh);
  shape.closePath();
  return shape;
}

/**
 * Builds the procedural VERELLIS watch model as a shared multi-part THREE.Group hierarchy.
 */
export function buildWatchModel(options: WatchBuilderOptions): WatchRig {
  const { isMobile, isLowSpec = false, saveData = false, isSoftwareGl, maxAnisotropy } = options;
  const lowDetail = isMobile || isLowSpec || saveData || isSoftwareGl;
  const usePhysicalExtras = !isSoftwareGl && !isLowSpec && !saveData;
  const dialTexSize = lowDetail ? 512 : 1024;
  const curveSegments = isSoftwareGl || isLowSpec ? 8 : lowDetail ? 10 : 28;
  const bevelSegments = isSoftwareGl || isLowSpec ? 1 : lowDetail ? 2 : 4;
  const radialSegments = isSoftwareGl || isLowSpec ? 24 : lowDetail ? 32 : 72;

  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMaterials.push(m);
    return m;
  };
  const createSurfaceMaterial = (
    params: THREE.MeshPhysicalMaterialParameters,
  ): THREE.MeshStandardMaterial => {
    if (usePhysicalExtras) {
      return trackMat(new THREE.MeshPhysicalMaterial(params));
    }
    const {
      anisotropy: _aniso,
      anisotropyRotation: _anisoRot,
      clearcoat: _cc,
      clearcoatRoughness: _ccr,
      transmission: _tr,
      ior: _ior,
      thickness: _th,
      attenuationColor: _ac,
      attenuationDistance: _ad,
      specularIntensity: _si,
      ...standardParams
    } = params;
    return trackMat(new THREE.MeshStandardMaterial(standardParams));
  };

  const sharedAssets = acquireSharedWatchAssets(dialTexSize, maxAnisotropy);
  const { brushedNormalMap, brushedRoughnessMap, getDialTexture, contactShadowTex, sweepTex } =
    sharedAssets;
  const initialSpec = WATCH_EDITIONS[0];

  // Brushed flat-face material (roughness ~ 0.40, metalness 1, anisotropy on)
  const caseMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.caseColor),
    metalness: initialSpec.metalness,
    roughness: initialSpec.roughness,
    roughnessMap: brushedRoughnessMap,
    normalMap: brushedNormalMap,
    normalScale: new THREE.Vector2(0.28, 0.28),
    anisotropy: usePhysicalExtras ? initialSpec.anisotropy : 0,
    anisotropyRotation: 0,
    clearcoat: usePhysicalExtras ? 0.14 : 0,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.96,
  });

  // Polished bevel, chamfer & center-link material (roughness ~ 0.22, metalness 1)
  const polishedMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.bezelColor),
    metalness: initialSpec.metalness,
    roughness: initialSpec.polishedRoughness,
    anisotropy: usePhysicalExtras ? 0.14 : 0,
    clearcoat: usePhysicalExtras ? 0.85 : 0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.05,
  });

  // Brushed bezel top face paired with polished bezel bevels
  const bezelMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.bezelColor),
    metalness: initialSpec.metalness,
    roughness: Math.max(0.32, initialSpec.roughness - 0.04),
    roughnessMap: brushedRoughnessMap,
    normalMap: brushedNormalMap,
    normalScale: new THREE.Vector2(0.22, 0.22),
    anisotropy: usePhysicalExtras ? initialSpec.anisotropy : 0,
    clearcoat: usePhysicalExtras ? 0.22 : 0,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.98,
  });

  // Subtle darkened AO crevice material where case, bezel, lugs & pins meet
  const creviceAoMat = createSurfaceMaterial({
    color: new THREE.Color('#474A50'),
    metalness: 0.88,
    roughness: 0.56,
    envMapIntensity: 0.45,
  });

  const markerMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.markerColor),
    metalness: 1.0,
    roughness: 0.18,
    clearcoat: usePhysicalExtras ? 0.9 : 0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.3,
  });

  const accentMetalMaterial = createSurfaceMaterial({
    color: new THREE.Color('#B8975A'),
    metalness: 1.0,
    roughness: 0.22,
    clearcoat: usePhysicalExtras ? 0.65 : 0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.15,
  });

  const darkMovementMat = createSurfaceMaterial({
    color: new THREE.Color('#2B2D31'),
    metalness: 0.88,
    roughness: 0.36,
    envMapIntensity: 0.9,
  });

  const handMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.handHex),
    metalness: 1.0,
    roughness: 0.18,
    clearcoat: usePhysicalExtras ? 0.88 : 0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.3,
  });

  const lumeMaterial = createSurfaceMaterial({
    color: new THREE.Color('#F3F1E8'),
    metalness: 0.0,
    roughness: 0.34,
    clearcoat: usePhysicalExtras ? 0.15 : 0,
    envMapIntensity: 0.75,
  });

  const secondHandMaterial = createSurfaceMaterial({
    color: new THREE.Color(initialSpec.secondHandHex),
    metalness: 0.94,
    roughness: 0.2,
    clearcoat: usePhysicalExtras ? 0.7 : 0,
    envMapIntensity: 1.15,
  });

  // Crystal: pure optical sapphire disc with subtle edge glint and zero fogging
  const crystalMaterial = createSurfaceMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0.0,
    roughness: 0.015,
    transmission: lowDetail ? 0 : 0.96,
    transparent: true,
    opacity: lowDetail ? 0.12 : 1.0,
    ior: 1.77,
    thickness: 0.08,
    attenuationColor: new THREE.Color(0xffffff),
    attenuationDistance: 12,
    specularIntensity: 1.0,
    clearcoat: usePhysicalExtras ? 1.0 : 0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 1.3,
    depthWrite: false,
  });

  const crystalEdgeMat = createSurfaceMaterial({
    color: new THREE.Color('#EEF2F7'),
    metalness: 0.05,
    roughness: 0.04,
    transparent: true,
    opacity: 0.24,
    clearcoat: usePhysicalExtras ? 1.0 : 0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.4,
    depthWrite: false,
  });

  const initialDialTex = getDialTexture('argent');

  const dialPrimaryMat = createSurfaceMaterial({
    color: 0xffffff,
    map: initialDialTex,
    metalness: 0.45,
    roughness: 0.34,
    anisotropy: usePhysicalExtras ? 0.55 : 0,
    clearcoat: usePhysicalExtras ? 0.15 : 0,
    envMapIntensity: 0.95,
  });

  const dialFadeMat = createSurfaceMaterial({
    color: 0xffffff,
    map: initialDialTex,
    metalness: 0.45,
    roughness: 0.34,
    anisotropy: usePhysicalExtras ? 0.55 : 0,
    clearcoat: usePhysicalExtras ? 0.15 : 0,
    envMapIntensity: 0.95,
    transparent: true,
    opacity: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const watchRoot = new THREE.Group();
  watchRoot.name = 'VerellisWatchRoot';

  // ExtrudeGeometry uses group 0 for front/back flat faces (brushed) and group 1 for bevels/edges (polished)
  const brushedBeveledCaseMats: THREE.Material[] = [caseMaterial, polishedMaterial];
  const brushedBeveledBezelMats: THREE.Material[] = [bezelMaterial, polishedMaterial];

  // =========================================================================
  // 1. CASE, SHORT LUGS, CROWN GUARDS & FACETED BEZEL
  // =========================================================================
  const caseGroup = new THREE.Group();
  caseGroup.name = 'WatchCaseGroup';

  const outerOctagon = createOctagonShape(1.52, 1.06);
  const caseInnerHole = new THREE.Path();
  caseInnerHole.absarc(0, 0, 1.12, 0, Math.PI * 2, true);
  outerOctagon.holes.push(caseInnerHole);

  const caseGeo = trackGeo(
    new THREE.ExtrudeGeometry(outerOctagon, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.085,
      bevelSize: 0.075,
      bevelSegments,
      curveSegments,
    }),
  );
  caseGeo.translate(0, 0, -0.21);
  caseGeo.computeVertexNormals();
  const caseMesh = new THREE.Mesh(caseGeo, brushedBeveledCaseMats);
  caseGroup.add(caseMesh);

  // Subtle AO crevice seam ring between case middle and bezel
  const seamShape = createOctagonShape(1.41, 1.025);
  const seamHole = new THREE.Path();
  seamHole.absarc(0, 0, 1.1, 0, Math.PI * 2, true);
  seamShape.holes.push(seamHole);
  const seamGeo = trackGeo(
    new THREE.ExtrudeGeometry(seamShape, {
      depth: 0.025,
      bevelEnabled: false,
      curveSegments,
    }),
  );
  seamGeo.translate(0, 0, 0.21);
  const seamMesh = new THREE.Mesh(seamGeo, creviceAoMat);
  caseGroup.add(seamMesh);

  // Short sculpted tapered lugs where bracelet joins the case + lug end-link pins
  const lugShoulderShape = createTaperedLugShape(1.24, 1.16, 0.44, 0.045);
  const lugGeo = trackGeo(
    new THREE.ExtrudeGeometry(lugShoulderShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.055,
      bevelSize: 0.048,
      bevelSegments,
      curveSegments,
    }),
  );
  lugGeo.translate(0, 0, -0.15);

  const lugRecessGeo = trackGeo(new THREE.BoxGeometry(0.42, 0.16, 0.22));
  const lugPinGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 1.18, 16));
  lugPinGeo.rotateZ(Math.PI / 2);

  for (const dir of [1, -1] as const) {
    const lug = new THREE.Mesh(lugGeo, brushedBeveledCaseMats);
    lug.position.set(0, dir * 1.56, -0.02);
    if (dir === -1) lug.rotation.z = Math.PI;
    caseGroup.add(lug);

    // Subtle darkened lug pocket & spring-bar pin tucked flush inside lug-to-link seam
    const pocket = new THREE.Mesh(lugRecessGeo, creviceAoMat);
    pocket.position.set(0, dir * 1.72, -0.02);
    caseGroup.add(pocket);

    const endPin = new THREE.Mesh(lugPinGeo, polishedMaterial);
    endPin.position.set(0, dir * 1.805, -0.02);
    caseGroup.add(endPin);
  }

  // Twin sculpted crown guard shoulders at 3 o'clock flank
  const guardShape = createRoundedRectShape(0.24, 0.13, 0.04);
  const guardGeo = trackGeo(
    new THREE.ExtrudeGeometry(guardShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: Math.max(2, bevelSegments - 1),
      curveSegments: 12,
    }),
  );
  guardGeo.translate(0, 0, -0.12);
  for (const gy of [0.24, -0.24]) {
    const guard = new THREE.Mesh(guardGeo, brushedBeveledCaseMats);
    guard.position.set(1.48, gy, 0);
    caseGroup.add(guard);
  }

  // Faceted octagonal bezel on front (+Z) with mirror-chamfered bevels
  const bezelShape = createOctagonShape(1.38, 1.02);
  const bezelHole = new THREE.Path();
  bezelHole.absarc(0, 0, 1.08, 0, Math.PI * 2, true);
  bezelShape.holes.push(bezelHole);

  const bezelGeo = trackGeo(
    new THREE.ExtrudeGeometry(bezelShape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelThickness: 0.065,
      bevelSize: 0.072,
      bevelSegments,
      curveSegments,
    }),
  );
  bezelGeo.translate(0, 0, 0.23);
  const bezelMesh = new THREE.Mesh(bezelGeo, brushedBeveledBezelMats);
  caseGroup.add(bezelMesh);

  // 8 precision polished bezel screws + engraved screw slots
  const screwGeo = trackGeo(new THREE.CylinderGeometry(0.044, 0.044, 0.028, 18));
  screwGeo.rotateX(Math.PI / 2);
  const screwSlotGeo = trackGeo(new THREE.BoxGeometry(0.068, 0.011, 0.012));
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const sx = Math.cos(angle) * 1.24;
    const sy = Math.sin(angle) * 1.24 * 1.02;

    const screw = new THREE.Mesh(screwGeo, polishedMaterial);
    screw.position.set(sx, sy, 0.408);
    caseGroup.add(screw);

    const slot = new THREE.Mesh(screwSlotGeo, creviceAoMat);
    slot.position.set(sx, sy, 0.42);
    slot.rotation.z = angle + Math.PI / 2;
    caseGroup.add(slot);
  }

  // Stepped architectural caseback ring + exhibition sapphire rear lens
  const backRingGeo = trackGeo(new THREE.RingGeometry(0.88, 1.26, 8));
  const backRing = new THREE.Mesh(backRingGeo, caseMaterial);
  backRing.rotation.y = Math.PI;
  backRing.rotation.z = Math.PI / 8;
  backRing.position.z = -0.305;
  caseGroup.add(backRing);

  const backGlassGeo = trackGeo(new THREE.CircleGeometry(0.88, radialSegments));
  const backGlass = new THREE.Mesh(backGlassGeo, crystalMaterial);
  backGlass.rotation.y = Math.PI;
  backGlass.position.z = -0.295;
  backGlass.renderOrder = 4;
  caseGroup.add(backGlass);

  watchRoot.add(caseGroup);

  // =========================================================================
  // 2. MOVEMENT, LAYERED DIAL, REHAUT & APPLIED 3D HOUR MARKERS
  // =========================================================================
  const movementGroup = new THREE.Group();
  movementGroup.name = 'WatchMovementGroup';

  const caliberGeo = trackGeo(new THREE.CylinderGeometry(1.06, 1.06, 0.24, radialSegments));
  caliberGeo.rotateX(Math.PI / 2);
  const caliberMesh = new THREE.Mesh(caliberGeo, darkMovementMat);
  caliberMesh.position.z = -0.05;
  movementGroup.add(caliberMesh);

  // Decorative golden oscillating rotor visible through exhibition caseback
  const rotorShape = new THREE.Shape();
  rotorShape.moveTo(0, 0);
  rotorShape.absarc(0, 0, 0.82, -Math.PI * 0.35, Math.PI * 0.35, false);
  rotorShape.lineTo(0, 0);
  const rotorGeo = trackGeo(
    new THREE.ExtrudeGeometry(rotorShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments,
    }),
  );
  const rotorMesh = new THREE.Mesh(rotorGeo, accentMetalMaterial);
  rotorMesh.position.z = -0.22;
  rotorMesh.rotation.z = -0.6;
  movementGroup.add(rotorMesh);

  // Polished angled rehaut / chapter ring + subtle inner AO groove
  const flangeGeo = trackGeo(new THREE.CylinderGeometry(1.09, 1.04, 0.16, radialSegments, 1, true));
  flangeGeo.rotateX(Math.PI / 2);
  const flangeMesh = new THREE.Mesh(flangeGeo, polishedMaterial);
  flangeMesh.material = polishedMaterial.clone();
  trackMat(flangeMesh.material);
  flangeMesh.material.side = THREE.DoubleSide;
  flangeMesh.position.z = 0.155;
  movementGroup.add(flangeMesh);

  const dialAoRingGeo = trackGeo(new THREE.RingGeometry(1.025, 1.065, radialSegments));
  const dialAoRingMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x0d0e11,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  const dialAoRing = new THREE.Mesh(dialAoRingGeo, dialAoRingMat);
  dialAoRing.position.z = 0.097;
  movementGroup.add(dialAoRing);

  // Main dial disc facing +Z
  const dialGeo = trackGeo(new THREE.CircleGeometry(1.06, radialSegments));
  const dialMesh = new THREE.Mesh(dialGeo, dialPrimaryMat);
  dialMesh.position.z = 0.095;
  movementGroup.add(dialMesh);

  // Cross-fade secondary dial mesh for seamless 0.4s edition switching
  const dialFadeMesh = new THREE.Mesh(dialGeo, dialFadeMat);
  dialFadeMesh.position.z = 0.098;
  dialFadeMesh.visible = false;
  movementGroup.add(dialFadeMesh);

  // 3D Applied Raised Hour Markers (faceted beveled batons, double baton at 12 o'clock)
  const batonShape = createRoundedRectShape(0.044, 0.145, 0.008);
  const batonGeo = trackGeo(
    new THREE.ExtrudeGeometry(batonShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.009,
      bevelSize: 0.007,
      bevelSegments: 2,
      curveSegments: 8,
    }),
  );
  const batonInstanced = new THREE.InstancedMesh(batonGeo, markerMaterial, 13);
  const dummyObj = new THREE.Object3D();
  let instanceIdx = 0;

  for (let h = 0; h < 12; h++) {
    const angle = (h / 12) * Math.PI * 2;
    const radius = 0.855;
    if (h === 0) {
      // Double baton at 12 o'clock
      for (const offset of [-0.036, 0.036]) {
        dummyObj.position.set(offset, radius, 0.098);
        dummyObj.rotation.set(0, 0, 0);
        dummyObj.scale.set(0.76, 1.06, 1);
        dummyObj.updateMatrix();
        batonInstanced.setMatrixAt(instanceIdx++, dummyObj.matrix);
      }
    } else {
      const mx = Math.sin(angle) * radius;
      const my = Math.cos(angle) * radius;
      dummyObj.position.set(mx, my, 0.098);
      dummyObj.rotation.set(0, 0, -angle);
      dummyObj.scale.set(1, 1, 1);
      dummyObj.updateMatrix();
      batonInstanced.setMatrixAt(instanceIdx++, dummyObj.matrix);
    }
  }
  batonInstanced.instanceMatrix.needsUpdate = true;
  batonInstanced.computeBoundingSphere();
  movementGroup.add(batonInstanced);

  // Raised golden sub-dial bezel rings for Aurum
  const subDialRingsGroup = new THREE.Group();
  const subRingGeo = trackGeo(new THREE.TorusGeometry(0.212, 0.012, 12, 40));
  const leftSubRing = new THREE.Mesh(subRingGeo, accentMetalMaterial);
  leftSubRing.position.set(-0.425, 0, 0.104);
  const rightSubRing = new THREE.Mesh(subRingGeo, accentMetalMaterial);
  rightSubRing.position.set(0.425, 0, 0.104);
  subDialRingsGroup.add(leftSubRing, rightSubRing);
  subDialRingsGroup.visible = false;
  movementGroup.add(subDialRingsGroup);

  watchRoot.add(movementGroup);

  // =========================================================================
  // 3. BEVELED HANDS WITH LUME INLAY & SECOND HAND WITH COUNTERWEIGHT TAIL
  // =========================================================================
  const handsGroup = new THREE.Group();
  handsGroup.name = 'WatchHandsGroup';

  // Hour hand: polished bevelled frame + raised lume inlay
  const hourHand = new THREE.Group();
  const hourShape = new THREE.Shape();
  hourShape.moveTo(-0.048, -0.1);
  hourShape.lineTo(-0.032, 0.51);
  hourShape.lineTo(0, 0.62);
  hourShape.lineTo(0.032, 0.51);
  hourShape.lineTo(0.048, -0.1);
  hourShape.closePath();

  const hourGeo = trackGeo(
    new THREE.ExtrudeGeometry(hourShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 2,
    }),
  );
  const hourMesh = new THREE.Mesh(hourGeo, handMaterial);
  hourMesh.position.z = 0.135;
  hourHand.add(hourMesh);

  const hourLumeShape = createRoundedRectShape(0.028, 0.34, 0.012);
  const hourLumeGeo = trackGeo(
    new THREE.ExtrudeGeometry(hourLumeShape, {
      depth: 0.008,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    }),
  );
  const hourLumeMesh = new THREE.Mesh(hourLumeGeo, lumeMaterial);
  hourLumeMesh.position.set(0, 0.25, 0.157);
  hourHand.add(hourLumeMesh);

  hourHand.rotation.z = THREE.MathUtils.degToRad(55); // 10:10 hour position
  handsGroup.add(hourHand);

  // Minute hand: longer faceted bevelled lancet + slim lume inlay
  const minuteHand = new THREE.Group();
  const minShape = new THREE.Shape();
  minShape.moveTo(-0.038, -0.12);
  minShape.lineTo(-0.022, 0.78);
  minShape.lineTo(0, 0.9);
  minShape.lineTo(0.022, 0.78);
  minShape.lineTo(0.038, -0.12);
  minShape.closePath();

  const minGeo = trackGeo(
    new THREE.ExtrudeGeometry(minShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.009,
      bevelSize: 0.007,
      bevelSegments: 2,
    }),
  );
  const minMesh = new THREE.Mesh(minGeo, handMaterial);
  minMesh.position.z = 0.172;
  minuteHand.add(minMesh);

  const minLumeShape = createRoundedRectShape(0.02, 0.52, 0.009);
  const minLumeGeo = trackGeo(
    new THREE.ExtrudeGeometry(minLumeShape, {
      depth: 0.007,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    }),
  );
  const minLumeMesh = new THREE.Mesh(minLumeGeo, lumeMaterial);
  minLumeMesh.position.set(0, 0.37, 0.192);
  minuteHand.add(minLumeMesh);

  minuteHand.rotation.z = THREE.MathUtils.degToRad(-60); // 10:10 minute position
  handsGroup.add(minuteHand);

  // Thin sweep second hand with sculpted counterweight tail & stepped central pinion
  const secondHand = new THREE.Group();
  const secBladeShape = new THREE.Shape();
  secBladeShape.moveTo(-0.007, 0.0);
  secBladeShape.lineTo(-0.004, 0.88);
  secBladeShape.lineTo(0.0, 0.91);
  secBladeShape.lineTo(0.004, 0.88);
  secBladeShape.lineTo(0.007, 0.0);
  secBladeShape.lineTo(0.018, -0.21);
  secBladeShape.lineTo(0.0, -0.25);
  secBladeShape.lineTo(-0.018, -0.21);
  secBladeShape.closePath();

  const secGeo = trackGeo(
    new THREE.ExtrudeGeometry(secBladeShape, {
      depth: 0.009,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    }),
  );
  const secMesh = new THREE.Mesh(secGeo, secondHandMaterial);
  secMesh.position.z = 0.208;
  secondHand.add(secMesh);

  // Open counterweight ring on the tail
  const counterRingGeo = trackGeo(new THREE.TorusGeometry(0.04, 0.01, 10, 24));
  const counterRing = new THREE.Mesh(counterRingGeo, secondHandMaterial);
  counterRing.position.set(0, -0.21, 0.212);
  secondHand.add(counterRing);

  const hubCollarGeo = trackGeo(new THREE.CylinderGeometry(0.068, 0.072, 0.025, 24));
  hubCollarGeo.rotateX(Math.PI / 2);
  const hubCollarMesh = new THREE.Mesh(hubCollarGeo, polishedMaterial);
  hubCollarMesh.position.z = 0.198;
  secondHand.add(hubCollarMesh);

  const hubCapGeo = trackGeo(new THREE.CylinderGeometry(0.044, 0.052, 0.035, 24));
  hubCapGeo.rotateX(Math.PI / 2);
  const hubCapMesh = new THREE.Mesh(hubCapGeo, secondHandMaterial);
  hubCapMesh.position.z = 0.212;
  secondHand.add(hubCapMesh);

  secondHand.rotation.z = THREE.MathUtils.degToRad(145);
  handsGroup.add(secondHand);

  watchRoot.add(handsGroup);

  // =========================================================================
  // 4. KNURLED CROWN WITH MACHINED CIRCUMFERENTIAL GROOVE DETAIL
  // =========================================================================
  const crownGroup = new THREE.Group();
  crownGroup.name = 'WatchCrownGroup';

  const stemGeo = trackGeo(new THREE.CylinderGeometry(0.068, 0.068, 0.22, 20));
  stemGeo.rotateZ(Math.PI / 2);
  const stemMesh = new THREE.Mesh(stemGeo, creviceAoMat);
  stemMesh.position.set(1.5, 0, 0);
  crownGroup.add(stemMesh);

  // Grooved crown barrel using LatheGeometry (chamfered ends + crisp central waist groove)
  const crownProfile = [
    new THREE.Vector2(0.0, -0.105),
    new THREE.Vector2(0.145, -0.105),
    new THREE.Vector2(0.172, -0.085),
    new THREE.Vector2(0.172, -0.022),
    new THREE.Vector2(0.138, -0.008),
    new THREE.Vector2(0.138, 0.008),
    new THREE.Vector2(0.172, 0.022),
    new THREE.Vector2(0.172, 0.085),
    new THREE.Vector2(0.145, 0.105),
    new THREE.Vector2(0.0, 0.105),
  ];
  const crownBarrelGeo = trackGeo(new THREE.LatheGeometry(crownProfile, lowDetail ? 22 : 36));
  crownBarrelGeo.rotateZ(-Math.PI / 2);
  const crownBody = new THREE.Mesh(crownBarrelGeo, polishedMaterial);
  crownBody.position.set(1.665, 0, 0);
  crownGroup.add(crownBody);

  // Subtle AO darkening band inside the machined crown groove
  const grooveBandGeo = trackGeo(new THREE.CylinderGeometry(0.141, 0.141, 0.016, lowDetail ? 20 : 28));
  grooveBandGeo.rotateZ(Math.PI / 2);
  const grooveBand = new THREE.Mesh(grooveBandGeo, creviceAoMat);
  grooveBand.position.set(1.665, 0, 0);
  crownGroup.add(grooveBand);

  // Crisp knurl flutes on both sides of the circumferential groove
  const knurlGeo = trackGeo(new THREE.BoxGeometry(0.066, 0.018, 0.02));
  const knurlCount = lowDetail ? 14 : 20;
  for (let i = 0; i < knurlCount; i++) {
    const a = (i / knurlCount) * Math.PI * 2;
    const ky = Math.cos(a) * 0.171;
    const kz = Math.sin(a) * 0.171;
    for (const gx of [1.615, 1.715]) {
      const flute = new THREE.Mesh(knurlGeo, bezelMaterial);
      flute.position.set(gx, ky, kz);
      flute.rotation.x = a;
      crownGroup.add(flute);
    }
  }

  const crownTipGeo = trackGeo(new THREE.CylinderGeometry(0.095, 0.125, 0.025, lowDetail ? 18 : 24));
  crownTipGeo.rotateZ(Math.PI / 2);
  const crownTip = new THREE.Mesh(crownTipGeo, accentMetalMaterial);
  crownTip.position.set(1.78, 0, 0);
  crownGroup.add(crownTip);

  watchRoot.add(crownGroup);

  // =========================================================================
  // 5. DOMED SAPPHIRE CRYSTAL (NO FOGGING) & SPECULAR SWEEP
  // =========================================================================
  const crystalGroup = new THREE.Group();
  crystalGroup.name = 'WatchCrystalGroup';

  const domePoints: THREE.Vector2[] = [];
  const domeSteps = lowDetail ? 10 : 20;
  for (let i = 0; i <= domeSteps; i++) {
    const t = i / domeSteps;
    const rad = t * 1.115;
    const zLift = Math.cos(t * Math.PI * 0.5) * 0.125;
    domePoints.push(new THREE.Vector2(rad, zLift));
  }
  const crystalGeo = trackGeo(new THREE.LatheGeometry(domePoints, radialSegments));
  crystalGeo.rotateX(Math.PI / 2);
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMaterial);
  crystalMesh.position.z = 0.295;
  crystalMesh.renderOrder = 6;
  crystalGroup.add(crystalMesh);

  // Subtle chamfered sapphire edge highlight ring (clear reflective sheen, zero fogging)
  const edgeRingGeo = trackGeo(new THREE.TorusGeometry(1.102, 0.011, lowDetail ? 8 : 10, radialSegments));
  const edgeRingMesh = new THREE.Mesh(edgeRingGeo, crystalEdgeMat);
  edgeRingMesh.position.z = 0.305;
  edgeRingMesh.renderOrder = 7;
  crystalGroup.add(edgeRingMesh);

  // Specular light sweep plane crossing crystal
  const sweepMaterial = trackMat(
    new THREE.MeshBasicMaterial({
      map: sweepTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    }),
  );
  const sweepGeo = trackGeo(new THREE.PlaneGeometry(0.62, 2.35));
  const sweepMesh = new THREE.Mesh(sweepGeo, sweepMaterial);
  sweepMesh.position.set(-1.3, 0, 0.43);
  sweepMesh.rotation.z = THREE.MathUtils.degToRad(-28);
  sweepMesh.renderOrder = 8;
  crystalGroup.add(sweepMesh);

  watchRoot.add(crystalGroup);

  // =========================================================================
  // 6. SYMMETRIC INTEGRATED BRACELET ALONG SMOOTH Y-Z CURVES (7 LINKS + CLASP PER SIDE)
  // =========================================================================
  const braceletGroup = new THREE.Group();
  braceletGroup.name = 'WatchBraceletGroup';

  const topLinks: THREE.Group[] = [];
  const bottomLinks: THREE.Group[] = [];
  const linkCount = 7;

  const LUG_END_Y = 1.828;
  const LUG_END_Z = -0.02;
  const ARC_RADIUS = 2.85;
  const CURVE_MAX_ARC = 5.4;

  const LINK_TOTAL_LEN = 0.296;
  const LINK_GAP = 0.045; // Uniform ~0.6mm-equivalent gap
  const LINK_PITCH = LINK_TOTAL_LEN + LINK_GAP;
  const LINK_DEPTH = 0.145;
  const LINK_BEVEL_SIZE = 0.022;
  const LINK_BEVEL_THICKNESS = 0.024;
  const LUG_LINK_WIDTH = 1.2;
  const CLASP_LINK_WIDTH = LUG_LINK_WIDTH * 0.8; // Even taper to 80% at clasp
  const CLASP_TOTAL_LEN = 0.36;

  // Build smooth CatmullRomCurve3 in the Y-Z plane (X fixed at 0) for each side
  const createBraceletCurve = (direction: 1 | -1): THREE.CatmullRomCurve3 => {
    const sampleSteps = 28;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= sampleSteps; k++) {
      const s = (k / sampleSteps) * CURVE_MAX_ARC;
      const theta = s / ARC_RADIUS;
      const py = direction * (LUG_END_Y + ARC_RADIUS * Math.sin(theta));
      const pz = LUG_END_Z - ARC_RADIUS * (1 - Math.cos(theta));
      pts.push(new THREE.Vector3(0, py, pz));
    }
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  };

  const topBraceletCurve = createBraceletCurve(1);
  const bottomBraceletCurve = createBraceletCurve(-1);
  const _curvePt = new THREE.Vector3();
  const _curveTan = new THREE.Vector3();

  const poseBraceletElement = (element: THREE.Object3D, arcDistance: number) => {
    const dir = (element.userData.direction as 1 | -1 | undefined) ?? 1;
    const curve = dir === 1 ? topBraceletCurve : bottomBraceletCurve;
    const u = THREE.MathUtils.clamp(arcDistance / CURVE_MAX_ARC, 0, 1);
    curve.getPointAt(u, _curvePt);
    curve.getTangentAt(u, _curveTan);

    // Strictly centered on X = 0; pitch around X only from curve tangent (no Y or Z tilt)
    element.position.set(0, _curvePt.y, _curvePt.z);
    const rx =
      dir === 1
        ? Math.atan2(_curveTan.z, _curveTan.y)
        : -Math.atan2(_curveTan.z, -_curveTan.y);
    element.rotation.set(rx, 0, 0);
  };

  // Single shared link geometry (unit total X width = 1.0, exact total Y length = LINK_TOTAL_LEN)
  const sharedLinkShape = createRoundedRectShape(
    1.0 - 2 * LINK_BEVEL_SIZE,
    LINK_TOTAL_LEN - 2 * LINK_BEVEL_SIZE,
    0.036,
  );
  const sharedLinkGeo = trackGeo(
    new THREE.ExtrudeGeometry(sharedLinkShape, {
      depth: LINK_DEPTH,
      bevelEnabled: true,
      bevelThickness: LINK_BEVEL_THICKNESS,
      bevelSize: LINK_BEVEL_SIZE,
      bevelSegments: Math.max(2, bevelSegments - 1),
      curveSegments: Math.max(8, curveSegments - 8),
    }),
  );
  sharedLinkGeo.translate(0, 0, -LINK_DEPTH / 2);

  const sharedCenterShape = createRoundedRectShape(
    0.27 - 2 * 0.012,
    LINK_TOTAL_LEN * 0.92 - 2 * 0.012,
    0.016,
  );
  const sharedCenterGeo = trackGeo(
    new THREE.ExtrudeGeometry(sharedCenterShape, {
      depth: LINK_DEPTH + 0.022,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 8,
    }),
  );
  sharedCenterGeo.translate(0, 0, -(LINK_DEPTH + 0.022) / 2);

  // Shared hinge pin & dark center sleeve along X axis (scaled strictly along X)
  const pinSharedGeo = trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 12));
  pinSharedGeo.rotateZ(Math.PI / 2);
  const pinSleeveGeo = trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.26, 12));
  pinSleeveGeo.rotateZ(Math.PI / 2);

  const buildBraceletSide = (direction: 1 | -1, targetList: THREE.Group[]) => {
    for (let i = 0; i < linkCount; i++) {
      const linkGroup = new THREE.Group();
      const t = i / (linkCount - 1);
      const linkWidth = THREE.MathUtils.lerp(LUG_LINK_WIDTH, CLASP_LINK_WIDTH, t);

      const linkMesh = new THREE.Mesh(sharedLinkGeo, brushedBeveledCaseMats);
      linkMesh.scale.x = linkWidth;
      linkGroup.add(linkMesh);

      const centerMesh = new THREE.Mesh(sharedCenterGeo, polishedMaterial);
      centerMesh.scale.x = linkWidth;
      linkGroup.add(centerMesh);

      // Articulation pin centered cleanly in the uniform 0.6mm gap
      const pinMesh = new THREE.Mesh(pinSharedGeo, polishedMaterial);
      pinMesh.scale.x = linkWidth * 0.88;
      pinMesh.position.set(0, direction * (LINK_TOTAL_LEN * 0.5 + LINK_GAP * 0.5), 0);
      linkGroup.add(pinMesh);

      const pinSleeve = new THREE.Mesh(pinSleeveGeo, creviceAoMat);
      pinSleeve.scale.x = linkWidth;
      pinSleeve.position.set(0, direction * (LINK_TOTAL_LEN * 0.5 + LINK_GAP * 0.5), 0);
      linkGroup.add(pinSleeve);

      const assembledArcS = LINK_TOTAL_LEN * 0.5 + i * LINK_PITCH;
      const explodedArcS = assembledArcS + 0.9 + i * 0.24;

      linkGroup.userData.direction = direction;
      linkGroup.userData.assembledArcS = assembledArcS;
      linkGroup.userData.explodedArcS = explodedArcS;

      poseBraceletElement(linkGroup, assembledArcS);
      linkGroup.userData.assembledPos = [
        linkGroup.position.x,
        linkGroup.position.y,
        linkGroup.position.z,
      ] as [number, number, number];
      linkGroup.userData.assembledRot = [
        linkGroup.rotation.x,
        linkGroup.rotation.y,
        linkGroup.rotation.z,
      ] as [number, number, number];

      braceletGroup.add(linkGroup);
      targetList.push(linkGroup);
    }
  };

  buildBraceletSide(1, topLinks);
  buildBraceletSide(-1, bottomLinks);

  // Mirrored clasp pieces on each end, matching the link finish & 80% taper width
  const claspCoverShape = createRoundedRectShape(
    CLASP_LINK_WIDTH - 2 * LINK_BEVEL_SIZE,
    CLASP_TOTAL_LEN - 2 * LINK_BEVEL_SIZE,
    0.04,
  );
  const claspCoverGeo = trackGeo(
    new THREE.ExtrudeGeometry(claspCoverShape, {
      depth: LINK_DEPTH,
      bevelEnabled: true,
      bevelThickness: LINK_BEVEL_THICKNESS,
      bevelSize: LINK_BEVEL_SIZE,
      bevelSegments: Math.max(2, bevelSegments - 1),
      curveSegments: 10,
    }),
  );
  claspCoverGeo.translate(0, 0, -LINK_DEPTH / 2);

  const claspBladeGeo = trackGeo(new THREE.BoxGeometry(CLASP_LINK_WIDTH * 0.72, CLASP_TOTAL_LEN * 0.7, 0.04));
  const claspPusherGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.12, 0.065));

  const CLASP_ARC_S = LINK_TOTAL_LEN + (linkCount - 1) * LINK_PITCH + LINK_GAP + CLASP_TOTAL_LEN * 0.5;
  const CLASP_EXPLODED_S = CLASP_ARC_S + 2.45;

  const createClaspPiece = (direction: 1 | -1, name: string): THREE.Group => {
    const group = new THREE.Group();
    group.name = name;

    const cover = new THREE.Mesh(claspCoverGeo, brushedBeveledCaseMats);
    group.add(cover);

    const innerBlade = new THREE.Mesh(claspBladeGeo, creviceAoMat);
    innerBlade.position.z = -LINK_DEPTH * 0.42;
    group.add(innerBlade);

    for (const px of [-(CLASP_LINK_WIDTH * 0.5 + 0.015), CLASP_LINK_WIDTH * 0.5 + 0.015]) {
      const pusher = new THREE.Mesh(claspPusherGeo, polishedMaterial);
      pusher.position.set(px, 0, 0);
      group.add(pusher);
    }

    group.userData.direction = direction;
    group.userData.assembledArcS = CLASP_ARC_S;
    group.userData.explodedArcS = CLASP_EXPLODED_S;
    poseBraceletElement(group, CLASP_ARC_S);
    braceletGroup.add(group);
    return group;
  };

  const topClaspGroup = createClaspPiece(1, 'TopFoldingClasp');
  const bottomClaspGroup = createClaspPiece(-1, 'BottomFoldingClasp');

  watchRoot.add(braceletGroup);

  // =========================================================================
  // 7. SOFT STUDIO CONTACT SHADOW BENEATH WATCH
  // =========================================================================
  const contactShadowMaterial = trackMat(
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    }),
  );
  const contactShadowGeo = trackGeo(new THREE.PlaneGeometry(5.6, 3.6));
  const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMaterial);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, -4.22, -0.45);
  contactShadow.renderOrder = 1;

  // Helpers to update finish & crossfade smoothly
  const applySpecProperties = (
    color: THREE.Color,
    bezelCol: THREE.Color,
    markerCol: THREE.Color,
    handCol: THREE.Color,
    secCol: THREE.Color,
    metalness: number,
    roughness: number,
    polishedRoughness: number,
    clearcoat: number,
    anisotropy: number,
  ) => {
    caseMaterial.color.copy(color);
    caseMaterial.metalness = metalness;
    caseMaterial.roughness = roughness;
    if (caseMaterial instanceof THREE.MeshPhysicalMaterial) {
      caseMaterial.clearcoat = Math.min(0.28, clearcoat);
      caseMaterial.anisotropy = anisotropy;
    }

    polishedMaterial.color.copy(bezelCol);
    polishedMaterial.metalness = metalness;
    polishedMaterial.roughness = polishedRoughness;

    bezelMaterial.color.copy(bezelCol);
    bezelMaterial.metalness = metalness;
    bezelMaterial.roughness = Math.max(0.32, roughness - 0.04);
    if (bezelMaterial instanceof THREE.MeshPhysicalMaterial) {
      bezelMaterial.anisotropy = anisotropy;
    }

    markerMaterial.color.copy(markerCol);
    handMaterial.color.copy(handCol);
    secondHandMaterial.color.copy(secCol);
  };

  const _c1 = new THREE.Color();
  const _c2 = new THREE.Color();
  const _b1 = new THREE.Color();
  const _b2 = new THREE.Color();
  const _m1 = new THREE.Color();
  const _m2 = new THREE.Color();
  const _h1 = new THREE.Color();
  const _h2 = new THREE.Color();
  const _s1 = new THREE.Color();
  const _s2 = new THREE.Color();

  const setEditionImmediate = (id: WatchEditionId) => {
    const spec = WATCH_EDITIONS.find((e) => e.id === id) ?? WATCH_EDITIONS[0];
    applySpecProperties(
      _c1.set(spec.caseColor),
      _b1.set(spec.bezelColor),
      _m1.set(spec.markerColor),
      _h1.set(spec.handHex),
      _s1.set(spec.secondHandHex),
      spec.metalness,
      spec.roughness,
      spec.polishedRoughness,
      spec.clearcoat,
      spec.anisotropy,
    );
    dialPrimaryMat.map = getDialTexture(spec.id);
    dialPrimaryMat.needsUpdate = true;
    dialFadeMat.opacity = 0;
    dialFadeMesh.visible = false;
    subDialRingsGroup.visible = spec.hasSubDials;
  };

  const applyEditionBlend = (fromId: WatchEditionId, toId: WatchEditionId, mix: number) => {
    const t = THREE.MathUtils.clamp(mix, 0, 1);
    if (t <= 0.001) {
      setEditionImmediate(fromId);
      return;
    }
    if (t >= 0.999) {
      setEditionImmediate(toId);
      return;
    }

    const fromSpec = WATCH_EDITIONS.find((e) => e.id === fromId) ?? WATCH_EDITIONS[0];
    const toSpec = WATCH_EDITIONS.find((e) => e.id === toId) ?? WATCH_EDITIONS[0];

    _c1.set(fromSpec.caseColor).lerp(_c2.set(toSpec.caseColor), t);
    _b1.set(fromSpec.bezelColor).lerp(_b2.set(toSpec.bezelColor), t);
    _m1.set(fromSpec.markerColor).lerp(_m2.set(toSpec.markerColor), t);
    _h1.set(fromSpec.handHex).lerp(_h2.set(toSpec.handHex), t);
    _s1.set(fromSpec.secondHandHex).lerp(_s2.set(toSpec.secondHandHex), t);

    applySpecProperties(
      _c1,
      _b1,
      _m1,
      _h1,
      _s1,
      THREE.MathUtils.lerp(fromSpec.metalness, toSpec.metalness, t),
      THREE.MathUtils.lerp(fromSpec.roughness, toSpec.roughness, t),
      THREE.MathUtils.lerp(fromSpec.polishedRoughness, toSpec.polishedRoughness, t),
      THREE.MathUtils.lerp(fromSpec.clearcoat, toSpec.clearcoat, t),
      THREE.MathUtils.lerp(fromSpec.anisotropy, toSpec.anisotropy, t),
    );

    const fromDialTex = getDialTexture(fromSpec.id);
    if (dialPrimaryMat.map !== fromDialTex) {
      dialPrimaryMat.map = fromDialTex;
      dialPrimaryMat.needsUpdate = true;
    }
    const toDialTex = getDialTexture(toSpec.id);
    if (dialFadeMat.map !== toDialTex) {
      dialFadeMat.map = toDialTex;
      dialFadeMat.needsUpdate = true;
    }
    dialFadeMesh.visible = true;
    dialFadeMat.opacity = t;
    subDialRingsGroup.visible = toSpec.hasSubDials ? t > 0.45 : fromSpec.hasSubDials && t < 0.55;
  };

  const dispose = () => {
    for (const g of disposableGeometries) g.dispose();
    for (const m of disposableMaterials) m.dispose();
    sharedAssets.release();
  };

  return {
    watchRoot,
    caseGroup,
    movementGroup,
    handsGroup,
    hourHand,
    minuteHand,
    secondHand,
    crownGroup,
    crystalGroup,
    sweepMesh,
    sweepMaterial,
    braceletGroup,
    topLinks,
    bottomLinks,
    topClaspGroup,
    bottomClaspGroup,
    poseBraceletElement,
    contactShadow,
    contactShadowMaterial,
    getDialTexture,
    dialPrimaryMat,
    dialFadeMat,
    dialFadeMesh,
    subDialRingsGroup,
    caseMaterial,
    bezelMaterial,
    polishedMaterial,
    markerMaterial,
    accentMetalMaterial,
    handMaterial,
    secondHandMaterial,
    setEditionImmediate,
    applyEditionBlend,
    dispose,
  };
}
