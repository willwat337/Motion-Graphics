import React from 'react';
import { AbsoluteFill } from 'remotion';
import { lerp } from '../shared/timeline';
import { CHART, COLORS, STAGE } from './constants';

// Radial studio backdrop + ghosted zigzag chart line that drifts in a seamless loop.
export const Background: React.FC<{ t: number; cam: number }> = ({ t, cam }) => {
  const phase = (t / STAGE.duration) * Math.PI * 2;
  const dx = Math.sin(phase) * CHART.driftX;
  const dy = Math.cos(phase) * CHART.driftY;
  const n = CHART.points.length;
  const pts = CHART.points
    .map((p, i) => `${lerp(CHART.xStart, CHART.xEnd, i / (n - 1))},${p * STAGE.height}`)
    .join(' ');

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle farthest-corner at 50% 50%, ${COLORS.bgCenter} 0%, ${COLORS.bgEdge} 100%)`,
      }}
    >
      <svg
        width={STAGE.width}
        height={STAGE.height}
        viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `scale(${cam})` }}
      >
        <polyline
          points={pts}
          transform={`translate(${dx} ${dy})`}
          fill="none"
          stroke={COLORS.chartLine}
          strokeWidth={CHART.lineWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
