import { useEffect, useRef } from 'react';
import type { CharStyle, FontFamily, GlobalStyle, TextLayer, TextTransform } from '../types';
import { charsToText, FONT_OPTIONS } from '../types';

interface Props {
  global: GlobalStyle;
  onGlobalChange: (patch: Partial<GlobalStyle>) => void;
  selection: { start: number; end: number } | null;
  selectedChars: CharStyle[];
  onApplyToSelection: (patch: Partial<CharStyle>) => void;
  onApplyGlobalToAll: () => void;
  activeLayerRotation: number;
  activeEmojiRotation: number;
  activeEmojiX: number;
  activeEmojiY: number;
  activeEmojiWidth: number;
  activeEmojiHeight: number;
  hasActiveLayer: boolean;
  hasActiveEmoji: boolean;
  activeLayer: TextLayer | null;
  onLayerRotationChange: (v: number) => void;
  onEmojiRotationChange: (v: number) => void;
  onEmojiUpdate: (patch: any) => void;
  onTextChange: (text: string) => void;
  onSelectionChange: (range: { start: number; end: number } | null) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium text-slate-400">{children}</label>;
}

function RangeInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>
        {label}: <span className="text-cyan-400">{value}</span>
      </Label>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
    </div>
  );
}

export function StylePanel({
  global,
  onGlobalChange,
  selection,
  selectedChars,
  onApplyToSelection,
  onApplyGlobalToAll,
  activeLayerRotation,
  activeEmojiRotation,
  activeEmojiX,
  activeEmojiY,
  activeEmojiWidth,
  activeEmojiHeight,
  hasActiveLayer,
  hasActiveEmoji,
  activeLayer,
  onLayerRotationChange,
  onEmojiRotationChange,
  onEmojiUpdate,
  onTextChange,
  onSelectionChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSelection = selection !== null && selection.end > selection.start;

  // Sync selection to textarea
  useEffect(() => {
    if (selection && textareaRef.current) {
      textareaRef.current.selectionStart = selection.start;
      textareaRef.current.selectionEnd = selection.end;
    }
  }, [selection]);

  const selectionLabel = hasSelection
    ? `Selected: ${selection!.end - selection!.start} character(s)`
    : 'No selection — changes apply to all text';

  const selColor = hasSelection && selectedChars?.[0] ? selectedChars[0].color : global.color;
  const selFont =
    hasSelection && selectedChars?.[0] ? selectedChars[0].fontFamily : global.fontFamily;

  const activeText = activeLayer ? charsToText(activeLayer.chars) : '';

  return (
    <div className="space-y-4 rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      {hasActiveLayer && (
        <>
          <div className="border-b border-slate-700/60 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Edit Text Content</h3>
              <span className="text-[10px] text-slate-500">Select text to style</span>
            </div>
            <textarea
              ref={textareaRef}
              value={activeText}
              onChange={(e) => onTextChange(e.target.value)}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                // Only update if there's an actual selection
                if (target.selectionStart !== target.selectionEnd) {
                  onSelectionChange({
                    start: target.selectionStart,
                    end: target.selectionEnd,
                  });
                } else if (selection !== null) {
                  // If it was selected and now it's just a cursor, clear it
                  onSelectionChange(null);
                }
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLTextAreaElement;
                // If cursor moved without selection, clear the selection state
                if (target.selectionStart === target.selectionEnd && selection !== null) {
                  onSelectionChange(null);
                }
              }}
              className="w-full min-h-[100px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 shadow-inner focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Type your message..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cyan-400">Styling</h3>
              {hasSelection && (
                <button 
                  onClick={() => onSelectionChange(null)}
                  className="text-[10px] text-cyan-500 hover:text-cyan-400 underline"
                >
                  Deselect all
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {selectionLabel}. {hasSelection ? "Styles apply to highlighted text." : "Styles apply to whole box."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Color {hasSelection ? '(selection)' : '(default)'}</Label>
              <input
                type="color"
                value={selColor}
                onChange={(e) => {
                  const color = e.target.value;
                  if (hasSelection) onApplyToSelection({ color });
                  else onGlobalChange({ color });
                }}
                className="h-9 w-full cursor-pointer rounded border border-slate-600 bg-slate-800"
              />
            </div>
            <div>
              <Label>Font Family</Label>
              <select
                value={selFont}
                onChange={(e) => {
                  const fontFamily = e.target.value as FontFamily;
                  if (hasSelection) onApplyToSelection({ fontFamily });
                  else onGlobalChange({ fontFamily });
                }}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-sm text-slate-200"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-3">
            <h3 className="mb-3 text-sm font-semibold text-violet-400">Stroke / Outline</h3>
            <div className="space-y-3">
              <RangeInput
                label="Thickness"
                value={global.strokeWidth}
                min={0}
                max={12}
                onChange={(strokeWidth) => {
                  onGlobalChange({ strokeWidth });
                  if (hasSelection) onApplyToSelection({ strokeWidth });
                }}
              />
              <div>
                <Label>Stroke Color</Label>
                <input
                  type="color"
                  value={global.strokeColor}
                  onChange={(e) => {
                    const strokeColor = e.target.value;
                    onGlobalChange({ strokeColor });
                    if (hasSelection) onApplyToSelection({ strokeColor });
                  }}
                  className="h-9 w-full cursor-pointer rounded border border-slate-600 bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-3">
            <h3 className="mb-3 text-sm font-semibold text-amber-400">Drop Shadow / Glow</h3>
            <div className="space-y-3">
              <RangeInput
                label="Blur"
                value={global.shadowBlur}
                min={0}
                max={40}
                onChange={(shadowBlur) => {
                  onGlobalChange({ shadowBlur });
                  if (hasSelection) onApplyToSelection({ shadowBlur });
                }}
              />
              <RangeInput
                label="Offset X"
                value={global.shadowOffsetX}
                min={-20}
                max={20}
                onChange={(shadowOffsetX) => {
                  onGlobalChange({ shadowOffsetX });
                  if (hasSelection) onApplyToSelection({ shadowOffsetX });
                }}
              />
              <RangeInput
                label="Offset Y"
                value={global.shadowOffsetY}
                min={-20}
                max={20}
                onChange={(shadowOffsetY) => {
                  onGlobalChange({ shadowOffsetY });
                  if (hasSelection) onApplyToSelection({ shadowOffsetY });
                }}
              />
              <div>
                <Label>Shadow / Glow Color</Label>
                <input
                  type="color"
                  value={global.shadowColor.startsWith('rgba') ? '#000000' : global.shadowColor}
                  onChange={(e) => {
                    const shadowColor = e.target.value;
                    onGlobalChange({ shadowColor });
                    if (hasSelection) onApplyToSelection({ shadowColor });
                  }}
                  className="h-9 w-full cursor-pointer rounded border border-slate-600 bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-3">
            <h3 className="mb-2 text-sm font-semibold text-emerald-400">Case Transform</h3>
            <div className="flex gap-2">
              {(['none', 'uppercase', 'lowercase'] as TextTransform[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onGlobalChange({ textTransform: t });
                    onApplyToSelection({ textTransform: t });
                  }}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    global.textTransform === t
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {t === 'none' ? 'Aa' : t === 'uppercase' ? 'AA' : 'aa'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-700/60 pb-3">
            <RangeInput
              label="Font Size"
              value={global.fontSize}
              min={24}
              max={120}
              onChange={(fontSize) => {
                onGlobalChange({ fontSize });
                if (hasSelection) onApplyToSelection({ fontSize });
              }}
            />
          </div>
        </>
      )}

      {(hasActiveLayer || hasActiveEmoji) && (
        <div className="pt-1">
          <h3 className="mb-3 text-sm font-semibold text-fuchsia-400">Transform & Layout</h3>
          <div className="space-y-3">
            {hasActiveLayer && (
              <RangeInput
                label="Text rotation"
                value={Math.round(activeLayerRotation)}
                min={-180}
                max={180}
                onChange={onLayerRotationChange}
              />
            )}
            {hasActiveEmoji && (
              <>
                <RangeInput
                  label="Emoji Size"
                  value={Math.round(activeEmojiWidth)}
                  min={20}
                  max={400}
                  onChange={(v) => onEmojiUpdate({ width: v, height: v })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <RangeInput
                    label="Position X (%)"
                    value={Math.round(activeEmojiX)}
                    min={0}
                    max={100}
                    onChange={(x) => onEmojiUpdate({ x })}
                  />
                  <RangeInput
                    label="Position Y (%)"
                    value={Math.round(activeEmojiY)}
                    min={0}
                    max={100}
                    onChange={(y) => onEmojiUpdate({ y })}
                  />
                </div>
                <RangeInput
                  label="Emoji rotation"
                  value={Math.round(activeEmojiRotation)}
                  min={-180}
                  max={180}
                  onChange={onEmojiRotationChange}
                />
              </>
            )}
          </div>
        </div>
      )}

      {hasActiveLayer && (
        <button
          type="button"
          onClick={onApplyGlobalToAll}
          className="w-full rounded-lg border border-cyan-600/30 bg-cyan-900/10 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-900/20 hover:border-cyan-500/50"
        >
          ✨ Make all text styles uniform
        </button>
      )}

      {!hasActiveLayer && !hasActiveEmoji && (
        <div className="py-8 text-center text-xs text-slate-500">
          Select a layer to adjust styles
        </div>
      )}
    </div>
  );
}
