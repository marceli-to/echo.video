import React from 'react';
import { C, R, WIN, manrope, mono, oneLine } from '../theme';
import { Icon, IconName } from './Icon';
import { DayLabel, FeedRow, HintedLabel, MonoLabel, PreviewHead, PrimaryButton } from './parts';
import type { FeedItem } from '../data';

// People (PeopleView.swift): the list of people, Sandra Brunner's feed, and the preview of the
// selected feed row. Contents from the demo index.

const people = [
  { initials: 'SB', name: 'Sandra Brunner', sub: 'Atelier Brunner', date: 'Sun' },
  { initials: 'TB', name: 'Tom Brunner', sub: 'tom@atelier-brunner.test', date: 'Sun' },
  { initials: 'LM', name: 'Lea Meier', sub: '+41 76 555 01 88', date: '12 Nov' },
  { initials: 'LM', name: 'Lea Meier', sub: 'Café Linde', date: '4 Nov' },
  { initials: 'AN', name: 'Anna Nef', sub: 'Stiftung Seeblick', date: '8 Oct' },
];

type FeedEntry = FeedItem & { attachment?: string };
const feed: { label: string; items: FeedEntry[] }[] = [
  {
    label: 'Sun 22 Nov',
    items: [
      { icon: 'calendar-blank', meta: 'Meeting · 30 min', time: '09:00', title: 'Jour fixe Relaunch', snippet: 'Stand der Arbeiten, offene Punkte, nächste Schritte.' },
    ],
  },
  { label: 'Sat 21 Nov', items: [{ icon: 'chat-teardrop', time: '09:41', title: 'WhatsApp', snippet: 'You: Perfekt, danke!' }] },
  {
    label: 'Wed 18 Nov',
    items: [
      {
        icon: 'chat-teardrop',
        time: '17:30',
        title: 'WhatsApp',
        snippet: 'You: Danke, schaue ich mir morgen an.',
        attachment: 'Offerte_2026-031_Wartung.pdf',
      },
    ],
  },
  {
    label: 'Sun 15 Nov',
    items: [
      { icon: 'calendar-blank', meta: 'Meeting · 30 min', time: '09:00', title: 'Jour fixe Relaunch', snippet: 'Stand der Arbeiten, offene Punkte, nächste Schritte.' },
    ],
  },
  {
    label: 'Thu 12 Nov',
    items: [
      { icon: 'calendar-blank', meta: 'Meeting · 1 h', time: '10:00', title: 'Kick-off Wartung 2027', snippet: 'Atelier Brunner, Zürich · Offerte 2026-031 durchgehen' },
    ],
  },
];

const Avatar: React.FC<{ initials: string; size: number; tinted?: boolean }> = ({ initials, size, tinted }) => (
  <div
    style={{
      ...manrope(size * 0.36, 800),
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      background: tinted ? C.accentTint : C.iconTile,
      color: C.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {initials}
  </div>
);

const PeopleList: React.FC = () => (
  <div style={{ width: 292, padding: '0 14px', boxSizing: 'border-box', flexShrink: 0 }}>
    <div
      style={{
        marginTop: 20,
        height: 42,
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 10,
        background: C.surface,
        color: C.ink,
      }}
    >
      <Icon name="magnifying-glass" size={15} />
      <span style={{ ...manrope(14.5, 500), color: C.muted }}>Find a person</span>
    </div>
    <div style={{ padding: '22px 10px 8px' }}>
      <MonoLabel>Last contact</MonoLabel>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {people.map((p, i) => (
        <div
          key={i}
          style={{
            height: 64,
            padding: '0 14px 0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderRadius: R.row,
            background: i === 0 ? C.surface : undefined,
          }}
        >
          <Avatar initials={p.initials} size={40} tinted={i === 0} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ ...manrope(15.5, 600), color: C.ink, ...oneLine }}>{p.name}</span>
            <span style={{ ...mono(11), color: C.muted, ...oneLine }}>{p.sub}</span>
          </div>
          <span style={{ ...mono(11), color: C.muted, marginLeft: 6 }}>{p.date}</span>
        </div>
      ))}
    </div>
    <div style={{ ...mono(11), color: C.accent, padding: 12 }}>Show 2 more who only wrote to you</div>
  </div>
);

