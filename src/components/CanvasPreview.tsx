import { useEffect } from 'react';
import type { BackgroundMode, EmojiItem, TextLayer } from '../types';
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
  onSelectTextLayer: (id: string) => void;
  onSelectEmoji: (id: string) => void;
  onClearSelection: () => void;
  onTextSelectionChange: (start: number, end: number) => void;
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClearSelection]);

  const previewBg =
    background === 'gaming'
      ? 'gaming-bg'
      : background === 'checkerboard'
        ? 'preview-grid'
        : 'preview-transparent';

  return (
    <div className="relative flex min-h-[320px] flex-1 flex-col">
      <div
        className="relative overflow-hidden rounded-xl border border-slate-700/40"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClearSelection();
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
          className={`relative aspect-video w-full bg-transparent ${bloodSplatter ? 'blood-splatter' : ''}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClearSelection();
          }}
        >
          {sortedLayers.map((entry) =>
            entry.kind === 'text' ? (
              <DraggableTextLayer
                key={entry.item.id}
                layer={entry.item}
                isActive={activeLayerId === entry.item.id}
                selection={activeLayerId === entry.item.id ? selection : null}
                containerRef={canvasRef}
                onSelect={onSelectTextLayer}
                onSelectionChange={onTextSelectionChange}
                onUpdate={(patch) => onTextLayerUpdate(entry.item.id, patch)}
                onCharsChange={(chars) => onTextLayerCharsChange(entry.item.id, chars)}
                onRemove={() => onTextLayerRemove(entry.item.id)}
                onDuplicate={() => onTextLayerDuplicate(entry.item.id)}
                onBringForward={() => onBringForward('text', entry.item.id)}
                onSendBackward={() => onSendBackward('text', entry.item.id)}
              />
            ) : (
              <DraggableEmoji
                key={entry.item.id}
                emoji={entry.item}
                isActive={activeEmojiId === entry.item.id}
                containerRef={canvasRef}
                onSelect={onSelectEmoji}
                onUpdate={(patch) => onEmojiUpdate(entry.item.id, patch)}
                onRemove={() => onEmojiRemove(entry.item.id)}
                onDuplicate={() => onEmojiDuplicate(entry.item.id)}
                onBringForward={() => onBringForward('emoji', entry.item.id)}
                onSendBackward={() => onSendBackward('emoji', entry.item.id)}
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
