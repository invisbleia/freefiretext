import type { CanvasSize, EmojiItem, TextLayer } from '../types';
import { CANVAS_SIZES } from '../types';

export type LayerEntry =
  | { kind: 'text'; item: TextLayer; zIndex: number }
  | { kind: 'emoji'; item: EmojiItem; zIndex: number };

interface Props {
  layers: LayerEntry[];
  activeId: string | null;
  canvasSize: CanvasSize;
  onSelect: (kind: 'text' | 'emoji', id: string) => void;
  onRemove: (kind: 'text' | 'emoji', id: string) => void;
  onAddText: () => void;
  onCanvasSizeChange: (size: CanvasSize) => void;
}

export function LayersPanel({
  layers,
  activeId,
  canvasSize,
  onSelect,
  onRemove,
  onAddText,
  onCanvasSizeChange,
}: Props) {
  const hasSelection = activeId !== null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Canvas Settings</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="mb-1 block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Aspect Ratio / Size
            </label>
            <select
              value={CANVAS_SIZES.findIndex(s => s.label === canvasSize.label)}
              onChange={(e) => onCanvasSizeChange(CANVAS_SIZES[Number(e.target.value)])}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {CANVAS_SIZES.map((s, i) => (
                <option key={s.label} value={i}>
                  {s.label} ({s.ratio})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Width (px)
            </label>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1.5 text-xs text-slate-400">
              {canvasSize.width}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Height (px)
            </label>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1.5 text-xs text-slate-400">
              {canvasSize.height}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/60 pt-4">
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

        <div className="max-h-48 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
          {layers.length === 0 ? (
            <p className="py-4 text-center text-[10px] text-slate-500 italic">No layers yet</p>
          ) : (
            layers
              .slice()
              .reverse()
              .map((layer) => {
                const id = layer.item.id;
                const isActive = activeId === id;
                const label =
                  layer.kind === 'text'
                    ? layer.item.chars.map((c) => c.char).join('') || 'Empty Text'
                    : 'Emoji';

                return (
                  <div
                    key={id}
                    className={`group flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-all ${
                      isActive
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-transparent hover:bg-slate-800/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(layer.kind, id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="shrink-0 text-[10px] opacity-40">
                        {layer.kind === 'text' ? 'T' : '😊'}
                      </span>
                      <span
                        className={`truncate text-xs ${
                          isActive ? 'font-medium text-violet-300' : 'text-slate-400'
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(layer.kind, id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
