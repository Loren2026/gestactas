import { DB_NAME, DB_VERSION, STORE_SCHEMAS } from './schema.js';

let dbPromise = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const [storeName, definition] of Object.entries(STORE_SCHEMAS)) {
        let store;

        if (!db.objectStoreNames.contains(storeName)) {
          store = db.createObjectStore(storeName, { keyPath: definition.keyPath });
        } else {
          store = request.transaction.objectStore(storeName);
        }

        for (const index of definition.indexes) {
          if (!store.indexNames.contains(index.name)) {
            store.createIndex(index.name, index.keyPath, index.options);
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}
