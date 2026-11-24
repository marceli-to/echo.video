import React from 'react';
import { C, R, manrope, mono, oneLine } from '../theme';
import { Icon, IconName } from './Icon';
import { MonoLabel } from './parts';

// Settings window (SettingsView.swift): title, pane buttons, hairline, the pane.
// Sources: SourcesView.swift. Agents: AgentsSettings.swift + PrivacySettings.swift building blocks.

export type Pane = 'sources' | 'agents';
export const PANE_SIZE: Record<Pane, { w: number; h: number }> = {
  sources: { w: 880, h: 620 },
  agents: { w: 720, h: 640 },
};
export const SETTINGS_HEADER = 99;

/** macOS switch (Tahoe): accent track, white pill knob. */
export const Switch: React.FC<{ on: boolean; size: 'regular' | 'small' | 'mini' }> = ({ on, size }) => {
  const dims = { regular: { w: 54, h: 24 }, small: { w: 44, h: 20 }, mini: { w: 36, h: 16 } }[size];
  const knobW = Math.round(dims.w * 0.6);
  return (
    <div
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.h / 2,
        background: on ? C.accent : 'rgba(30, 38, 33, 0.09)',
        position: 'relative',
        flexShrink: 0,
        boxShadow: on ? undefined : 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: on ? dims.w - knobW - 2 : 2,
          width: knobW,
          height: dims.h - 4,
          borderRadius: (dims.h - 4) / 2,
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
        }}
      />
    </div>
  );
};

const SmallButton: React.FC<{ children: React.ReactNode; primary?: boolean }> = ({ children, primary }) => (
  <div
    style={{
      ...manrope(13, 600),
      height: 28,
      padding: '0 11px',
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: R.button,
      color: primary ? C.onAccent : C.ink,
      background: primary ? C.accent : C.surface,
      border: primary ? undefined : `1px solid ${C.line}`,
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

const PaneButton: React.FC<{ title: string; icon: IconName; selected: boolean }> = ({ title, icon, selected }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      padding: '6px 12px',
      borderRadius: 8,
      color: selected ? C.ink : C.muted,
      background: selected ? 'rgba(30, 38, 33, 0.08)' : undefined,
    }}
  >
    <Icon name={icon} size={20} />
    <span style={mono(10.5)}>{title}</span>
  </div>
);

// MARK: Sources

const StatusPill: React.FC<{ label?: string }> = ({ label = 'Up to date' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 9px 4px 8px',
      borderRadius: 20,
      background: C.surfaceSecondary,
      flexShrink: 0,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: 3, background: '#28CD41' }} />
    <span style={{ ...mono(10.5), color: 'rgba(30, 38, 33, 0.7)' }}>{label}</span>
  </div>
);

const Divider = () => <div style={{ height: 1, background: C.line }} />;

const SettingsRow: React.FC<{ label: string; trailing?: React.ReactNode; chevron?: boolean }> = ({ label, trailing, chevron }) => (
  <div style={{ minHeight: 22, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ ...manrope(13, 500), color: C.ink, flex: 1, ...oneLine }}>{label}</span>
    {trailing}
    {chevron ? <Icon name="caret-right" size={12.5} color={C.muted} /> : null}
  </div>
);

const SourceCard: React.FC<{
  icon: IconName;
  title: string;
  text: string;
  settings?: React.ReactNode;
  actions?: React.ReactNode;
  stats: string;
  detail: string;
}> = ({ icon, title, text, settings, actions, stats, detail }) => (
  <div style={{ padding: 20, borderRadius: R.card, background: C.surface, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.ink }}>
      <Icon name={icon} size={19} />
      <span style={{ ...manrope(17, 700), flex: 1 }}>{title}</span>
      <Switch on size="small" />
    </div>
    <div style={{ ...manrope(13.5, 500), color: 'rgba(30, 38, 33, 0.8)', lineHeight: 'calc(13.5px * 1.366 + 2px)', paddingTop: 14 }}>{text}</div>
    {settings ? <div style={{ paddingTop: 14 }}>{settings}</div> : null}
    {actions ? <div style={{ paddingTop: 14, display: 'flex', gap: 8 }}>{actions}</div> : null}
    <div style={{ flex: 1, minHeight: 18 }} />
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...mono(11), color: 'rgba(30, 38, 33, 0.7)' }}>{stats}</span>
        <span style={{ ...mono(11), color: C.muted }}>{detail}</span>
      </div>
      <StatusPill />
    </div>
  </div>
);

