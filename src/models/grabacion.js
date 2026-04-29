import { generateId, nowIso } from '../shared/utils.js';

export function createEmptyGrabacion(overrides = {}) {
  const timestamp = nowIso();

  return {
    id: generateId('grabacion'),
    junta_id: null,
    nombre: 'Grabación sin título',
    mime_type: 'audio/webm',
    extension: 'webm',
    duracion_segundos: 0,
    tamano_bytes: 0,
    audio_blob: null,
    marcador_count: 0,
    estado: 'guardada',
    origen: 'media_recorder',
    created_at: timestamp,
    updated_at: timestamp,
    sync_status: 'local_only',
    ...overrides,
  };
}
