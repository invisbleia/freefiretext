import { useEffect } from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('pointerdown', close);
    window.addEventListener('contextmenu', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('contextmenu', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-[9999] min-w-[168px] overflow-hidden rounded-lg border border-slate-600 bg-slate-900 py-1 shadow-2xl"
      style={{ left: Math.min(x, window.innerWidth - 168), top: Math.min(y, window.innerHeight - 200) }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-slate-700" />
        ) : (
          <button
            key={i}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.onClick();
              onClose();
            }}
            className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-800 ${
              item.danger ? 'text-red-400' : 'text-slate-200'
            }`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
