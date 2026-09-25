const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function mdToHtml(md) {
  // Pre-formatting code blocks
  const codeBlocks = [];
  let html = md.replace(/```([a-z]*)\r?\n([\s\S]*?)```/g, (m, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    codeBlocks.push(
      `<pre><code>${code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</code></pre>`
    );
    return placeholder;
  });

  // Escape HTML in prose
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`___CODE_BLOCK_${i}___`, block);
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr/>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gim, (match) => {
    if (match.includes('---')) return ''; // separator line
    const cells = match
      .split('|')
      .slice(1, -1)
      .map(c => c.trim());
    const isHeader = false; // standard cell
    return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
  });

  // Wrap consecutive tr in table
  html = html.replace(/(<tr>[\s\S]*?<\/tr>(\r?\n)*)+/g, '<table>$&</table>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Paragraphs
  const paragraphs = html.split(/\r?\n\r?\n/);
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|pre|table|ul|blockquote|hr)/i.test(trimmed)) {
      return trimmed;
    }
    return '<p>' + trimmed.replace(/\r?\n/g, '<br/>') + '</p>';
  }).join('\n\n');

  return html;
}

function compileMdToPdf(mdRelativePath, pdfRelativePath, title) {
  const mdPath = path.resolve(mdRelativePath);
  const pdfPath = path.resolve(pdfRelativePath);

  if (!fs.existsSync(mdPath)) {
    console.error('Source file not found:', mdPath);
    return false;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = mdToHtml(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: counter(page);
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.5;
    font-size: 10pt;
    background: #ffffff;
  }
  h1 {
    color: #0f172a;
    font-size: 16pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4px;
    margin-top: 14px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  h2 {
    color: #1e293b;
    font-size: 13pt;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 3px;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h3 {
    color: #334155;
    font-size: 11pt;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  h4 {
    color: #475569;
    font-size: 10pt;
    margin-top: 8px;
    margin-bottom: 3px;
    page-break-after: avoid;
  }
  pre {
    background: #090d16;
    color: #38bdf8;
    padding: 8px 10px;
    border-radius: 5px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8pt;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    border-left: 3px solid #38bdf8;
    page-break-inside: avoid;
    margin: 6px 0;
  }
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }
  blockquote {
    border-left: 3.5px solid #0284c7;
    background: #f0f9ff;
    margin: 6px 0;
    padding: 5px 10px;
    font-style: normal;
    color: #0369a1;
    font-size: 9.5pt;
  }
  hr {
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 12px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
  }
  tr:first-child td {
    background: #f8fafc;
    font-weight: 600;
    color: #0f172a;
  }
  ul {
    margin: 4px 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 2px;
  }
  p {
    margin: 4px 0;
  }
  strong {
    color: #0f172a;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  const htmlPath = path.resolve(pdfRelativePath.replace(/\.pdf$/, '.temp.html'));
  fs.writeFileSync(htmlPath, fullHtml, 'utf8');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`[SUCCESS] PDF Generated: ${path.basename(pdfPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
      fs.unlinkSync(htmlPath);
      return true;
    }
  } catch (err) {
    console.error(`[ERROR] Failed to render PDF for ${path.basename(mdPath)}:`, err.message);
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
    return false;
  }
  return false;
}

// 1. Generate Sunum ve Sistem Rehberi PDF
compileMdToPdf(
  'Teknopark_Istanbul_Basvuru_Evraklari/03_TEKNOPARK_JURI_SUNUM_VE_SISTEM_REHBERI.md',
  'Teknopark_Istanbul_Basvuru_Evraklari/03_TEKNOPARK_JURI_SUNUM_VE_SISTEM_REHBERI.pdf',
  'ALPAR AI — Jüri Sunumu ve 360° Görsel Sistem Rehberi'
);

// 2. Refresh Danışma Kurulu Profili PDF with latest updates (Musa Aygül & Ahmet Rıfat Albuz)
compileMdToPdf(
  'Teknopark_Istanbul_Basvuru_Evraklari/05_DANISMA_KURULU_PROFILI.md',
  'Teknopark_Istanbul_Basvuru_Evraklari/05_DANISMA_KURULU_PROFILI.pdf',
  'ALPAR AI — Danışma Kurulu Profili ve Yetkinlik Matrisi'
);
