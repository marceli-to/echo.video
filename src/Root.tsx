import React from 'react';
import { Composition, Still } from 'remotion';
import { Ref, RefProps } from './Refs';
import { Tour, TOUR } from './Tour';
import { Laura } from './ask/laura';
import { Next } from './ask/next';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Tour" component={Tour} durationInFrames={TOUR.frames} fps={TOUR.fps} width={TOUR.width} height={TOUR.height} />
    {/* The website's "Ask your AI" examples */}
    <Composition id="AskLaura" component={Laura.Component} durationInFrames={Laura.meta.frames} fps={30} width={1600} height={1000} />
    <Composition id="AskNext" component={Next.Component} durationInFrames={Next.meta.frames} fps={30} width={1600} height={1000} />
    {/* Single states at 1:1, to compare with the app's snapshots (tools/compare.sh). */}
    <Still id="Ref" component={Ref} width={1392} height={2400} defaultProps={{ screen: 'recent' } as RefProps} />
  </>
);
