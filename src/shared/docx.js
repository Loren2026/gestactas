function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function textToRuns(text) {
  return xmlEscape(text)
    .split('\n')
    .map((line) => `<w:r><w:t xml:space="preserve">${line || ' '}</w:t></w:r>`)
    .join('<w:r><w:br/></w:r>');
}

function uint32ToBytes(value) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function uint16ToBytes(value) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[index] = crc >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatUint8Arrays(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function createStoredZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      20, 0,
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      ...uint32ToBytes(crc),
      ...uint32ToBytes(dataBytes.length),
      ...uint32ToBytes(dataBytes.length),
      ...uint16ToBytes(nameBytes.length),
      0, 0,
    ]);

    localParts.push(localHeader, nameBytes, dataBytes);

    const centralHeader = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02,
      20, 0,
      20, 0,
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      ...uint32ToBytes(crc),
      ...uint32ToBytes(dataBytes.length),
      ...uint32ToBytes(dataBytes.length),
      ...uint16ToBytes(nameBytes.length),
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      0, 0, 0, 0,
      ...uint32ToBytes(offset),
    ]);

    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const localDirectory = concatUint8Arrays(localParts);
  const endRecord = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06,
    0, 0,
    0, 0,
    ...uint16ToBytes(files.length),
    ...uint16ToBytes(files.length),
    ...uint32ToBytes(centralDirectory.length),
    ...uint32ToBytes(localDirectory.length),
    0, 0,
  ]);

  return concatUint8Arrays([localDirectory, centralDirectory, endRecord]);
}

function stripMarkdown(markdown = '') {
  return String(markdown)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/\|/g, ' ')
    .trim();
}

function buildConvocatoriaDocumentXml({ comunidadNombre, fecha, hora, lugar, ordenDia }) {
  const points = Array.isArray(ordenDia) ? ordenDia.filter(Boolean) : [];
  const agendaParagraphs = (points.length ? points : ['Sin puntos definidos']).map((point, index) => `
    <w:p><w:r><w:t>${xmlEscape(`${index + 1}. ${point}`)}</w:t></w:r></w:p>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
    <w:body>
      <w:p><w:r><w:t>Convocatoria de junta</w:t></w:r></w:p>
      <w:p><w:r><w:t>${xmlEscape(`Comunidad: ${comunidadNombre}`)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${xmlEscape(`Fecha: ${fecha}`)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${xmlEscape(`Hora: ${hora}`)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${xmlEscape(`Lugar: ${lugar}`)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Orden del día</w:t></w:r></w:p>
      ${agendaParagraphs}
      <w:p>${textToRuns('Documento editable para su envío a los propietarios.')}</w:p>
      <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
    </w:body>
  </w:document>`;
}

function buildActaDocumentXml({ titulo, markdown, estructura }) {
  const agreements = (estructura?.acuerdos || []).map((item) => `<w:p><w:r><w:t>${xmlEscape(`• ${item}`)}</w:t></w:r></w:p>`).join('');
  const pending = (estructura?.pendientes || []).map((item) => `<w:p><w:r><w:t>${xmlEscape(`• ${item.tarea || ''} · Responsable: ${item.responsable || 'Pendiente'} · Fecha límite: ${item.fecha_limite || 'Pendiente'}`)}</w:t></w:r></w:p>`).join('');
  const voting = (estructura?.votaciones || []).map((item) => `<w:p><w:r><w:t>${xmlEscape(`${item.asunto}: a favor ${item.a_favor}, en contra ${item.en_contra}, abstenciones ${item.abstenciones}. Resultado: ${item.resultado}`)}</w:t></w:r></w:p>`).join('');
  const bodyText = stripMarkdown(markdown || '');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      <w:p><w:r><w:t>${xmlEscape(titulo || 'Acta de junta')}</w:t></w:r></w:p>
      <w:p>${textToRuns(bodyText)}</w:p>
      <w:p><w:r><w:t>Acuerdos adoptados</w:t></w:r></w:p>
      ${agreements || '<w:p><w:r><w:t>Sin acuerdos definidos</w:t></w:r></w:p>'}
      <w:p><w:r><w:t>Tareas pendientes</w:t></w:r></w:p>
      ${pending || '<w:p><w:r><w:t>Sin tareas pendientes</w:t></w:r></w:p>'}
      <w:p><w:r><w:t>Votaciones</w:t></w:r></w:p>
      ${voting || '<w:p><w:r><w:t>Sin votaciones registradas</w:t></w:r></w:p>'}
      <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
    </w:body>
  </w:document>`;
}

function createBasicDocxBlob(documentXml) {
  const files = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`,
    },
    {
      name: 'word/document.xml',
      content: documentXml,
    },
  ];

  return new Blob([createStoredZip(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function ownerTableText(owners = []) {
  if (!owners.length) return 'Sin propietarios disponibles';
  return owners.map((owner, index) => `${index + 1}. ${owner.nombre} | DNI: ${owner.dni || 'No consta'} | Coeficiente: ${owner.coeficiente || ''} | Propiedad: ${owner.propiedad || ''}`).join('\n');
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') return bytes;
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function parseZipEntries(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const entries = [];
  let offset = 0;

  while (offset + 30 < bytes.length && bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x03 && bytes[offset + 3] === 0x04) {
    const compression = bytes[offset + 8] | (bytes[offset + 9] << 8);
    const compressedSize = bytes[offset + 18] | (bytes[offset + 19] << 8) | (bytes[offset + 20] << 16) | (bytes[offset + 21] << 24);
    const fileNameLength = bytes[offset + 26] | (bytes[offset + 27] << 8);
    const extraLength = bytes[offset + 28] | (bytes[offset + 29] << 8);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const nameBytes = bytes.slice(nameStart, nameStart + fileNameLength);
    const name = new TextDecoder().decode(nameBytes);
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    const content = compression === 0 ? compressed : await inflateRaw(compressed);
    entries.push({ name, content });
    offset = dataStart + compressedSize;
  }

  return entries;
}

export function buildConvocatoriaDocx({ comunidadNombre, fecha, hora, lugar, ordenDia }) {
  return createBasicDocxBlob(buildConvocatoriaDocumentXml({ comunidadNombre, fecha, hora, lugar, ordenDia }));
}

export function buildActaDocx({ titulo, markdown, estructura }) {
  return createBasicDocxBlob(buildActaDocumentXml({ titulo, markdown, estructura }));
}

export async function buildCustomTemplateDocx({ templateBlob, replacements = {}, owners = [] }) {
  const entries = await parseZipEntries(templateBlob);
  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();
  const ownerText = ownerTableText(owners);

  const files = entries.map((entry) => {
    if (entry.name !== 'word/document.xml') return entry;
    let xml = textDecoder.decode(entry.content);
    const merged = {
      ...replacements,
      PROPIETARIOS_TABLA: ownerText,
    };
    Object.entries(merged).forEach(([key, value]) => {
      const token = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      xml = xml.replace(token, xmlEscape(String(value || '')));
    });
    if (!xml.includes(ownerText)) {
      xml = xml.replace('</w:body>', `<w:p>${textToRuns(`Relación de propietarios\n${ownerText}`)}</w:p></w:body>`);
    }
    return { name: entry.name, content: textEncoder.encode(xml) };
  });

  return new Blob([createStoredZip(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function createDocxFile(blob, filename) {
  return new File([blob], filename, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
