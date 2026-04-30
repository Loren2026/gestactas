const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
const INPUT_COST_PER_MILLION = 3;
const OUTPUT_COST_PER_MILLION = 15;
const MAX_INPUT_TOKENS = 120000;
const SUMMARY_THRESHOLD_TOKENS = 90000;

const REQUIRED_SECTIONS = [
  'cabecera',
  'asistencia',
  'orden_dia',
  'desarrollo',
  'acuerdos',
  'pendientes',
  'cierre',
  'votaciones',
  'firmas',
];

const TEMPLATE_LABELS = {
  junta_ordinaria: 'Junta ordinaria',
  junta_extraordinaria: 'Junta extraordinaria',
  asamblea_general: 'Asamblea general',
  junta_vecinos: 'Junta de vecinos',
};

function getApiKey() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('gestactas_claude_api_key') || '';
}

function estimateTokens(text = '') {
  return Math.ceil((String(text).length || 0) / 4);
}

function estimateCost({ inputTokens, outputTokens, model = DEFAULT_MODEL }) {
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;
  return {
    model,
    inputTokens,
    outputTokens,
    estimatedCost: Number((inputCost + outputCost).toFixed(4)),
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonBlock(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return '';
}

function markdownFromStructure(structure) {
  const acuerdos = (structure.acuerdos || []).map((item) => `- ${item}`).join('\n') || '- Sin acuerdos definidos';
  const pendientes = (structure.pendientes || []).map((item) => `| ${item.tarea || ''} | ${item.responsable || ''} | ${item.fecha_limite || ''} |`).join('\n') || '| Sin tareas | - | - |';
  const desarrollo = (structure.desarrollo || []).map((item, index) => `### ${index + 1}. ${item.punto || `Punto ${index + 1}`}\n${item.resumen || ''}`).join('\n\n');
  const asistentes = (structure.asistencia?.asistentes || []).map((item) => `- ${item.nombre} · DNI: ${item.dni} · Coef.: ${item.coeficiente}`).join('\n');
  const votaciones = (structure.votaciones || []).map((item) => `- ${item.asunto}: a favor ${item.a_favor}, en contra ${item.en_contra}, abstenciones ${item.abstenciones}. Resultado: ${item.resultado}`).join('\n');

  return `# ${structure.cabecera?.titulo || 'Acta de junta'}

## Cabecera
- Comunidad: ${structure.cabecera?.comunidad || ''}
- Fecha: ${structure.cabecera?.fecha || ''}
- Hora: ${structure.cabecera?.hora || ''}
- Lugar: ${structure.cabecera?.lugar || ''}
- Convocatoria: ${structure.cabecera?.convocatoria || ''}

## Asistencia
- Presidente: ${structure.asistencia?.presidente || ''}
- Secretario: ${structure.asistencia?.secretario || ''}
- Quórum: ${structure.asistencia?.quorum || ''}
${asistentes ? `\n### Asistentes\n${asistentes}` : ''}

## Orden del día
${(structure.orden_dia || []).map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Desarrollo de la reunión
${desarrollo}

## Acuerdos adoptados
${acuerdos}

## Votaciones
${votaciones || '- Sin votaciones registradas'}

## Pendientes y responsables
| Tarea | Responsable | Fecha límite |
|---|---|---|
${pendientes}

## Cierre
${structure.cierre?.texto || ''}
${structure.cierre?.proxima_junta ? `\n- Próxima junta: ${structure.cierre.proxima_junta}` : ''}

## Firmas
- Presidente: ${structure.firmas?.presidente || ''}
- Secretario: ${structure.firmas?.secretario || ''}`;
}

function buildPrompt({ templateName, context, transcript, summarizedTranscript }) {
  const templateLabel = TEMPLATE_LABELS[templateName] || TEMPLATE_LABELS.junta_ordinaria;
  const transcriptBody = summarizedTranscript || transcript;

  return `Eres un asistente jurídico especializado en actas de comunidades de propietarios en España.

Debes redactar el acta de una ${templateLabel} con formato legal claro, neutro y profesional.

REQUISITOS LEGALES OBLIGATORIOS:
- Incluir número de convocatoria (primera o segunda convocatoria).
- Incluir asistentes con nombre completo, DNI y coeficiente de participación.
- Incluir quórum y constitución válida de la junta.
- Incluir votaciones con a favor, en contra y abstenciones.
- Incluir espacio de firma para presidente y secretario.
- Mantener tono jurídico, claro, sin inventar hechos no respaldados.
- Si falta un dato, indícalo expresamente como pendiente o no consta.

DEBES RESPONDER EN DOS BLOQUES:
1) Un bloque JSON válido dentro de \`\`\`json.
2) Un bloque Markdown dentro de \`\`\`markdown.

ESTRUCTURA JSON OBLIGATORIA:
{
  "cabecera": {
    "titulo": "Acta de Junta General Ordinaria",
    "comunidad": "...",
    "fecha": "...",
    "hora": "...",
    "lugar": "...",
    "convocatoria": "segunda convocatoria"
  },
  "asistencia": {
    "presidente": "...",
    "secretario": "...",
    "quorum": "...",
    "asistentes": [
      {"nombre": "...", "dni": "...", "coeficiente": "..."}
    ]
  },
  "orden_dia": ["..."],
  "desarrollo": [
    {"punto": "...", "resumen": "..."}
  ],
  "acuerdos": ["..."],
  "pendientes": [
    {"tarea": "...", "responsable": "...", "fecha_limite": "..."}
  ],
  "votaciones": [
    {"asunto": "...", "a_favor": "...", "en_contra": "...", "abstenciones": "...", "resultado": "..."}
  ],
  "cierre": {
    "texto": "...",
    "proxima_junta": "..."
  },
  "firmas": {
    "presidente": "...",
    "secretario": "..."
  }
}

EJEMPLO DE MARKDOWN:
# Acta de Junta General Ordinaria
## Cabecera
- Comunidad: Comunidad de Propietarios Edificio Astur
- Fecha: 25 de abril de 2026
- Hora: 18:30
- Lugar: Portal del edificio
- Convocatoria: Segunda convocatoria

## Asistencia
- Presidente: ...
- Secretario: ...
- Quórum: ...

## Acuerdos adoptados
- Se aprueban las cuentas.

CONTEXTO DE LA JUNTA:
${JSON.stringify(context, null, 2)}

TRANSCRIPCIÓN BASE:
${transcriptBody}

Si la transcripción es ambigua, prioriza precisión y deja constancia de la duda en lugar de inventar.`;
}

async function callClaude({ apiKey, model, prompt, maxTokens = 4096 }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Claude API devolvió ${response.status}: ${text}`);
    error.code = 'claude_api_error';
    throw error;
  }

  const payload = await response.json();
  const text = payload.content?.map((item) => item.text || '').join('\n').trim() || '';
  return { payload, text };
}

function validateStructure(structure) {
  const missing = REQUIRED_SECTIONS.filter((key) => !(key in (structure || {})));
  return {
    valid: missing.length === 0,
    missing,
  };
}

export function createClaudeService() {
  return {
    getApiKey,
    estimateTokens,
    estimateCost({ transcript, model = DEFAULT_MODEL, outputTokens = 5000 }) {
      const inputTokens = estimateTokens(transcript);
      return estimateCost({ inputTokens, outputTokens, model });
    },
    needsSummary(transcript) {
      return estimateTokens(transcript) > SUMMARY_THRESHOLD_TOKENS;
    },
    async summarizeTranscript({ transcript, model = DEFAULT_MODEL }) {
      const apiKey = getApiKey();
      if (!apiKey) {
        const error = new Error('No hay clave de Claude API configurada.');
        error.code = 'missing_claude_key';
        throw error;
      }

      const prompt = `Resume esta transcripción extensa de junta de propietarios en España para preparar un acta posterior. Mantén acuerdos, votaciones, pendientes, asistentes y puntos del orden del día.\n\n${transcript}`;
      const { text } = await callClaude({ apiKey, model, prompt, maxTokens: 2500 });
      return text;
    },
    buildPrompt,
    validateStructure,
    markdownFromStructure,
    async generateActa({ templateName = 'junta_ordinaria', context, transcript, model = DEFAULT_MODEL }) {
      const apiKey = getApiKey();
      if (!apiKey) {
        const error = new Error('No hay clave de Claude API configurada.');
        error.code = 'missing_claude_key';
        throw error;
      }

      let summarizedTranscript = '';
      if (this.needsSummary(transcript)) {
        summarizedTranscript = await this.summarizeTranscript({ transcript, model });
      }

      const prompt = buildPrompt({ templateName, context, transcript, summarizedTranscript });
      const { text } = await callClaude({ apiKey, model, prompt, maxTokens: 4500 });
      const jsonText = extractJsonBlock(text);
      const structure = safeJsonParse(jsonText);
      const validation = validateStructure(structure);
      if (!structure || !validation.valid) {
        const error = new Error(`La respuesta de Claude no incluye la estructura obligatoria completa. Faltan: ${validation.missing.join(', ')}`);
        error.code = 'invalid_acta_structure';
        throw error;
      }

      const markdownMatch = text.match(/```markdown\s*([\s\S]*?)```/i);
      const markdown = markdownMatch?.[1]?.trim() || markdownFromStructure(structure);
      const outputTokens = estimateTokens(markdown) + estimateTokens(JSON.stringify(structure));
      const cost = estimateCost({ inputTokens: estimateTokens(prompt), outputTokens, model });

      return {
        prompt,
        structure,
        markdown,
        summarizedTranscript,
        model,
        cost,
        validation,
      };
    },
  };
}
