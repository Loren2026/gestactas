import { STORES } from '../../db/schema.js';

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function createGrabacionesRepository(db) {
  return {
    async listByJuntaId(juntaId) {
      const transaction = db.transaction(STORES.grabaciones, 'readonly');
      const index = transaction.objectStore(STORES.grabaciones).index('by_junta_id');
      return promisifyRequest(index.getAll(juntaId));
    },
    async getById(id) {
      const transaction = db.transaction(STORES.grabaciones, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.grabaciones).get(id));
    },
    async save(grabacion) {
      const transaction = db.transaction(STORES.grabaciones, 'readwrite');
      await promisifyRequest(transaction.objectStore(STORES.grabaciones).put(grabacion));
      return grabacion;
    },
    async delete(id) {
      const transaction = db.transaction(STORES.grabaciones, 'readwrite');
      await promisifyRequest(transaction.objectStore(STORES.grabaciones).delete(id));
      return true;
    },
    async listAll() {
      const transaction = db.transaction(STORES.grabaciones, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.grabaciones).getAll());
    },
    async count() {
      const transaction = db.transaction(STORES.grabaciones, 'readonly');
      return promisifyRequest(transaction.objectStore(STORES.grabaciones).count());
    },
  };
}
