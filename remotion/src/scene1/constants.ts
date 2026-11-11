/* =====================================================================
   SCENE 1 — "The problem"
   Edit these to tune the scene or copy the file as a starting point for
   the next one. Times are seconds, positions are 1920x1080 pixels.
   ===================================================================== */

export const STAGE = {
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 8,
};

export const COLORS = {
  bgCenter: '#f4f4f4',
  bgEdge: '#dcdcdc',
  chartLine: 'rgba(255, 255, 255, 0.25)',
  textShadow: 'rgba(0, 0, 0, 0.10)',
  charcoal: '#2b2b2b',
  lightGray: '#8a8a8a',
  midGray: '#555555',
  cardInk: '#ffffff',
  chipLight: '#f3e3a6',
  chipMid: '#c9a65a',
  chipDark: '#9c7a35',
  chipLines: 'rgba(95, 70, 25, 0.55)',
};

export const TIMING = {
  cameraStart: 1.0,
  cameraEnd: 1.06, // push-in over the full scene

  cardsInStart: 0.1,
  cardsInStagger: 0.12,
  cardsInDur: 1.3,

  cardsMoveStart: 1.5,
  cardsMoveRamp: 3.0, // bob + turn fade up to full strength over this long

  sheenStart: 2.0,
  sheenStagger: 0.55,
  sheenDur: 1.3,

  textStart: 1.0,
  textStagger: 0.3,
  textDur: 0.9,
  textRise: 26,

  loopFadeOut: 0.4, // fade cards + text at the end so the loop restarts cleanly (0 = off)
};

export const LAYOUT = {
  hero: { x: 1210, y: 545 }, // slightly right of center
  textX: 150, // left third
};

export const CARD = {
  width: 470,
  height: (470 * 54) / 85.6, // real card ratio
  radius: 22,
  thickness: 4, // px of real 3D depth
  bobAmp: 9,
  bobPeriod: 5.0,
  turnAmp: 0.38, // radians around the vertical axis (real 3D now)
  turnPeriod: 8.0,
  tiltAmp: 0.08, // gentle forward/back rock
  fanScaleFrom: 0.9,
  textureScale: 2.2, // face texture resolution vs on-screen size
};

export const LIGHTING = {
  ambient: 0.9,
  key: { intensity: 2.3, position: [-300, 700, 1500] as [number, number, number] },
  environment: 0.7, // glossy reflections from a neutral studio environment
  shadowOpacity: 0.24,
  shadowSoftness: 22, // blur radius
  shadowPlaneZ: -120, // distance behind the cards that the shadow falls on
};

// Drawn back-to-front (last is on top). fan/spread are offsets from LAYOUT.hero, rot in degrees.
export const CARDS = [
  { rate: '7%', color: '#3fa66b', fan: { x: 40, y: 14, rot: 14 }, spread: { x: 230, y: 160, rot: -8 }, phase: 2.4 },
  { rate: '12%', color: '#3f7fd6', fan: { x: 14, y: 5, rot: 5 }, spread: { x: -200, y: 150, rot: 6 }, phase: 1.1 },
  { rate: '19%', color: '#e8873a', fan: { x: -12, y: -4, rot: -5 }, spread: { x: 225, y: -120, rot: 7 }, phase: 3.7 },
  { rate: '24%', color: '#d64545', fan: { x: -40, y: -12, rot: -14 }, spread: { x: -215, y: -140, rot: -10 }, phase: 0.2 },
];
export type CardSpec = (typeof CARDS)[number];

export const TEXT_LINES = [
  { text: 'Stuck paying', weight: 400, size: 46, color: COLORS.charcoal, x: 0, y: 385 },
  { text: 'Debt', weight: 700, size: 232, color: COLORS.charcoal, x: -6, y: 590 },
  { text: 'forever?', weight: 400, size: 118, color: COLORS.lightGray, x: 70, y: 664 },
  { text: 'there’s a smarter order.', weight: 400, size: 38, color: COLORS.midGray, x: 4, y: 762 },
];

export const CHART = {
  points: [0.86, 0.52, 0.7, 0.34, 0.58, 0.22, 0.44, 0.08, 0.3], // normalized y, evenly spaced on x
  xStart: -420,
  xEnd: 2340,
  lineWidth: 48,
  driftX: 60,
  driftY: 22,
};
