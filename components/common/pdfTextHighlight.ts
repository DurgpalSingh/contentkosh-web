import type { PdfTextHighlightSnapshot } from '@/lib/contentFileViewer.config';

const PDF_TEXT_LAYER_SELECTOR = '.pdf-text-layer';
const PDF_TEXT_HIGHLIGHT_SELECTOR = 'mark.pdf-text-highlight';

function isWithinPdfTextLayer(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return element?.closest(PDF_TEXT_LAYER_SELECTOR) != null;
}

function getTextNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (isWithinPdfTextLayer(node)) nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function getRangeForTextOffsets(root: HTMLElement, start: number, end: number): Range | null {
  const textNodes = getTextNodes(root);
  let textOffset = 0;
  let startNode: Text | null = null;
  let startNodeOffset = 0;
  let endNode: Text | null = null;
  let endNodeOffset = 0;

  for (const textNode of textNodes) {
    const nodeStart = textOffset;
    const nodeEnd = nodeStart + textNode.length;
    if (!startNode && start >= nodeStart && start < nodeEnd) {
      startNode = textNode;
      startNodeOffset = start - nodeStart;
    }
    if (end > nodeStart && end <= nodeEnd) {
      endNode = textNode;
      endNodeOffset = end - nodeStart;
      break;
    }
    textOffset = nodeEnd;
  }

  if (!startNode || !endNode) return null;
  const range = document.createRange();
  range.setStart(startNode, startNodeOffset);
  range.setEnd(endNode, endNodeOffset);
  return range;
}

export function isPdfTextSelection(selection: Selection | null, root: HTMLElement): selection is Selection {
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  return root.contains(range.startContainer) &&
    root.contains(range.endContainer) &&
    isWithinPdfTextLayer(range.startContainer) &&
    isWithinPdfTextLayer(range.endContainer);
}

