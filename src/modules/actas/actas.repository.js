import { STORES } from '../../db/schema.js';

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function createActasRepository(db) {
  return {
    async listByJuntaId(juntaId) {
      const transaction = db.transaction(STORES.actas, 'readonly');
      const index = transaction.objectStore(STORES.actas).index('by_junta_id');
      return promisifyRequest(index.getAll(juntaId));
    },
    async getById(id) {
      const transaction = db.transaction(STORES.actas, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.actas).get(id));
    },
    async save(acta) {
      const transaction = db.transaction(STORES.actas, 'readwrite');
      await promisifyRequest(transaction.objectStore(STORES.actas).put(acta));
      return acta;
    },
    async count() {
      const transaction = db.transaction(STORES.actas, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.actas).count());
    },
  };
}