const Chip: React.FC<{ title: string; count: number; selected?: boolean }> = ({ title, count, selected }) => (
  <div
    style={{
      height: 30,
      padding: '0 13px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: 15,
      background: selected ? C.ink : C.surface,
      color: selected ? C.ground : C.ink,
    }}
  >
    <span style={manrope(13, 600)}>{title}</span>
    <span style={{ ...mono(11), opacity: selected ? 0.8 : 0.6 }}>{count}</span>
  </div>
);

const IdentityChip: React.FC<{ icon: IconName; value: string }> = ({ icon, value }) => (
  <div
    style={{
      height: 28,
      padding: '0 16px 0 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: 14,
      background: C.surface,
      color: C.ink,
    }}
  >
    <Icon name={icon} size={13} />
    <span style={mono(12)}>{value}</span>
  </div>
);

export type FeedSelection = 'none' | 'meeting' | 'chat';

const PersonFeed: React.FC<{ selection: FeedSelection }> = ({ selection }) => (
  <div style={{ flex: 1, minWidth: 0, padding: '26px 28px 24px', overflow: 'hidden' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar initials="SB" size={60} tinted />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ ...manrope(26, 700), color: C.ink, ...oneLine }}>Sandra Brunner</span>
        <span style={{ ...manrope(15, 500), color: C.muted }}>Atelier Brunner</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <div
          style={{
            ...manrope(13, 600),
            color: C.ink,
            height: 28,
            padding: '0 11px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            borderRadius: R.button,
            background: C.surface,
            border: `1px solid ${C.line}`,
          }}
        >
          <HintedLabel title="Search with Sandra" keys="⌘K" />
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: R.button,
            background: C.surface,
            border: `1px solid ${C.line}`,
            color: C.ink,
          }}
        >
          <Icon name="dots-three" size={16} />
        </div>
      </div>
    </div>
    {/* Identities */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 14 }}>
      <IdentityChip icon="envelope-simple" value="sandra@atelier-brunner.test" />
      <IdentityChip icon="phone" value="+41 79 555 41 18" />
    </div>
    {/* Next meeting */}
    <div
      style={{
        marginTop: 18,
        padding: '14px 18px 14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        borderRadius: R.card,
        background: C.surface,
      }}
    >
      <div style={{ width: 16, height: 17, display: 'flex', alignItems: 'center', color: C.ink }}>
        <Icon name="calendar-blank" size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ ...mono(12, 500), color: C.accent }}>tomorrow 14:00</span>
          <span style={{ ...manrope(14, 600), color: C.ink, ...oneLine }}>Abnahme Website Atelier Brunner</span>
        </div>
        <span style={{ ...mono(11), color: C.muted }}>Zoom · Sandra Brunner</span>
      </div>
      <MonoLabel>Next meeting</MonoLabel>
    </div>
    {/* Kinds */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 0 4px' }}>
      <div style={{ flex: 1, display: 'flex', gap: 6 }}>
        <Chip title="All" count={12} selected />
        <Chip title="Mail" count={1} />
        <Chip title="Chats" count={4} />
        <Chip title="Meetings" count={7} />
      </div>
      <span style={{ ...mono(11), color: C.muted, height: 30, display: 'flex', alignItems: 'center' }}>since Oct 2026</span>
    </div>
    {/* Feed */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {feed.map((d, di) => (
        <React.Fragment key={d.label}>
          <DayLabel label={d.label} />
          {d.items.map((item, i) => (
            <FeedRow
              key={i}
              item={item}
              selected={(selection === 'meeting' && di === 0) || (selection === 'chat' && di === 1)}
              attachment={item.attachment}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const MetaRow: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <>
    <span style={{ ...mono(11), color: C.muted }}>{k}</span>
    <span style={{ ...manrope(13, 500), color: C.ink }}>{v}</span>
  </>
);

const SecondaryButton: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      ...manrope(14, 600),
      color: C.ink,
      height: 34,
      padding: '0 14px',
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: R.button,
      background: C.surface,
      border: `1px solid ${C.line}`,
    }}
  >
    {title}
  </div>
);

const MeetingPreview: React.FC = () => (
  <>
    <div style={{ flex: 1, padding: '26px 36px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PreviewHead icon="calendar-blank" source="Calendar · Work · repeats" title="Jour fixe Relaunch" />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 4, alignItems: 'baseline' }}>
          <MetaRow k="when" v="Sun, 22 Nov 2026, 09:00–09:30 (30 min)" />
          <MetaRow k="organizer" v="Sandra Brunner" />
          <MetaRow k="series" v="8 times, since Oct 2026 · next on 29 Nov" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MonoLabel>2 guests</MonoLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {['You', 'Tom Brunner'].map((g) => (
            <div
              key={g}
              style={{ ...manrope(13, 600), color: C.ink, height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', borderRadius: 15, background: C.surface }}
            >
              {g}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MonoLabel>Notes</MonoLabel>
        <div style={{ ...manrope(15, 500), color: C.ink, padding: 18, borderRadius: R.card, background: C.surface }}>
          Stand der Arbeiten, offene Punkte, nächste Schritte.
        </div>
      </div>
    </div>
    <div style={{ padding: '20px 36px', display: 'flex', gap: 10 }}>
      <PrimaryButton title="Open in Calendar" />
      <SecondaryButton title="Show person" />
    </div>
  </>
);

type Bubble = { text: string; sent?: boolean; media?: boolean; match?: boolean } | { day: string };
const bubbles: Bubble[] = [
  { text: 'Könnt ihr euch den Entwurf nächste Woche kurz anschauen?' },
  { text: 'Klar, Dienstag 10 Uhr bei euch im Atelier?', sent: true },
  { text: 'Passt 👍' },
  { day: '18 Nov 2026' },
  { text: 'Document: Offerte_2026-031_Wartung.pdf', media: true },
  { text: 'Hier die Offerte für Hosting und Monitoring, wie besprochen.' },
  { text: 'Danke, schaue ich mir morgen an.', sent: true },
  { day: '21 Nov 2026' },
  { text: 'Hast du die Mail von gestern gesehen?' },
  { text: 'Ja, CHF 180 für die Wartung passt für uns.', sent: true },
  { text: 'Super, dann unterschreibe ich die Offerte heute noch.' },
  { text: 'Perfekt, danke!', sent: true, match: true },
];

const ChatPreview: React.FC = () => (
  <>
    <div style={{ padding: '26px 36px 16px' }}>
      <PreviewHead icon="chat-teardrop" source="WhatsApp · 10 messages" title="Sandra Brunner" />
    </div>
    {/* Scrolled to the match (the last message): the card's bottom shows, older messages run off the top. */}
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 36px 12px' }}>
      <div style={{ padding: 18, borderRadius: R.card, background: C.surface, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bubbles.map((b, i) =>
          'day' in b ? (
            <div key={i} style={{ ...mono(10.5), color: C.muted, textAlign: 'center', padding: '4px 0' }}>
              {b.day}
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', justifyContent: b.sent ? 'flex-end' : 'flex-start', paddingLeft: b.sent ? 48 : 0, paddingRight: b.sent ? 0 : 48 }}>
              <div
                style={{
                  padding: '8px 13px',
                  borderRadius: 15,
                  background: b.match ? C.accentTint : b.sent ? C.accent : C.surfaceSecondary,
                  color: b.match ? C.ink : b.sent ? C.onAccent : C.ink,
                  ...(b.media ? manrope(13, 500) : manrope(13.5, b.match ? 600 : 400)),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {b.media ? (
                  <>
                    <Icon name="file" size={15} color={C.muted} />
                    <span style={{ color: C.muted }}>{b.text}</span>
                  </>
                ) : (
                  b.text
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
    <div style={{ padding: '20px 36px' }}>
      <PrimaryButton title="Open in WhatsApp" />
    </div>
  </>
);

export const PEOPLE_PREVIEW = 492;

export const PeopleScreen: React.FC<{ selection?: FeedSelection }> = ({ selection = 'none' }) => (
  <div style={{ display: 'flex', height: WIN.h - WIN.titleBar - 1 }}>
    <PeopleList />
    <div style={{ width: 1, background: C.line, flexShrink: 0 }} />
    <PersonFeed selection={selection} />
    {selection !== 'none' ? (
      <>
        <div style={{ width: 1, background: C.line, flexShrink: 0 }} />
        <div style={{ width: PEOPLE_PREVIEW - 1, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selection === 'meeting' ? <MeetingPreview /> : <ChatPreview />}
        </div>
      </>
    ) : null}
  </div>
);
