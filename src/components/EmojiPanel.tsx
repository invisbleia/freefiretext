import { useEffect, useState } from 'react';
import { buildDefaultEmojiPaths, loadEmojiPaths } from '../data/emojiFiles';

interface Props {
  onAdd: (src: string) => void;
}

export function EmojiPanel({ onAdd }: Props) {
  const [files, setFiles] = useState<string[]>(buildDefaultEmojiPaths);

  useEffect(() => {
    loadEmojiPaths().then(setFiles);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      <h3 className="mb-3 shrink-0 text-sm font-semibold text-pink-400">Add Meme Emojis</h3>

      {files.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">Loading emojis…</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
            {files.map((file) => {
              const src = `/emoji/${file}`;
              return (
                <button
                  key={file}
                  type="button"
                  onClick={() => onAdd(src)}
                  title=""
                  className="aspect-square overflow-hidden rounded-md border border-slate-700/30 bg-transparent p-0 transition hover:border-pink-500/50 hover:bg-slate-800/30"
                  aria-label="Add emoji to canvas"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="pointer-events-none h-full w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

