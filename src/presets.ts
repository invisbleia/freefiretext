import type { CharStyle, GlobalStyle } from './types';
import type { PresetConfig } from './types';
import { createChar, DEFAULT_GLOBAL } from './types';

function rangeStyle(
  text: string,
  segments: { from: number; to: number; style: Partial<CharStyle> }[],
  global: GlobalStyle = DEFAULT_GLOBAL
): CharStyle[] {
  return text.split('').map((char, i) => {
    const seg = segments.find((s) => i >= s.from && i < s.to);
    return createChar(char, seg?.style ?? {}, global);
  });
}

export const PRESETS: PresetConfig[] = [
  {
    id: 'revenge',
    name: "LET'S REVENGE!",
    text: "LET'S REVENGE!",
    background: 'gaming',
    emojis: [{ file: 'emoji/001.png', x: 72, y: 8, width: 90, height: 90 }],
    buildChars: (g) =>
      rangeStyle("LET'S REVENGE!", [
        {
          from: 0,
          to: 14,
          style: {
            fontFamily: 'Road Rage',
            color: '#FACC15',
            strokeWidth: 4,
            strokeColor: '#1c1917',
            shadowBlur: 18,
            shadowColor: 'rgba(234, 88, 12, 0.9)',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            fontSize: 64,
            textTransform: 'uppercase',
          },
        },
      ], g),
  },
  {
    id: 'pov-gold',
    name: 'POV: FINDING GOLD PLAYER',
    text: 'POV: FINDING GOLD PLAYER',
    background: 'gaming',
    buildChars: (g) => {
      const text = 'POV: FINDING GOLD PLAYER';
      const segments = [
        { from: 0, to: 4, style: { fontFamily: 'Road Rage' as const, color: '#EF4444' } },
        { from: 4, to: 5, style: { color: '#EF4444', fontFamily: 'Bebas Neue' as const } },
        { from: 5, to: 13, style: { fontFamily: 'Bebas Neue' as const, color: '#FACC15' } },
        { from: 13, to: 18, style: { fontFamily: 'Bebas Neue' as const, color: '#22D3EE' } },
        { from: 18, to: 24, style: { fontFamily: 'Bebas Neue' as const, color: '#FACC15' } },
      ];
      return rangeStyle(text, segments, {
        ...g,
        strokeWidth: 2,
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        fontSize: 56,
        textTransform: 'uppercase',
      });
    },
  },
  {
    id: 'someone-coming',
    name: 'SOMEONE IS COMING',
    text: 'SOMEONE IS COMING',
    background: 'gaming',
    bloodSplatter: true,
    emojis: [{ file: 'emoji/012.png', x: 78, y: 55, width: 80, height: 80 }],
    buildChars: (g) =>
      rangeStyle('SOMEONE IS COMING', [
        { from: 0, to: 7, style: { fontFamily: 'Bebas Neue', color: '#FACC15', fontSize: 58 } },
        { from: 7, to: 8, style: { fontFamily: 'Bebas Neue', color: '#FACC15', fontSize: 58 } },
        {
          from: 8,
          to: 10,
          style: { fontFamily: 'Anton', color: '#EF4444', fontSize: 62, strokeWidth: 4 },
        },
        { from: 10, to: 11, style: { fontFamily: 'Bebas Neue', color: '#F8FAFC', fontSize: 58 } },
        { from: 11, to: 18, style: { fontFamily: 'Bebas Neue', color: '#F8FAFC', fontSize: 58 } },
      ], { ...g, strokeWidth: 3, shadowBlur: 6 }),
  },
  {
    id: 'm590',
    name: 'M590 OVERPOWERED',
    text: 'M590 OVERPOWERED',
    background: 'gaming',
    emojis: [{ file: 'emoji/020.png', x: 85, y: 15, width: 75, height: 75 }],
    buildChars: (g) =>
      rangeStyle('M590 OVERPOWERED', [
        {
          from: 0,
          to: 4,
          style: {
            fontFamily: 'Anton',
            color: '#A3E635',
            fontSize: 64,
            strokeWidth: 4,
            strokeColor: '#14532d',
          },
        },
        { from: 4, to: 5, style: { color: '#A3E635', fontFamily: 'Bebas Neue' } },
        {
          from: 5,
          to: 17,
          style: {
            fontFamily: 'Impact',
            color: '#BEF264',
            fontSize: 60,
            strokeWidth: 3,
            strokeColor: '#000',
            shadowBlur: 12,
            shadowColor: 'rgba(0,0,0,0.7)',
          },
        },
      ], g),
  },
  {
    id: 'woodpecker',
    name: 'WOODPECKER X WOODPECKER',
    text: 'WOODPECKER X WOODPECKER',
    background: 'checkerboard',
    buildChars: (g) =>
      rangeStyle('WOODPECKER X WOODPECKER', [
        {
          from: 0,
          to: 10,
          style: {
            fontFamily: 'Permanent Marker',
            color: '#FACC15',
            fontSize: 48,
            strokeWidth: 4,
            strokeColor: '#000',
          },
        },
        {
          from: 10,
          to: 13,
          style: {
            fontFamily: 'Impact',
            color: '#EF4444',
            fontSize: 56,
            strokeWidth: 5,
          },
        },
        {
          from: 13,
          to: 23,
          style: {
            fontFamily: 'Permanent Marker',
            color: '#22D3EE',
            fontSize: 48,
            strokeWidth: 4,
            strokeColor: '#000',
          },
        },
      ], g),
  },
];

export type { PresetConfig };
