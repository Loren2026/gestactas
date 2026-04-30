/**
 * GestActas - Store de estado centralizado
 * Bloque 6 - Gestión de estado de la aplicación
 */

class GestactasStore {
    constructor() {
        this.state = {
            comunidades: [],
            propietarios: [],
            juntas: [],
            actas: [],
            exportHistory: [],
            settings: {
                theme: 'dark',
                language: 'es',
                dateFormat: 'DD/MM/YYYY',
                exportFormat: 'docx',
                validateBeforeExport: true,
                autoDownload: true
            },
            ui: {
                currentScreen: 'juntas',
                selectedJunta: null,
                selectedActa: null,
                sidebarOpen: true
            }
        };

        this.subscribers = [];
        this.storageKey = 'gestactas_store';
    }

    /**
     * Inicializa el store
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log('🗃️ Inicializando store...');

        try {
            // Cargar estado desde localStorage
            await this.loadState();

            console.log('✅ Store inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar store:', error);
            // Continuar con estado por defecto
        }
    }

    /**
     * Suscribe un callback a cambios en el estado
     * @param {Function} callback - Callback a ejecutar cuando cambie el estado
     * @returns {Function} Función para cancelar la suscripción
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        
        // Retornar función para cancelar suscripción
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Notifica a todos los suscriptores de un cambio
     * @param {Object} newState - Nuevo estado
     */
    notify(newState) {
        this.subscribers.forEach(callback => {
            try {
                callback(newState);
            } catch (error) {
                console.error('Error en callback de suscriptor:', error);
            }
        });
    }

    /**
     * Obtiene todo el estado
     * @returns {Object} Estado actual
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Obtiene una parte del estado
     * @param {string} path - Ruta al estado (ej: 'comunidades')
     * @returns {any} Valor del estado
     */
    get(path) {
        return this._getNestedValue(this.state, path);
    }

    /**
     * Actualiza el estado
     * @param {string|Function} path - Ruta al estado o función de actualización
     * @param {any} value - Nuevo valor (si path es string)
     */
    set(path, value) {
        if (typeof path === 'function') {
            // Función de actualización
            this.state = path(this.state);
        } else {
            // Ruta específica
            this._setNestedValue(this.state, path, value);
        }

        // Notificar suscriptores
        this.notify(this.state);

        // Guardar en localStorage
        this.saveState();
    }

    /**
     * Actualiza el estado con merge
     * @param {Object} updates - Objeto con actualizaciones
     */
    update(updates) {
        this.state = this._deepMerge(this.state, updates);
        this.notify(this.state);
        this.saveState();
    }

    /**
     * Reinicia el estado a valores por defecto
     * @param {string} path - Ruta a reiniciar (opcional)
     */
    reset(path) {
        if (path) {
            const defaultValue = this._getDefaultValue(path);
            this.set(path, defaultValue);
        } else {
            this.state = this._getDefaultState();
            this.notify(this.state);
            this.saveState();
        }
    }

