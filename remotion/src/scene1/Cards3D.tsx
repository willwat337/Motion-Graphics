import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { continueRender, delayRender } from 'remotion';
import { Ease, deg, lerp, mix, progress } from '../shared/timeline';
import { fontReady, fontSpec } from '../shared/fonts';
import { CARD, CARDS, CardSpec, LAYOUT, LIGHTING, STAGE, TIMING } from './constants';
import { makeFaceTexture, makeSheenTexture } from './cardTextures';

// Perspective camera placed so 1 world unit = 1 pixel on the z=0 plane.
const FOV = 30;
const CAMERA_Z = STAGE.height / 2 / Math.tan(deg(FOV / 2));

/* ---------- Geometry ---------------------------------------------------- */

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Flat face with UVs mapped 0..1 across the card so a texture fits exactly. */
function faceGeometry(shape: THREE.Shape, w: number, h: number) {
  const geo = new THREE.ShapeGeometry(shape, 16);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function useCardGeometry() {
  return useMemo(() => {
    const shape = roundedRectShape(CARD.width, CARD.height, CARD.radius);
    const bevel = 1.2;
    const body = new THREE.ExtrudeGeometry(shape, {
      depth: CARD.thickness,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    });
    body.translate(0, 0, -CARD.thickness / 2);
    return { body, face: faceGeometry(shape, CARD.width, CARD.height), faceZ: CARD.thickness / 2 + bevel + 0.05 };
  }, []);
}

/* ---------- Textures (wait for the font before printing the rates) ------ */

function useCardTextures() {
  const [handle] = useState(() => delayRender('Building card textures'));
  const [tex, setTex] = useState<{ faces: THREE.CanvasTexture[]; sheens: THREE.CanvasTexture[] } | null>(null);
  useEffect(() => {
    (async () => {
      await fontReady;
      await Promise.all([document.fonts.load(fontSpec(400, 40)), document.fonts.load(fontSpec(700, 40))]);
      const sheen = makeSheenTexture();
      setTex({
        faces: CARDS.map(makeFaceTexture),
        sheens: CARDS.map(() => {
          const s = sheen.clone();
          s.needsUpdate = true;
          return s;
        }),
      });
      continueRender(handle);
    })();
  }, [handle]);
  return tex;
}

/* ---------- Animation --------------------------------------------------- */

function cardState(card: CardSpec, i: number, t: number) {
  const inP = Ease.outCubic(progress(t, TIMING.cardsInStart + i * TIMING.cardsInStagger, TIMING.cardsInDur));
  const moveP = Ease.inOutSine(progress(t, TIMING.cardsMoveStart, STAGE.duration - TIMING.cardsMoveStart));
  const ramp = Ease.inOutSine(progress(t, TIMING.cardsMoveStart, TIMING.cardsMoveRamp));
  const local = Math.max(0, t - TIMING.cardsMoveStart);
  const wave = (period: number, extra = 0) => Math.sin((local / period) * Math.PI * 2 + card.phase + extra);

  const px = LAYOUT.hero.x + lerp(card.fan.x, card.spread.x, moveP);
  const py = LAYOUT.hero.y + lerp(card.fan.y, card.spread.y, moveP) + wave(CARD.bobPeriod) * CARD.bobAmp * ramp + (1 - inP) * 30;
  const fanRot = lerp(card.fan.rot * 0.35, card.fan.rot, inP);

  return {
    // screen pixels -> world units (y up, origin at frame center)
    position: [px - STAGE.width / 2, STAGE.height / 2 - py, i * 10 - (1 - inP) * 60] as [number, number, number],
    rotation: [
      wave(CARD.turnPeriod * 0.8, 1.3) * CARD.tiltAmp * ramp,
      wave(CARD.turnPeriod) * CARD.turnAmp * ramp,
      -deg(lerp(fanRot, card.spread.rot, moveP)),
    ] as [number, number, number],
    scale: lerp(CARD.fanScaleFrom, 1, inP),
    opacity: inP,
    sheen: Ease.inOutSine(progress(t, TIMING.sheenStart + i * TIMING.sheenStagger, TIMING.sheenDur)),
  };
}

/* ---------- Scene pieces ------------------------------------------------ */

const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = LIGHTING.environment;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

const CameraRig: React.FC<{ zoom: number }> = ({ zoom }) => {
  const camera = useThree(s => s.camera) as THREE.PerspectiveCamera;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
  return null;
};

const Card: React.FC<{
  card: CardSpec;
  index: number;
  t: number;
  geo: ReturnType<typeof useCardGeometry>;
  face: THREE.Texture;
  sheen: THREE.Texture;
}> = ({ card, index, t, geo, face, sheen }) => {
  const s = cardState(card, index, t);
  sheen.offset.x = lerp(1.0, -1.0, s.sheen); // band crosses the card left -> right
  const edgeColor = useMemo(() => new THREE.Color(mix(card.color, '#000000', 0.25)), [card.color]);

  // Painter's order: each card draws fully on top of the ones before it, so cards
  // turning in real 3D never slice through each other. Depth is still used for
  // perspective, lighting and shadows.
  const order = index * 10;
  const layered = { transparent: true, depthTest: false, depthWrite: false, opacity: s.opacity } as const;

  return (
    <group position={s.position} rotation={s.rotation} scale={s.scale}>
      <mesh geometry={geo.body} castShadow renderOrder={order}>
        <meshPhysicalMaterial color={edgeColor} roughness={0.45} clearcoat={0.5} {...layered} />
      </mesh>
      <mesh geometry={geo.face} position={[0, 0, geo.faceZ]} renderOrder={order + 1}>
        <meshPhysicalMaterial
          map={face}
          roughness={0.38}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.14}
          {...layered}
        />
      </mesh>
      {s.sheen > 0 && s.sheen < 1 && (
        <mesh geometry={geo.face} position={[0, 0, geo.faceZ + 0.1]} renderOrder={order + 2}>
          <meshBasicMaterial map={sheen} blending={THREE.AdditiveBlending} toneMapped={false} {...layered} />
        </mesh>
      )}
    </group>
  );
};

/* ---------- Layer ------------------------------------------------------- */

export const Cards3D: React.FC<{ t: number; cam: number }> = ({ t, cam }) => {
  const geo = useCardGeometry();
  const tex = useCardTextures();
  const k = LIGHTING.key;

  return (
    <ThreeCanvas
      width={STAGE.width}
      height={STAGE.height}
      flat
      shadows="variance"
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 10, far: CAMERA_Z * 3 }}
    >
      <CameraRig zoom={cam} />
      <StudioEnvironment />
      <ambientLight intensity={LIGHTING.ambient} />
      <directionalLight
        position={k.position}
        intensity={k.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={LIGHTING.shadowSoftness}
        shadow-blurSamples={24}
        shadow-bias={-0.0005}
        shadow-camera-left={-1300}
        shadow-camera-right={1300}
        shadow-camera-top={900}
        shadow-camera-bottom={-900}
        shadow-camera-near={100}
        shadow-camera-far={5000}
      />
      {/* Invisible catcher: only the soft shadow shows on the 2D backdrop */}
      <mesh position={[0, 0, LIGHTING.shadowPlaneZ]} receiveShadow>
        <planeGeometry args={[STAGE.width * 3, STAGE.height * 3]} />
        <shadowMaterial transparent opacity={LIGHTING.shadowOpacity} />
      </mesh>
      {tex &&
        CARDS.map((card, i) => (
          <Card key={card.rate} card={card} index={i} t={t} geo={geo} face={tex.faces[i]} sheen={tex.sheens[i]} />
        ))}
    </ThreeCanvas>
  );
};
