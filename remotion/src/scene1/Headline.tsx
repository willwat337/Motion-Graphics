import React from 'react';
import { Ease, progress } from '../shared/timeline';
import { serif } from '../shared/fonts';
import { COLORS, LAYOUT, STAGE, TEXT_LINES, TIMING } from './constants';

// SVG text so each line sits exactly on its baseline (y), like the canvas version.
export const Headline: React.FC<{ t: number; cam: number }> = ({ t, cam }) => (
  <svg
    width={STAGE.width}
    height={STAGE.height}
    viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'visible',
      transform: `scale(${cam})`,
      filter: `drop-shadow(0 8px 9px ${COLORS.textShadow})`,
    }}
  >
    {TEXT_LINES.map((line, i) => {
      const p = Ease.outQuart(progress(t, TIMING.textStart + i * TIMING.textStagger, TIMING.textDur));
      return (
        <text
          key={line.text}
          x={LAYOUT.textX + line.x}
          y={line.y + (1 - p) * TIMING.textRise}
          fill={line.color}
          opacity={p}
          style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: line.weight, fontSize: line.size }}
        >
          {line.text}
        </text>
      );
    })}
  </svg>
);
