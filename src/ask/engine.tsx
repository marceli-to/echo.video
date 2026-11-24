import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { loadFonts } from '../fonts';
import { C, R, WIN, manrope, mono, oneLine } from '../theme';
import { Icon, IconName } from '../ui/Icon';
import { Window } from '../ui/Window';
import { RecentScreen } from '../ui/screens';

loadFonts();

// The website's "Ask your AI" examples as videos. An assistant (a neutral stand-in, not a real
// product) asks écho through MCP; its calls come in one by one, and next to it the map of what écho
// connects builds up as each call returns, including where sources disagree. The answer streams in,
// and a click on one of its sources opens the original in écho (echo://item → Recent, pinned preview).
// A scenario (laura.tsx, next.tsx) supplies the question, calls, map, answer and the écho preview.

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.inOut(Easing.cubic);
const outQuad = Easing.out(Easing.quad);

export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };
export type SourceKind = 'event' | 'chat' | 'mail';
export type Run = { t: string; b?: boolean } | { br: 'p' | 'li' } | { src: SourceKind };
export type Tool = { name: string; args: string; result: string; reveals: string[]; local?: boolean };
export type MapNode = {
  id: string;
  box: Box;
  icon: IconName;
  source: string;
  date: string;
  body: React.ReactNode;
  /** Pulses in the warning colour once this reveal has happened (a mismatch it's part of). */
  warnOn?: string;
};
export type Scenario = {
  app: 'chat' | 'terminal';
  /** Terminal: the folder in the title. */
  project?: string;
  question: string;
  tools: Tool[];
  answer: Run[];
  center: { id: string; box: Box; anchor: Pt; render: (frame: number, at: (id: string) => number) => React.ReactNode };
  nodes: MapNode[];
  edges: { from: Pt; to: Pt; reveal: string; conflict?: boolean; bend?: number }[];
  labels: { reveal: string; at: Pt; text: string }[];
  /** While the answer talks about these, the nodes light up: from the run starting with `from` to the one starting with `to`. */
  focus: { nodes: string[]; from: string; to: string }[];
  /** The source the pointer clicks, and where it sits on the stage (checked on a still). */
  link: { kind: SourceKind; at: Pt };
  /** What écho shows in its preview when the link opens. */
  echo: React.ReactNode;
};

// MARK: Timeline

const CHARS_PER_FRAME = 2.4;
const runLength = (r: Run) => ('t' in r ? r.t.length : 'src' in r ? r.src.length : 0);

export const timeline = (sc: Scenario) => {
  const typeStart = s(1.0);
  const charFrames = sc.question.length < 20 ? 3 : 1.6;
  const typeEnd = typeStart + Math.ceil(sc.question.length * charFrames);
  const send = typeEnd + s(0.5);
  const toolsStart = send + s(0.7);
  const toolAt = (i: number) => toolsStart + s(1.05) * i;
  const toolDone = (i: number) => toolAt(i) + s(0.6);
  const reveal: Record<string, number> = {};
  sc.tools.forEach((t, i) => t.reveals.forEach((id, j) => (reveal[id] = toolDone(i) + j * s(0.5))));
  const answerStart = toolDone(sc.tools.length - 1) + s(1.4);
  const answerLength = sc.answer.reduce((n, r) => n + runLength(r), 0);
  const answerEnd = answerStart + Math.ceil(answerLength / CHARS_PER_FRAME);
  const charsUntil = (prefix: string) => {
    let n = 0;
    for (const r of sc.answer) {
      if (('t' in r && r.t.startsWith(prefix)) || ('br' in r && prefix === `<${r.br}>`)) return n;
      n += runLength(r);
    }
    return n;
  };
  const atChars = (n: number) => answerStart + Math.ceil(n / CHARS_PER_FRAME);
  const focus = sc.focus.map((f) => ({ nodes: f.nodes, from: atChars(charsUntil(f.from)), to: atChars(charsUntil(f.to)) }));
  // Time to read the answer, a calm move to the link, a moment on it, then the click.
  const cursorMove = [answerEnd + s(2.2), answerEnd + s(3.6)];
  const click = cursorMove[1] + s(0.7);
  const echoIn = click + s(0.35);
  const echoHold = echoIn + s(4.5);
  const total = echoHold + s(0.8) + s(0.4);
  return { typeStart, charFrames, typeEnd, send, toolAt, toolDone, reveal, answerStart, answerEnd, focus, cursorMove, click, echoIn, echoHold, total };
};
type TL = ReturnType<typeof timeline>;

