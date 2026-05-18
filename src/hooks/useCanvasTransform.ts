import { useCallback, useEffect, useRef, useState } from 'react';

type DragMode = 'move' | 'rotate' | 'resize';

interface MoveState {
  mode: DragMode;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origRotation: number;
  origWidth?: number;
  origHeight?: number;
  centerX: number;
  centerY: number;
}

interface Options {
  containerRef: React.RefObject<HTMLElement | null>;
  x: number;
  y: number;
  rotation: number;
  width?: number;
  height?: number;
  onUpdate: (patch: {
    x?: number;
    y?: number;
    rotation?: number;
    width?: number;
    height?: number;
  }) => void;
}

export function useCanvasTransform({
  containerRef,
  x,
  y,
  rotation,
  width,
  height,
  onUpdate,
}: Options) {
  const dragRef = useRef<MoveState | null>(null);
  const [liveRotation, setLiveRotation] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getCenter = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 };
  }, []);

  const startMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent, el: HTMLElement) => {
      e.stopPropagation();
      setIsDragging(true);
      const { centerX, centerY } = getCenter(el);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        mode: 'move',
        startX: clientX,
        startY: clientY,
        origX: x,
        origY: y,
        origRotation: rotation,
        centerX,
        centerY,
      };
    },
    [x, y, rotation, getCenter]
  );

  const startRotate = useCallback(
    (e: React.MouseEvent | React.TouchEvent, el: HTMLElement) => {
      e.stopPropagation();
      setIsDragging(true);
      const { centerX, centerY } = getCenter(el);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        mode: 'rotate',
        startX: clientX,
        startY: clientY,
        origX: x,
        origY: y,
        origRotation: rotation,
        centerX,
        centerY,
      };
      setLiveRotation(rotation);
    },
    [x, y, rotation, getCenter]
  );

  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent, el: HTMLElement) => {
      e.stopPropagation();
      setIsDragging(true);
      const { centerX, centerY } = getCenter(el);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        mode: 'resize',
        startX: clientX,
        startY: clientY,
        origX: x,
        origY: y,
        origRotation: rotation,
        origWidth: width,
        origHeight: height,
        centerX,
        centerY,
      };
    },
    [x, y, rotation, width, height, getCenter]
  );

  const onMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const state = dragRef.current;
      const container = containerRef.current;
      if (!state || !container) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (state.mode === 'move') {
        const rect = container.getBoundingClientRect();
        const dx = ((clientX - state.startX) / rect.width) * 100;
        const dy = ((clientY - state.startY) / rect.height) * 100;
        onUpdate({
          x: Math.max(0, Math.min(95, state.origX + dx)),
          y: Math.max(0, Math.min(95, state.origY + dy)),
        });
      }

      if (state.mode === 'rotate') {
        const startAngle = Math.atan2(state.startY - state.centerY, state.startX - state.centerX);
        const currentAngle = Math.atan2(clientY - state.centerY, clientX - state.centerX);
        const delta = ((currentAngle - startAngle) * 180) / Math.PI;
        const next = Math.round(state.origRotation + delta);
        setLiveRotation(next);
        onUpdate({ rotation: next });
      }

      if (state.mode === 'resize' && state.origWidth !== undefined && state.origHeight !== undefined) {
        const dw = clientX - state.startX;
        const dh = clientY - state.startY;
        onUpdate({
          width: Math.max(32, state.origWidth + dw),
          height: Math.max(32, state.origHeight + dh),
        });
      }
    },
    [containerRef, onUpdate]
  );

  const onEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
    setLiveRotation(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [onMove, onEnd]);

  return { startMove, startRotate, startResize, isDragging, liveRotation };
}
