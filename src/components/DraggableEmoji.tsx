import { useRef } from 'react';
import type { EmojiItem } from '../types';
import { useCanvasTransform } from '../hooks/useCanvasTransform';
import { useContextMenu, usePointerInteraction } from '../hooks/usePointerInteraction';
import { clearBrowserSelection } from '../utils/selection';
import { TransformFrame } from './TransformFrame';
import { ContextMenu } from './ContextMenu';

interface Props {
  emoji: EmojiItem;
  isActive: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onUpdate: (patch: Partial<EmojiItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export function DraggableEmoji({
  emoji,
  isActive,
  containerRef,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { startMove, startRotate, startResize, liveRotation } = useCanvasTransform({
    containerRef,
    x: emoji.x,
    y: emoji.y,
    rotation: emoji.rotation,
    width: emoji.width,
    height: emoji.height,
    onUpdate,
  });

  const { menu, open: openMenu, close: closeMenu } = useContextMenu();

  const pointer = usePointerInteraction({
    onClick: () => onSelect(emoji.id),
    onDragStart: (e) => {
      if (!isActive) onSelect(emoji.id);
      if (rootRef.current) startMove(e, rootRef.current);
    },
    onLongPress: (e) => {
      openMenu(e as any);
    }
  });

  const menuItems = [
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
        className={`absolute ${isActive ? 'z-40' : 'z-20'}`}
        style={{
          left: `${emoji.x}%`,
          top: `${emoji.y}%`,
          width: emoji.width,
          height: emoji.height,
          transform: `rotate(${emoji.rotation}deg)`,
          transformOrigin: 'center center',
          zIndex: emoji.zIndex,
        }}
        onContextMenu={(e) => {
          if (!('touches' in e)) openMenu(e); // Only use native contextmenu for mouse
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          clearBrowserSelection();
          pointer.onPointerDown(e);
        }}
        onPointerMove={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onPointerMove(e);
        }}
        onPointerUp={pointer.onPointerUp}
        onTouchStart={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          clearBrowserSelection();
          pointer.onTouchStart(e);
        }}
        onTouchMove={(e) => {
          if ((e.target as HTMLElement).closest('[data-handle]')) return;
          pointer.onTouchMove(e);
        }}
        onTouchEnd={pointer.onTouchEnd}
      >
        <TransformFrame
          isActive={isActive}
          rotation={emoji.rotation}
          liveRotation={liveRotation}
          accentColor="#f472b6"
          onRotateStart={(e) => rootRef.current && startRotate(e, rootRef.current)}
        >
          <img
            src={emoji.src}
            alt=""
            draggable={false}
            className="pointer-events-none h-full w-full cursor-grab object-contain drop-shadow-lg active:cursor-grabbing"
          />
        </TransformFrame>

        {isActive && (
          <div
            data-handle
            data-ui-only
            className="absolute -bottom-1 -right-1 h-3.5 w-3.5 cursor-se-resize rounded-sm border border-white/50 bg-cyan-500"
            onMouseDown={(e) => rootRef.current && startResize(e, rootRef.current)}
          />
        )}
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={closeMenu} />}
    </>
  );
}