export function getPdfTextSelectionPageNumbers(range: Range, root: HTMLElement): number[] {
  const getPageNumber = (node: Node): number => {
    const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
    return Number(element?.closest<HTMLElement>('[data-page-number]')?.dataset.pageNumber);
  };
  const startPage = getPageNumber(range.startContainer);
  const endPage = getPageNumber(range.endContainer);
  if (!startPage || !endPage || !root.contains(range.startContainer) || !root.contains(range.endContainer)) return [];

  const firstPage = Math.min(startPage, endPage);
  const lastPage = Math.max(startPage, endPage);
  return Array.from({ length: lastPage - firstPage + 1 }, (_value, index) => firstPage + index);
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

export function createPdfTextHighlightSnapshot(
  root: HTMLElement,
  version: number,
  pageNumbers?: number[]
): PdfTextHighlightSnapshot {
  const pages: PdfTextHighlightSnapshot['pages'] = {};
  const pageElements = pageNumbers
    ? pageNumbers
      .map((pageNumber) => root.querySelector<HTMLElement>(`[data-page-number="${pageNumber}"]`))
      .filter((pageElement): pageElement is HTMLElement => pageElement !== null)
    : Array.from(root.querySelectorAll<HTMLElement>('[data-page-number]'));

  for (const pageElement of pageElements) {
    const pageNumber = pageElement.dataset.pageNumber;
    const textLayer = pageElement.querySelector<HTMLElement>(PDF_TEXT_LAYER_SELECTOR);
    if (!pageNumber || !textLayer) continue;

    const textNodes = getTextNodes(textLayer);
    let textOffset = 0;
    const ranges: Array<{ start: number; end: number }> = [];
    for (const textNode of textNodes) {
      const start = textOffset;
      textOffset += textNode.length;
      if (!textNode.parentElement?.closest(PDF_TEXT_HIGHLIGHT_SELECTOR)) continue;

      const lastRange = ranges[ranges.length - 1];
      if (lastRange?.end === start) {
        lastRange.end = textOffset;
      } else {
        ranges.push({ start, end: textOffset });
      }
    }

    if (ranges.length > 0) {
      pages[pageNumber] = {
        textHash: hashText(textNodes.map((textNode) => textNode.textContent ?? '').join('')),
        ranges,
      };
    }
  }

  return { version, pages };
}

export function parsePdfTextHighlightSnapshot(serialized: string, version: number): PdfTextHighlightSnapshot {
  const value: unknown = JSON.parse(serialized);
  if (!value || typeof value !== 'object') throw new Error('Invalid PDF highlight data.');

  const snapshot = value as Partial<PdfTextHighlightSnapshot>;
  if (
    snapshot.version !== version ||
    !snapshot.pages ||
    typeof snapshot.pages !== 'object' ||
    Array.isArray(snapshot.pages)
  ) {
    throw new Error('Unsupported PDF highlight data.');
  }

  for (const [pageNumber, page] of Object.entries(snapshot.pages)) {
    if (
      !/^[1-9]\d*$/.test(pageNumber) ||
      !page ||
      typeof page.textHash !== 'string' ||
      !/^[a-f0-9]{1,8}$/i.test(page.textHash) ||
      !Array.isArray(page.ranges)
    ) {
      throw new Error('Invalid PDF highlight page data.');
    }
    let previousEnd = -1;
    for (const range of page.ranges) {
      if (
        !range ||
        !Number.isInteger(range.start) ||
        !Number.isInteger(range.end) ||
        range.start < 0 ||
        range.end <= range.start ||
        range.end > 10000000 ||
        range.start < previousEnd
      ) {
        throw new Error('Invalid PDF highlight range data.');
      }
      previousEnd = range.end;
    }
  }

  return snapshot as PdfTextHighlightSnapshot;
}

export function restorePdfTextHighlights(
  root: HTMLElement,
  snapshot: PdfTextHighlightSnapshot,
  pageNumbers?: number[]
): void {
  const pages = pageNumbers
    ? pageNumbers.flatMap((pageNumber) => {
      const page = snapshot.pages[String(pageNumber)];
      return page ? [[String(pageNumber), page] as const] : [];
    })
    : Object.entries(snapshot.pages);

  for (const [pageNumber, page] of pages) {
    const pageSelector = `[data-page-number="${pageNumber}"]`;
    const pageElement = root.matches(pageSelector)
      ? root
      : root.querySelector<HTMLElement>(pageSelector);
    const textLayer = pageElement?.querySelector<HTMLElement>(PDF_TEXT_LAYER_SELECTOR);
    if (!textLayer) continue;

    const textNodes = getTextNodes(textLayer);
    const pageText = textNodes.map((textNode) => textNode.textContent ?? '').join('');
    if (hashText(pageText) !== page.textHash) continue;

    for (const rangeData of [...page.ranges].sort((a, b) => b.start - a.start)) {
      const range = getRangeForTextOffsets(textLayer, rangeData.start, rangeData.end);
      if (range) applyPdfTextHighlight(range, textLayer);
    }
  }
}

export function removePdfTextHighlight(range: Range, root: HTMLElement): number {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const markedTextNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (
      isWithinPdfTextLayer(node) &&
      node.parentElement?.closest(PDF_TEXT_HIGHLIGHT_SELECTOR) &&
      range.intersectsNode(node)
    ) {
      markedTextNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  let removedCharacterCount = 0;
  for (const textNode of markedTextNodes) {
    const mark = textNode.parentElement?.closest(PDF_TEXT_HIGHLIGHT_SELECTOR);
    if (!mark) continue;

    const startOffset = range.startContainer === textNode ? range.startOffset : 0;
    const endOffset = range.endContainer === textNode ? range.endOffset : textNode.length;
    if (endOffset <= startOffset) continue;

    const selectedText = startOffset > 0 ? textNode.splitText(startOffset) : textNode;
    if (endOffset - startOffset < selectedText.length) {
      selectedText.splitText(endOffset - startOffset);
    }

    removedCharacterCount += selectedText.length;
    const replacements: Node[] = [];
    // Each marker wraps one text node, so splitting it produces at most one sibling per side.
    const textBeforeSelection = selectedText.previousSibling;
    const textAfterSelection = selectedText.nextSibling;
    if (textBeforeSelection) {
      const beforeMark = mark.cloneNode(false) as HTMLElement;
      beforeMark.append(textBeforeSelection);
      replacements.push(beforeMark);
    }
    replacements.push(document.createTextNode(selectedText.textContent ?? ''));
    if (textAfterSelection) {
      const afterMark = mark.cloneNode(false) as HTMLElement;
      afterMark.append(textAfterSelection);
      replacements.push(afterMark);
    }
    mark.replaceWith(...replacements);
  }

  return removedCharacterCount;
}
