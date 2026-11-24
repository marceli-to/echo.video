import React from 'react';
import { C, R, WIN, manrope, mono, oneLine } from '../theme';
import { Icon, IconName } from './Icon';
import type { FeedItem } from '../data';

/** "Hallo **Sandra** …": matches bold in ink (rows) or tinted (preview). */
export const Snippet: React.FC<{ text: string; size: number; tinted?: boolean }> = ({ text, size, tinted }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <span
            key={i}
            style={{
              ...manrope(size, 600),
              color: C.ink,
              background: tinted ? C.accentTint : undefined,
            }}
          >
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

/** Small uppercase label with tracking (MonoLabel). */
export const MonoLabel: React.FC<{ children: string }> = ({ children }) => (
  <span style={{ ...mono(10.5), letterSpacing: 1.2, color: C.muted, textTransform: 'uppercase' }}>{children}</span>
);

export const KeyHint: React.FC<{ keys: string }> = ({ keys }) => (
  <span
    style={{
      ...mono(10.5),
      color: C.muted,
      padding: '3px 6px',
      border: `1px solid ${C.line}`,
      borderRadius: 6,
    }}
  >
    {keys}
  </span>
);

/** Title + ↵ drawn (HintedLabel). */
export const HintedLabel: React.FC<{ title: string; keys?: string; iconSize?: number }> = ({ title, keys = '', iconSize = 13 }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span>{title}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.6 }}>
      {keys ? <span style={mono(11)}>{keys}</span> : null}
      {keys ? null : <Icon name="arrow-elbow-down-left" size={iconSize} />}
    </span>
  </span>
);

export const PrimaryButton: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      ...manrope(14, 600),
      color: C.onAccent,
      background: C.accent,
      height: 34,
      padding: '0 14px',
      borderRadius: R.button,
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    <HintedLabel title={title} />
  </div>
);

/** A Recent row (FeedRowLayout): icon, mono label + time, title, one line of snippet. */
export const FeedRow: React.FC<{ item: FeedItem; selected?: boolean; selectedAmount?: number }> = ({
  item,
  selected,
  selectedAmount,
}) => {
  const amount = selectedAmount ?? (selected ? 1 : 0);
  const time = <span style={{ ...mono(11), color: C.muted, flexShrink: 0 }}>{item.time}</span>;
  const title = <div style={{ ...manrope(15, 600), ...oneLine }}>{item.title}</div>;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '16px 18px',
        borderRadius: R.row,
      }}
    >
      {amount > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: R.row,
            background: C.surface,
            border: `1px solid rgba(30, 38, 33, 0.14)`,
            boxShadow: '0 3px 5px rgba(0, 0, 0, 0.05)',
            opacity: amount,
          }}
        />
      ) : null}
      <div style={{ position: 'relative', width: 16, height: item.meta ? 15 : 21, display: 'flex', alignItems: 'center' }}>
        <Icon name={item.icon} size={16} color={C.ink} />
      </div>
      <div style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {item.meta ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ ...mono(10.5), color: C.muted85, ...oneLine, flex: 1 }}>{item.meta}</span>
              {time}
            </div>
            {title}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>{title}</div>
            {time}
          </div>
        )}
        {item.snippet ? (
          <div style={{ ...manrope(13.5, 400), color: C.muted, ...oneLine }}>
            <Snippet text={item.snippet} size={13.5} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Day header in the list. */
export const DayLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ padding: '22px 16px 8px' }}>
    <MonoLabel>{label}</MonoLabel>
  </div>
);

/** Source line + title on top of every preview (PreviewHead). */
export const PreviewHead: React.FC<{ icon: IconName; source: string; title: string; action?: string }> = ({
  icon,
  source,
  title,
  action,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted }}>
      <Icon name={icon} size={13} />
      <span style={{ ...mono(11), flex: 1 }}>{source}</span>
      {action ? <span style={{ ...mono(11), color: C.accent }}>{action}</span> : null}
    </div>
    <div style={{ ...manrope(22, 700), color: C.ink }}>{title}</div>
  </div>
);

const ViewTab: React.FC<{ title: string; keys: string; selected: boolean }> = ({ title, keys, selected }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      color: selected ? C.ink : C.muted,
      padding: '6px 12px 6px 14px',
      borderRadius: 8,
      background: selected ? C.surface : undefined,
      boxShadow: selected ? '0 1px 3px rgba(0, 0, 0, 0.08)' : undefined,
    }}
  >
    <span style={manrope(13, 600)}>{title}</span>
    <span style={mono(10.5)}>{keys}</span>
  </div>
);

/** Title bar: traffic lights, "écho", Recent / People tabs, sync status. */
export const TitleBar: React.FC = () => (
  <div style={{ position: 'relative', height: WIN.titleBar, display: 'flex', alignItems: 'center', padding: '0 18px 0 100px' }}>
    <div style={{ position: 'absolute', left: 17, top: 17, display: 'flex', gap: 9 }}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div
          key={c}
          style={{ width: 14, height: 14, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
        />
      ))}
    </div>
    <span style={{ ...manrope(15, 700), color: C.ink }}>écho</span>
    <div style={{ flex: 1 }} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4DB059' }} />
      <span style={{ ...mono(11), color: C.muted }}>up to date</span>
    </span>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: 2,
        padding: 3,
        borderRadius: 10,
        background: 'rgba(30, 38, 33, 0.07)',
      }}
    >
      <ViewTab title="Recent" keys="⌘1" selected />
      <ViewTab title="People" keys="⌘2" selected={false} />
    </div>
  </div>
);
