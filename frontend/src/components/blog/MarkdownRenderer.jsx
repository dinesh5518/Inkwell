/**
 * Simple Markdown-to-HTML renderer
 * Handles headings, bold, italic, code, links, blockquotes, lists, images
 */
const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Code blocks (before inline code to avoid conflicts)
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="language-${lang || 'text'}"><code>${code.trim()}</code></pre>`
    )

    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Horizontal rule
    .replace(/^---$/gm, '<hr />')

    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Unordered lists
    .replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>')

    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

    // Paragraphs (double newline = paragraph break)
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') ||
          trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr') ||
          trimmed.startsWith('<img')) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  return html;
};

const MarkdownRenderer = ({ content }) => {
  const html = renderMarkdown(content);

  return (
    <div
      className="prose-content text-gray-800 dark:text-gray-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownRenderer;
