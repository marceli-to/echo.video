import React from 'react';
import { Composition, Still } from 'remotion';
import { Ref, RefProps } from './Refs';
import { Tour, TOUR } from './Tour';
import { Ask, ASK } from './Ask';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Tour" component={Tour} durationInFrames={TOUR.frames} fps={TOUR.fps} width={TOUR.width} height={TOUR.height} />
    <Composition id="Ask" component={Ask} durationInFrames={ASK.frames} fps={ASK.fps} width={ASK.width} height={ASK.height} />
    {/* Single states at 1:1, to compare with the app's snapshots (tools/compare.sh). */}
    <Still id="Ref" component={Ref} width={1392} height={2400} defaultProps={{ screen: 'recent' } as RefProps} />
  </>
);
