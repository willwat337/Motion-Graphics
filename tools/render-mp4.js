#!/usr/bin/env node
/*
 * Frame-perfect MP4 renderer for the canvas scenes.
 *
 * Unlike the in-page Record button (real-time MediaRecorder, which drops
 * frames if the device can't keep up), this steps the timeline exactly
 * 1/fps at a time, so every frame is present and evenly spaced.
 *
 * Usage:  node tools/render-mp4.js scenes/01-the-problem.html [out.mp4] [fps]
 * Needs:  Playwright (Chromium) and ffmpeg.
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [, , input, outArg, fpsArg] = process.argv;
  if (!input) {
    console.error('Usage: node tools/render-mp4.js <scene.html> [out.mp4] [fps]');
    process.exit(1);
  }
  const out = outArg || input.replace(/\.html?$/, '.mp4');
  const fps = Number(fpsArg) || 60;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + path.resolve(input) + '?export');
  await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 15000 });
  const duration = await page.evaluate(() => STAGE.duration);
  const total = Math.round(duration * fps);

  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < total; i++) {
    const b64 = await page.evaluate(t => {
      renderFrame(t);
      return document.getElementById('stage').toDataURL('image/png').split(',')[1];
    }, i / fps);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) {
      await new Promise(r => ff.stdin.once('drain', r));
    }
    if (i % fps === 0) process.stdout.write(`\rframe ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`\rwrote ${out} (${total} frames @ ${fps}fps)`);
})();
