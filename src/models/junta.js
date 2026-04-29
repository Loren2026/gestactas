import { generateId, nowIso } from '../shared/utils.js';

export function createJuntaDraft(overrides = {}) {
  const timestamp = nowIso();

  return {
    id: generateId('junta'),
    comunidad_id: null,
    tipo: 'Ordinaria',
    fecha: '',
    hora_primera_convocatoria: '',
    hora_segunda_convocatoria: '',
    lugar: '',
    orden_dia: [],
    asistentes: [],
    quorum_porcentaje: 0,
    quorum_coeficientes: 0,
    estado: 'Preparada',
    created_at: timestamp,
    updated_at: timestamp,
    sync_status: 'local_only',
    ...overrides,
  };
}
