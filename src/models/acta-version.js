import { generateId, nowIso } from '../shared/utils.js';

export function createActaVersion(overrides = {}) {
  const timestamp = nowIso();

  return {
    id: generateId('acta_version'),
    acta_id: null,
    junta_id: null,
    transcripcion_id: null,
    numero_version: 1,
    origen: 'claude_api',
    es_version_final: false,
    prompt_utilizado: '',
    modelo_utilizado: 'claude-3-5-sonnet-latest',
    contenido_markdown: '',
    contenido_texto_plano: '',
    estructura_json: null,
    cabecera_junta_snapshot: null,
    asistentes_snapshot: [],
    orden_dia_snapshot: [],
    tareas_pendientes: [],
    coste_estimado: 0,
    error_codigo: '',
    error_mensaje: '',
    created_at: timestamp,
    updated_at: timestamp,
    autosaved_at: null,
    metadata: {},
    ...overrides,
  };
}
