import type { EmojiItem, TextLayer } from '../types';
import { charsToText } from '../types';

export type LayerEntry =
  | { kind: 'text'; item: TextLayer }
  | { kind: 'emoji'; item: EmojiItem };

interface Props {
  layers: LayerEntry[];
  activeTextId: string | null;
  activeEmojiId: string | null;
  onSelectText: (id: string) => void;
  onSelectEmoji: (id: string) => void;
  onAddText: () => void;
  onDeleteText: (id: string) => void;
  onDeleteEmoji: (id: string) => void;
  onBringForward: (kind: 'text' | 'emoji', id: string) => void;
  onSendBackward: (kind: 'text' | 'emoji', id: string) => void;
  onAlign: (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export function LayersPanel({
  layers,
  activeTextId,
  activeEmojiId,
  onSelectText,
  onSelectEmoji,
  onAddText,
  onDeleteText,
  onDeleteEmoji,
  onBringForward,
  onSendBackward,
  onAlign,
}: Props) {
  const hasSelection = !!(activeTextId || activeEmojiId);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Layers</h3>
        <button
          type="button"
          onClick={onAddText}
          className="rounded-lg bg-violet-600/90 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-500"
        >
          + Text
        </button>
      </div>

      {hasSelection && (
        <div className="mb-3 grid grid-cols-3 gap-1">
          {(
            [
              ['left', '⬅'],
              ['center', '⬌'],
              ['right', '➡'],
              ['top', '⬆'],
              ['middle', '⬍'],
              ['bottom', '⬇'],
            ] as const
          ).map(([align, icon]) => (
            <button
              key={align}
              type="button"
              title={`Align ${align}`}
              onClick={() => onAlign(align)}
              className="rounded bg-slate-800 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              {icon}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {[...layers].reverse().map((entry) => {
          const id = entry.item.id;
          const isActive =
            entry.kind === 'text' ? activeTextId === id : activeEmojiId === id;
          const label =
            entry.kind === 'text'
              ? charsToText(entry.item.chars).slice(0, 20) || 'Text'
              : 'Emoji';

          return (
            <div
              key={id}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition ${
                isActive ? 'bg-violet-600/30 ring-1 ring-violet-500/50' : 'bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-slate-200"
                onClick={() =>
                  entry.kind === 'text' ? onSelectText(id) : onSelectEmoji(id)
                }
              >
                <span className="mr-1 opacity-50">{entry.kind === 'text' ? 'T' : '😀'}</span>
                {label}
              </button>
              <button
                type="button"
                title="Bring Forward"
                className="shrink-0 rounded px-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                onClick={() => onBringForward(entry.kind, id)}
              >
                ↑
              </button>
              <button
                type="button"
                title="Send Backward"
                className="shrink-0 rounded px-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                onClick={() => onSendBackward(entry.kind, id)}
              >
                ↓
              </button>
              <button
                type="button"
                title="Delete"
                className="shrink-0 rounded px-1 text-red-400/70 hover:bg-red-900/40 hover:text-red-300"
                onClick={() =>
                  entry.kind === 'text' ? onDeleteText(id) : onDeleteEmoji(id)
                }
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        Click text to edit · Drag to move · Right-click for more · Rotate handle shows angle
      </p>
    </div>
  );
}
