# Motion Graphics — Remotion + Three.js

Scenes are React components rendered frame by frame by [Remotion](https://www.remotion.dev),
so every exported frame is exact (no dropped frames). Cards are real 3D meshes built with
Three.js via `@remotion/three` / React Three Fiber; text and backdrop are 2D layers on top.

## Layout

```
src/
  Root.tsx                 registers compositions
  shared/timeline.ts       easing + progress helpers (seconds-based)
  shared/fonts.ts          bundled Playfair Display (public/fonts, SIL OFL)
  scene1/constants.ts      ← colors, timings, layout, lighting, cards, text
  scene1/Scene1Problem.tsx composes the layers + camera push-in
  scene1/Background.tsx    radial backdrop + drifting zigzag
  scene1/Cards3D.tsx       Three.js cards, lights, soft shadows, sheen
  scene1/cardTextures.ts   printed card face (chip, rate) + sheen texture
  scene1/Headline.tsx      staggered serif headline
```

To make a new scene, copy `scene1/`, edit its `constants.ts`, and add a `<Composition>` in `Root.tsx`.

## Commands

```bash
npm install
npm run studio     # live preview + timeline scrubbing in the browser
npm run render     # -> out/scene-01-the-problem.mp4
```

On a machine without a GPU (e.g. a cloud container) add `--gl=swangle`. If Remotion
can't download its own headless Chrome, point it at an installed one with
`--browser-executable=/path/to/chrome-headless-shell`.
