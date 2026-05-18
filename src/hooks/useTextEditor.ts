import { useCallback, useMemo, useState } from 'react';
import type { BackgroundMode, CharStyle, EmojiItem, GlobalStyle, TextLayer } from '../types';
import {
  applyStyleToRange,
  DEFAULT_GLOBAL,
  textToChars,
} from '../types';
import { normalizeSelectionRange, clearBrowserSelection } from '../utils/selection';
import { PRESETS } from '../presets';
import type { LayerEntry } from '../components/LayersPanel';

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

let zCounter = 10;

function nextZ() {
  return ++zCounter;
}

function createTextLayer(text: string, global: GlobalStyle, overrides?: Partial<TextLayer>): TextLayer {
  return {
    id: newId('text'),
    chars: textToChars(text, global),
    x: 50,
    y: 50,
    rotation: 0,
    zIndex: nextZ(),
    ...overrides,
  };
}

type Align = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

function alignPos(align: Align): Partial<{ x: number; y: number }> {
  switch (align) {
    case 'left':
      return { x: 15 };
    case 'center':
      return { x: 50 };
    case 'right':
      return { x: 85 };
    case 'top':
      return { y: 15 };
    case 'middle':
      return { y: 50 };
    case 'bottom':
      return { y: 85 };
  }
}

