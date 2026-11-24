const PDF_TEXT_LAYER_SELECTOR = '.pdf-text-layer';
const PDF_TEXT_HIGHLIGHT_SELECTOR = 'mark.pdf-text-highlight';

function isWithinPdfTextLayer(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return element?.closest(PDF_TEXT_LAYER_SELECTOR) != null;
}

export function isPdfTextSelection(selection: Selection | null, root: HTMLElement): selection is Selection {
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  return root.contains(range.startContainer) &&
    root.contains(range.endContainer) &&
    isWithinPdfTextLayer(range.startContainer) &&
    isWithinPdfTextLayer(range.endContainer);
}

export function applyPdfTextHighlight(range: Range, root: HTMLElement): number {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return 0;

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (isWithinPdfTextLayer(node) && range.intersectsNode(node)) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  let highlightedNodeCount = 0;
  for (const textNode of textNodes) {
    if (textNode.parentElement?.closest(PDF_TEXT_HIGHLIGHT_SELECTOR)) continue;

    const startOffset = range.startContainer === textNode ? range.startOffset : 0;
    const endOffset = range.endContainer === textNode ? range.endOffset : textNode.length;
    if (endOffset <= startOffset) continue;

    const selectedText = startOffset > 0 ? textNode.splitText(startOffset) : textNode;
    if (endOffset - startOffset < selectedText.length) {
      selectedText.splitText(endOffset - startOffset);
    }

    const mark = document.createElement('mark');
    mark.className = 'pdf-text-highlight';
    selectedText.parentNode?.replaceChild(mark, selectedText);
    mark.appendChild(selectedText);
    highlightedNodeCount += 1;
  }

  return highlightedNodeCount;
}

export function clearPdfTextHighlights(root: HTMLElement): number {
  const highlights = Array.from(root.querySelectorAll(PDF_TEXT_HIGHLIGHT_SELECTOR));
  for (const highlight of highlights) {
    const parent = highlight.parentNode;
    highlight.replaceWith(document.createTextNode(highlight.textContent ?? ''));
    parent?.normalize();
  }
  return highlights.length;
}
