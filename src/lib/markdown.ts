import { marked, Renderer } from 'marked';

const renderer = new Renderer();

// Экранирование HTML-тегов в пользовательском вводе
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Переопределяем renderer.html чтобы экранировать сырой HTML в markdown
renderer.html = function ({ text }: { text: string }): string {
  return escapeHtml(text);
};

marked.setOptions({
  gfm: true,
  breaks: false,
  renderer,
});

export function renderMarkdown(md: string): string {
  if (!md) return '';
  return marked.parse(md, { async: false }) as string;
}