export function useTextEditor() {
  const [textLayers, setTextLayers] = useState<TextLayer[]>(() => [
    createTextLayer('POV: FINDING GOLD PLAYER', DEFAULT_GLOBAL),
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(() => null);
  const [activeEmojiId, setActiveEmojiId] = useState<string | null>(null);
  const [global, setGlobal] = useState<GlobalStyle>(DEFAULT_GLOBAL);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [background, setBackground] = useState<BackgroundMode>('transparent');
  const [bloodSplatter, setBloodSplatter] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const activeLayer = useMemo(
    () => (activeLayerId ? textLayers.find((l) => l.id === activeLayerId) ?? null : null),
    [textLayers, activeLayerId]
  );

  const editingLayerId = activeLayerId;

  const sortedLayers = useMemo((): LayerEntry[] => {
    const entries: LayerEntry[] = [
      ...textLayers.map((item) => ({ kind: 'text' as const, item })),
      ...emojis.map((item) => ({ kind: 'emoji' as const, item })),
    ];
    return entries.sort((a, b) => a.item.zIndex - b.item.zIndex);
  }, [textLayers, emojis]);

  const applyToSelection = useCallback(
    (patch: Partial<CharStyle>) => {
      if (!activeLayerId) return;
      setTextLayers((layers) =>
        layers.map((layer) => {
          if (layer.id !== activeLayerId) return layer;
          if (!selection) {
            return { ...layer, chars: layer.chars.map((c) => ({ ...c, ...patch })) };
          }
          return {
            ...layer,
            chars: applyStyleToRange(layer.chars, selection.start, selection.end, patch),
          };
        })
      );
    },
    [activeLayerId, selection]
  );

  const applyGlobalToAll = useCallback(() => {
    if (!activeLayerId) return;
    setTextLayers((layers) =>
      layers.map((layer) => {
        if (layer.id !== activeLayerId) return layer;
        return {
          ...layer,
          chars: layer.chars.map((c) => ({
            ...c,
            strokeWidth: global.strokeWidth,
            strokeColor: global.strokeColor,
            shadowBlur: global.shadowBlur,
            shadowColor: global.shadowColor,
            shadowOffsetX: global.shadowOffsetX,
            shadowOffsetY: global.shadowOffsetY,
            textTransform: global.textTransform,
            fontSize: global.fontSize,
          })),
        };
      })
    );
  }, [activeLayerId, global]);

  const updateSelection = useCallback((start: number, end: number) => {
    setSelection(normalizeSelectionRange(start, end));
  }, []);

  const selectTextLayer = useCallback((id: string) => {
    clearBrowserSelection();
    setActiveLayerId(id);
    setActiveEmojiId(null);
    setSelection(null);
  }, []);

  const selectEmoji = useCallback((id: string) => {
    clearBrowserSelection();
    setActiveEmojiId(id);
    setActiveLayerId(null);
    setSelection(null);
  }, []);

  const clearCanvasSelection = useCallback(() => {
    clearBrowserSelection();
    setActiveLayerId(null);
    setActiveEmojiId(null);
    setSelection(null);
  }, []);

  const addTextLayer = useCallback(() => {
    const layer = createTextLayer('NEW TEXT', global, {
      x: 30 + textLayers.length * 8,
      y: 40 + textLayers.length * 6,
    });
    setTextLayers((prev) => [...prev, layer]);
    setActiveLayerId(layer.id);
    setActiveEmojiId(null);
    setSelection(null);
  }, [global, textLayers.length]);

  const updateTextLayer = useCallback((id: string, patch: Partial<TextLayer>) => {
    setTextLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const updateTextLayerChars = useCallback((id: string, chars: CharStyle[]) => {
    setTextLayers((prev) => prev.map((l) => (l.id === id ? { ...l, chars } : l)));
  }, []);

  const removeTextLayer = useCallback((id: string) => {
    setTextLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length ? next : [createTextLayer('NEW TEXT', DEFAULT_GLOBAL)];
    });
    setActiveLayerId((current) => (current === id ? null : current));
    setSelection(null);
  }, []);

  const duplicateTextLayer = useCallback(
    (id: string) => {
      const src = textLayers.find((l) => l.id === id);
      if (!src) return;
      const copy: TextLayer = {
        ...src,
        id: newId('text'),
        x: src.x + 5,
        y: src.y + 5,
        zIndex: nextZ(),
        chars: src.chars.map((c) => ({ ...c })),
      };
      setTextLayers((prev) => [...prev, copy]);
      setActiveLayerId(copy.id);
      setActiveEmojiId(null);
    },
    [textLayers]
  );

  const addEmoji = useCallback(
    (src: string) => {
      const item: EmojiItem = {
        id: newId('emoji'),
        src,
        x: 40 + emojis.length * 5,
        y: 30,
        width: 80,
        height: 80,
        rotation: 0,
        zIndex: nextZ(),
      };
      setEmojis((prev) => [...prev, item]);
      setActiveEmojiId(item.id);
      setActiveLayerId(null);
      setSelection(null);
    },
    [emojis.length]
  );

  const updateEmoji = useCallback((id: string, patch: Partial<EmojiItem>) => {
    setEmojis((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const removeEmoji = useCallback((id: string) => {
    setEmojis((prev) => prev.filter((e) => e.id !== id));
    setActiveEmojiId((current) => (current === id ? null : current));
  }, []);

  const duplicateEmoji = useCallback(
    (id: string) => {
      const src = emojis.find((e) => e.id === id);
      if (!src) return;
      const copy: EmojiItem = {
        ...src,
        id: newId('emoji'),
        x: src.x + 5,
        y: src.y + 5,
        zIndex: nextZ(),
      };
      setEmojis((prev) => [...prev, copy]);
      setActiveEmojiId(copy.id);
      setActiveLayerId(null);
    },
    [emojis]
  );

  const bringForward = useCallback((kind: 'text' | 'emoji', id: string) => {
    const layer = kind === 'text' 
      ? textLayers.find((l) => l.id === id)
      : emojis.find((e) => e.id === id);
    if (!layer) return;

    const all = [...textLayers, ...emojis].sort((a, b) => a.zIndex - b.zIndex);
    const index = all.findIndex((l) => l.id === id);
    if (index < all.length - 1) {
      const above = all[index + 1];
      const newZ = above.zIndex;
      const oldZ = layer.zIndex;
      
      if (kind === 'text') updateTextLayer(id, { zIndex: newZ });
      else updateEmoji(id, { zIndex: newZ });

      const aboveKind = textLayers.some(l => l.id === above.id) ? 'text' : 'emoji';
      if (aboveKind === 'text') updateTextLayer(above.id, { zIndex: oldZ });
      else updateEmoji(above.id, { zIndex: oldZ });
    } else {
      const z = nextZ();
      if (kind === 'text') updateTextLayer(id, { zIndex: z });
      else updateEmoji(id, { zIndex: z });
    }
  }, [textLayers, emojis, updateTextLayer, updateEmoji]);

  const sendBackward = useCallback((kind: 'text' | 'emoji', id: string) => {
    const layer = kind === 'text' 
      ? textLayers.find((l) => l.id === id)
      : emojis.find((e) => e.id === id);
    if (!layer) return;

    const all = [...textLayers, ...emojis].sort((a, b) => a.zIndex - b.zIndex);
    const index = all.findIndex((l) => l.id === id);
    if (index > 0) {
      const below = all[index - 1];
      const newZ = below.zIndex;
      const oldZ = layer.zIndex;

      if (kind === 'text') updateTextLayer(id, { zIndex: newZ });
      else updateEmoji(id, { zIndex: newZ });

      const belowKind = textLayers.some(l => l.id === below.id) ? 'text' : 'emoji';
      if (belowKind === 'text') updateTextLayer(below.id, { zIndex: oldZ });
      else updateEmoji(below.id, { zIndex: oldZ });
    } else {
      const z = Math.min(...all.map(l => l.zIndex)) - 1;
      if (kind === 'text') updateTextLayer(id, { zIndex: z });
      else updateEmoji(id, { zIndex: z });
    }
  }, [textLayers, emojis, updateTextLayer, updateEmoji]);

  const alignActive = useCallback(
    (align: Align) => {
      const pos = alignPos(align);
      if (activeLayerId) updateTextLayer(activeLayerId, pos);
      if (activeEmojiId) updateEmoji(activeEmojiId, pos);
    },
    [activeLayerId, activeEmojiId, updateTextLayer, updateEmoji]
  );

  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      setActivePreset(presetId);
      setBackground(preset.background);
      setBloodSplatter(!!preset.bloodSplatter);
      const layer: TextLayer = {
        id: newId('text'),
        chars: preset.buildChars(global),
        x: 50,
        y: 50,
        rotation: 0,
        zIndex: nextZ(),
      };
      setTextLayers([layer]);
      setActiveLayerId(layer.id);
      setActiveEmojiId(null);
      setSelection(null);
      if (preset.emojis) {
        setEmojis(
          preset.emojis.map((e) => ({
            id: newId('emoji'),
            src: `/emoji/${e.file}`,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            rotation: 0,
            zIndex: nextZ(),
          }))
        );
      } else {
        setEmojis([]);
      }
    },
    [global]
  );

  const activeLayerRotation = activeLayer?.rotation ?? 0;
  const activeEmoji = emojis.find((e) => e.id === activeEmojiId);

  const setActiveLayerRotation = useCallback(
    (rotation: number) => {
      if (!activeLayerId) return;
      updateTextLayer(activeLayerId, { rotation });
    },
    [activeLayerId, updateTextLayer]
  );

  const setActiveEmojiRotation = useCallback(
    (rotation: number) => {
      if (!activeEmojiId) return;
      updateEmoji(activeEmojiId, { rotation });
    },
    [activeEmojiId, updateEmoji]
  );

  return {
    textLayers,
    sortedLayers,
    activeLayer,
    activeLayerId,
    editingLayerId,
    activeEmojiId,
    activeEmoji,
    global,
    setGlobal,
    selection,
    setSelection: updateSelection,
    applyToSelection,
    applyGlobalToAll,
    emojis,
    addEmoji,
    updateEmoji,
    removeEmoji,
    duplicateEmoji,
    background,
    setBackground,
    bloodSplatter,
    setBloodSplatter,
    activePreset,
    loadPreset,
    selectTextLayer,
    selectEmoji,
    clearCanvasSelection,
    addTextLayer,
    updateTextLayer,
    updateTextLayerChars,
    removeTextLayer,
    duplicateTextLayer,
    bringForward,
    sendBackward,
    alignActive,
    activeLayerRotation,
    activeEmojiRotation: activeEmoji?.rotation ?? 0,
    setActiveLayerRotation,
    setActiveEmojiRotation,
  };
}