const SourcesPane: React.FC = () => (
  <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ ...manrope(52, 800), color: C.ink, fontVariantNumeric: 'tabular-nums' }}>61’742</span>
          <span style={{ ...manrope(18, 600), color: C.muted }}>passages read</span>
        </div>
        <div style={{ ...manrope(14.5, 500), color: 'rgba(30, 38, 33, 0.8)', maxWidth: 560 }}>
          Everything is read. écho watches your sources and picks up changes as they happen. Nothing is uploaded; the index is
          encrypted on this Mac.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: C.accent }} />
        <SmallButton>Sync now</SmallButton>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <MonoLabel>Sources</MonoLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SourceCard
          icon="file-text"
          title="Files"
          text="Each folder directly inside becomes a project. Scanned pages are read with on-device text recognition."
          settings={
            <>
              <Divider />
              <div style={{ padding: '9px 0', display: 'flex', alignItems: 'center', gap: 10, color: C.muted }}>
                <Icon name="folder-simple" size={15} />
                <span style={{ ...mono(11.5), color: C.ink, flex: 1 }}>~/Documents/Projekte</span>
                <Icon name="minus-circle" size={15} />
              </div>
              <div style={{ height: 14 }} />
              <Divider />
              <SettingsRow label="Links you drop on écho" trailing={<span style={{ ...mono(11.5), color: C.muted }}>~/Documents/Links</span>} chevron />
              <Divider />
              <SettingsRow label="Fetch title and description when you drop a link" trailing={<Switch on size="mini" />} />
            </>
          }
          actions={<SmallButton>Add folder…</SmallButton>}
          stats="1’284 files · 23 projects"
          detail="synced 2 min ago"
        />
        <SourceCard
          icon="envelope-simple"
          title="Apple Mail"
          text="2 accounts, with the text of attachments (PDF, Word, text…)."
          settings={
            <>
              <Divider />
              <SettingsRow label="Mailboxes" trailing={<span style={{ ...mono(11), color: C.muted }}>All</span>} chevron />
              <Divider />
              <SettingsRow label="Include Trash and Junk" trailing={<Switch on={false} size="mini" />} />
            </>
          }
          stats="18’406 messages · 6’912 threads"
          detail="synced just now"
        />
        <SourceCard
          icon="chat-circle"
          title="iMessage"
          text="iMessage and SMS from the Messages app. Turn on Messages in iCloud to have your full history on this Mac."
          stats="4’215 messages · 86 chats"
          detail="synced just now"
        />
        <SourceCard
          icon="chat-teardrop"
          title="WhatsApp"
          text="Chats and groups from the WhatsApp app. It only keeps what it synced from your phone; import older chats from an export."
          actions={<SmallButton>Import chat export…</SmallButton>}
          stats="9’870 messages · 142 chats"
          detail="synced just now"
        />
        <SourceCard
          icon="lock-simple"
          title="Signal"
          text="Chats and groups from Signal Desktop. Disappearing and view-once messages are left out."
          stats="1’032 messages · 18 chats"
          detail="synced 5 min ago"
        />
        <SourceCard
          icon="calendar-blank"
          title="Calendar"
          text="Meetings appear in each person's timeline. The last 10 years and the next 90 days. écho only ever reads."
          stats="2’318 events · 41 series"
          detail="synced just now"
        />
      </div>
    </div>
  </div>
);

// MARK: Agents

const SectionLabel: React.FC<{ title: string; trailing?: React.ReactNode }> = ({ title, trailing }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ ...mono(10.5), letterSpacing: 1, color: C.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: C.line }} />
    {trailing}
  </div>
);

