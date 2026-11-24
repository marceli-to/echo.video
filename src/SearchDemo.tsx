import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { loadFonts } from './fonts';
import { WIN } from './theme';
import { Window } from './ui/Window';
import { RecentScreen, ResultsScreen } from './ui/screens';
import { Panel, PanelState } from './ui/Panel';
import { PanelOverlay } from './Refs';
import { MAIL_INDEX } from './data';

loadFonts();

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

// The story: Recent → ⌘K → type "sandra offerte" (results follow each word) → ↓↓↓ to the mail → ↵:
// the results as the list, the mail thread in the preview. Then back to the start, so it loops.
const T = {
  open: s(1.5),
  typeStart: s(2.6),
  pauseAfterSandra: s(1.0),
  holdResults: s(1.0),
  arrowGap: s(0.32),
  holdOnMail: s(0.8),
  holdEnd: s(6.0),
  fadeBack: s(0.7),
};

/** Typing times: a person's rhythm, not a metronome (frames per character). */
const typed = (() => {
  const steps: { at: number; text: string }[] = [];
  const word1 = 'sandra';
  const word2 = ' offerte';
  const gaps1 = [0, 4, 4, 3, 4, 4];
  const gaps2 = [0, 4, 3, 4, 3, 4, 3, 4];
  let t = T.typeStart;
  word1.split('').forEach((_, i) => {
    t += gaps1[i];
    steps.push({ at: t, text: word1.slice(0, i + 1) });
  });
  t += T.pauseAfterSandra;
  word2.split('').forEach((_, i) => {
    t += gaps2[i];
    steps.push({ at: t, text: word1 + word2.slice(0, i + 1) });
  });
  return { steps, end: t };
})();

const arrows = [1, 2, 3].map((n) => typed.end + T.holdResults + T.arrowGap * (n - 1));
const enter = arrows[arrows.length - 1] + T.holdOnMail;
const backStart = enter + T.holdEnd;
const total = backStart + T.fadeBack + s(0.5);

export const DEMO = { fps: FPS, width: 1600, height: 1000, frames: total };

/** Which results the panel shows for what's typed. The search runs as you type; a word of
 * one or two letters finds nothing new yet, so the panel keeps the last results meanwhile. */
const stateFor = (text: string): PanelState => {
  if (text.length < 2) return 'guide';
  if (text.startsWith('sandra offert')) return 'offerte';
  if (text.startsWith('sandra off')) return 'off';
  return 'sandra';
};

export const SearchDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const text = [...typed.steps].reverse().find((st) => frame >= st.at)?.text ?? '';
  const typing = frame >= typed.steps[0].at - 2 && frame < typed.end + 8;
  // The caret blinks (macOS: about 0.5 s on, 0.5 s off) except while typing.
  const caret = typing || Math.floor((frame - T.open) / s(0.5)) % 2 === 0;
  const selected = arrows.filter((a) => frame >= a).length;
  const panelOpen = frame >= T.open && frame < enter;
  // SwiftUI: .transition(.opacity) with .easeOut(0.12 s).
  const panelOpacity =
    frame < enter
      ? interpolate(frame, [T.open, T.open + 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
      : interpolate(frame, [enter, enter + 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const showResults = frame >= enter && frame < backStart + T.fadeBack;
  const backOpacity = interpolate(frame, [backStart, backStart + T.fadeBack], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: '#EEEFEA', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: WIN.w,
          height: WIN.h,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06), 0 30px 70px rgba(30, 38, 33, 0.20)',
          position: 'relative',
        }}
      >
        <Window
          overlay={
            panelOpen || (frame >= enter && panelOpacity > 0) ? (
              <PanelOverlay opacity={panelOpacity}>
                <Panel text={text} caret={caret} state={stateFor(text)} selected={selected} />
              </PanelOverlay>
            ) : null
          }
        >
          {showResults ? <ResultsScreen selected={MAIL_INDEX} /> : <RecentScreen />}
        </Window>
        {/* Back to the start for a seamless loop. */}
        {backOpacity > 0 ? (
          <div style={{ position: 'absolute', inset: 0, opacity: backOpacity }}>
            <Window>
              <RecentScreen />
            </Window>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
