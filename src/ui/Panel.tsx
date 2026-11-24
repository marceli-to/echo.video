import React from 'react';
import { C, manrope, mono, oneLine } from '../theme';
import { Icon } from './Icon';
import { KeyHint, MonoLabel, Snippet } from './parts';
import { Match, filterGuide, offMatches, offerteMatches, sandraMatches } from '../data';

export type PanelState = 'guide' | 'sandra' | 'off' | 'offerte';

const results: Record<Exclude<PanelState, 'guide'>, { list: Match[]; count: number; ms: number }> = {
  sandra: { list: sandraMatches, count: 10, ms: 11 },
  off: { list: offMatches, count: 6, ms: 10 },
  offerte: { list: offerteMatches, count: 5, ms: 14 },
};

const MATCHES_MAX = 440;

const SectionHeader: React.FC<{ title: string; trailing?: string }> = ({ title, trailing }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', padding: '14px 20px 6px' }}>
    <MonoLabel>{title}</MonoLabel>
    <div style={{ flex: 1 }} />
    {trailing ? <span style={{ ...mono(11), color: C.muted }}>{trailing}</span> : null}
  </div>
);

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span style={{ ...mono(11), color: C.ink, padding: '4px 9px', borderRadius: 7, background: C.surfaceSecondary }}>{label}</span>
);

const MatchRow: React.FC<{ m: Match; selected: boolean }> = ({ m, selected }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '13px 14px',
      borderRadius: 12,
      background: selected ? C.accentTint : undefined,
    }}
  >
    <div style={{ width: 15, height: 14, display: 'flex', alignItems: 'center', color: C.muted }}>
      <Icon name={m.icon} size={15} />
    </div>
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ ...mono(10.5), color: C.muted85, ...oneLine, flex: 1 }}>{m.label}</span>
        <span style={{ ...mono(10.5), color: C.muted }}>{m.date}</span>
      </div>
      <div style={{ ...manrope(14.5, 600), color: C.ink, ...oneLine }}>{m.title}</div>
      <div style={{ ...manrope(13, 500), color: C.muted, ...oneLine }}>
        <Snippet text={m.snippet} size={13} />
      </div>
    </div>
  </div>
);

/** The ⌘K panel (SearchPanel.swift), 680 wide. */
export const Panel: React.FC<{ text: string; caret: boolean; state: PanelState; selected: number }> = ({
  text,
  caret,
  state,
  selected,
}) => {
  const res = state === 'guide' ? null : results[state];
  const match = res?.list[selected];
  const jump = state === 'sandra';
  const hints: string[] =
    state === 'guide'
      ? ['↵ show', '↑↓ move']
      : ['↵ show in the list', `⌘↵ ${match?.open ?? ''}`, ...(jump ? ['tab with:Sandra Brunner'] : []), '↑↓ move'];
  return (
    <div
      style={{
        width: 680,
        background: C.surface,
        borderRadius: 18,
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 24px 60px rgba(0, 0, 0, 0.28)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Query */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 16px 20px' }}>
        <Icon name="magnifying-glass" size={20} color={C.ink} />
        <div style={{ flex: 1, position: 'relative', ...manrope(20, 500), whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
          {text ? (
            <span style={{ color: C.ink }}>{text}</span>
          ) : (
            <span style={{ color: 'rgba(71, 81, 74, 0.7)', position: 'absolute', left: 0 }}>Search mail, chats, files and meetings</span>
          )}
          <span style={{ width: 2, height: 24, marginLeft: 1, background: caret ? C.ink : 'transparent', position: 'relative', zIndex: 1 }} />
        </div>
        <KeyHint keys="esc" />
      </div>
      <div style={{ height: 1, background: C.line }} />

      <div style={{ paddingBottom: 10 }}>
        {state === 'guide' ? (
          <>
            <SectionHeader title="Filters" trailing="type them or click" />
            <div style={{ padding: '0 10px' }}>
              {filterGuide.map((e) => (
                <div key={e.key} style={{ height: 30, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...mono(12, 500), color: C.ink, width: 118 }}>{e.key}</span>
                  <span style={{ ...manrope(13, 500), color: C.muted, flex: 1, ...oneLine }}>{e.about}</span>
                  <span style={{ ...mono(11), color: C.muted }}>{e.example}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px 4px' }}>
              <span style={{ ...mono(11), color: C.muted, height: 24, display: 'flex', alignItems: 'center' }}>add</span>
              <Chip label="in:mail" />
              <Chip label="in:chats" />
              <Chip label="has:attachment" />
              <Chip label="2026" />
            </div>
            {jump ? (
              <>
                <SectionHeader title="Jump to" />
                <div style={{ padding: '0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 10px', borderRadius: 10 }}>
                    <div
                      style={{
                        ...manrope(22 * 0.36, 800),
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: C.iconTile,
                        color: C.ink,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      SB
                    </div>
                    <span style={{ ...manrope(14, 600), color: C.ink }}>Sandra Brunner</span>
                    <span style={{ ...mono(11), color: C.muted }}>person · Atelier Brunner</span>
                  </div>
                </div>
              </>
            ) : null}
            <SectionHeader title="Matches" trailing={`${res!.count} · all words · ${res!.ms} ms`} />
            <div style={{ maxHeight: MATCHES_MAX, overflow: 'hidden', padding: '0 10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {res!.list.map((m, i) => (
                  <MatchRow key={i} m={m} selected={i === selected} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hints */}
      <div
        style={{
          ...mono(11),
          color: C.muted,
          display: 'flex',
          gap: 18,
          padding: '12px 20px',
          background: C.surfaceSecondary,
          whiteSpace: 'nowrap',
        }}
      >
        {hints.map((h) => (
          <span key={h}>{h}</span>
        ))}
        <div style={{ flex: 1 }} />
        {state !== 'guide' && !jump ? <span>with: in: type: … filters</span> : null}
      </div>
    </div>
  );
};
