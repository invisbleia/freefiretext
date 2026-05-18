import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharStyle, GlobalStyle, TextLayer } from '../types';
import { charToCss, DEFAULT_GLOBAL, getCharDisplay, rebuildCharsWithExistingStyle, textToChars } from '../types';
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
  onDeselect: () => void;
  onSelectionChange: (range: { start: number; end: number } | null) => void;
  onUpdate: (patch: Partial<TextLayer>) => void;
  onCharsChange: (chars: CharStyle[]) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  otherLayers: { id: string; x: number; y: number }[];
  onSnapChange: (snaps: { x?: number; y?: number } | null) => void;
}

export function DraggableTextLayer({
  layer,
  isActive,
  selection,
  containerRef,
  onSelect,
  onDeselect,
  onSelectionChange,
  onUpdate,
  onCharsChange,
  onRemove,
  onDuplicate,
  onBringForward,
  onSendBackward,
  otherLayers,
  onSnapChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const { startMove, startRotate, liveRotation } = useCanvasTransform({
    containerRef,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    otherLayers,
    onUpdate: (patch) => onUpdate(patch),
    onSnapChange,
  });

  const { menu, open: openMenu, close: closeMenu } = useContextMenu();

  const pointer = usePointerInteraction({
    onClick: () => {
      if (isActive) onDeselect();
      else onSelect(layer.id);
    },
    onDragStart: (e) => {
      if (!isActive) {
        onSelect(layer.id);
        if (rootRef.current) startMove(e, rootRef.current);
        return;
      }
      // If already active, only move if dragging from the designated handle
      const isHandle = (e.target as HTMLElement).closest('[data-drag-handle]');
      if (isHandle && rootRef.current) {
        startMove(e, rootRef.current);
      }
    },
    onLongPress: (e) => {
      openMenu(e as any);
    }
  });

  const pointerEventsProps = isActive ? {} : {
    onPointerDown: pointer.onPointerDown,
    onPointerMove: pointer.onPointerMove,
    onPointerUp: pointer.onPointerUp,
    onTouchStart: pointer.onTouchStart,
    onTouchMove: pointer.onTouchMove,
    onTouchEnd: pointer.onTouchEnd,
  };

  useEffect(() => {
    if (!isActive) {
      window.getSelection()?.removeAllRanges();
    }
  }, [isActive]);

  const menuItems = [
    { label: 'Duplicate', onClick: onDuplicate },
    { label: 'Bring Forward', onClick: onBringForward },
    { label: 'Send Backward', onClick: onSendBackward },
    { divider: true, label: '', onClick: () => {} },
    { label: 'Delete', onClick: onRemove, danger: true },
  ];

  const baseChar = layer.chars[0] || {
    ...DEFAULT_GLOBAL,
    char: '',
  };
  const baseStyle = charToCss(baseChar as CharStyle);

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
        {...pointerEventsProps}
      >
        <TransformFrame
          isActive={isActive}
          rotation={layer.rotation}
          liveRotation={liveRotation}
          accentColor="#a78bfa"
          onRotateStart={(e) => rootRef.current && startRotate(e, rootRef.current)}
        >
          {isActive && (
            <div 
              data-handle 
              data-drag-handle 
              className="absolute inset-0 z-0 cursor-move" 
              onPointerDown={pointer.onPointerDown}
            />
          )}
          <div
            ref={textRef}
            data-placeholder="ENTER TEXT..."
            className="styled-text-layer whitespace-pre-wrap text-center relative z-10 select-none cursor-grab"
            style={{ 
              ...baseStyle,
              minHeight: '1em',
              display: 'block',
            }}
          >
            {layer.chars.map((c, i) => {
              const isSelected = isActive && selection && i >= selection.start && i < selection.end;
              return (
                <span 
                  key={`${i}-${c.char}`} 
                  data-char-index={i} 
                  style={{
                    ...charToCss(c),
                    backgroundColor: isSelected ? 'rgba(167, 139, 250, 0.4)' : undefined,
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
