import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharStyle, GlobalStyle, TextLayer } from '../types';
import { charToCss, DEFAULT_GLOBAL, getCharDisplay, textToChars } from '../types';
import { useCanvasTransform } from '../hooks/useCanvasTransform';
import { useContextMenu, usePointerInteraction } from '../hooks/usePointerInteraction';
import { getCharRangeFromSelection } from '../utils/selection';
import { TransformFrame } from './TransformFrame';
import { ContextMenu } from './ContextMenu';

interface Props {
  layer: TextLayer;
  isActive: boolean;
  selection: { start: number; end: number } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onSelectionChange: (start: number, end: number) => void;
  onUpdate: (patch: Partial<TextLayer>) => void;
  onCharsChange: (chars: CharStyle[]) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export function DraggableTextLayer({
  layer,
  isActive,
  selection,
  containerRef,
  onSelect,
  onSelectionChange,
  onUpdate,
  onCharsChange,
  onRemove,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const { startMove, startRotate, liveRotation } = useCanvasTransform({
    containerRef,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    onUpdate: (patch) => onUpdate(patch),
  });

  const { menu, open: openMenu, close: closeMenu } = useContextMenu();

  const pointer = usePointerInteraction({
    disabled: editing,
    onClick: () => {
      if (!isActive) onSelect(layer.id);
    },
    onDragStart: (e) => {
      if (!isActive) onSelect(layer.id);
      if (rootRef.current) startMove(e, rootRef.current);
    },
    onLongPress: (e) => {
      openMenu(e as any);
    }
  });

  const syncSelection = useCallback(() => {
    if (!isActive || editing) return;
    const range = getCharRangeFromSelection(textRef.current);
    if (range) onSelectionChange(range.start, range.end);
  }, [isActive, editing, onSelectionChange]);

  useEffect(() => {
    document.addEventListener('selectionchange', syncSelection);
    return () => document.removeEventListener('selectionchange', syncSelection);
  }, [syncSelection]);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  useEffect(() => {
    if (!isActive) {
      setEditing(false);
      window.getSelection()?.removeAllRanges();
    }
  }, [isActive]);

  const commitEdit = useCallback(() => {
    const el = editRef.current;
    if (!el) return;
    const newText = el.innerText.replace(/[\n\u00A0]/g, ' ');
    const oldChars = layer.chars;
    const base = oldChars[0];
    const globalFromChar: GlobalStyle = base
      ? {
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
        }
      : DEFAULT_GLOBAL;
    const next = textToChars(newText, globalFromChar).map((c, i) =>
      oldChars[i] ? { ...c, ...oldChars[i], char: c.char } : c
    );
    onCharsChange(next);
    setEditing(false);
  }, [layer.chars, onCharsChange]);

  const menuItems = [
    { label: 'Edit Text', onClick: () => setEditing(true) },
    { label: 'Duplicate', onClick: onDuplicate },
    { label: 'Bring Forward', onClick: onBringForward },
    { label: 'Send Backward', onClick: onSendBackward },
    { divider: true, label: '', onClick: () => {} },
    { label: 'Delete', onClick: onRemove, danger: true },
  ];

  return (
    <>
      <div
        ref={rootRef}
        className={`absolute ${isActive ? 'z-30' : 'z-10'}`}
        style={{
          left: `${layer.x}%`,
          top: `${layer.y}%`,
          transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
          transformOrigin: 'center center',
          zIndex: layer.zIndex,
        }}
        onContextMenu={(e) => {
          if (!('touches' in e)) openMenu(e); // Only use native contextmenu for mouse
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onPointerDown(e);
        }}
        onPointerMove={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onPointerMove(e);
        }}
        onPointerUp={pointer.onPointerUp}
        onTouchStart={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onTouchStart(e);
        }}
        onTouchMove={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onTouchMove(e);
        }}
        onTouchEnd={pointer.onTouchEnd}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          if (isActive) setEditing(true);
        }}
      >
        <TransformFrame
          isActive={isActive && !editing}
          rotation={layer.rotation}
          liveRotation={liveRotation}
          accentColor="#a78bfa"
          onRotateStart={(e) => rootRef.current && startRotate(e, rootRef.current)}
        >
          <div
            ref={editing ? editRef : textRef}
            contentEditable={editing}
            suppressContentEditableWarning={editing}
            className={`styled-text-layer whitespace-pre-wrap text-center ${
              isActive && !editing ? 'cursor-text select-text' : ''
            } ${editing ? 'min-w-[60px] cursor-text outline-none' : 'cursor-grab select-none'}`}
            style={{ userSelect: isActive || editing ? 'text' : 'none' }}
            onBlur={editing ? commitEdit : undefined}
            onKeyDown={
              editing
                ? (e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditing(false);
                    }
                  }
                : undefined
            }
          >
            {layer.chars.map((c, i) => {
              const isSelected = !editing && isActive && selection && i >= selection.start && i < selection.end;
              return (
                <span 
                  key={`${i}-${c.char}`} 
                  data-char-index={i} 
                  style={{
                    ...charToCss(c),
                    backgroundColor: isSelected ? 'rgba(167, 139, 250, 0.5)' : undefined,
                    outline: isSelected ? '2px solid rgba(167, 139, 250, 0.8)' : undefined,
                    borderRadius: isSelected ? '2px' : undefined
                  }}
                >
                  {getCharDisplay(c)}
                </span>
              );
            })}
          </div>
        </TransformFrame>
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={closeMenu} />}
    </>
  );
}
