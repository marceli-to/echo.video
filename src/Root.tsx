import React from 'react';
import { Composition, Still } from 'remotion';
import { Ref, RefProps } from './Refs';
import { Tour, TOUR } from './Tour';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Tour" component={Tour} durationInFrames={TOUR.frames} fps={TOUR.fps} width={TOUR.width} height={TOUR.height} />
    {/* Single states at 1:1, to compare with the app's snapshots (tools/compare.sh). */}
    <Still id="Ref" component={Ref} width={1392} height={2400} defaultProps={{ screen: 'recent' } as RefProps} />
  </>
);
