import React from 'react';
import { C, WIN } from '../theme';
import { TitleBar } from './parts';

/** écho's main window content, 1392 × 832 pt: title bar, hairline, the screen, and overlays (⌘K). */
export const Window: React.FC<{ children: React.ReactNode; overlay?: React.ReactNode }> = ({ children, overlay }) => (
  <div
    style={{
      position: 'relative',
      width: WIN.w,
      height: WIN.h,
      background: C.ground,
      color: C.ink,
      overflow: 'hidden',
      // No inherited text size: every text sets its own, so blocks get no extra line-height strut.
      fontSize: 1,
      lineHeight: 'normal',
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <TitleBar />
    <div style={{ height: 1, background: C.line }} />
    {children}
    {overlay}
  </div>
);
