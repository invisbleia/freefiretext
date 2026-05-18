/** Clear browser text selection highlight. */
export function clearBrowserSelection() {
  window.getSelection()?.removeAllRanges();
}

/** Map a DOM Selection inside a char-span container to character indices (end is exclusive). */
export function getCharRangeFromSelection(
  container: HTMLElement | null
): { start: number; end: number } | null {
  if (!container) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const anchor = charIndexFromPoint(container, sel.anchorNode, sel.anchorOffset);
  const focus = charIndexFromPoint(container, sel.focusNode, sel.focusOffset);
  if (anchor === null || focus === null) return null;
  if (anchor === focus && sel.isCollapsed) return { start: anchor, end: anchor };

  const lo = Math.min(anchor, focus);
  const hi = Math.max(anchor, focus);
  return { start: lo, end: hi + 1 };
}

function charIndexFromPoint(
  container: HTMLElement,
  node: Node | null,
  offset: number
): number | null {
  if (!node || !container.contains(node)) return null;

  if (node === container) {
    const spans = container.querySelectorAll('[data-char-index]');
    if (!spans.length) return null;
    if (offset <= 0) return 0;
    const idx = Math.min(offset, spans.length) - 1;
    return Number(spans[idx].getAttribute('data-char-index'));
  }

  let el: Element | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);

  while (el && el !== container) {
    const idx = el.getAttribute('data-char-index');
    if (idx !== null) {
      const index = Number(idx);
      if (node.nodeType === Node.TEXT_NODE && offset >= (node.textContent?.length ?? 0)) {
        return index;
      }
      return index;
    }
    el = el.parentElement;
  }

  const spans = container.querySelectorAll('[data-char-index]');
  for (const span of spans) {
    if (span.contains(node)) return Number(span.getAttribute('data-char-index'));
  }
  return null;
}

/** Normalize any start/end pair to exclusive-end range. */
export function normalizeSelectionRange(
  start: number,
  end: number
): { start: number; end: number } | null {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  if (lo === hi) return null;
  return { start: lo, end: hi };
}
