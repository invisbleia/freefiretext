import type { ReactNode } from 'react';

interface Props {
  isActive: boolean;
  rotation: number;
  liveRotation: number | null;
  accentColor: string;
  children: ReactNode;
  onRotateStart: (e: any) => void;
}

export function TransformFrame({
  isActive,
  rotation,
  liveRotation,
  accentColor,
  children,
  onRotateStart,
}: Props) {
  const angle = Math.round(liveRotation ?? rotation);
  const normalized = ((angle % 360) + 360) % 360;

  return (
    <div className="relative">
      {isActive && (
        <>
          <div
            data-handle
            data-drag-handle
            data-ui-only
            className="absolute -inset-4 cursor-move rounded-sm border-2 border-dashed opacity-80"
            style={{ borderColor: accentColor }}
          />

          <div
            data-ui-only
            className="pointer-events-none absolute left-1/2 top-full h-8 w-px -translate-x-1/2"
            style={{ backgroundColor: accentColor, opacity: 0.6 }}
          />

          <button
            type="button"
            data-handle
            data-ui-only
            title={`Rotate (${normalized}°)`}
            onMouseDown={onRotateStart}
            onTouchStart={onRotateStart}
            className="absolute left-1/2 top-[calc(100%+2.5rem)] z-50 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-slate-900/90 shadow-xl transition hover:scale-110 sm:h-7 sm:w-7 sm:top-[calc(100%+2rem)]"
            style={{ borderColor: accentColor, cursor: 'grab' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke={accentColor} strokeWidth="2.5">
              <path d="M12 4a8 8 0 1 1-7.8 6.2M12 4V1m0 3l2.5-2.5" strokeLinecap="round" />
            </svg>
          </button>

          <div
            data-ui-only
            className="pointer-events-none absolute left-1/2 top-[calc(100%+2.5rem)] z-50 -translate-x-1/2 translate-y-6 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-lg sm:top-[calc(100%+2rem)] sm:translate-y-4"
            style={{ backgroundColor: accentColor }}
          >
            {normalized}°
          </div>
        </>
      )}

      {children}
    </div>
  );
}
