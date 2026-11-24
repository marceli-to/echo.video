import React from 'react';
import { C, R, manrope, mono } from '../theme';
import { Icon } from '../ui/Icon';
import { PreviewHead, PrimaryButton, Snippet } from '../ui/parts';
import { MapNode, Scenario, makeAsk } from './engine';

// Website example 3: "In Claude Code. You only asked what’s next." A coding agent in the project
// folder reads progress.md, then asks écho what happened since: Thomas Keller moved the launch by
// mail, Sandra dropped the newsletter sign-up on WhatsApp. Neither is in the notes yet.

const N: Record<string, MapNode['box']> = {
  progress: { x: 870, y: 330, w: 280, h: 196 },
  mail: { x: 1290, y: 318, w: 280, h: 150 },
  chat: { x: 1290, y: 640, w: 280, h: 120 },
};
const HUB = { x: 1070, y: 92, w: 300, h: 170 };
const HUB_BOTTOM = { x: HUB.x + HUB.w / 2, y: HUB.y + 150 };

const line = (y: number) => ({ y: N.progress.y + y });
const launchAt = { x: N.progress.x + N.progress.w, ...line(150) };
const newsAt = { x: N.progress.x + N.progress.w, ...line(98) };
const mailIn = { x: N.mail.x, y: N.mail.y + 100 };
const chatIn = { x: N.chat.x, y: N.chat.y + 60 };

const Md: React.FC<{ children: React.ReactNode; dim?: boolean; head?: boolean }> = ({ children, dim, head }) => (
  <div style={{ ...mono(12, head ? 600 : 400), color: dim ? C.muted : C.ink, lineHeight: 1.6, whiteSpace: 'pre' }}>{children}</div>
);

const Hub: React.FC<{ frame: number; from: number }> = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 18,
        background: C.iconTile,
        color: C.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 4px #EEEFEA, 0 8px 24px rgba(30,38,33,0.12)',
      }}
    >
      <Icon name="folder-simple" size={30} />
    </div>
    <span style={{ ...manrope(16, 700), color: C.ink }}>Keller Relaunch</span>
    <span style={{ ...mono(10.5), color: C.muted }}>project · Keller Design AG</span>
    <div style={{ display: 'flex', gap: 6, paddingTop: 2 }}>
      {['Thomas Keller', 'Sandra Moser'].map((n) => (
        <span key={n} style={{ ...mono(10.5), color: C.ink, background: C.surface, borderRadius: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}>
          {n}
        </span>
      ))}
    </div>
  </div>
);

