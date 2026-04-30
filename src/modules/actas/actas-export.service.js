import { buildActaDocx, buildCustomTemplateDocx, downloadBlob } from '../../shared/docx.js';

function stripMarkdown(markdown = '') {
  return String(markdown)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^-\s+/gm, '• ')
    .trim();
}

function escapePdfText(text = '') {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdf(text) {
  const lines = stripMarkdown(text).split('\n').flatMap((line) => {
    const safe = line || ' ';
    const chunks = [];
    for (let i = 0; i < safe.length; i += 90) chunks.push(safe.slice(i, i + 90));
    return chunks;
  });

  const contentLines = ['BT', '/F1 10 Tf', '40 800 Td'];
  lines.forEach((line, index) => {
    if (index > 0) contentLines.push('0 -14 Td');
    contentLines.push(`(${escapePdfText(line)}) Tj`);
  });
  contentLines.push('ET');
  const stream = contentLines.join('\n');

  const objects = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj');
  objects.push('3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj');
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj`);
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj');

  let offset = 9;
  const body = objects.map((obj) => {
    const current = offset;
    offset += obj.length + 1;
    return { obj, offset: current };
  });

  let pdf = '%PDF-1.4\n';
  body.forEach(({ obj }) => { pdf += `${obj}\n`; });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body.forEach(({ offset: value }) => {
    pdf += `${String(value).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function createActasExportService() {
  return {
    exportTxt({ filename, markdown }) {
      downloadBlob(new Blob([stripMarkdown(markdown)], { type: 'text/plain;charset=utf-8' }), filename);
    },
    exportPdf({ filename, markdown }) {
      downloadBlob(buildSimplePdf(markdown), filename);
    },
    exportDocx({ filename, actaData }) {
      downloadBlob(buildActaDocx(actaData), filename);
    },
    async exportCustomTemplateDocx({ filename, templateBlob, replacements, owners }) {
      const blob = await buildCustomTemplateDocx({ templateBlob, replacements, owners });
      downloadBlob(blob, filename);
    },
    print(markdown) {
      const popup = window.open('', '_blank', 'width=900,height=1000');
      if (!popup) return;
      popup.document.write(`<html><head><title>Acta</title><style>body{font-family:Arial,sans-serif;padding:24px;white-space:pre-wrap}</style></head><body>${stripMarkdown(markdown)}</body></html>`);
      popup.document.close();
      popup.focus();
      popup.print();
    },
  };
}
