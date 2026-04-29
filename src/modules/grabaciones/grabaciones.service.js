import { createEmptyGrabacion } from '../../models/grabacion.js';
import { nowIso } from '../../shared/utils.js';

const DEFAULT_STORAGE_LIMIT_BYTES = 150 * 1024 * 1024;
const STORAGE_WARNING_RATIO = 0.8;
const STORAGE_DANGER_RATIO = 0.95;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const supported = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return supported.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || '';
}

function extensionFromMimeType(mimeType) {
  if (!mimeType) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'm4a';
  return 'webm';
}

export function createGrabacionesService(repository) {
  return {
    getPreferredMimeType() {
      return pickMimeType();
    },

    async listByJuntaId(juntaId) {
      const items = await repository.listByJuntaId(juntaId);
      return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    },

    async getById(id) {
      return repository.getById(id);
    },

    async saveRecording({ juntaId, blob, durationSeconds, markerCount = 0, nombre }) {
      const now = nowIso();
      const mimeType = blob?.type || this.getPreferredMimeType() || 'audio/webm';
      const extension = extensionFromMimeType(mimeType);
      const total = await this.getStorageUsage();
      const nextTotal = total.usedBytes + (blob?.size || 0);
      const limit = total.limitBytes;

      if (nextTotal > limit) {
        const error = new Error('No hay espacio local suficiente para guardar la grabación.');
        error.code = 'storage_limit_exceeded';
        throw error;
      }

      const draft = createEmptyGrabacion({
        junta_id: juntaId,
        nombre: nombre || `Grabación ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`,
        mime_type: mimeType,
        extension,
        duracion_segundos: Math.max(0, Math.round(durationSeconds || 0)),
        tamano_bytes: blob?.size || 0,
        audio_blob: blob,
        marcador_count: markerCount,
        estado: 'guardada',
        created_at: now,
        updated_at: now,
      });

      await repository.save(draft);
      return draft;
    },

    async delete(id) {
      return repository.delete(id);
    },

    async getStorageUsage() {
      const items = await repository.listAll();
      const usedBytes = items.reduce((sum, item) => sum + Number(item.tamano_bytes || item.audio_blob?.size || 0), 0);
      let limitBytes = DEFAULT_STORAGE_LIMIT_BYTES;
      let quotaBytes = null;
      let availableBytes = null;

      if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          quotaBytes = Number(estimate.quota || 0) || null;
          const usageBytes = Number(estimate.usage || 0) || 0;
          if (quotaBytes) {
            limitBytes = Math.max(Math.floor(quotaBytes * 0.9), usedBytes || 0, 25 * 1024 * 1024);
            availableBytes = Math.max(quotaBytes - usageBytes, 0);
          }
        } catch {
          // sin estimate, usamos límite conservador por defecto
        }
      }

      const ratio = limitBytes ? usedBytes / limitBytes : 0;
      const status = ratio >= STORAGE_DANGER_RATIO ? 'danger' : ratio >= STORAGE_WARNING_RATIO ? 'warning' : 'ok';

      return {
        usedBytes,
        usedLabel: formatBytes(usedBytes),
        limitBytes,
        limitLabel: formatBytes(limitBytes),
        availableBytes,
        availableLabel: availableBytes == null ? 'No disponible' : formatBytes(availableBytes),
        quotaBytes,
        quotaLabel: quotaBytes == null ? 'No disponible' : formatBytes(quotaBytes),
        ratio,
        status,
      };
    },

    async getStorageAlert() {
      const usage = await this.getStorageUsage();
      if (usage.status === 'ok') return { level: 'ok', message: '' };
      if (usage.status === 'warning') {
        return {
          level: 'warning',
          message: `El almacenamiento local de audio está alto: ${usage.usedLabel} de ${usage.limitLabel}. Conviene eliminar grabaciones antiguas pronto.`,
        };
      }
      return {
        level: 'danger',
        message: `El almacenamiento local de audio está casi al límite: ${usage.usedLabel} de ${usage.limitLabel}. Es posible que la siguiente grabación no se pueda guardar.`,
      };
    },
  };
}
