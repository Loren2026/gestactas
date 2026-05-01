/**
 * GestActas - Servicio de IndexedDB
 * 
 * Servicio de almacenamiento robusto para persistencia local de datos de juntas,
 * asistentes, grabaciones, transcripciones, actas y exportaciones.
 */

class IndexedDBService {
    constructor() {
        this.dbName = 'GestActasDB';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * Inicializa la base de datos IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error al abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB inicializado correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db);
            };
        });
    }

    /**
     * Crea los stores necesarios en la base de datos
     */
    createStores(db) {
        // Store para comunidades
        if (!db.objectStoreNames.contains('comunidades')) {
            const comunidadesStore = db.createObjectStore('comunidades', { keyPath: 'id', autoIncrement: true });
            comunidadesStore.createIndex('nombre', 'nombre', { unique: false });
            comunidadesStore.createIndex('direccion', 'direccion', { unique: false });
        }

        // Store para propietarios
        if (!db.objectStoreNames.contains('propietarios')) {
            const propietariosStore = db.createObjectStore('propietarios', { keyPath: 'id', autoIncrement: true });
            propietariosStore.createIndex('nombre', 'nombre', { unique: false });
            propietariosStore.createIndex('comunidadId', 'comunidadId', { unique: false });
        }

        // Store para juntas
        if (!db.objectStoreNames.contains('juntas')) {
            const juntasStore = db.createObjectStore('juntas', { keyPath: 'id', autoIncrement: true });
            juntasStore.createIndex('fecha', 'fecha', { unique: false });
            juntasStore.createIndex('tipo', 'tipo', { unique: false });
            juntasStore.createIndex('comunidadId', 'comunidadId', { unique: false });
        }

        // Store para asistentes
        if (!db.objectStoreNames.contains('asistentes')) {
            const asistentesStore = db.createObjectStore('asistentes', { keyPath: 'id', autoIncrement: true });
            asistentesStore.createIndex('juntaId', 'juntaId', { unique: false });
            asistentesStore.createIndex('propietarioId', 'propietarioId', { unique: false });
        }

        // Store para grabaciones
        if (!db.objectStoreNames.contains('grabaciones')) {
            const grabacionesStore = db.createObjectStore('grabaciones', { keyPath: 'id', autoIncrement: true });
            grabacionesStore.createIndex('juntaId', 'juntaId', { unique: false });
            grabacionesStore.createIndex('fecha', 'fecha', { unique: false });
        }

        // Store para transcripciones
        if (!db.objectStoreNames.contains('transcripciones')) {
            const transcripcionesStore = db.createObjectStore('transcripciones', { keyPath: 'id', autoIncrement: true });
            transcripcionesStore.createIndex('grabacionId', 'grabacionId', { unique: false });
            transcripcionesStore.createIndex('fecha', 'fecha', { unique: false });
        }

        // Store para actas
        if (!db.objectStoreNames.contains('actas')) {
            const actasStore = db.createObjectStore('actas', { keyPath: 'id', autoIncrement: true });
            actasStore.createIndex('juntaId', 'juntaId', { unique: false });
            actasStore.createIndex('fecha', 'fecha', { unique: false });
        }

        // Store para exportaciones
        if (!db.objectStoreNames.contains('exportaciones')) {
            const exportacionesStore = db.createObjectStore('exportaciones', { keyPath: 'id', autoIncrement: true });
            exportacionesStore.createIndex('actaId', 'actaId', { unique: false });
            exportacionesStore.createIndex('fecha', 'fecha', { unique: false });
        }
    }

    /**
     * Guarda un objeto en un store
     */
    async add(storeName, data) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                console.log(`Datos guardados en ${storeName}:`, data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`Error al guardar en ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Actualiza un objeto en un store
     */
    async update(storeName, data) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                console.log(`Datos actualizados en ${storeName}:`, data);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`Error al actualizar en ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene un objeto de un store por su ID
     */
    async get(storeName, id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                console.log(`Datos obtenidos de ${storeName}:`, request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`Error al obtener de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene todos los objetos de un store
     */
    async getAll(storeName) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                console.log(`Todos los datos obtenidos de ${storeName}:`, request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`Error al obtener todos de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Elimina un objeto de un store por su ID
     */
    async delete(storeName, id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`Datos eliminados de ${storeName}:`, id);
                resolve();
            };

            request.onerror = () => {
                console.error(`Error al eliminar de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene objetos de un store filtrados por un índice
     */
    async getByIndex(storeName, indexName, value) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => {
                console.log(`Datos filtrados de ${storeName} por ${indexName}:`, request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`Error al filtrar ${storeName} por ${indexName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Limpia todos los datos de un store
     */
    async clear(storeName) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log(`Store ${storeName} limpiado`);
                resolve();
            };

            request.onerror = () => {
                console.error(`Error al limpiar ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Realiza un respaldo de todos los datos de la base de datos
     */
    async backup() {
        if (!this.db) {
            await this.init();
        }

        const stores = ['comunidades', 'propietarios', 'juntas', 'asistentes', 'grabaciones', 'transcripciones', 'actas', 'exportaciones'];
        const backup = {
            fecha: new Date().toISOString(),
            version: this.dbVersion,
            datos: {}
        };

        for (const storeName of stores) {
            backup.datos[storeName] = await this.getAll(storeName);
        }

        console.log('Respaldo realizado:', backup);
        return backup;
    }

    /**
     * Restaura datos desde un respaldo
     */
    async restore(backup) {
        if (!this.db) {
            await this.init();
        }

        const stores = Object.keys(backup.datos);

        for (const storeName of stores) {
            await this.clear(storeName);
            for (const data of backup.datos[storeName]) {
                await this.add(storeName, data);
            }
        }

        console.log('Restauración completada:', backup);
        return backup;
    }
}

// Exportar instancia singleton
const indexedDBService = new IndexedDBService();

window.IndexedDBService = IndexedDBService;
window.indexedDBService = indexedDBService;
