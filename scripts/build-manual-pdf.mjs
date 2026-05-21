/**
 * แปลง USER_MANUAL.md → manual.html สำหรับ Print to PDF
 * รัน: node scripts/build-manual-pdf.mjs
 * จากนั้นเปิด public/manual.html ใน browser แล้วกด Cmd+P → Save as PDF
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const md = readFileSync(join(root, 'USER_MANUAL.md'), 'utf8')

// ── Simple Markdown → HTML converter ────────────────────────────────────────
function mdToHtml(text) {
  return text
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

    // Blockquotes
    .replace(/^> \*\*(.*?)\*\*\s*(.*)/gm, '<blockquote><strong>$1</strong> $2</blockquote>')
    .replace(/^> (.*)/gm, '<blockquote>$1</blockquote>')

    // H1-H4
    .replace(/^#### (.*)/gm, '<h4>$1</h4>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^# (.*)/gm, '<h1>$1</h1>')

    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const th = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
      const tr = rows.trim().split('\n').map(row => {
        const td = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
        return `<tr>${td}</tr>`
      }).join('\n')
      return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`
    })

    // Bold + Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Horizontal rule
    .replace(/^---$/gm, '<hr>')

    // Ordered lists
    .replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')
      return `<ol>${items}</ol>`
    })

    // Unordered lists
    .replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')
      return `<ul>${items}</ul>`
    })

    // Sub-bullets (indented)
    .replace(/((?:^   [-*] .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(l => `<li>${l.replace(/^   [-*] /, '')}</li>`).join('')
      return `<ul class="sub">${items}</ul>`
    })

    // Paragraphs
    .replace(/^(?!<[houptbc])(.+)$/gm, '<p>$1</p>')

    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(\s*)<\/p>/g, '')
}

const body = mdToHtml(md)

// ── Extract headings for TOC ─────────────────────────────────────────────────
const tocItems = []
let bodyWithIds = body.replace(/<h([23])(.*?)>(.*?)<\/h\1>/g, (_, level, attrs, text) => {
  const id = text.toLowerCase().replace(/[^ก-๙a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (level === '2') tocItems.push({ level, id, text })
  return `<h${level}${attrs} id="${id}">${text}</h${level}>`
})

const toc = tocItems.map(({ id, text }) =>
  `<li><a href="#${id}">${text}</a></li>`
).join('\n')

// ── Final HTML ───────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>คู่มือการใช้งาน — Community Driven</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;600&display=swap');

  :root {
    --yellow: #F59E0B;
    --yellow-light: #FEF3C7;
    --gray-900: #111827;
    --gray-700: #374151;
    --gray-500: #6B7280;
    --gray-200: #E5E7EB;
    --gray-50: #F9FAFB;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sarabun', sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: var(--gray-700);
    background: white;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 48px;
  }

  /* Cover */
  .cover {
    min-height: 240px;
    background: var(--gray-900);
    border-radius: 16px;
    padding: 48px;
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .cover-badge {
    display: inline-block;
    background: var(--yellow);
    color: var(--gray-900);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 6px;
    margin-bottom: 16px;
    width: fit-content;
  }
  .cover h1 {
    color: white;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.3;
    border: none;
    padding: 0;
    margin-bottom: 8px;
  }
  .cover p {
    color: #9CA3AF;
    font-size: 13px;
    margin: 0;
  }

  /* TOC */
  .toc {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 48px;
  }
  .toc h2 {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: none;
    padding: 0;
    margin-bottom: 12px;
  }
  .toc ul { list-style: none; counter-reset: toc; }
  .toc li {
    counter-increment: toc;
    padding: 4px 0;
    border-bottom: 1px dashed var(--gray-200);
  }
  .toc li:last-child { border-bottom: none; }
  .toc a {
    color: var(--gray-700);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .toc a::before {
    content: counter(toc);
    min-width: 22px;
    height: 22px;
    background: var(--yellow);
    color: var(--gray-900);
    font-weight: 700;
    font-size: 11px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .toc a:hover { color: var(--yellow); }

  /* Headings */
  h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--gray-900);
    border-left: 4px solid var(--yellow);
    padding-left: 14px;
    margin: 40px 0 16px;
    padding-top: 8px;
  }
  h2 {
    font-size: 17px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 28px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--gray-200);
  }
  h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 20px 0 8px;
  }
  h4 {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 16px 0 6px;
  }

  /* Paragraph */
  p { margin: 8px 0; }

  /* Lists */
  ul, ol {
    margin: 8px 0 8px 24px;
    padding: 0;
  }
  li { margin: 4px 0; }
  ul.sub { margin-left: 40px; }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
  }
  thead { background: var(--gray-900); }
  thead th {
    color: white;
    font-weight: 600;
    padding: 10px 14px;
    text-align: left;
    font-size: 12px;
    letter-spacing: 0.04em;
  }
  tbody tr:nth-child(even) { background: var(--gray-50); }
  tbody tr:hover { background: var(--yellow-light); }
  td { padding: 9px 14px; border-bottom: 1px solid var(--gray-200); }

  /* Blockquote */
  blockquote {
    background: var(--yellow-light);
    border-left: 4px solid var(--yellow);
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin: 12px 0;
    font-size: 13px;
    color: var(--gray-700);
  }
  blockquote strong { color: var(--gray-900); }

  /* Code */
  code {
    font-family: 'IBM Plex Mono', monospace;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #D97706;
  }
  pre {
    background: var(--gray-900);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 12px 0;
  }
  pre code {
    background: none;
    border: none;
    color: #D1FAE5;
    font-size: 12px;
    padding: 0;
  }

  /* HR */
  hr {
    border: none;
    border-top: 2px solid var(--gray-200);
    margin: 32px 0;
  }

  strong { color: var(--gray-900); }

  /* Print */
  @media print {
    body { padding: 0; max-width: 100%; }
    .cover { border-radius: 0; }
    h1, h2 { page-break-after: avoid; }
    table, blockquote, pre { page-break-inside: avoid; }
    @page {
      margin: 20mm 15mm;
      size: A4;
    }
    @page :first { margin-top: 0; }
  }
</style>
</head>
<body>

<div class="cover">
  <span class="cover-badge">Community Driven — กพร.</span>
  <h1>คู่มือการใช้งาน<br>ระบบบันทึกและติดตามโครงการชุมชนสุขภาวะ</h1>
  <p>ฐานข้อมูล 3 ปี &nbsp;·&nbsp; เวอร์ชัน 2569.1 &nbsp;·&nbsp; พ.ค. 2569</p>
</div>

<div class="toc">
  <h2>สารบัญ</h2>
  <ul>${toc}</ul>
</div>

${bodyWithIds}

</body>
</html>`

const outPath = join(root, 'public', 'manual.html')
writeFileSync(outPath, html, 'utf8')
console.log(`✅ สร้างไฟล์แล้ว: ${outPath}`)
console.log(`\nขั้นตอนถัดไป:`)
console.log(`  1. เปิด http://localhost:3000/manual.html`)
console.log(`  2. กด Cmd+P (Print)`)
console.log(`  3. เลือก "Save as PDF" → กด Save`)
