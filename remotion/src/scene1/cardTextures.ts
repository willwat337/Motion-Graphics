import * as THREE from 'three';
import { mix } from '../shared/timeline';
import { fontSpec } from '../shared/fonts';
import { CARD, COLORS, CardSpec } from './constants';

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawChip(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const grad = g.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, COLORS.chipLight);
  grad.addColorStop(0.5, COLORS.chipMid);
  grad.addColorStop(0.75, COLORS.chipLight);
  grad.addColorStop(1, COLORS.chipDark);
  roundRect(g, x, y, w, h, 8);
  g.fillStyle = grad;
  g.fill();

  g.strokeStyle = COLORS.chipLines;
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(x + w * 0.34, y); g.lineTo(x + w * 0.34, y + h);
  g.moveTo(x + w * 0.66, y); g.lineTo(x + w * 0.66, y + h);
  for (const fy of [0.36, 0.64]) {
    g.moveTo(x, y + h * fy); g.lineTo(x + w * 0.34, y + h * fy);
    g.moveTo(x + w * 0.66, y + h * fy); g.lineTo(x + w, y + h * fy);
  }
  g.stroke();
  roundRect(g, x + w * 0.34, y + h * 0.24, w * 0.32, h * 0.52, 4);
  g.stroke();
}

function drawContactless(g: CanvasRenderingContext2D, x: number, y: number) {
  g.strokeStyle = 'rgba(255,255,255,0.75)';
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let k = 1; k <= 3; k++) {
    g.beginPath();
    g.arc(x, y, 7 * k, -0.6, 0.6);
    g.stroke();
  }
}

/** Printed card face: color gradient, chip, contactless mark and the rate. */
export function makeFaceTexture(card: CardSpec): THREE.CanvasTexture {
  const S = CARD.textureScale;
  const w = CARD.width, h = CARD.height, r = CARD.radius;
  const c = document.createElement('canvas');
  c.width = Math.round(w * S);
  c.height = Math.round(h * S);
  const g = c.getContext('2d')!;
  g.scale(S, S);

  const body = g.createLinearGradient(0, 0, w, h);
  body.addColorStop(0, mix(card.color, '#ffffff', 0.18));
  body.addColorStop(0.55, card.color);
  body.addColorStop(1, mix(card.color, '#000000', 0.22));
  g.fillStyle = body;
  g.fillRect(0, 0, w, h);

  // Subtle printed diagonal highlight (the live sheen + 3D reflections do the rest)
  const diag = g.createLinearGradient(0, 0, w, h);
  diag.addColorStop(0.3, 'rgba(255,255,255,0)');
  diag.addColorStop(0.42, 'rgba(255,255,255,0.08)');
  diag.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.fillStyle = diag;
  g.fillRect(0, 0, w, h);

  roundRect(g, 0.75, 0.75, w - 1.5, h - 1.5, r);
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = 1.5;
  g.stroke();

  const chipW = w * 0.14, chipH = chipW * 0.78;
  const chipX = w * 0.09, chipY = h * 0.3;
  drawChip(g, chipX, chipY, chipW, chipH);
  drawContactless(g, chipX + chipW + 26, chipY + chipH / 2);

  g.save();
  g.shadowColor = 'rgba(0,0,0,0.18)';
  g.shadowBlur = 8 * S;
  g.shadowOffsetY = 3 * S;
  g.fillStyle = COLORS.cardInk;
  g.textBaseline = 'alphabetic';
  g.textAlign = 'right';
  g.font = fontSpec(700, Math.round(h * 0.38));
  g.fillText(card.rate, w - 30, h - 30);
  g.globalAlpha = 0.8;
  g.textAlign = 'left';
  g.font = fontSpec(400, 24);
  g.fillText('annual rate', 32, h - 36);
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Transparent texture with one soft diagonal light band in the middle; slide it via offset.x. */
export function makeSheenTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.translate(w / 2, h / 2);
  g.rotate((24 * Math.PI) / 180);
  const band = 120;
  const grad = g.createLinearGradient(-band, 0, band, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(-band, -h, band * 2, h * 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
