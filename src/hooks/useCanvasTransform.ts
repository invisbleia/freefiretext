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
  otherLayers?: { id: string; x: number; y: number }[];
  onUpdate: (patch: {
    x?: number;
    y?: number;
    rotation?: number;
    width?: number;
    height?: number;
  }) => void;
  onSnapChange?: (snaps: { x?: number; y?: number } | null) => void;
}

export function useCanvasTransform({
  containerRef,
  x,
  y,
  rotation,
  width,
  height,
  otherLayers = [],
  onUpdate,
  onSnapChange,
}: Options) {
  const dragRef = useRef<MoveState | null>(null);
  const [liveRotation, setLiveRotation] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Keep latest props in refs to avoid recreating listeners on every movement
  const onUpdateRef = useRef(onUpdate);
  const onSnapChangeRef = useRef(onSnapChange);
  const otherLayersRef = useRef(otherLayers);
  
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onSnapChangeRef.current = onSnapChange; }, [onSnapChange]);
  useEffect(() => { otherLayersRef.current = otherLayers; }, [otherLayers]);

  const getCenter = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 };
  }, []);

  const onEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
    setLiveRotation(null);
    onSnapChangeRef.current?.(null);
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
        
        let nextX = state.origX + dx;
        let nextY = state.origY + dy;

        // Snapping logic
        const snapThreshold = 2.0; // percent
        let activeSnapX: number | undefined;
        let activeSnapY: number | undefined;

        // 1. Canvas Center Snapping
        if (Math.abs(nextX - 50) < snapThreshold) {
          nextX = 50;
          activeSnapX = 50;
        }
        if (Math.abs(nextY - 50) < snapThreshold) {
          nextY = 50;
          activeSnapY = 50;
        }
        
        // 2. Cross-Object Snapping
        for (const other of otherLayersRef.current) {
          if (Math.abs(nextX - other.x) < snapThreshold) {
            nextX = other.x;
            activeSnapX = other.x;
          }
          if (Math.abs(nextY - other.y) < snapThreshold) {
            nextY = other.y;
            activeSnapY = other.y;
          }
        }

        // 3. Edge snapping
        if (Math.abs(nextX - 0) < snapThreshold) nextX = 0;
        if (Math.abs(nextX - 100) < snapThreshold) nextX = 100;
        if (Math.abs(nextY - 0) < snapThreshold) nextY = 0;
        if (Math.abs(nextY - 100) < snapThreshold) nextY = 100;

        onSnapChangeRef.current?.(activeSnapX !== undefined || activeSnapY !== undefined 
          ? { x: activeSnapX, y: activeSnapY } 
          : null);

        onUpdateRef.current({
          x: Math.max(0, Math.min(100, nextX)),
          y: Math.max(0, Math.min(100, nextY)),
        });
      }

      if (state.mode === 'rotate') {
        const startAngle = Math.atan2(state.startY - state.centerY, state.startX - state.centerX);
        const currentAngle = Math.atan2(clientY - state.centerY, clientX - state.centerX);
        const delta = ((currentAngle - startAngle) * 180) / Math.PI;
        const next = Math.round(state.origRotation + delta);
        setLiveRotation(next);
        onUpdateRef.current({ rotation: next });
      }

      if (state.mode === 'resize' && state.origWidth !== undefined && state.origHeight !== undefined) {
        const dw = clientX - state.startX;
        const dh = clientY - state.startY;
        onUpdateRef.current({
          width: Math.max(32, state.origWidth + dw),
          height: Math.max(32, state.origHeight + dh),
        });
      }
    },
    [containerRef]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEnd();
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMove, onEnd]);

  return { startMove, startRotate, startResize, isDragging, liveRotation };
}