const Card: React.FC<{ children: React.ReactNode[] }> = ({ children }) => (
  <div style={{ padding: '0 18px', borderRadius: R.row, background: C.surface }}>
    {children.map((c, i) => (
      <React.Fragment key={i}>
        {i > 0 ? <Divider /> : null}
        {c}
      </React.Fragment>
    ))}
  </div>
);

const Note: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ ...mono(10.5), color: C.muted, lineHeight: 'calc(10.5px * 1.32 + 4px)', paddingTop: 10 }}>{children}</div>
);

const shared: { icon: IconName; name: string }[] = [
  { icon: 'envelope-simple', name: 'Mail' },
  { icon: 'chat-circle', name: 'iMessage' },
  { icon: 'chat-teardrop', name: 'WhatsApp' },
  { icon: 'lock-simple', name: 'Signal' },
  { icon: 'file-text', name: 'Files' },
  { icon: 'calendar-blank', name: 'Calendar' },
  { icon: 'note-blank', name: 'Notes' },
  { icon: 'list-checks', name: 'Reminders' },
];

const HELPER = '/Applications/Echo.app/Contents/Helpers/echo-mcp';

const Snippet: React.FC<{ title: string; detail: string; code: string }> = ({ title, detail, code }) => (
  <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ ...manrope(14, 600), color: C.ink }}>{title}</span>
        <span style={{ ...mono(10.5), color: C.muted, lineHeight: 'calc(10.5px * 1.32 + 4px)' }}>{detail}</span>
      </div>
      <SmallButton>
        <Icon name="copy" size={13} />
        Copy
      </SmallButton>
    </div>
    <div
      style={{
        ...mono(11),
        color: C.ink,
        lineHeight: 'calc(11px * 1.32 + 4px)',
        whiteSpace: 'pre-wrap',
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(30, 38, 33, 0.05)',
      }}
    >
      {code}
    </div>
  </div>
);

const log = [
  { time: '14:32', tool: 'Read', detail: 'msg:4182', outcome: 'ok' },
  { time: '14:32', tool: 'Search', detail: 'offerte · with:Sandra Brunner', outcome: '5 results' },
  { time: '14:31', tool: 'person', detail: 'Sandra', outcome: 'ok' },
  { time: '14:31', tool: 'List sources', detail: undefined, outcome: '8 sources' },
];

