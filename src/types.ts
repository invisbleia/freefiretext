import type { CSSProperties } from 'react';

export type FontFamily =
  | 'Bebas Neue'
  | 'Impact'
  | 'Anton'
  | 'Road Rage'
  | 'Permanent Marker';

export type TextTransform = 'none' | 'uppercase' | 'lowercase';

export interface CanvasSize {
  label: string;
  width: number;
  height: number;
  ratio: string;
}

export const CANVAS_SIZES: CanvasSize[] = [
  { label: 'YouTube / Desktop', width: 1920, height: 1080, ratio: '16:9' },
  { label: 'TikTok / Shorts', width: 1080, height: 1920, ratio: '9:16' },
  { label: 'Instagram Square', width: 1080, height: 1080, ratio: '1:1' },
  { label: 'Facebook / Twitter', width: 1200, height: 630, ratio: '1.91:1' },
];

export interface CharStyle {
  char: string;
  fontFamily: FontFamily;
  color: string;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  textTransform: TextTransform;
  fontSize: number;
}

export interface TextLayer {
  id: string;
  chars: CharStyle[];
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

export interface GlobalStyle {
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  textTransform: TextTransform;
  fontSize: number;
  fontFamily: FontFamily;
  color: string;
}

export interface EmojiItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export type BackgroundMode = 'gaming' | 'checkerboard' | 'transparent';

export interface PresetConfig {
  id: string;
  name: string;
  text: string;
  background: BackgroundMode;
  bloodSplatter?: boolean;
  emojis?: { file: string; x: number; y: number; width: number; height: number }[];
  buildChars: (defaults: GlobalStyle) => CharStyle[];
}

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Road Rage', label: 'Road Rage' },
  { value: 'Permanent Marker', label: 'Permanent Marker' },
];

export const FONT_CSS: Record<FontFamily, string> = {
  'Bebas Neue': "'Bebas Neue', sans-serif",
  Impact: "Impact, 'Arial Black', sans-serif",
  Anton: "'Anton', sans-serif",
  'Road Rage': "'Road Rage', 'Permanent Marker', cursive",
  'Permanent Marker': "'Permanent Marker', cursive",
};

export const DEFAULT_GLOBAL: GlobalStyle = {
  strokeWidth: 3,
  strokeColor: '#000000',
  shadowBlur: 8,
  shadowColor: 'rgba(0,0,0,0.8)',
  shadowOffsetX: 3,
  shadowOffsetY: 3,
  textTransform: 'uppercase',
  fontSize: 72,
  fontFamily: 'Bebas Neue',
  color: '#ffffff',
};

export function createChar(
  char: string,
  overrides: Partial<CharStyle> = {},
  global: GlobalStyle = DEFAULT_GLOBAL
): CharStyle {
  return {
    char,
    fontFamily: overrides.fontFamily ?? global.fontFamily,
    color: overrides.color ?? global.color,
    strokeWidth: overrides.strokeWidth ?? global.strokeWidth,
    strokeColor: overrides.strokeColor ?? global.strokeColor,
    shadowBlur: overrides.shadowBlur ?? global.shadowBlur,
    shadowColor: overrides.shadowColor ?? global.shadowColor,
    shadowOffsetX: overrides.shadowOffsetX ?? global.shadowOffsetX,
    shadowOffsetY: overrides.shadowOffsetY ?? global.shadowOffsetY,
    textTransform: overrides.textTransform ?? global.textTransform,
    fontSize: overrides.fontSize ?? global.fontSize,
  };
}

export function textToChars(text: string, global: GlobalStyle = DEFAULT_GLOBAL): CharStyle[] {
  return text.split('').map((c) => createChar(c, {}, global));
}

export function rebuildCharsWithExistingStyle(
  newText: string,
  oldChars: CharStyle[]
): CharStyle[] {
  const textToProcess = newText;
  const base = oldChars[0] || DEFAULT_GLOBAL;
  
  // If text was totally cleared or is brand new, start with base styles
  if (oldChars.length === 0) {
    return textToChars(textToProcess, base as GlobalStyle);
  }

  // Simple heuristic: if lengths are same, preserve styles 1:1
  if (newText.length === oldChars.length) {
    return textToChars(textToProcess, base as GlobalStyle).map((c, i) => ({
      ...oldChars[i],
      char: c.char
    }));
  }

  // If text is growing/shrinking, try to preserve the most common style 
  // or the style at the point of change. For simplicity in this generator,
  // we use the base style of the first character for new additions.
  const globalFromChar: GlobalStyle = {
    strokeWidth: base.strokeWidth,
    strokeColor: base.strokeColor,
    shadowBlur: base.shadowBlur,
    shadowColor: base.shadowColor,
    shadowOffsetX: base.shadowOffsetX,
    shadowOffsetY: base.shadowOffsetY,
    textTransform: base.textTransform,
    fontSize: base.fontSize,
    fontFamily: base.fontFamily,
    color: base.color,
  };

  return textToChars(textToProcess, globalFromChar).map((c, i) => {
    // If we have an old char at this index, keep its unique style (like custom colors per letter)
    if (oldChars[i]) {
      return { ...oldChars[i], char: c.char };
    }
    return c;
  });
}

export function charsToText(chars: CharStyle[]): string {
  return chars.map((c) => c.char).join('');
}

export function applyStyleToRange(
  chars: CharStyle[],
  start: number,
  end: number,
  patch: Partial<CharStyle>
): CharStyle[] {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  return chars.map((c, i) => (i >= lo && i < hi ? { ...c, ...patch } : c));
}

export function getCharDisplay(char: CharStyle): string {
  if (char.char === ' ') return '\u00A0';
  switch (char.textTransform) {
    case 'uppercase':
      return char.char.toUpperCase();
    case 'lowercase':
      return char.char.toLowerCase();
    default:
      return char.char;
  }
}

export function charToCss(char: CharStyle): CSSProperties {
  const shadows: string[] = [];
  if (char.shadowBlur > 0 || char.shadowOffsetX !== 0 || char.shadowOffsetY !== 0) {
    shadows.push(
      `${char.shadowOffsetX}px ${char.shadowOffsetY}px ${char.shadowBlur}px ${char.shadowColor}`
    );
  }
  return {
    fontFamily: FONT_CSS[char.fontFamily],
    color: char.color,
    fontSize: `${char.fontSize}px`,
    WebkitTextStroke: char.strokeWidth > 0 ? `${char.strokeWidth}px ${char.strokeColor}` : undefined,
    paintOrder: 'stroke fill',
    textShadow: shadows.length ? shadows.join(', ') : undefined,
    display: 'inline',
    lineHeight: 1.1,
    userSelect: 'text',
    cursor: 'text',
  };
}
