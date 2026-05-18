import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import { clearBrowserSelection } from '../utils/selection';

const EXPORT_SIZES = [
  { label: '1280 × 720 (HD)', width: 1280, height: 720 },
  { label: '1920 × 1080 (FHD)', width: 1920, height: 1080 },
  { label: '1080 × 1080 (Square)', width: 1080, height: 1080 },
  { label: '854 × 480 (SD)', width: 854, height: 480 },
];

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDeselect: () => void;
}

export function ExportButton({ canvasRef, onDeselect }: Props) {
  const [exporting, setExporting] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(0);

  const handleExport = useCallback(async () => {
    const el = canvasRef.current;
    if (!el || exporting) return;

    const { width: exportW, height: exportH } = EXPORT_SIZES[sizeIndex];
    setExporting(true);
    onDeselect();
    clearBrowserSelection();
    document.body.classList.add('is-exporting');

    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const scaleX = exportW / el.clientWidth;
      const scaleY = exportH / el.clientHeight;
      const scale = Math.min(scaleX, scaleY);

      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale,
        useCORS: true,
        logging: false,
        ignoreElements: (node) => {
          if (node instanceof HTMLElement) {
            return node.hasAttribute('data-ui-only');
          }
          return false;
        },
      });

      const out = document.createElement('canvas');
      out.width = exportW;
      out.height = exportH;
      const ctx = out.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.clearRect(0, 0, exportW, exportH);
      const offsetX = (exportW - canvas.width) / 2;
      const offsetY = (exportH - canvas.height) / 2;
      ctx.drawImage(canvas, offsetX, offsetY);

      const link = document.createElement('a');
      link.download = `free-fire-text-${exportW}x${exportH}-${Date.now()}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      document.body.classList.remove('is-exporting');
      setExporting(false);
    }
  }, [canvasRef, exporting, sizeIndex, onDeselect]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          value={sizeIndex}
          onChange={(e) => setSizeIndex(Number(e.target.value))}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-xs text-slate-200"
        >
          {EXPORT_SIZES.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition hover:from-cyan-400 hover:to-violet-500 disabled:opacity-60"
      >
        {exporting ? 'Downloading…' : 'Download PNG (Transparent)'}
      </button>
    </div>
  );
}
