import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { loadFonts } from './fonts';
import { C, R, WIN, manrope, mono, oneLine } from './theme';
import { Icon, IconName } from './ui/Icon';
import { Window } from './ui/Window';
import { RecentScreen } from './ui/screens';
import { Bubble, ChatPreviewView } from './ui/people';

loadFonts();

// "Ask your AI about your real work" (website, first example): an assistant asks écho through MCP
// when the next appointment with Laura Brunner is. Next to it, what écho connects as each call
// returns: the person, her calendar entry, her mail and her WhatsApp messages, and where they
// disagree. A click on the answer's "chat" source opens the original message in écho.
// The assistant app is a stand-in, not any real product. Names and messages are made up.

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.inOut(Easing.cubic);
const outQuad = Easing.out(Easing.quad);

const QUESTION = 'When is my next appointment with Laura Brunner?';

// Timeline
const T = {
  typeStart: s(1.0),
  charFrames: 1.6,
  send: 0, // set below
};
const typeEnd = T.typeStart + Math.ceil(QUESTION.length * T.charFrames);
const send = typeEnd + s(0.5);
const toolsStart = send + s(0.7);
const toolGap = s(1.05);
const toolRun = s(0.6);

type Tool = { name: string; args: string; result: string; reveals: NodeId[] };
type NodeId = 'person' | 'calendar' | 'mail' | 'wa1' | 'wa2' | 'conflict';
const tools: Tool[] = [
  { name: 'person', args: 'Laura Brunner', result: '1 person', reveals: ['person'] },
  { name: 'search', args: 'with:Laura Brunner · in calendar', result: '3 results', reveals: ['calendar'] },
  { name: 'search', args: 'with:Laura Brunner · in mail', result: '2 results', reveals: ['mail'] },
  { name: 'search', args: 'with:Laura Brunner · in whatsapp', result: '6 results', reveals: ['wa1'] },
  { name: 'get_item', args: 'chat:2291', result: 'ok', reveals: ['wa2', 'conflict'] },
];
const toolAt = (i: number) => toolsStart + toolGap * i;
const toolDone = (i: number) => toolAt(i) + toolRun;
const revealAt: Record<NodeId, number> = (() => {
  const out = {} as Record<NodeId, number>;
  tools.forEach((t, i) => t.reveals.forEach((id, j) => (out[id] = toolDone(i) + j * s(0.5))));
  return out;
})();
const answerStart = toolDone(tools.length - 1) + s(1.4);
const CHARS_PER_FRAME = 2.4;

// The answer, as runs: plain, **bold**, a list item break, or a source link.
type Run = { t: string; b?: boolean } | { br: 'p' | 'li' } | { src: 'event' | 'chat' };
const answer: Run[] = [
  { t: 'Your next appointment with Laura Brunner is ' },
  { t: 'probably Wednesday 9 December', b: true },
  { t: ', but it isn’t confirmed yet.' },
  { br: 'li' },
  { t: 'Your calendar', b: true },
  { t: ' still has it on ' },
  { t: 'Thursday 10 Dec at 09:30', b: true },
  { t: ' ' },
  { src: 'event' },
  { br: 'li' },
  { t: 'On WhatsApp on 20 Nov', b: true },
  { t: ', you asked to move it because a client wants to meet you on the 10th, and offered the 9th or 11th. Laura replied at 16:43: “Ja, Mi 9.12. würde gut gehen. OK?” ' },
  { src: 'chat' },
  { br: 'p' },
  { t: 'I don’t see a reply from you after that. To lock it in, confirm the 9th with her, agree on a time (you usually meet at 09:30), and move the calendar entry.' },
];
const answerLength = answer.reduce((n, r) => n + ('t' in r ? r.t.length : 'src' in r ? 4 : 0), 0);
const answerEnd = answerStart + Math.ceil(answerLength / CHARS_PER_FRAME);
// When the answer reaches the calendar / the WhatsApp part, the map points at it.
const charsUntil = (pred: (r: Run) => boolean) => {
  let n = 0;
  for (const r of answer) {
    if (pred(r)) return n;
    n += 't' in r ? r.t.length : 'src' in r ? 4 : 0;
  }
  return n;
};
const focusCalendar = answerStart + Math.ceil(charsUntil((r) => 't' in r && r.t === 'Your calendar') / CHARS_PER_FRAME);
const focusChat = answerStart + Math.ceil(charsUntil((r) => 't' in r && r.t === 'On WhatsApp on 20 Nov') / CHARS_PER_FRAME);
const focusEnd = answerStart + Math.ceil(charsUntil((r) => 'br' in r && r.br === 'p') / CHARS_PER_FRAME);