const MailPreviewView: React.FC = () => (
  <>
    <div style={{ padding: '26px 36px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PreviewHead icon="envelope-simple" source="Mail · Thomas Keller → You" title="Launch verschieben" action="19 Nov 2026 at 10:24" />
    </div>
    <div style={{ flex: 1, padding: '0 36px' }}>
      <div style={{ borderRadius: R.card, background: C.surface, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, ...manrope(13, 500), color: C.ink }}>
          {[
            'Hallo Marco',
            'Unsere neuen Fotos sind leider noch nicht bereit. Lass uns den Launch vom 1. Dezember auf **Montag, 14. Dezember** verschieben. Passt das für euch?',
            'Den Kick-off am 3. Dezember machen wir wie geplant.',
            'Liebe Grüsse\nThomas',
          ].map((p, i) => (
            <div key={i} style={{ lineHeight: 'calc(13px * 1.366 + 4px)', whiteSpace: 'pre-line' }}>
              <Snippet text={p} size={15} tinted />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ padding: '20px 36px' }}>
      <PrimaryButton title="Open in Mail" />
    </div>
  </>
);

export const next: Scenario = {
  app: 'terminal',
  project: '~/Projekte/keller-relaunch',
  question: 'What’s next?',
  tools: [
    { name: 'Read', args: 'progress.md', result: '34 lines', reveals: ['hub', 'progress'], local: true },
    { name: 'search', args: 'Keller launch · since 2026-11-12', result: '4 results', reveals: ['mail'] },
    { name: 'search', args: 'newsletter · since 2026-11-12', result: '2 results', reveals: ['chat'] },
    { name: 'get_item', args: 'msg:5120', result: 'ok', reveals: ['c1', 'c2'] },
  ],
  answer: [
    { t: 'Next in ' },
    { t: 'progress.md', b: true },
    { t: ' is the contact form. Before you start: two things changed that aren’t in the notes yet.' },
    { br: 'li' },
    { t: 'Thomas Keller wrote on 19 Nov', b: true },
    { t: ' that the launch moves from 1 December to ' },
    { t: 'Monday 14 December', b: true },
    { t: ': their new photos aren’t ready. ' },
    { src: 'mail' },
    { br: 'li' },
    { t: 'On WhatsApp on 21 Nov', b: true },
    { t: ', Sandra asked to ' },
    { t: 'drop the newsletter sign-up', b: true },
    { t: ' for now. ' },
    { src: 'chat' },
    { br: 'p' },
    { t: 'The contact form is still next, and the new date leaves room for it. I’d update progress.md first: the new launch date, and the newsletter off the list. Shall I?' },
  ],
  center: { id: 'hub', box: HUB, anchor: HUB_BOTTOM, render: (frame, at) => <Hub frame={frame} from={at('hub')} /> },
  nodes: [
    {
      id: 'progress',
      box: N.progress,
      icon: 'file-text',
      source: 'progress.md',
      date: 'edited 12 Nov',
      warnOn: 'c1',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Md head>## Next</Md>
          <Md>- [ ] Contact form</Md>
          <Md>- [ ] Newsletter sign-up</Md>
          <Md dim>- [x] Team page</Md>
          <Md head>## Launch</Md>
          <Md>Mon 1 December</Md>
        </div>
      ),
    },
    {
      id: 'mail',
      box: N.mail,
      icon: 'envelope-simple',
      source: 'Mail · Thomas Keller',
      date: '19 Nov',
      warnOn: 'c1',
      body: (
        <>
          <span style={{ ...manrope(15, 600), color: C.ink }}>Launch verschieben</span>
          <span style={{ ...manrope(13, 500), color: C.muted, lineHeight: 1.45 }}>
            Unsere neuen Fotos sind noch nicht bereit. Lass uns den Launch auf{' '}
            <span style={{ color: C.ink, fontWeight: 600, background: C.accentTint, padding: '0 2px', borderRadius: 3 }}>Montag, 14. Dezember</span>{' '}
            verschieben.
          </span>
        </>
      ),
    },
    {
      id: 'chat',
      box: N.chat,
      icon: 'chat-teardrop',
      source: 'WhatsApp · Sandra Moser',
      date: '21 Nov, 08:52',
      warnOn: 'c2',
      body: (
        <span style={{ ...manrope(13.5, 500), color: C.ink, lineHeight: 1.45 }}>
          Hoi! Die{' '}
          <span style={{ fontWeight: 600, background: C.accentTint, padding: '0 2px', borderRadius: 3 }}>Newsletter-Anmeldung lassen wir vorerst weg</span>, ok?
          Das machen wir nach dem Launch.
        </span>
      ),
    },
  ],
  edges: [
    { from: HUB_BOTTOM, to: { x: N.progress.x + N.progress.w / 2, y: N.progress.y }, reveal: 'progress' },
    { from: HUB_BOTTOM, to: { x: N.mail.x + N.mail.w / 2, y: N.mail.y }, reveal: 'mail' },
    { from: HUB_BOTTOM, to: { x: N.chat.x, y: N.chat.y + 24 }, reveal: 'chat', bend: 60 },
    { from: launchAt, to: mailIn, reveal: 'c1', conflict: true },
    { from: newsAt, to: chatIn, reveal: 'c2', conflict: true },
  ],
  labels: [
    { reveal: 'c1', at: { x: (launchAt.x + mailIn.x) / 2, y: (launchAt.y + mailIn.y) / 2 + 30 }, text: '1 Dec → 14 Dec' },
    { reveal: 'c2', at: { x: (newsAt.x + chatIn.x) / 2, y: (newsAt.y + chatIn.y) / 2 + 40 }, text: 'newsletter: drop' },
  ],
  focus: [
    { nodes: ['progress'], from: 'Next in ', to: 'Thomas Keller wrote' },
    { nodes: ['mail'], from: 'Thomas Keller wrote', to: 'On WhatsApp on 21 Nov' },
    { nodes: ['chat'], from: 'On WhatsApp on 21 Nov', to: '<p>' },
    { nodes: ['progress'], from: 'The contact form is still next', to: '(end)' },
  ],
  link: { kind: 'mail', at: { x: 452, y: 490 } },
  echo: <MailPreviewView />,
};

export const Next = makeAsk(next);
