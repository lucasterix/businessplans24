// Tiny, dependency-free markdown-to-HTML converter for PDF rendering.
// Handles the subset our LLM actually emits:
//   #..#### headers, **bold**, *italic*, `code`, - / * lists, --- hrs,
//   paragraph blocks split on blank lines, soft <br> for single newlines.
// All text is HTML-escaped before markdown tokens are converted, so user
// content can never inject tags.

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

function renderInline(escaped: string): string {
  // escaped is already HTML-escaped. We only inject safe tags.
  return escaped
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`\n]+?)`/g, '<code>$1</code>');
}

/**
 * Convert a markdown-ish paragraph blob to safe HTML.
 * - The outermost heading (# Section title) is stripped because every section
 *   already carries its own heading chrome in the PDF template.
 * - ## subheadings become <h3>, ### become <h4>.
 */
export function renderMarkdown(raw: string): string {
  if (!raw) return '';
  const blocks = raw
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const block of blocks) {
    // Horizontal rule
    if (/^-{3,}$/.test(block)) {
      out.push('<hr class="md-hr" />');
      continue;
    }

    // Heading line
    const h = block.match(/^(#{1,4})\s+(.+?)\s*$/m);
    if (h && h.index === 0 && !block.includes('\n')) {
      const level = h[1].length;
      if (level === 1) continue; // drop top-level heading; section head already exists
      const tag = level === 2 ? 'h3' : level === 3 ? 'h4' : 'h5';
      out.push(`<${tag}>${renderInline(escHtml(h[2]))}</${tag}>`);
      continue;
    }

    // Unordered list (lines starting with - or *)
    if (block.split('\n').every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = block.split('\n').map((l) => l.replace(/^\s*[-*]\s+/, ''));
      out.push(
        `<ul>${items.map((it) => `<li>${renderInline(escHtml(it))}</li>`).join('')}</ul>`
      );
      continue;
    }

    // Paragraph — preserve soft line breaks as <br>
    const inner = block
      .split('\n')
      .map((l) => renderInline(escHtml(l)))
      .join('<br/>');
    out.push(`<p>${inner}</p>`);
  }
  return out.join('\n');
}
