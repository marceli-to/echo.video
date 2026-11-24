import React from 'react';
import { staticFile } from 'remotion';

// Phosphor Light, the same SVGs the app bundles. Drawn as a mask so it takes the text colour.
export type IconName =
  | 'magnifying-glass'
  | 'file-text'
  | 'envelope-simple'
  | 'chat-circle'
  | 'chat-teardrop'
  | 'calendar-blank'
  | 'note-blank'
  | 'list-checks'
  | 'squares-four'
  | 'caret-down'
  | 'arrow-elbow-down-left'
  | 'x'
  | 'paperclip'
  | 'gear-six'
  | 'lock-simple'
  | 'sparkle'
  | 'phone'
  | 'copy'
  | 'folder-simple'
  | 'minus-circle'
  | 'caret-right'
  | 'dots-three'
  | 'file';

export const Icon: React.FC<{ name: IconName; size: number; color?: string; style?: React.CSSProperties }> = ({
  name,
  size,
  color = 'currentColor',
  style,
}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
};
