import React from 'react';
import { C, R, WIN, manrope, mono, oneLine } from '../theme';
import { Icon, IconName } from './Icon';
import { DayLabel, FeedRow, HintedLabel, MonoLabel, PreviewHead, PrimaryButton, Snippet } from './parts';
import { recentDays, resultRows } from '../data';

const Split: React.FC<{ list: React.ReactNode; preview: React.ReactNode }> = ({ list, preview }) => (
  <div style={{ display: 'flex', height: WIN.h - WIN.titleBar - 1 }}>
    <div style={{ width: WIN.listWidth, overflow: 'hidden', padding: '24px 32px' }}>{list}</div>
    <div style={{ width: 1, background: C.line }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{preview}</div>
  </div>
);

const segments: { icon: IconName; title?: string }[] = [
  { icon: 'squares-four', title: 'All' },
  { icon: 'envelope-simple' },
  { icon: 'chat-circle' },
  { icon: 'calendar-blank' },
  { icon: 'note-blank' },
  { icon: 'list-checks' },
];

const FilterBar: React.FC<{ searchPressed?: number }> = ({ searchPressed = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: 'rgba(30, 38, 33, 0.07)' }}>
      {segments.map((s) => (
        <div
          key={s.icon}
          style={{
            height: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: s.title ? '0 11px 0 10px' : '0 9px',
            borderRadius: 7,
            color: s.title ? C.ink : C.muted,
            background: s.title ? C.surface : undefined,
            boxShadow: s.title ? '0 1px 3px rgba(0, 0, 0, 0.08)' : undefined,
          }}
        >
          <Icon name={s.icon} size={15} />
          {s.title ? <span style={manrope(13, 600)}>{s.title}</span> : null}
        </div>
      ))}
    </div>
    <div style={{ flex: 1 }} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted }}>
      <span style={mono(11)}>people you know</span>
      <Icon name="caret-down" size={11} />
    </span>
    <div
      style={{
        ...manrope(13, 600),
        color: C.ink,
        height: 28,
        padding: '0 11px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: R.button,
        background: searchPressed > 0 ? C.surfaceSecondary : C.surface,
        border: `1px solid ${C.line}`,
      }}
    >
      <HintedLabel title="Search" keys="⌘K" />
    </div>
  </div>
);

const Footer: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '20px 36px' }}>
    <PrimaryButton title={title} />
  </div>
);

const MetaRow: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <>
    <span style={{ ...mono(11), color: C.muted }}>{k}</span>
    <span style={{ ...manrope(13, 500), color: C.ink }}>{v}</span>
  </>
);

