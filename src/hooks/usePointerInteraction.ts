import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  onClick?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onLongPress?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

/** Distinguish click vs drag using a movement threshold. */
export function usePointerInteraction({
  threshold = 5,
  onClick,
  onDragStart,
  onLongPress,
  disabled = false,
}: Options) {
  const startRef = useRef<{ x: number; y: number; dragging: boolean; longPressTimer?: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      if (disabled || ('button' in e && e.button !== 0)) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const timer = onLongPress 
        ? window.setTimeout(() => {
            if (startRef.current && !startRef.current.dragging) {
              startRef.current.dragging = true; // prevent click
              onLongPress({ clientX, clientY } as any);
            }
          }, 500)
        : undefined;

      startRef.current = { x: clientX, y: clientY, dragging: false, longPressTimer: timer };
    },
    [disabled, onLongPress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      const s = startRef.current;
      if (!s || s.dragging || disabled) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - s.x;
      const dy = clientY - s.y;
      if (Math.hypot(dx, dy) >= threshold) {
        if (s.longPressTimer) clearTimeout(s.longPressTimer);
        s.dragging = true;
        onDragStart?.(e as unknown as React.MouseEvent);
      }
    },
    [threshold, onDragStart, disabled]
  );

  const finish = useCallback(() => {
    const s = startRef.current;
    if (s?.longPressTimer) clearTimeout(s.longPressTimer);
    startRef.current = null;
    if (!s || disabled) return;
    if (!s.dragging) onClick?.();
  }, [onClick, disabled]);

  useEffect(() => {
    const onUp = () => finish();
    const onMove = (e: PointerEvent | TouchEvent) => {
      const s = startRef.current;
      if (!s || s.dragging || disabled) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - s.x;
      const dy = clientY - s.y;
      if (Math.hypot(dx, dy) >= threshold) {
        s.dragging = true;
        onDragStart?.(e as unknown as React.MouseEvent);
      }
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchmove', onMove);
    };
  }, [finish, onDragStart, threshold, disabled]);

  return { onPointerDown, onPointerMove, onPointerUp: finish, onTouchStart: onPointerDown, onTouchMove: onPointerMove, onTouchEnd: finish };
}

export function useContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const open = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setMenu({ x: clientX, y: clientY });
  }, []);

  const close = useCallback(() => setMenu(null), []);

  return { menu, open, close };
}
