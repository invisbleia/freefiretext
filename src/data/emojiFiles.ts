/** All PNG meme stickers under public/emoji/emoji/ */
export function buildDefaultEmojiPaths(): string[] {
  return Array.from({ length: 108 }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    return `emoji/${num}.png`;
  });
}

export async function loadEmojiPaths(): Promise<string[]> {
  try {
    const res = await fetch('/emoji/manifest.json');
    if (res.ok) {
      const data = (await res.json()) as { files?: string[] };
      if (data.files?.length) return data.files;
    }
  } catch {
    /* use fallback */
  }
  return buildDefaultEmojiPaths();
}
