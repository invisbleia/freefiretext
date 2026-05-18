import { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';
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
  canvasSize: { width: number; height: number };
}

export function ExportButton({ canvasRef, onDeselect, canvasSize }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const el = canvasRef.current;
    if (!el || exporting) return;

    const { width: exportW, height: exportH } = canvasSize;
    setExporting(true);
    onDeselect();
    clearBrowserSelection();
    document.body.classList.add('is-exporting');

    try {
      // Wait for selection UI to hide
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Use html-to-image for better emoji/SVG/shadow support
      const dataUrl = await toPng(el, {
        width: exportW,
        height: exportH,
        style: {
          transform: `scale(${exportW / el.clientWidth})`,
          transformOrigin: 'top left',
          width: `${el.clientWidth}px`,
          height: `${el.clientHeight}px`,
        },
        pixelRatio: 1,
        backgroundColor: 'transparent',
        filter: (node) => {
          if (node instanceof HTMLElement && node.hasAttribute('data-ui-only')) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `free-fire-text-${exportW}x${exportH}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      document.body.classList.remove('is-exporting');
      setExporting(false);
    }
  }, [canvasRef, exporting, canvasSize, onDeselect]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition hover:from-cyan-400 hover:to-violet-500 disabled:opacity-60"
      >
        {exporting ? 'Downloading…' : `Download PNG (${canvasSize.width}x${canvasSize.height})`}
      </button>
    </div>
  );
}
