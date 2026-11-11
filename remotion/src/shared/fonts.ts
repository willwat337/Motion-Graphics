import { continueRender, delayRender, staticFile } from 'remotion';

// Playfair Display Italic (variable 400–900), bundled in public/fonts under the SIL OFL.
// Self-hosted so renders work offline and never depend on a font CDN.
const FAMILY = 'Playfair Display';

const handle = delayRender('Loading Playfair Display');
const face = new FontFace(FAMILY, `url(${staticFile('fonts/PlayfairDisplay-Italic-VF.woff2')}) format('woff2')`, {
  style: 'italic',
  weight: '400 900',
});

export const fontReady: Promise<void> = face
  .load()
  .then(loaded => {
    document.fonts.add(loaded);
  })
  .finally(() => continueRender(handle));

export const serif = `"${FAMILY}", Georgia, "Times New Roman", serif`;
export const fontSpec = (weight: number, size: number) => `italic ${weight} ${size}px ${serif}`;
