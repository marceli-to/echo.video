// Tokens copied from écho (App/Resources/Assets.xcassets/Colors, Theme.swift, Appearance.swift).
// Light appearance, highlight colour "graphite".
export const C = {
  ink: '#1E2621',
  ground: '#E4E6E0',
  surface: '#F2F2F2',
  surfaceSecondary: '#E9EAE6',
  muted: '#47514A',
  muted85: 'rgba(71, 81, 74, 0.85)',
  line: '#D0D4CB',
  iconTile: '#DADDD5',
  accent: '#474C49', // graphite
  accentTint: '#DCDCDC', // Surface + 13 % of graphite
  onAccent: '#FFFFFF',
  dim: 'rgba(20, 26, 23, 0.22)', // ⌘K overlay
};

export const R = { row: 12, card: 14, button: 8 };

/** Manrope at a weight (SwiftUI .medium = 500, .semibold = 600, .bold = 700, .heavy = 800). */
export const manrope = (size: number, weight = 500): React.CSSProperties => ({
  fontFamily: 'Manrope',
  fontSize: size,
  fontWeight: weight,
  lineHeight: 'normal',
});

// The bundled JetBrains Mono (v2, variable). Note: a Mac with the old JetBrains Mono v1.0 installed
// in ~/Library/Fonts shows that one in écho instead (wider, no ⌘ glyph); the video follows the bundle.
export const mono = (size: number, weight = 400): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', Menlo, monospace",
  fontSize: size,
  fontWeight: weight,
  lineHeight: 'normal',
});

/** One line, cut with … at the end. */
export const oneLine: React.CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
};

/** The window, in points (the app's own snapshot size: 1392 × 832). */
export const WIN = { w: 1392, h: 832, titleBar: 48, listWidth: 816 };
