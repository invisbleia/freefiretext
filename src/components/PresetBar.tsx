import { PRESETS } from '../presets';

interface Props {
  activePreset: string | null;
  onLoad: (id: string) => void;
}

export function PresetBar({ activePreset, onLoad }: Props) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      <h3 className="mb-3 text-sm font-semibold text-orange-400">Quick Style Presets</h3>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onLoad(p.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activePreset === p.id
                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'border border-slate-600 bg-slate-800 text-slate-300 hover:border-orange-500/50'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
