import { STORES } from '../../db/schema.js';

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function createJuntasRepository(db) {
  return {
    async list() {
      const transaction = db.transaction(STORES.juntas, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.juntas).getAll());
    },
    async getById(id) {
      const transaction = db.transaction(STORES.juntas, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.juntas).get(id));
    },
    async save(junta) {
      const transaction = db.transaction(STORES.juntas, 'readwrite');
      await promisifyRequest(transaction.objectStore(STORES.juntas).put(junta));
      return junta;
    },
    async count() {
      const transaction = db.transaction(STORES.juntas, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.juntas).count());
    },
  };
}