    /**
     * Guarda el estado en localStorage
     */
    async saveState() {
        try {
            const stateToSave = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: this.state
            };

            localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error al guardar estado:', error);
        }
    }

    /**
     * Carga el estado desde localStorage
     */
    async loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Validar versión
                if (parsed.version === '1.0.0') {
                    // Merge con estado actual para asegurar que todas las claves existan
                    this.state = this._deepMerge(this._getDefaultState(), parsed.data);
                } else {
                    console.warn('Versión del store no compatible, usando valores por defecto');
                }
            }
        } catch (error) {
            console.error('Error al cargar estado:', error);
            // Usar estado por defecto
        }
    }

    /**
     * Limpia el estado del localStorage
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            this.state = this._getDefaultState();
            this.notify(this.state);
        } catch (error) {
            console.error('Error al limpiar estado:', error);
        }
    }

    // ============ MÉTODOS ESPECÍFICOS DE BLOQUE 6 ============

    /**
     * Agrega una comunidad
     * @param {Object} comunidad - Datos de la comunidad
     */
    addComunidad(comunidad) {
        const comunidades = [...this.state.comunidades];
        const nuevaComunidad = {
            id: this._generateId(),
            ...comunidad,
            createdAt: new Date().toISOString()
        };
        comunidades.push(nuevaComunidad);
        this.set('comunidades', comunidades);
        return nuevaComunidad;
    }

    /**
     * Actualiza una comunidad
     * @param {string} id - ID de la comunidad
     * @param {Object} updates - Actualizaciones
     */
    updateComunidad(id, updates) {
        const comunidades = this.state.comunidades.map(c => 
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        );
        this.set('comunidades', comunidades);
    }

    /**
     * Elimina una comunidad
     * @param {string} id - ID de la comunidad
     */
    deleteComunidad(id) {
        const comunidades = this.state.comunidades.filter(c => c.id !== id);
        this.set('comunidades', comunidades);
    }

    /**
     * Agrega un propietario
     * @param {Object} propietario - Datos del propietario
     */
    addPropietario(propietario) {
        const propietarios = [...this.state.propietarios];
        const nuevoPropietario = {
            id: this._generateId(),
            ...propietario,
            createdAt: new Date().toISOString()
        };
        propietarios.push(nuevoPropietario);
        this.set('propietarios', propietarios);
        return nuevoPropietario;
    }

    /**
     * Agrega una junta
     * @param {Object} junta - Datos de la junta
     */
    addJunta(junta) {
        const juntas = [...this.state.juntas];
        const nuevaJunta = {
            id: this._generateId(),
            ...junta,
            createdAt: new Date().toISOString()
        };
        juntas.push(nuevaJunta);
        this.set('juntas', juntas);
        return nuevaJunta;
    }

    /**
     * Actualiza una junta
     * @param {string} id - ID de la junta
     * @param {Object} updates - Actualizaciones
     */
    updateJunta(id, updates) {
        const juntas = this.state.juntas.map(j => 
            j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
        );
        this.set('juntas', juntas);
    }

    /**
     * Agrega un acta
     * @param {Object} acta - Datos del acta
     */
    addActa(acta) {
        const actas = [...this.state.actas];
        const nuevaActa = {
            id: this._generateId(),
            ...acta,
            createdAt: new Date().toISOString()
        };
        actas.push(nuevaActa);
        this.set('actas', actas);
        return nuevaActa;
    }

    /**
     * Actualiza un acta
     * @param {string} id - ID del acta
     * @param {Object} updates - Actualizaciones
     */
    updateActa(id, updates) {
        const actas = this.state.actas.map(a => 
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        );
        this.set('actas', actas);
    }

    /**
     * Agrega una exportación al historial
     * @param {Object} exportData - Datos de la exportación
     */
    addExportToHistory(exportData) {
        const history = [...this.state.exportHistory];
        const nuevaExportacion = {
            id: this._generateId(),
            ...exportData,
            timestamp: new Date().toISOString()
        };
        history.unshift(nuevaExportacion);
        
        // Mantener solo los últimos 100 registros
        if (history.length > 100) {
            history.pop();
        }
        
        this.set('exportHistory', history);
        return nuevaExportacion;
    }

    /**
     * Actualiza las configuraciones
     * @param {Object} settings - Nuevas configuraciones
     */
    updateSettings(settings) {
        this.set('settings', { ...this.state.settings, ...settings });
    }

    /**
     * Actualiza el estado UI
     * @param {Object} ui - Nuevos valores UI
     */
    updateUI(ui) {
        this.set('ui', { ...this.state.ui, ...ui });
    }

    // ============ MÉTODOS PRIVADOS ============

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    _setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    _deepMerge(target, source) {
        const output = { ...target };
        
        Object.keys(source).forEach(key => {
            if (this._isObject(source[key]) && this._isObject(target[key])) {
                output[key] = this._deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
        
        return output;
    }

    _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    _generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    _getDefaultState() {
        return {
            comunidades: [],
            propietarios: [],
            juntas: [],
            actas: [],
            exportHistory: [],
            settings: {
                theme: 'dark',
                language: 'es',
                dateFormat: 'DD/MM/YYYY',
                exportFormat: 'docx',
                validateBeforeExport: true,
                autoDownload: true
            },
            ui: {
                currentScreen: 'juntas',
                selectedJunta: null,
                selectedActa: null,
                sidebarOpen: true
            }
        };
    }

    _getDefaultValue(path) {
        const defaults = this._getDefaultState();
        return this._getNestedValue(defaults, path);
    }
}

// Instancia global
let gestactasStore = null;

/**
 * Obtiene la instancia del store
 * @returns {GestactasStore} Instancia del store
 */
function getStore() {
    if (!gestactasStore) {
        gestactasStore = new GestactasStore();
    }
    return gestactasStore;
}

/**
 * Inicializa el store
 * @returns {Promise<void>}
 */
async function initStore() {
    const store = getStore();
    await store.initialize();
    return store;
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GestactasStore, getStore, initStore };
}
