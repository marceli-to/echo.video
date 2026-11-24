import React from 'react';
import { Composition, Still } from 'remotion';
import { Ref, RefProps } from './Refs';
import { SearchDemo, DEMO } from './SearchDemo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SearchDemo"
      component={SearchDemo}
      durationInFrames={DEMO.frames}
      fps={DEMO.fps}
      width={DEMO.width}
      height={DEMO.height}
    />
    <Still id="Ref" component={Ref} width={1392} height={832} defaultProps={{ screen: 'recent' } as RefProps} />
  </>
);
