import { useMemo, useRef } from 'react';
import { CanvasPreview } from './components/CanvasPreview';
import { EmojiPanel } from './components/EmojiPanel';
import { ExportButton } from './components/ExportButton';
import { LayersPanel } from './components/LayersPanel';
import { PresetBar } from './components/PresetBar';
import { StylePanel } from './components/StylePanel';
import { useTextEditor } from './hooks/useTextEditor';
import type { BackgroundMode } from './types';

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const editor = useTextEditor();

  const selectedChars = useMemo(() => {
    if (!editor.selection || !editor.activeLayer) return [];
    return editor.activeLayer.chars.slice(editor.selection.start, editor.selection.end);
  }, [editor.selection, editor.activeLayer]);

  return (
    <div className="min-h-screen select-none bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-500 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl">
              FREE FIRE TEXT GENERATOR
            </h1>
            <p className="text-xs text-slate-500">Click · drag · rotate · right-click — free & easy</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Background</label>
            <select
              value={editor.background}
              onChange={(e) => editor.setBackground(e.target.value as BackgroundMode)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200"
            >
              <option value="gaming">Gaming Blur</option>
              <option value="checkerboard">Checkerboard</option>
              <option value="transparent">Transparent</option>
            </select>
            <label className="ml-2 flex items-center gap-1 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={editor.bloodSplatter}
                onChange={(e) => editor.setBloodSplatter(e.target.checked)}
                className="accent-red-500"
              />
              Blood FX
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[300px_1fr_minmax(260px,340px)]">
        <aside className="flex flex-col gap-4 overflow-y-auto lg:max-h-[calc(100vh-88px)]">
          <LayersPanel
            layers={editor.sortedLayers}
            activeTextId={editor.activeLayerId}
            activeEmojiId={editor.activeEmojiId}
            onSelectText={editor.selectTextLayer}
            onSelectEmoji={editor.selectEmoji}
            onAddText={editor.addTextLayer}
            onDeleteText={editor.removeTextLayer}
            onDeleteEmoji={editor.removeEmoji}
            onBringForward={editor.bringForward}
            onSendBackward={editor.sendBackward}
            onAlign={editor.alignActive}
          />
          <PresetBar activePreset={editor.activePreset} onLoad={editor.loadPreset} />
          <StylePanel
            global={editor.global}
            onGlobalChange={(patch) => editor.setGlobal((g) => ({ ...g, ...patch }))}
            selection={editor.selection}
            selectedChars={selectedChars}
            onApplyToSelection={editor.applyToSelection}
            onApplyGlobalToAll={editor.applyGlobalToAll}
            activeLayerRotation={editor.activeLayerRotation}
            activeEmojiRotation={editor.activeEmojiRotation}
            hasActiveLayer={!!editor.activeLayerId}
            hasActiveEmoji={!!editor.activeEmojiId}
            onLayerRotationChange={editor.setActiveLayerRotation}
            onEmojiRotationChange={editor.setActiveEmojiRotation}
          />
        </aside>

        <section className="flex min-h-[400px] flex-col gap-4">
          <CanvasPreview
            sortedLayers={editor.sortedLayers}
            activeLayerId={editor.activeLayerId}
            activeEmojiId={editor.activeEmojiId}
            selection={editor.selection}
            background={editor.background}
            bloodSplatter={editor.bloodSplatter}
            onSelectTextLayer={editor.selectTextLayer}
            onSelectEmoji={editor.selectEmoji}
            onClearSelection={editor.clearCanvasSelection}
            onTextSelectionChange={editor.setSelection}
            onTextLayerUpdate={editor.updateTextLayer}
            onTextLayerCharsChange={editor.updateTextLayerChars}
            onTextLayerRemove={editor.removeTextLayer}
            onTextLayerDuplicate={editor.duplicateTextLayer}
            onEmojiUpdate={editor.updateEmoji}
            onEmojiRemove={editor.removeEmoji}
            onEmojiDuplicate={editor.duplicateEmoji}
            onBringForward={editor.bringForward}
            onSendBackward={editor.sendBackward}
            canvasRef={canvasRef}
          />
          <ExportButton canvasRef={canvasRef} onDeselect={editor.clearCanvasSelection} />
        </section>

        <aside className="flex min-h-[calc(100vh-88px)] flex-col lg:sticky lg:top-[72px] lg:self-start">
          <EmojiPanel onAdd={editor.addEmoji} />
        </aside>
      </main>
    </div>
  );
}

export default App;