/** Recent: the feed with the done reminder selected, previewed on the right. */
export const RecentScreen: React.FC<{ searchPressed?: number }> = ({ searchPressed }) => (
  <Split
    list={
      <>
        <div style={{ paddingBottom: 4 }}>
          <FilterBar searchPressed={searchPressed} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recentDays.map((d, di) => (
            <React.Fragment key={d.label}>
              <DayLabel label={d.label} />
              {d.items.map((item, i) => (
                <FeedRow key={i} item={item} selected={di === 0 && i === 0} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </>
    }
    preview={
      <>
        <div style={{ flex: 1, padding: '26px 36px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PreviewHead icon="list-checks" source="Reminders · Erinnerungen" title="Offerte Café Linde schicken" />
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 4, alignItems: 'baseline' }}>
            <MetaRow k="done" v="22 Nov 2026 at 17:07" />
            <MetaRow k="created" v="16 Nov 2026 at 18:19" />
          </div>
        </div>
        <Footer title="Open in Reminders" />
      </>
    }
  />
);

const KindChip: React.FC<{ title: string; count: number; selected?: boolean }> = ({ title, count, selected }) => (
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

const Collapsed: React.FC<{ label: string; date: string; text: string }> = ({ label, date, text }) => (
  <div
    style={{
      padding: '11px 16px',
      borderRadius: R.row,
      background: 'rgba(242, 242, 242, 0.55)',
      border: `1px solid ${C.line}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ ...mono(10.5), color: C.muted85, ...oneLine, flex: 1 }}>{label}</span>
      <span style={{ ...mono(11), color: C.muted }}>{date}</span>
    </div>
    <div style={{ ...manrope(13, 500), color: C.muted, ...oneLine }}>{text}</div>
  </div>
);

/** The search as the Recent list (after ↵ in the panel): the mail selected, its thread on the right. */
export const ResultsScreen: React.FC<{ selected?: number }> = ({ selected = 3 }) => (
  <Split
    list={
      <>
        <div
          style={{
            minHeight: 56,
            padding: '12px 12px 12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderRadius: R.card,
            background: C.surface,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxSizing: 'border-box',
          }}
        >
          <Icon name="magnifying-glass" size={18} color={C.ink} />
          <span style={{ ...manrope(18, 500), color: C.ink }}>sandra offerte</span>
          <div style={{ flex: 1 }} />
          <span style={{ ...mono(11), color: C.muted, padding: '6px 0', whiteSpace: 'pre' }}>clear  ⌘⌫</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '20px 0 0 4px' }}>
          <span style={{ ...manrope(30, 800), color: C.ink, fontVariantNumeric: 'tabular-nums' }}>5</span>
          <span style={{ ...manrope(16, 500), color: C.muted, flex: 1 }}>conversations, meetings and files</span>
          <span style={{ ...mono(11), color: C.muted }}>all words · 14 ms</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 0 4px' }}>
          <KindChip title="All" count={5} selected />
          <KindChip title="Mail" count={1} />
          <KindChip title="Chats" count={2} />
          <KindChip title="Files" count={1} />
          <KindChip title="Meetings" count={1} />
          <div style={{ flex: 1 }} />
          <span style={{ ...mono(11), color: C.ink, textDecoration: 'underline', padding: '6px 0' }}>Best match</span>
          <span style={{ ...mono(11), color: C.muted, padding: '6px 0', marginLeft: 4 }}>Newest</span>
        </div>
        <div style={{ paddingTop: 14 }}>
          {resultRows.map((r, i) => (
            <FeedRow key={i} item={r} selected={i === selected} />
          ))}
        </div>
      </>
    }
    preview={
      <>
        <div style={{ padding: '26px 36px 8px' }}>
          <PreviewHead
            icon="envelope-simple"
            source="Mail · 3 messages · 3 Nov – 14 Nov"
            title="Wartung & Betrieb 2027"
            action="Expand all"
          />
        </div>
        <div style={{ flex: 1, padding: '0 36px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Collapsed
            label="You → Sandra Brunner"
            date="14 Nov 2026 at 11:30"
            text="Hallo Sandra Perfekt, dann halten wir das so fest. Ich schicke dir im Dezember die Rechnung für das erste Quartal."
          />
          <Collapsed
            label="Sandra Brunner · sandr…lier-brunner.test → You"
            date="14 Nov 2026 at 09:12"
            text="Hallo zusammen Danke für die Unterlagen. Wir haben das intern besprochen und sind einverstanden."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ ...mono(10.5), color: C.muted85, flex: 1 }}>You → Sandra Brunner</span>
              <span style={{ ...mono(11), color: C.muted }}>3 Nov 2026 at 10:05</span>
            </div>
            <div style={{ borderRadius: R.card, background: C.surface, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
              {/* The body text takes the inherited 13 pt; only the matching words are set at 15 (HighlightedText). */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, ...manrope(13, 500), color: C.ink }}>
                {['Hallo **Sandra**', 'Anbei unsere **Offerte** für Wartung und Betrieb im nächsten Jahr. Hosting, Updates und Monitoring sind pauschal enthalten.', 'Liebe Grüsse\nMarco'].map(
                  (p, i) => (
                    <div key={i} style={{ lineHeight: 'calc(13px * 1.366 + 4px)', whiteSpace: 'pre-line' }}>
                      <Snippet text={p} size={15} tinted />
                    </div>
                  ),
                )}
              </div>
              <div style={{ height: 1, background: C.line, margin: '0 20px' }} />
              <div style={{ padding: '8px 20px' }}>
                <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 10, color: C.ink }}>
                  <Icon name="file-text" size={16.25} />
                  <span style={{ ...manrope(14, 500), flex: 1 }}>Offerte_2026-031_Wartung.pdf</span>
                  <span style={{ ...mono(11, 500), color: C.muted }}>2 pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer title="Open in Mail" />
      </>
    }
  />
);

export { MonoLabel, Snippet };
