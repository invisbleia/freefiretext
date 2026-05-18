import { useEffect, useMemo, useState } from 'react';
import type { BackgroundMode, EmojiItem, TextLayer, CanvasSize } from '../types';
import type { LayerEntry } from './LayersPanel';
import { DraggableEmoji } from './DraggableEmoji';
import { DraggableTextLayer } from './DraggableTextLayer';

interface Props {
  sortedLayers: LayerEntry[];
  activeLayerId: string | null;
  activeEmojiId: string | null;
  selection: { start: number; end: number } | null;
  background: BackgroundMode;
  bloodSplatter: boolean;
  canvasSize: CanvasSize;
  onSelectTextLayer: (id: string) => void;
  onSelectEmoji: (id: string) => void;
  onClearSelection: () => void;
  onTextSelectionChange: (range: { start: number; end: number } | null) => void;
  onTextLayerUpdate: (id: string, patch: Partial<TextLayer>) => void;
  onTextLayerCharsChange: (id: string, chars: TextLayer['chars']) => void;
  onTextLayerRemove: (id: string) => void;
  onTextLayerDuplicate: (id: string) => void;
  onEmojiUpdate: (id: string, patch: Partial<EmojiItem>) => void;
  onEmojiRemove: (id: string) => void;
  onEmojiDuplicate: (id: string) => void;
  onBringForward: (kind: 'text' | 'emoji', id: string) => void;
  onSendBackward: (kind: 'text' | 'emoji', id: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function CanvasPreview({
  sortedLayers,
  activeLayerId,
  activeEmojiId,
  selection,
  background,
  bloodSplatter,
  canvasSize,
  onSelectTextLayer,
  onSelectEmoji,
  onClearSelection,
  onTextSelectionChange,
  onTextLayerUpdate,
  onTextLayerCharsChange,
  onTextLayerRemove,
  onTextLayerDuplicate,
  onEmojiUpdate,
  onEmojiRemove,
  onEmojiDuplicate,
  onBringForward,
  onSendBackward,
  canvasRef,
}: Props) {
  const [activeSnap, setActiveSnap] = useState<{ x?: number; y?: number } | null>(null);

  const otherLayers = useMemo(() => {
    const activeId = activeLayerId || activeEmojiId;
    return sortedLayers
      .filter((l) => l.item.id !== activeId)
      .map((l) => ({ id: l.item.id, x: l.item.x, y: l.item.y }));
  }, [sortedLayers, activeLayerId, activeEmojiId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClearSelection();
        return;
      }

      const isMoveKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      if (isMoveKey && (activeLayerId || activeEmojiId)) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        if (activeLayerId) {
          const layer = sortedLayers.find((l) => l.kind === 'text' && l.item.id === activeLayerId);
          if (layer && layer.kind === 'text') {
            onTextLayerUpdate(activeLayerId, {
              x: Math.max(0, Math.min(100, layer.item.x + dx)),
              y: Math.max(0, Math.min(100, layer.item.y + dy)),
            });
          }
        } else if (activeEmojiId) {
          const emoji = sortedLayers.find((l) => l.kind === 'emoji' && l.item.id === activeEmojiId);
          if (emoji && emoji.kind === 'emoji') {
            onEmojiUpdate(activeEmojiId, {
              x: Math.max(0, Math.min(100, emoji.item.x + dx)),
              y: Math.max(0, Math.min(100, emoji.item.y + dy)),
            });
          }
        }
      }

      if (e.key === 'Delete' && !(e.target instanceof HTMLElement && e.target.isContentEditable)) {
        if (activeLayerId) onTextLayerRemove(activeLayerId);
        else if (activeEmojiId) onEmojiRemove(activeEmojiId);
      }

      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (activeLayerId) onTextLayerDuplicate(activeLayerId);
        else if (activeEmojiId) onEmojiDuplicate(activeEmojiId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    onClearSelection,
    activeLayerId,
    activeEmojiId,
    sortedLayers,
    onTextLayerUpdate,
    onEmojiUpdate,
    onTextLayerRemove,
    onEmojiRemove,
    onTextLayerDuplicate,
    onEmojiDuplicate,
  ]);

  const previewBg =
    background === 'gaming'
      ? 'gaming-bg'
      : background === 'checkerboard'
        ? 'preview-grid'
        : 'preview-transparent';

  const containerStyle = useMemo(() => {
    return {
      aspectRatio: canvasSize.width / canvasSize.height,
    };
  }, [canvasSize]);

  return (
    <div className="relative flex min-h-[320px] flex-1 flex-col">
      <div
        className="relative overflow-hidden rounded-xl border border-slate-700/40"
        onMouseDown={(e) => {
          // If we clicked the container or something that isn't a handle/object, clear selection
          const target = e.target as HTMLElement;
          if (!target.closest('[data-handle]') && !target.closest('.styled-text-layer') && !target.closest('img')) {
            onClearSelection();
          }
        }}
      >
        {/* Preview-only background — never exported */}
        <div
          className={`pointer-events-none absolute inset-0 ${previewBg}`}
          aria-hidden
          data-ui-only
        />

        {/* Export target — always transparent */}
        <div
          ref={canvasRef}
          data-export-root
          className={`relative w-full bg-transparent ${bloodSplatter ? 'blood-splatter' : ''}`}
          style={containerStyle}
        >
          {/* Alignment Guides */}
          {activeSnap && (
            <>
              {activeSnap.x !== undefined && (
                <div 
                  data-ui-only
                  className="pointer-events-none absolute bottom-0 top-0 z-50 w-px border-l border-dashed border-cyan-400"
                  style={{ left: `${activeSnap.x}%` }}
                />
              )}
              {activeSnap.y !== undefined && (
                <div 
                  data-ui-only
                  className="pointer-events-none absolute left-0 right-0 z-50 h-px border-t border-dashed border-cyan-400"
                  style={{ top: `${activeSnap.y}%` }}
                />
              )}
            </>
          )}

          {sortedLayers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-500">
              <div className="rounded-full border border-slate-700/50 bg-slate-800/30 p-6">
                <svg className="h-12 w-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Canvas is empty</p>
                <p className="text-[10px] opacity-60">Add text or emojis from the side panels to start</p>
              </div>
            </div>
          )}
          {sortedLayers.map((entry) =>
            entry.kind === 'text' ? (
              <DraggableTextLayer
                key={entry.item.id}
                layer={entry.item}
                isActive={activeLayerId === entry.item.id}
                selection={activeLayerId === entry.item.id ? selection : null}
                containerRef={canvasRef}
                otherLayers={otherLayers}
                onSelect={onSelectTextLayer}
                onDeselect={onClearSelection}
                onSelectionChange={onTextSelectionChange}
                onUpdate={(patch) => onTextLayerUpdate(entry.item.id, patch)}
                onCharsChange={(chars) => onTextLayerCharsChange(entry.item.id, chars)}
                onRemove={() => onTextLayerRemove(entry.item.id)}
                onDuplicate={() => onTextLayerDuplicate(entry.item.id)}
                onBringForward={() => onBringForward('text', entry.item.id)}
                onSendBackward={() => onSendBackward('text', entry.item.id)}
                onSnapChange={setActiveSnap}
              />
            ) : (
              <DraggableEmoji
                key={entry.item.id}
                emoji={entry.item}
                isActive={activeEmojiId === entry.item.id}
                containerRef={canvasRef}
                otherLayers={otherLayers}
                onSelect={onSelectEmoji}
                onDeselect={onClearSelection}
                onUpdate={(patch) => onEmojiUpdate(entry.item.id, patch)}
                onRemove={() => onEmojiRemove(entry.item.id)}
                onDuplicate={() => onEmojiDuplicate(entry.item.id)}
                onBringForward={() => onBringForward('emoji', entry.item.id)}
                onSendBackward={() => onSendBackward('emoji', entry.item.id)}
                onSnapChange={setActiveSnap}
              />
            )
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Click empty area or press Esc to deselect · Export downloads transparent PNG
      </p>
    </div>
  );
}