const cursorMove = [answerEnd + s(1.2), answerEnd + s(2.2)];
const click = cursorMove[1] + s(0.15);
const echoIn = click + s(0.35);
const echoHold = echoIn + s(4.5);
const total = echoHold + s(0.8) + s(0.4);

export const ASK = { fps: FPS, width: 1600, height: 1000, frames: total };

// MARK: Assistant (a neutral stand-in app)

const SYS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif";
const sys = (size: number, weight = 400): React.CSSProperties => ({ fontFamily: SYS, fontSize: size, fontWeight: weight, lineHeight: 'normal' });
const A = { bg: '#FAFAF8', ink: '#1C1C1A', muted: '#6E6E69', line: '#E6E5E1', soft: '#F0EFEB', accent: '#3A3A36' };

const ASSIST = { x: 56, y: 70, w: 760, h: 860 };

const EchoBadge: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <div
    style={{
      ...manrope(size * 0.72, 800),
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: C.ground,
      color: C.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
      flexShrink: 0,
    }}
  >
    é
  </div>
);

const Spinner: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      width: 12,
      height: 12,
      borderRadius: 6,
      border: `1.5px solid ${A.line}`,
      borderTopColor: A.muted,
      transform: `rotate(${frame * 18}deg)`,
    }}
  />
);

const Check: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <path d="M2.5 6.2 L5 8.6 L9.5 3.6" fill="none" stroke={A.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SourceLink: React.FC<{ kind: 'event' | 'chat'; pressed?: boolean }> = ({ kind, pressed }) => (
  <span
    style={{
      ...mono(11, 500),
      color: C.ink,
      background: pressed ? '#DCDCD6' : C.ground,
      borderRadius: 6,
      padding: '1px 6px 2px',
      marginLeft: 2,
      whiteSpace: 'nowrap',
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.1)',
    }}
  >
    {kind}
  </span>
);

