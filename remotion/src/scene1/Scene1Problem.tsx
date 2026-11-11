import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Ease, lerp, progress } from '../shared/timeline';
import { Background } from './Background';
import { Cards3D } from './Cards3D';
import { Headline } from './Headline';
import { STAGE, TIMING } from './constants';

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Slow camera push-in, applied to every layer (3D camera zoom + 2D scale).
  const cam = lerp(TIMING.cameraStart, TIMING.cameraEnd, Ease.inOutSine(t / STAGE.duration));
  const fade = 1 - Ease.inOutSine(progress(t, STAGE.duration - TIMING.loopFadeOut, TIMING.loopFadeOut));

  return (
    <AbsoluteFill>
      <Background t={t} cam={cam} />
      <AbsoluteFill style={{ opacity: fade }}>
        <Cards3D t={t} cam={cam} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: fade }}>
        <Headline t={t} cam={cam} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