const AgentsPane: React.FC<{ connected: boolean }> = ({ connected }) => (
  <div style={{ padding: '26px 40px 32px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ ...manrope(14, 500), color: C.muted, maxWidth: 560 }}>
      Let an AI assistant such as Claude search écho for you. What it reads goes to the assistant’s provider so it can answer you.
      Turned off, nothing leaves this Mac.
    </div>
    <div style={{ paddingTop: 30 }}>
      <SectionLabel title="Access" />
    </div>
    <div style={{ paddingTop: 10 }}>
      <Card>
        {[
          <div key="a" style={{ minHeight: 46, padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ ...manrope(14, 600), color: C.ink }}>Let AI assistants search écho</span>
              <span style={{ ...mono(10.5), color: C.muted }}>{connected ? 'on · connected: claude-code' : 'on · no assistant connected'}</span>
            </div>
            <Switch on size="regular" />
          </div>,
        ]}
      </Card>
    </div>
    <Note>Assistants can only search and read. They can't send, change or delete anything. While écho is locked they get nothing.</Note>
    <div style={{ paddingTop: 34 }}>
      <SectionLabel title="What assistants can see" />
    </div>
    <div style={{ paddingTop: 10 }}>
      <Card>
        {shared.map((s) => (
          <div key={s.name} style={{ padding: '9px 0', display: 'flex', alignItems: 'center', gap: 12, color: C.ink }}>
            <div style={{ width: 18, display: 'flex', justifyContent: 'center' }}>
              <Icon name={s.icon} size={15} />
            </div>
            <span style={{ ...manrope(14, 600), flex: 1 }}>{s.name}</span>
            <span style={{ ...mono(10.5), color: C.muted }}>shared</span>
            <Switch on size="small" />
          </div>
        ))}
      </Card>
    </div>
    <Note>A source that's off doesn't exist for assistants: no results, no items, not even a count. Mail attachments follow Mail.</Note>
    <div style={{ paddingTop: 14 }}>
      <Card>
        {[
          <div key="a" style={{ minHeight: 46, padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ ...manrope(14, 600), color: C.ink }}>Include addresses and numbers</span>
              <span style={{ ...mono(10.5), color: C.muted }}>off · names only: “someone at example.com”, “unknown number”</span>
            </div>
            <Switch on={false} size="regular" />
          </div>,
        ]}
      </Card>
    </div>
    <div style={{ paddingTop: 34 }}>
      <SectionLabel title="Set up" />
    </div>
    <div style={{ paddingTop: 10 }}>
      <Card>
        {[
          <Snippet key="cc" title="Claude Code" detail="Run once in Terminal" code={`claude mcp add --scope user echo -- "${HELPER}"`} />,
          <Snippet
            key="cd"
            title="Claude Desktop"
            detail="Add to claude_desktop_config.json (Settings → Developer → Edit Config), then restart Claude"
            code={`{\n  "mcpServers": {\n    "echo": { "command": "${HELPER}" }\n  }\n}`}
          />,
        ]}
      </Card>
    </div>
    <Note>The assistant starts écho if it isn't running.</Note>
    <div style={{ paddingTop: 34 }}>
      <SectionLabel
        title="Access log"
        trailing={
          <div style={{ paddingLeft: 0 }}>
            <SmallButton>Clear…</SmallButton>
          </div>
        }
      />
    </div>
    <div style={{ paddingTop: 10 }}>
      <Card>
        {log.map((e, i) => (
          <div key={i} style={{ padding: '10px 0', display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ ...mono(10.5), color: C.muted, width: 92, flexShrink: 0 }}>{e.time}</span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...manrope(13, 600), color: C.ink }}>{e.tool}</span>
                <span style={{ ...mono(10.5), color: C.muted }}>claude-code</span>
              </div>
              {e.detail ? <span style={{ ...mono(11), color: C.ink }}>{e.detail}</span> : null}
            </div>
            <span style={{ ...mono(10.5), color: C.muted }}>{e.outcome}</span>
          </div>
        ))}
      </Card>
    </div>
    <Note>4 entries · the newest 500 are kept, encrypted with the index. Never content.</Note>
  </div>
);

/** The whole Settings window content. `scroll` moves the pane's content up (pt). */
export const SettingsWindow: React.FC<{
  pane: Pane;
  width?: number;
  height?: number;
  scroll?: number;
  connected?: boolean;
  active?: boolean;
}> = ({ pane, width, height, scroll = 0, connected = false, active = true }) => {
  const size = PANE_SIZE[pane];
  const w = width ?? size.w;
  const h = height ?? size.h + SETTINGS_HEADER;
  const title = pane === 'sources' ? 'Sources' : 'Agents';
  return (
    <div style={{ position: 'relative', width: w, height: h, background: C.ground, color: C.ink, overflow: 'hidden', fontSize: 1, lineHeight: 'normal', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ position: 'absolute', left: 9, top: 9, display: 'flex', gap: 9, zIndex: 2 }}>
        {(active ? ['#FF5F57', '#FEBC2E', '#28C840'] : ['#C9CBC6', '#C9CBC6', '#C9CBC6']).map((c, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
        ))}
      </div>
      <div style={{ padding: '12px 0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span style={{ ...manrope(13, 600), color: C.ink }}>{title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <PaneButton title="General" icon="gear-six" selected={false} />
          <PaneButton title="Sources" icon="envelope-simple" selected={pane === 'sources'} />
          <PaneButton title="Privacy" icon="lock-simple" selected={false} />
          <PaneButton title="Agents" icon="sparkle" selected={pane === 'agents'} />
        </div>
      </div>
      <Divider />
      <div style={{ position: 'relative', overflow: 'hidden', height: h - SETTINGS_HEADER }}>
        <div style={{ width: size.w, margin: '0 auto', transform: `translateY(${-scroll}px)` }}>
          {pane === 'sources' ? <SourcesPane /> : <AgentsPane connected={connected} />}
        </div>
      </div>
    </div>
  );
};
