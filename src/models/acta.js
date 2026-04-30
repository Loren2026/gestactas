import { generateId, nowIso } from '../shared/utils.js';

export function createEmptyActa(overrides = {}) {
  const timestamp = nowIso();

  return {
    id: generateId('acta'),
    junta_id: null,
    transcripcion_id: null,
    version_activa_id: null,
    estado: 'borrador',
    titulo: 'Acta sin título',
    resumen_corto: '',
    plantilla_tipo: 'oficial',
    plantilla_nombre: 'Junta ordinaria',
    plantilla_personalizada_nombre: '',
    plantilla_personalizada_blob: null,
    versiones: [],
    created_at: timestamp,
    updated_at: timestamp,
    sync_status: 'local_only',
    ...overrides,
  };
}
