import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { loadFonts } from './fonts';
import { WIN } from './theme';
import { Window } from './ui/Window';
import { RecentScreen, ResultsScreen } from './ui/screens';
import { Panel, PanelState } from './ui/Panel';
import { PeopleScreen, FeedSelection } from './ui/people';
import { PANE_SIZE, SETTINGS_HEADER, SettingsWindow } from './ui/settings';
import { PanelOverlay } from './Refs';
import { MAIL_INDEX } from './data';

loadFonts();

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.inOut(Easing.cubic);

// The tour, one take:
//  1. Search: Recent → ⌘K → "sandra offerte" (results follow the typing) → ↓↓↓ to the mail → ↵.
//  2. People: ⌘2 → Sandra Brunner → ↓ the meeting → ↓ the WhatsApp chat.
//  3. Settings (⌘,): Sources, scrolled through → Agents: Claude Code connects, down to the access log.
//  Then back to the first frame, so it loops.

// 1. Search
const open = s(1.5);
const typeStart = s(2.6);
const typed = (() => {
  const steps: { at: number; text: string }[] = [];
  const w1 = 'sandra';
  const w2 = ' offerte';
  const g1 = [0, 4, 4, 3, 4, 4];
  const g2 = [0, 4, 3, 4, 3, 4, 3, 4];
  let t = typeStart;
  w1.split('').forEach((_, i) => {
    t += g1[i];
    steps.push({ at: t, text: w1.slice(0, i + 1) });
  });
  t += s(1.0);
  w2.split('').forEach((_, i) => {
    t += g2[i];
    steps.push({ at: t, text: w1 + w2.slice(0, i + 1) });
  });
  return { steps, end: t };
})();
const arrows = [0, 1, 2].map((n) => typed.end + s(1.0) + s(0.32) * n);
const enter = arrows[2] + s(0.8);

// 2. People
const people = enter + s(3.2);
const feedMeeting = people + s(1.8);
const feedChat = feedMeeting + s(2.0);

// 3. Settings
const settingsOpen = feedChat + s(3.0);
const sourcesScroll = [settingsOpen + s(1.6), settingsOpen + s(3.4)];
const toAgents = sourcesScroll[1] + s(1.6);
const connects = toAgents + s(1.6);
const agentsScroll = [connects + s(1.4), connects + s(4.0)];
const settingsClose = agentsScroll[1] + s(3.0);
const back = settingsClose + s(1.0);
const total = back + s(0.7) + s(0.4);

export const TOUR = { fps: FPS, width: 1600, height: 1000, frames: total };

const stateFor = (text: string): PanelState => {
  if (text.length < 2) return 'guide';
  if (text.startsWith('sandra offert')) return 'offerte';
  if (text.startsWith('sandra off')) return 'off';
  return 'sandra';
};

// Where the windows sit on the 1600 × 1000 stage.
const MAIN = { x: (1600 - WIN.w) / 2, y: (1000 - WIN.h) / 2 };
const SET = { x: 360, y: 118 };
const SOURCES_MAX_SCROLL = 413;
const AGENTS_MAX_SCROLL = 810;

const windowShadow = '0 0 0 1px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06), 0 30px 70px rgba(30, 38, 33, 0.20)';

export const Tour: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Search
  const text = [...typed.steps].reverse().find((st) => frame >= st.at)?.text ?? '';
  const typing = frame >= typed.steps[0].at - 2 && frame < typed.end + 8;
  const caret = typing || Math.floor((frame - open) / s(0.5)) % 2 === 0;
  const selected = arrows.filter((a) => frame >= a).length;
  const panelOpacity =
    frame < enter
      ? interpolate(frame, [open, open + 4], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) })
      : interpolate(frame, [enter, enter + 4], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const panelShown = frame >= open && panelOpacity > 0 && frame < enter + 4;

  // 2. People
  const feed: FeedSelection = frame >= feedChat ? 'chat' : frame >= feedMeeting ? 'meeting' : 'none';

  // 3. Settings
  const settingsOpacity =
    frame < settingsClose
      ? interpolate(frame, [settingsOpen, settingsOpen + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) })
      : interpolate(frame, [settingsClose, settingsClose + 6], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const settingsScale = interpolate(frame, [settingsOpen, settingsOpen + 6], [0.97, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const pane = frame >= toAgents ? 'agents' : 'sources';
  // The window resizes to the next pane (top-left stays), as macOS does.
  const resize = interpolate(frame, [toAgents, toAgents + s(0.25)], [0, 1], { ...clamp, easing: ease });
  const winW = interpolate(resize, [0, 1], [PANE_SIZE.sources.w, PANE_SIZE.agents.w]);
  const winH = interpolate(resize, [0, 1], [PANE_SIZE.sources.h, PANE_SIZE.agents.h]) + SETTINGS_HEADER;
  const scroll =
    pane === 'sources'
      ? interpolate(frame, sourcesScroll, [0, SOURCES_MAX_SCROLL], { ...clamp, easing: ease })
      : interpolate(frame, agentsScroll, [0, AGENTS_MAX_SCROLL], { ...clamp, easing: ease });
  const settingsShown = frame >= settingsOpen && settingsOpacity > 0;

  // Main window content for this moment.
  const screen: 'recent' | 'people' = frame >= people ? 'people' : 'recent';
  const content =
    frame >= people ? <PeopleScreen selection={feed} /> : frame >= enter ? <ResultsScreen selected={MAIL_INDEX} /> : <RecentScreen />;

  const backOpacity = interpolate(frame, [back, back + s(0.7)], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ background: '#EEEFEA' }}>
      <div
        style={{
          position: 'absolute',
          left: MAIN.x,
          top: MAIN.y,
          width: WIN.w,
          height: WIN.h,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: windowShadow,
        }}
      >
        <Window
          screen={screen}
          active={!settingsShown}
          overlay={
            panelShown ? (
              <PanelOverlay opacity={panelOpacity}>
                <Panel text={text} caret={caret} state={stateFor(text)} selected={selected} />
              </PanelOverlay>
            ) : null
          }
        >
          {content}
        </Window>
        {backOpacity > 0 ? (
          <div style={{ position: 'absolute', inset: 0, opacity: backOpacity }}>
            <Window>
              <RecentScreen />
            </Window>
          </div>
        ) : null}
      </div>

      {settingsShown ? (
        <div
          style={{
            position: 'absolute',
            left: SET.x,
            top: SET.y,
            width: winW,
            height: winH,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08), 0 40px 90px rgba(30, 38, 33, 0.28)',
            opacity: settingsOpacity,
            transform: `scale(${settingsScale})`,
            transformOrigin: 'center top',
          }}
        >
          <SettingsWindow pane={pane} width={winW} height={winH} scroll={scroll} connected={frame >= connects} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
