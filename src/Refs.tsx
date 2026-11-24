import React from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFonts } from './fonts';
import { C } from './theme';
import { Window } from './ui/Window';
import { RecentScreen, ResultsScreen } from './ui/screens';
import { Panel, PanelState } from './ui/Panel';
import { FeedSelection, PeopleScreen } from './ui/people';
import { Pane, SettingsWindow } from './ui/settings';

loadFonts();

/** One state of the window at 1:1, to lay over the app's own snapshot and compare. */
export type RefProps = {
  screen: 'recent' | 'panel' | 'results' | 'people' | 'settings';
  text?: string;
  state?: PanelState;
  selected?: number;
  feed?: FeedSelection;
  pane?: Pane;
  /** Settings: draw this tall (to measure a pane's full content). */
  tall?: number;
};

export const PanelOverlay: React.FC<{ opacity?: number; children: React.ReactNode }> = ({ opacity = 1, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity }}>
    <div style={{ position: 'absolute', inset: 0, background: C.dim }} />
    <div style={{ position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)' }}>{children}</div>
  </div>
);

export const Ref: React.FC<RefProps> = ({ screen, text = '', state = 'guide', selected = 0, feed = 'none', pane = 'sources', tall }) =>
  screen === 'settings' ? (
    // The app's snapshot draws Settings 900 pt wide.
    <AbsoluteFill>
      <SettingsWindow pane={pane} width={900} height={tall ?? (pane === 'sources' ? 751 : 771)} />
    </AbsoluteFill>
  ) : screen === 'people' ? (
    <AbsoluteFill>
      <Window screen="people">
        <PeopleScreen selection={feed} />
      </Window>
    </AbsoluteFill>
  ) : (
  <AbsoluteFill>
    <Window
      overlay={
        screen === 'panel' ? (
          <PanelOverlay>
            <Panel text={text} caret={false} state={state} selected={selected} />
          </PanelOverlay>
        ) : null
      }
    >
      {screen === 'results' ? <ResultsScreen /> : <RecentScreen />}
    </Window>
  </AbsoluteFill>
);
