import React from 'react';
import { Composition } from 'remotion';
import { Scene1Problem } from './scene1/Scene1Problem';
import { STAGE } from './scene1/constants';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Scene1Problem"
      component={Scene1Problem}
      durationInFrames={Math.round(STAGE.duration * STAGE.fps)}
      fps={STAGE.fps}
      width={STAGE.width}
      height={STAGE.height}
    />
  </>
);
