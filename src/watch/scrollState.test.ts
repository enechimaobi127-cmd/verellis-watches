import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCameraFraming,
  computeWatchZoneFraming,
  getActiveHeroChapterIndex,
  getCollectionScrollState,
  getCrystalSweepAmount,
  getHeroTitleOpacities,
  segmentProgress,
  validateReservationInput,
} from './scrollState';

test('segmentProgress clamps and maps sub-ranges monotonically', () => {
  assert.equal(segmentProgress(0, 0.25, 0.5), 0);
  assert.equal(segmentProgress(0.25, 0.25, 0.5), 0);
  assert.equal(segmentProgress(0.375, 0.25, 0.5), 0.5);
  assert.equal(segmentProgress(0.5, 0.25, 0.5), 1);
  assert.equal(segmentProgress(0.9, 0.25, 0.5), 1);
});

test('getHeroTitleOpacities shows strictly one title at a time across boundaries', () => {
  assert.equal(getActiveHeroChapterIndex(0.05), 0);
  assert.equal(getActiveHeroChapterIndex(0.35), 1);
  assert.equal(getActiveHeroChapterIndex(0.65), 2);
  assert.equal(getActiveHeroChapterIndex(0.92), 3);

  for (let i = 0; i <= 100; i++) {
    const opacities = getHeroTitleOpacities(i / 100);
    const activeCount = opacities.filter((o) => o > 0).length;
    assert.ok(activeCount <= 1, `Expected at most 1 active title at p=${i / 100}, got ${activeCount}`);
  }
});

test('computeWatchZoneFraming centers watch in Zone A and fits <= 85% width and height at all sizes', () => {
  const cases = [
    { w: 360, h: 740, rect: { left: 24, top: 64, width: 312, height: 246 } },
    { w: 390, h: 844, rect: { left: 24, top: 64, width: 342, height: 290 } },
    { w: 768, h: 1024, rect: { left: 24, top: 64, width: 720, height: 366 } },
    { w: 1024, h: 768, rect: { left: 64, top: 80, width: 374, height: 624 } },
    { w: 1440, h: 900, rect: { left: 64, top: 80, width: 561, height: 756 } },
    { w: 1920, h: 1080, rect: { left: 64, top: 80, width: 777, height: 936 } },
    { w: 844, h: 390, rect: { left: 24, top: 68, width: 342, height: 298 } },
  ];

  for (const c of cases) {
    const res = computeWatchZoneFraming(c.w, c.h, c.rect, 1);
    assert.ok(res.projectedCoverageW <= 0.85, `Width coverage ${res.projectedCoverageW} > 0.85 for ${c.w}x${c.h}`);
    assert.ok(res.projectedCoverageH <= 0.85, `Height coverage ${res.projectedCoverageH} > 0.85 for ${c.w}x${c.h}`);
    const zoneCx = c.rect.left + c.rect.width * 0.5;
    const zoneCy = c.rect.top + c.rect.height * 0.5;
    assert.ok(Math.abs(c.w * 0.5 - res.offsetX - zoneCx) < 0.01);
    assert.ok(Math.abs(c.h * 0.5 - res.offsetY - zoneCy) < 0.01);
  }
});

test('computeCameraFraming splits desktop left at 30% and mobile top 45%', () => {
  const desktop = computeCameraFraming(1440, 900, 1);
  assert.equal(desktop.isDesktopSplit, true);
  assert.equal(desktop.offsetX, 288); // 20% shift places watch center at 30% width
  assert.equal(desktop.offsetY, 0);

  const tabletLandscape = computeCameraFraming(900, 700, 1);
  assert.equal(tabletLandscape.isDesktopSplit, true);
  assert.equal(tabletLandscape.offsetX, 180);

  const mobile = computeCameraFraming(390, 844, 1);
  assert.equal(mobile.isDesktopSplit, false);
  assert.equal(mobile.offsetX, 0);
  assert.ok(mobile.offsetY > 150, 'Watch should shift upward into top 45% zone on mobile');

  const heroCentered = computeCameraFraming(1440, 900, 0);
  assert.equal(heroCentered.offsetX, 0);
});

test('getCrystalSweepAmount peaks during crystal lowering window', () => {
  assert.equal(getCrystalSweepAmount(0.2).intensity, 0);
  const mid = getCrystalSweepAmount(0.64);
  assert.ok(mid.intensity > 0.9);
  assert.equal(getCrystalSweepAmount(0.9).intensity, 0);
});

test('getCollectionScrollState completes 360 deg per edition and switches cleanly', () => {
  const s0 = getCollectionScrollState(0);
  assert.equal(s0.editionId, 'argent');
  assert.equal(s0.rotationY, 0);

  const s1 = getCollectionScrollState(0.34);
  assert.equal(s1.editionId, 'aurum');
  assert.ok(s1.rotationY > Math.PI * 2);

  const s2 = getCollectionScrollState(0.68);
  assert.equal(s2.editionId, 'noir');
  assert.ok(s2.rotationY > Math.PI * 4);

  const sEnd = getCollectionScrollState(1);
  assert.equal(sEnd.editionId, 'noir');
  assert.ok(Math.abs(sEnd.rotationY - Math.PI * 6) < 1e-6);
});

test('validateReservationInput catches missing name and invalid email', () => {
  const bad = validateReservationInput({
    fullName: ' ',
    email: 'invalid-email',
    editionId: 'aurum',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.email);

  const good = validateReservationInput({
    fullName: 'Claire Moreau',
    email: 'claire@example.com',
    editionId: 'argent',
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});