const AnswerText: React.FC<{ shown: number; pressedChat: boolean }> = ({ shown, pressedChat }) => {
  // Splits the runs into paragraphs / list items, cut at `shown` characters.
  const blocks: { kind: 'p' | 'li'; runs: React.ReactNode[] }[] = [{ kind: 'p', runs: [] }];
  let left = shown;
  answer.forEach((r, i) => {
    if (left <= 0) return;
    if ('br' in r) {
      blocks.push({ kind: r.br, runs: [] });
      return;
    }
    const cur = blocks[blocks.length - 1];
    if ('src' in r) {
      left -= 4;
      cur.runs.push(<SourceLink key={i} kind={r.src} pressed={r.src === 'chat' && pressedChat} />);
      return;
    }
    const piece = r.t.slice(0, Math.max(0, left));
    left -= r.t.length;
    cur.runs.push(
      <span key={i} style={r.b ? { fontWeight: 650 } : undefined}>
        {piece}
      </span>,
    );
  });
  return (
    <div style={{ ...sys(15.5), color: A.ink, lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {blocks
        .filter((b) => b.runs.length > 0)
        .map((b, i) =>
          b.kind === 'li' ? (
            <div key={i} style={{ display: 'flex', gap: 10, paddingLeft: 4 }}>
              <span style={{ color: A.muted }}>•</span>
              <div>{b.runs}</div>
            </div>
          ) : (
            <div key={i}>{b.runs}</div>
          ),
        )}
    </div>
  );
};

const Assistant: React.FC<{ frame: number; active: boolean }> = ({ frame, active }) => {
  const typedChars = Math.max(0, Math.min(QUESTION.length, Math.floor((frame - T.typeStart) / T.charFrames)));
  const sent = frame >= send;
  const caretOn = !sent && (frame < T.typeStart || frame < typeEnd + 2 || Math.floor(frame / 15) % 2 === 0);
  const toolsShown = tools.filter((_, i) => frame >= toolAt(i)).length;
  const working = sent && frame < answerStart;
  const shown = frame >= answerStart ? Math.floor((frame - answerStart) * CHARS_PER_FRAME) : 0;
  const pressedChat = frame >= click && frame < click + 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: ASSIST.x,
        top: ASSIST.y,
        width: ASSIST.w,
        height: ASSIST.h,
        borderRadius: 16,
        overflow: 'hidden',
        background: A.bg,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05), 0 30px 70px rgba(30,38,33,0.18)',
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Title bar */}
      <div style={{ height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${A.line}` }}>
        <div style={{ position: 'absolute', left: 16, top: 15, display: 'flex', gap: 8 }}>
          {(active ? ['#FF5F57', '#FEBC2E', '#28C840'] : ['#CFCFCB', '#CFCFCB', '#CFCFCB']).map((c, i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
          ))}
        </div>
        <span style={{ ...sys(13, 600), color: A.muted }}>Assistant</span>
        <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 6, ...sys(12, 500), color: A.muted }}>
          <EchoBadge size={16} />
          écho connected
        </div>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 22, overflow: 'hidden' }}>
        {sent ? (
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%', ...sys(15.5), color: A.ink, background: A.soft, borderRadius: 18, padding: '10px 16px' }}>
            {QUESTION}
          </div>
        ) : null}
        {toolsShown > 0 ? (
          <div style={{ border: `1px solid ${A.line}`, borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', ...sys(13, 600), color: A.ink, borderBottom: `1px solid ${A.line}` }}>
              <EchoBadge />
              <span>{working ? 'Asking écho…' : `Asked écho · ${tools.length} calls`}</span>
            </div>
            {tools.slice(0, toolsShown).map((t, i) => {
              const done = frame >= toolDone(i);
              const appear = interpolate(frame, [toolAt(i), toolAt(i) + 5], [0, 1], { ...clamp, easing: outQuad });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    borderTop: i > 0 ? `1px solid ${A.line}` : undefined,
                    opacity: appear,
                    transform: `translateY(${(1 - appear) * 4}px)`,
                  }}
                >
                  <div style={{ width: 14, display: 'flex', justifyContent: 'center' }}>{done ? <Check /> : <Spinner frame={frame} />}</div>
                  <span style={{ ...mono(12, 600), color: A.ink, width: 70 }}>{t.name}</span>
                  <span style={{ ...mono(12), color: A.muted, flex: 1, ...oneLine }}>{t.args}</span>
                  <span style={{ ...mono(11.5), color: A.muted, opacity: done ? 1 : 0 }}>{t.result}</span>
                </div>
              );
            })}
          </div>
        ) : null}
        {shown > 0 ? <AnswerText shown={shown} pressedChat={pressedChat} /> : null}
      </div>

      {/* Input */}
      <div style={{ padding: '0 24px 22px' }}>
        <div
          style={{
            border: `1px solid ${A.line}`,
            borderRadius: 16,
            background: '#FFFFFF',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ flex: 1, ...sys(15.5), color: A.ink, display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
            {!sent && typedChars > 0 ? <span>{QUESTION.slice(0, typedChars)}</span> : null}
            {!sent ? <span style={{ width: 1.5, height: 19, background: caretOn ? A.ink : 'transparent', marginLeft: 1 }} /> : null}
            {sent || typedChars === 0 ? <span style={{ color: '#A5A5A0', position: sent ? 'static' : 'absolute', marginLeft: sent ? 0 : 4 }}>Ask anything</span> : null}
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              background: typedChars > 0 && !sent ? A.accent : '#D8D8D3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 11.5 V2.8 M3 6.6 L7 2.6 L11 6.6" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// MARK: The map: what écho connects

type Box = { x: number; y: number; w: number; h: number };
const NODES: Record<Exclude<NodeId, 'conflict'>, Box> = {
  person: { x: 1124, y: 520, w: 190, h: 150 },
  calendar: { x: 880, y: 190, w: 300, h: 112 },
  wa1: { x: 1258, y: 150, w: 300, h: 112 },
  wa2: { x: 1258, y: 350, w: 300, h: 70 },
  mail: { x: 880, y: 740, w: 300, h: 112 },
};
const center = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const PERSON_C = { x: NODES.person.x + NODES.person.w / 2, y: NODES.person.y + 32 };

const Card: React.FC<{
  box: Box;
  icon: IconName;
  source: string;
  date: string;
  appear: number;
  focus: number;
  warn?: number;
  children: React.ReactNode;
}> = ({ box, icon, source, date, appear, focus, warn = 0, children }) => (
  <div
    style={{
      position: 'absolute',
      left: box.x,
      top: box.y,
      width: box.w,
      minHeight: box.h,
      boxSizing: 'border-box',
      padding: '14px 16px',
      borderRadius: R.card,
      background: C.surface,
      opacity: appear,
      transform: `translateY(${(1 - appear) * 10}px) scale(${0.97 + 0.03 * appear + 0.015 * focus})`,
      boxShadow: [
        `0 0 0 ${1 + focus}px rgba(30, 38, 33, ${0.08 + 0.5 * focus})`,
        warn > 0 ? `0 0 0 ${1.5 * warn}px rgba(154, 74, 31, ${0.7 * warn})` : '',
        `0 ${6 + 10 * focus}px ${18 + 20 * focus}px rgba(30, 38, 33, ${0.08 + 0.06 * focus})`,
      ]
        .filter(Boolean)
        .join(', '),
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted }}>
      <Icon name={icon} size={13} />
      <span style={{ ...mono(11), flex: 1 }}>{source}</span>
      <span style={mono(11)}>{date}</span>
    </div>
    {children}
  </div>
);

const Edge: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; draw: number; color?: string; dashed?: boolean; width?: number }> = ({
  from,
  to,
  draw,
  color = '#B4BAB0',
  dashed,
  width = 1.5,
}) => {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  // A gentle curve, like a thread.
  const nx = -(to.y - from.y) / len;
  const ny = (to.x - from.x) / len;
  const bend = Math.min(40, len * 0.12);
  const c = { x: mid.x + nx * bend, y: mid.y + ny * bend };
  const d = `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`;
  const approx = len * 1.05;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? `5 5` : `${approx} ${approx}`}
      strokeDashoffset={dashed ? 0 : approx * (1 - draw)}
      opacity={dashed ? draw : 1}
    />
  );
};

const MapView: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = (id: NodeId) => interpolate(frame, [revealAt[id], revealAt[id] + s(0.35)], [0, 1], { ...clamp, easing: outQuad });
  const draw = (id: NodeId) => interpolate(frame, [revealAt[id] - s(0.1), revealAt[id] + s(0.5)], [0, 1], { ...clamp, easing: ease });
  const focusOf = (from: number, to: number) =>
    Math.min(
      interpolate(frame, [from, from + s(0.3)], [0, 1], { ...clamp, easing: outQuad }),
      interpolate(frame, [to, to + s(0.4)], [1, 0], { ...clamp, easing: outQuad }),
    );
  const calFocus = focusOf(focusCalendar, focusChat);
  const chatFocus = focusOf(focusChat, focusEnd);
  const conflict = appear('conflict');
  const warnPulse = conflict * (0.6 + 0.4 * Math.sin((frame - revealAt.conflict) / 6) ** 2);
  const p = appear('person');

  const anchorBottom = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h });
  const anchorTop = (b: Box) => ({ x: b.x + b.w / 2, y: b.y });
  const anchorLeft = (b: Box) => ({ x: b.x, y: b.y + b.h / 2 });
  void center;
  const calRight = { x: NODES.calendar.x + NODES.calendar.w, y: NODES.calendar.y + 70 };
  const wa2Left = anchorLeft(NODES.wa2);

  return (
    <>
      <svg width={1600} height={1000} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Edge from={PERSON_C} to={anchorBottom(NODES.calendar)} draw={draw('calendar')} />
        <Edge from={PERSON_C} to={{ x: NODES.wa1.x + 40, y: NODES.wa1.y + NODES.wa1.h }} draw={draw('wa1')} />
        <Edge from={PERSON_C} to={anchorTop(NODES.mail)} draw={draw('mail')} />
        {/* Laura's reply, in the same chat */}
        <Edge from={{ x: NODES.wa1.x + 200, y: NODES.wa1.y + NODES.wa1.h }} to={{ x: NODES.wa2.x + 200, y: NODES.wa2.y }} draw={draw('wa2')} />
        {/* Where they disagree */}
        <Edge from={calRight} to={wa2Left} draw={conflict} color={C.warning} dashed width={1.8} />
      </svg>

      {/* The person: who écho knows Laura is, across mail, phone and contacts */}
      <div
        style={{
          position: 'absolute',
          left: NODES.person.x,
          top: NODES.person.y,
          width: NODES.person.w,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: p,
          transform: `scale(${0.9 + 0.1 * p})`,
        }}
      >
        <div
          style={{
            ...manrope(22, 800),
            width: 64,
            height: 64,
            borderRadius: 32,
            background: C.accentTint,
            color: C.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 4px #EEEFEA, 0 8px 24px rgba(30,38,33,0.12)',
          }}
        >
          LB
        </div>
        <span style={{ ...manrope(16, 700), color: C.ink }}>Laura Brunner</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          {[
            { icon: 'envelope-simple' as IconName, v: 'laura@brunner-praxis.test' },
            { icon: 'phone' as IconName, v: '+41 79 555 12 34' },
          ].map((c, i) => (
            <div
              key={c.v}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 24,
                padding: '0 11px',
                borderRadius: 12,
                background: C.surface,
                color: C.ink,
                opacity: interpolate(frame, [revealAt.person + s(0.25 + i * 0.15), revealAt.person + s(0.5 + i * 0.15)], [0, 1], clamp),
                whiteSpace: 'nowrap',
              }}
            >
              <Icon name={c.icon} size={11} />
              <span style={mono(10.5)}>{c.v}</span>
            </div>
          ))}
        </div>
      </div>

      <Card box={NODES.calendar} icon="calendar-blank" source="Calendar" date="event" appear={appear('calendar')} focus={calFocus} warn={warnPulse}>
        <span style={{ ...manrope(15, 600), color: C.ink }}>Termin Laura Brunner</span>
        <span style={{ ...mono(12, 500), color: C.ink }}>Thu 10 Dec · 09:30–10:30</span>
        <span style={{ ...mono(10.5), color: C.muted }}>earlier: 15 Oct, 17 Sep · both 09:30</span>
      </Card>

      <Card box={NODES.wa1} icon="chat-teardrop" source="WhatsApp · You" date="20 Nov, 14:12" appear={appear('wa1')} focus={chatFocus}>
        <span style={{ ...manrope(13.5, 500), color: C.ink, lineHeight: 1.45 }}>
          Hallo Laura, können wir den Termin vom 10. verschieben? Ein Kunde möchte mich an dem Tag treffen. Ginge der 9. oder 11.?
        </span>
      </Card>

      <Card box={NODES.wa2} icon="chat-teardrop" source="WhatsApp · Laura" date="20 Nov, 16:43" appear={appear('wa2')} focus={chatFocus} warn={warnPulse}>
        <span style={{ ...manrope(14, 600), color: C.ink, background: C.accentTint, alignSelf: 'flex-start', padding: '0 3px', borderRadius: 3 }}>
          Ja, Mi 9.12. würde gut gehen. OK?
        </span>
      </Card>

      <Card box={NODES.mail} icon="envelope-simple" source="Mail · Laura Brunner" date="2 Nov" appear={appear('mail')} focus={0}>
        <span style={{ ...manrope(15, 600), color: C.ink }}>Terminbestätigung</span>
        <span style={{ ...manrope(13, 500), color: C.muted, lineHeight: 1.45 }}>
          Gerne bestätige ich Ihnen den Termin am Donnerstag, 10. Dezember, um 09:30.
        </span>
      </Card>

      {/* The disagreement, named */}
      <div
        style={{
          position: 'absolute',
          left: (calRight.x + wa2Left.x) / 2 - 92,
          top: (calRight.y + wa2Left.y) / 2 - 2,
          width: 184,
          display: 'flex',
          justifyContent: 'center',
          opacity: conflict,
          transform: `translateY(${(1 - conflict) * 6}px)`,
        }}
      >
        <span
          style={{
            ...mono(11, 600),
            color: C.warning,
            background: '#F6EEE8',
            border: `1px solid rgba(154, 74, 31, 0.35)`,
            borderRadius: 7,
            padding: '4px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          Thu 10 Dec ≠ Wed 9 Dec
        </span>
      </div>
    </>
  );
};

// MARK: écho, opened from the "chat" link

const lauraChat: Bubble[] = [
  { day: '15 Oct 2026' },
  { text: 'Bis später, ich bin um halb zehn da.', sent: true },
  { text: 'Perfekt 👍' },
  { day: '2 Nov 2026' },
  { text: 'Ich habe dir die Bestätigung für den 10. per Mail geschickt.' },
  { text: 'Danke, ist eingetragen.', sent: true },
  { day: '12 Nov 2026' },
  { text: 'Danke für die Unterlagen, ich schaue sie bis zum Termin durch.' },
  { text: 'Super, bis dann!', sent: true },
  { day: '20 Nov 2026' },
  { text: 'Hallo Laura, können wir den Termin vom 10. verschieben? Ein Kunde möchte mich an dem Tag treffen. Ginge der 9. oder 11.?', sent: true },
  { text: 'Ja, Mi 9.12. würde gut gehen. OK?', match: true },
];

const Pointer: React.FC<{ x: number; y: number; pressed: boolean }> = ({ x, y, pressed }) => (
  <svg width="22" height="30" viewBox="0 0 22 30" style={{ position: 'absolute', left: x - 3, top: y - 2, transform: `scale(${pressed ? 0.9 : 1})`, transformOrigin: '3px 2px' }}>
    <path d="M3 2 L3 24 L8.5 18.8 L12.3 27.4 L16 25.8 L12.3 17.4 L19.6 17.4 Z" fill="#111" stroke="#FFF" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const Ask: React.FC = () => {
  const frame = useCurrentFrame();
  const echoAppear = interpolate(frame, [echoIn, echoIn + 6], [0, 1], { ...clamp, easing: outQuad });
  const echoOut = interpolate(frame, [echoHold, echoHold + s(0.8)], [1, 0], { ...clamp, easing: ease });
  const echoShown = frame >= echoIn && echoOut > 0;
  // The rest fades back in under écho for the loop.
  const restart = frame >= echoHold;

  // Where the "chat" link sits: measured on a still (bottom of the answer's second list item).
  const target = CHAT_LINK;
  const start = { x: 640, y: 960 };
  const mv = interpolate(frame, cursorMove, [0, 1], { ...clamp, easing: ease });
  const cursorShown = frame >= cursorMove[0] - 4 && frame < echoIn + 2;
  const cx = start.x + (target.x - start.x) * mv;
  const cy = start.y + (target.y - start.y) * mv;

  const f = restart ? 0 : frame;

  return (
    <AbsoluteFill style={{ background: '#EEEFEA', fontSize: 1 }}>
      <Assistant frame={f} active={!echoShown || restart} />
      <MapView frame={f} />
      {cursorShown ? <Pointer x={cx} y={cy} pressed={frame >= click && frame < click + 6} /> : null}
      {echoShown ? (
        <div
          style={{
            position: 'absolute',
            left: (1600 - WIN.w) / 2,
            top: (1000 - WIN.h) / 2,
            width: WIN.w,
            height: WIN.h,
            borderRadius: 16,
            overflow: 'hidden',
            opacity: echoAppear * echoOut,
            transform: `scale(${0.97 + 0.03 * echoAppear})`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), 0 40px 90px rgba(30,38,33,0.28)',
          }}
        >
          <Window>
            <RecentScreen
              pinned={<ChatPreviewView source="WhatsApp · 24 messages" title="Laura Brunner" bubbles={lauraChat} />}
            />
          </Window>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Position of the answer's "chat" link on the stage (checked on a rendered still). */
export const CHAT_LINK = { x: 140, y: 577 };