// MARK: Shared bits

const SYS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif";
const sys = (size: number, weight = 400): React.CSSProperties => ({ fontFamily: SYS, fontSize: size, fontWeight: weight, lineHeight: 'normal' });
const A = { bg: '#FAFAF8', ink: '#1C1C1A', muted: '#6E6E69', line: '#E6E5E1', soft: '#F0EFEB', accent: '#3A3A36' };
const APP = { x: 56, y: 70, w: 760, h: 860 };

const Lights: React.FC<{ active: boolean }> = ({ active }) => (
  <div style={{ position: 'absolute', left: 16, top: 15, display: 'flex', gap: 8 }}>
    {(active ? ['#FF5F57', '#FEBC2E', '#28C840'] : ['#CFCFCB', '#CFCFCB', '#CFCFCB']).map((c, i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
    ))}
  </div>
);

export const EchoBadge: React.FC<{ size?: number }> = ({ size = 18 }) => (
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
  <div style={{ width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${A.line}`, borderTopColor: A.muted, transform: `rotate(${frame * 18}deg)` }} />
);

const Check: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <path d="M2.5 6.2 L5 8.6 L9.5 3.6" fill="none" stroke={A.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Splits the answer into paragraphs and list items, cut at `shown` characters. */
const answerBlocks = (answer: Run[], shown: number, link: (kind: SourceKind, key: number) => React.ReactNode) => {
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
      left -= r.src.length;
      cur.runs.push(link(r.src, i));
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
  return blocks.filter((b) => b.runs.length > 0);
};

// MARK: Chat app (a stand-in desktop assistant)

const ChatApp: React.FC<{ sc: Scenario; tl: TL; frame: number; active: boolean }> = ({ sc, tl, frame, active }) => {
  const typed = Math.max(0, Math.min(sc.question.length, Math.floor((frame - tl.typeStart) / tl.charFrames)));
  const sent = frame >= tl.send;
  const caretOn = !sent && (frame < tl.typeEnd + 2 || Math.floor(frame / 15) % 2 === 0);
  const toolsShown = sc.tools.filter((_, i) => frame >= tl.toolAt(i)).length;
  const working = sent && frame < tl.answerStart;
  const shown = frame >= tl.answerStart ? Math.floor((frame - tl.answerStart) * CHARS_PER_FRAME) : 0;
  const pressed = frame >= tl.click && frame < tl.click + 6;
  const blocks = answerBlocks(sc.answer, shown, (kind, key) => (
    <span
      key={key}
      style={{
        ...mono(11, 500),
        color: C.ink,
        background: pressed && kind === sc.link.kind ? '#DCDCD6' : C.ground,
        borderRadius: 6,
        padding: '1px 6px 2px',
        marginLeft: 2,
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.1)',
      }}
    >
      {kind}
    </span>
  ));

  return (
    <div
      style={{
        position: 'absolute',
        left: APP.x,
        top: APP.y,
        width: APP.w,
        height: APP.h,
        borderRadius: 16,
        overflow: 'hidden',
        background: A.bg,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05), 0 30px 70px rgba(30,38,33,0.18)',
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div style={{ height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${A.line}` }}>
        <Lights active={active} />
        <span style={{ ...sys(13, 600), color: A.muted }}>Assistant</span>
        <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 6, ...sys(12, 500), color: A.muted }}>
          <EchoBadge size={16} />
          écho connected
        </div>
      </div>
      <div style={{ flex: 1, padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 22, overflow: 'hidden' }}>
        {sent ? (
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%', ...sys(15.5), color: A.ink, background: A.soft, borderRadius: 18, padding: '10px 16px' }}>
            {sc.question}
          </div>
        ) : null}
        {toolsShown > 0 ? (
          <div style={{ border: `1px solid ${A.line}`, borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', ...sys(13, 600), color: A.ink, borderBottom: `1px solid ${A.line}` }}>
              <EchoBadge />
              <span>{working ? 'Asking écho…' : `Asked écho · ${sc.tools.length} calls`}</span>
            </div>
            {sc.tools.slice(0, toolsShown).map((t, i) => {
              const done = frame >= tl.toolDone(i);
              const appear = interpolate(frame, [tl.toolAt(i), tl.toolAt(i) + 5], [0, 1], { ...clamp, easing: outQuad });
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
        {shown > 0 ? (
          <div style={{ ...sys(15.5), color: A.ink, lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {blocks.map((b, i) =>
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
        ) : null}
      </div>
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
            {!sent && typed > 0 ? <span>{sc.question.slice(0, typed)}</span> : null}
            {!sent ? <span style={{ width: 1.5, height: 19, background: caretOn ? A.ink : 'transparent', marginLeft: 1 }} /> : null}
            {sent || typed === 0 ? <span style={{ color: '#A5A5A0', position: sent ? 'static' : 'absolute', marginLeft: sent ? 0 : 4 }}>Ask anything</span> : null}
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: typed > 0 && !sent ? A.accent : '#D8D8D3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 11.5 V2.8 M3 6.6 L7 2.6 L11 6.6" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// MARK: Terminal app (a stand-in coding agent)

const TERM = { bg: '#1D211F', ink: '#E7EAE4', muted: '#8C948E', line: '#2E3431', soft: '#272C29', accent: '#C9D1C8', warn: '#E39C70' };
const tmono = (size: number, weight = 400): React.CSSProperties => ({ ...mono(size, weight), lineHeight: 1.6 });

const TerminalApp: React.FC<{ sc: Scenario; tl: TL; frame: number; active: boolean }> = ({ sc, tl, frame, active }) => {
  const typed = Math.max(0, Math.min(sc.question.length, Math.floor((frame - tl.typeStart) / tl.charFrames)));
  const sent = frame >= tl.send;
  const caretOn = frame < tl.typeEnd + 2 || Math.floor(frame / 15) % 2 === 0;
  const toolsShown = sc.tools.filter((_, i) => frame >= tl.toolAt(i)).length;
  const working = sent && frame < tl.answerStart;
  const shown = frame >= tl.answerStart ? Math.floor((frame - tl.answerStart) * CHARS_PER_FRAME) : 0;
  const pressed = frame >= tl.click && frame < tl.click + 6;
  const blocks = answerBlocks(sc.answer, shown, (kind, key) => (
    <span key={key} style={{ color: pressed && kind === sc.link.kind ? '#FFFFFF' : '#9DB7E8', textDecoration: 'underline', textUnderlineOffset: 3 }}>
      {kind}
    </span>
  ));
  const dots = '.'.repeat(1 + (Math.floor(frame / 8) % 3));

  return (
    <div
      style={{
        position: 'absolute',
        left: APP.x,
        top: APP.y,
        width: APP.w,
        height: APP.h,
        borderRadius: 14,
        overflow: 'hidden',
        background: TERM.bg,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.08), 0 30px 70px rgba(30,38,33,0.28)',
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div style={{ height: 40, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${TERM.line}` }}>
        <Lights active={active} />
        <span style={{ ...mono(12, 500), color: TERM.muted }}>{sc.project} — agent</span>
        <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 6, ...mono(11), color: TERM.muted }}>
          <EchoBadge size={15} />
          mcp: echo
        </div>
      </div>
      <div style={{ flex: 1, padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden', color: TERM.ink }}>
        {sent ? (
          <div style={{ ...tmono(14), color: TERM.ink, background: TERM.soft, borderRadius: 6, padding: '6px 12px' }}>
            <span style={{ color: TERM.muted }}>› </span>
            {sc.question}
          </div>
        ) : null}
        {sc.tools.slice(0, toolsShown).map((t, i) => {
          const done = frame >= tl.toolDone(i);
          const appear = interpolate(frame, [tl.toolAt(i), tl.toolAt(i) + 5], [0, 1], { ...clamp, easing: outQuad });
          return (
            <div key={i} style={{ opacity: appear, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...tmono(13.5) }}>
                <span style={{ color: done ? '#8FBF8F' : TERM.muted }}>●</span>
                {t.local ? null : <EchoBadge size={15} />}
                <span style={{ fontWeight: 600 }}>{t.local ? t.name : `echo · ${t.name}`}</span>
                <span style={{ color: TERM.muted, ...oneLine }}>{t.args}</span>
              </div>
              <div style={{ ...tmono(12.5), color: TERM.muted, paddingLeft: 22 }}>{done ? `⎿  ${t.result}` : `⎿  running${dots}`}</div>
            </div>
          );
        })}
        {working && toolsShown === sc.tools.length && frame >= tl.toolDone(sc.tools.length - 1) ? (
          <div style={{ ...tmono(13), color: TERM.muted }}>✻ Thinking{dots}</div>
        ) : null}
        {shown > 0 ? (
          <div style={{ ...tmono(14), color: TERM.ink, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            {blocks.map((b, i) =>
              b.kind === 'li' ? (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: TERM.muted }}>–</span>
                  <div>{b.runs}</div>
                </div>
              ) : (
                <div key={i}>{b.runs}</div>
              ),
            )}
          </div>
        ) : null}
      </div>
      <div style={{ padding: '0 18px 18px' }}>
        <div style={{ border: `1px solid ${TERM.line}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', ...tmono(14), color: TERM.ink, whiteSpace: 'pre' }}>
          <span style={{ color: TERM.muted }}>› </span>
          {!sent ? <span>{sc.question.slice(0, typed)}</span> : null}
          <span style={{ width: 8, height: 18, background: caretOn && !working ? TERM.accent : 'transparent', marginLeft: 1 }} />
        </div>
      </div>
    </div>
  );
};

// MARK: The map

const Card: React.FC<{ node: MapNode; appear: number; focus: number; warn: number }> = ({ node, appear, focus, warn }) => (
  <div
    style={{
      position: 'absolute',
      left: node.box.x,
      top: node.box.y,
      width: node.box.w,
      minHeight: node.box.h,
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
      <Icon name={node.icon} size={13} />
      <span style={{ ...mono(11), flex: 1 }}>{node.source}</span>
      <span style={mono(11)}>{node.date}</span>
    </div>
    {node.body}
  </div>
);

const Edge: React.FC<{ from: Pt; to: Pt; draw: number; conflict?: boolean; bend?: number }> = ({ from, to, draw, conflict, bend: bendIn }) => {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  const nx = -(to.y - from.y) / len;
  const ny = (to.x - from.x) / len;
  const bend = bendIn ?? Math.min(40, len * 0.12);
  const c = { x: (from.x + to.x) / 2 + nx * bend, y: (from.y + to.y) / 2 + ny * bend };
  const d = `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`;
  const approx = len * 1.05;
  return conflict ? (
    <path d={d} fill="none" stroke={C.warning} strokeWidth={1.8} strokeLinecap="round" strokeDasharray="5 5" opacity={draw} />
  ) : (
    <path d={d} fill="none" stroke="#B4BAB0" strokeWidth={1.5} strokeLinecap="round" strokeDasharray={`${approx} ${approx}`} strokeDashoffset={approx * (1 - draw)} />
  );
};

const MapView: React.FC<{ sc: Scenario; tl: TL; frame: number }> = ({ sc, tl, frame }) => {
  const at = (id: string) => tl.reveal[id] ?? 1e9;
  const appear = (id: string) => interpolate(frame, [at(id), at(id) + s(0.35)], [0, 1], { ...clamp, easing: outQuad });
  const draw = (id: string) => interpolate(frame, [at(id) - s(0.1), at(id) + s(0.5)], [0, 1], { ...clamp, easing: ease });
  const focusOf = (id: string) =>
    Math.max(
      0,
      ...tl.focus
        .filter((f) => f.nodes.includes(id))
        .map((f) =>
          Math.min(
            interpolate(frame, [f.from, f.from + s(0.3)], [0, 1], { ...clamp, easing: outQuad }),
            interpolate(frame, [f.to, f.to + s(0.4)], [1, 0], { ...clamp, easing: outQuad }),
          ),
        ),
    );
  const warnOf = (n: MapNode) => {
    if (!n.warnOn) return 0;
    const c = appear(n.warnOn);
    return c * (0.6 + 0.4 * Math.sin((frame - at(n.warnOn)) / 6) ** 2);
  };
  const p = appear(sc.center.id);

  return (
    <>
      <svg width={1600} height={1000} style={{ position: 'absolute', left: 0, top: 0 }}>
        {sc.edges.map((e, i) => (
          <Edge key={i} from={e.from} to={e.to} draw={e.conflict ? appear(e.reveal) : draw(e.reveal)} conflict={e.conflict} bend={e.bend} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: sc.center.box.x, top: sc.center.box.y, width: sc.center.box.w, opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
        {sc.center.render(frame, at)}
      </div>
      {sc.nodes.map((n) => (
        <Card key={n.id} node={n} appear={appear(n.id)} focus={focusOf(n.id)} warn={warnOf(n)} />
      ))}
      {sc.labels.map((l, i) => {
        const c = appear(l.reveal);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: l.at.x - 120,
              top: l.at.y - 12,
              width: 240,
              display: 'flex',
              justifyContent: 'center',
              opacity: c,
              transform: `translateY(${(1 - c) * 6}px)`,
            }}
          >
            <span
              style={{
                ...mono(11, 600),
                color: C.warning,
                background: '#F6EEE8',
                border: '1px solid rgba(154, 74, 31, 0.35)',
                borderRadius: 7,
                padding: '4px 9px',
                whiteSpace: 'nowrap',
              }}
            >
              {l.text}
            </span>
          </div>
        );
      })}
    </>
  );
};

/** Avatar + name + identity chips, the centre of a map. */
export const PersonHub: React.FC<{ initials: string; name: string; ids: { icon: IconName; v: string }[]; frame: number; from: number }> = ({
  initials,
  name,
  ids,
  frame,
  from,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
      {initials}
    </div>
    <span style={{ ...manrope(16, 700), color: C.ink, whiteSpace: 'nowrap' }}>{name}</span>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {ids.map((c, i) => (
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
            opacity: interpolate(frame, [from + s(0.25 + i * 0.15), from + s(0.5 + i * 0.15)], [0, 1], clamp),
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name={c.icon} size={11} />
          <span style={mono(10.5)}>{c.v}</span>
        </div>
      ))}
    </div>
  </div>
);

const Pointer: React.FC<{ x: number; y: number; pressed: boolean }> = ({ x, y, pressed }) => (
  <svg width="22" height="30" viewBox="0 0 22 30" style={{ position: 'absolute', left: x - 3, top: y - 2, transform: `scale(${pressed ? 0.9 : 1})`, transformOrigin: '3px 2px' }}>
    <path d="M3 2 L3 24 L8.5 18.8 L12.3 27.4 L16 25.8 L12.3 17.4 L19.6 17.4 Z" fill="#111" stroke="#FFF" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

// MARK: The video

export const makeAsk = (sc: Scenario) => {
  const tl = timeline(sc);
  const meta = { fps: FPS, width: 1600, height: 1000, frames: tl.total };
  const Component: React.FC = () => {
    const frame = useCurrentFrame();
    const echoAppear = interpolate(frame, [tl.echoIn, tl.echoIn + 6], [0, 1], { ...clamp, easing: outQuad });
    const echoOut = interpolate(frame, [tl.echoHold, tl.echoHold + s(0.8)], [1, 0], { ...clamp, easing: ease });
    const echoShown = frame >= tl.echoIn && echoOut > 0;
    // Under the fading écho window everything is back at the first frame, for the loop.
    const restart = frame >= tl.echoHold;
    const f = restart ? 0 : frame;
    const start = { x: 640, y: 960 };
    const mv = interpolate(frame, tl.cursorMove, [0, 1], { ...clamp, easing: ease });
    const cursorShown = frame >= tl.cursorMove[0] - 4 && frame < tl.echoIn + 2;
    const App = sc.app === 'terminal' ? TerminalApp : ChatApp;
    return (
      <AbsoluteFill style={{ background: '#EEEFEA', fontSize: 1 }}>
        <App sc={sc} tl={tl} frame={f} active={!echoShown || restart} />
        <MapView sc={sc} tl={tl} frame={f} />
        {cursorShown ? (
          <Pointer
            x={start.x + (sc.link.at.x - start.x) * mv}
            y={start.y + (sc.link.at.y - start.y) * mv}
            pressed={frame >= tl.click && frame < tl.click + 6}
          />
        ) : null}
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
              <RecentScreen pinned={sc.echo} />
            </Window>
          </div>
        ) : null}
      </AbsoluteFill>
    );
  };
  return { Component, meta };
};
