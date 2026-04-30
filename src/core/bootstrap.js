/**
 * GestActas - Bootstrap de inicialización
 * Bloque 6 - Configuración y arranque de la aplicación
 */

class GestactasBootstrap {
    constructor() {
        this.services = {};
        this.initialized = false;
        this.config = {
            appName: 'GestActas',
            version: '1.0.0',
            block: '6',
            features: {
                exportToWord: true,
                previewDocuments: true,
                validateDocuments: true,
                shareDocuments: true,
                exportHistory: true
            },
            storage: {
                prefix: 'gestactas_',
                versionKey: 'gestactas_version'
            }
        };
    }

    /**
     * Inicializa la aplicación
     * @returns {Promise<Object>} Resultado de la inicialización
     */
    async initialize() {
        if (this.initialized) {
            console.warn('GestActas ya está inicializado');
            return { success: true, message: 'Ya inicializado' };
        }

        try {
            console.log('🚀 Inicializando GestActas Bloque 6...');

            // 1. Verificar compatibilidad del navegador
            const compatibility = this._checkCompatibility();
            if (!compatibility.compatible) {
                return {
                    success: false,
                    error: 'Navegador no compatible',
                    details: compatibility.errors
                };
            }

            // 2. Inicializar almacenamiento
            await this._initializeStorage();

            // 3. Inicializar servicios
            await this._initializeServices();

            // 4. Inicializar componentes UI
            await this._initializeUI();

            // 5. Configurar eventos globales
            this._setupGlobalEvents();

            // 6. Marcar como inicializado
            this.initialized = true;

            console.log('✅ GestActas Bloque 6 inicializado correctamente');
            
            return {
                success: true,
                message: 'GestActas inicializado correctamente',
                version: this.config.version,
                block: this.config.block
            };

        } catch (error) {
            console.error('❌ Error al inicializar GestActas:', error);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * Obtiene un servicio inicializado
     * @param {string} serviceName - Nombre del servicio
     * @returns {Object|null} Servicio o null si no existe
     */
    getService(serviceName) {
        return this.services[serviceName] || null;
    }

    /**
     * Registra un nuevo servicio
     * @param {string} serviceName - Nombre del servicio
     * @param {Object} service - Instancia del servicio
     */
    registerService(serviceName, service) {
        this.services[serviceName] = service;
        console.log(`📦 Servicio registrado: ${serviceName}`);
    }

    /**
     * Obtiene la configuración de la aplicación
     * @returns {Object} Configuración
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Actualiza la configuración de la aplicación
     * @param {Object} newConfig - Nueva configuración (merge con la existente)
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuración actualizada:', newConfig);
    }

    /**
     * Cierra la aplicación y limpia recursos
     * @returns {Promise<void>}
     */
    async shutdown() {
        console.log('🛑 Cerrando GestActas...');

        // Limpiar servicios
        for (const serviceName in this.services) {
            if (this.services[serviceName].shutdown) {
                try {
                    await this.services[serviceName].shutdown();
                } catch (error) {
                    console.error(`Error al cerrar servicio ${serviceName}:`, error);
                }
            }
        }

        this.services = {};
        this.initialized = false;

        console.log('✅ GestActas cerrado correctamente');
    }

    // ============ MÉTODOS PRIVADOS ============

    /**
     * Verifica la compatibilidad del navegador
     * @returns {Object} Resultado de la verificación
     */
    _checkCompatibility() {
        const errors = [];

        // Verificar características requeridas
        const requiredFeatures = [
            { name: 'Blob', check: () => typeof Blob !== 'undefined' },
            { name: 'FileReader', check: () => typeof FileReader !== 'undefined' },
            { name: 'localStorage', check: () => typeof localStorage !== 'undefined' },
            { name: 'Promise', check: () => typeof Promise !== 'undefined' },
            { name: 'Array.from', check: () => typeof Array.from === 'function' },
            { name: 'Object.assign', check: () => typeof Object.assign === 'function' }
        ];

        requiredFeatures.forEach(feature => {
            if (!feature.check()) {
                errors.push(`Característica no soportada: ${feature.name}`);
            }
        });

        return {
            compatible: errors.length === 0,
            errors
        };
    }

    /**
     * Inicializa el almacenamiento
     * @returns {Promise<void>}
     */
    async _initializeStorage() {
        console.log('💾 Inicializando almacenamiento...');

        try {
            // Verificar soporte de localStorage
            if (typeof localStorage === 'undefined') {
                throw new Error('localStorage no está disponible');
            }

            // Guardar versión actual
            localStorage.setItem(this.config.storage.versionKey, this.config.version);

            console.log('✅ Almacenamiento inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar almacenamiento:', error);
            throw error;
        }
    }

    /**
     * Inicializa los servicios de la aplicación
     * @returns {Promise<void>}
     */
    async _initializeServices() {
        console.log('📦 Inicializando servicios...');

        try {
            // Cargar servicios de Bloque 6 si están disponibles
            // ActaDocxService
            if (typeof ActaDocxService !== 'undefined') {
                const docxService = new ActaDocxService();
                this.registerService('docxService', docxService);
            }

            // DocxValidationService
            if (typeof DocxValidationService !== 'undefined') {
                const validationService = new DocxValidationService();
                this.registerService('validationService', validationService);
            }

            // ActasExportService
            if (typeof ActasExportService !== 'undefined' && 
                typeof ActaDocxService !== 'undefined' && 
                typeof DocxValidationService !== 'undefined') {
                
                const docxService = new ActaDocxService();
                const validationService = new DocxValidationService();
                const exportService = new ActasExportService(docxService, validationService);
                this.registerService('exportService', exportService);
            }

            console.log('✅ Servicios inicializados');
        } catch (error) {
            console.error('❌ Error al inicializar servicios:', error);
            throw error;
        }
    }

    /**
     * Inicializa los componentes UI
     * @returns {Promise<void>}
     */
    async _initializeUI() {
        console.log('🎨 Inicializando UI...');

        try {
            // Agregar meta tags si no existen
            this._ensureMetaTags();

            // Configurar manejo de errores globales
            this._setupErrorHandling();

            console.log('✅ UI inicializada');
        } catch (error) {
            console.error('❌ Error al inicializar UI:', error);
            throw error;
        }
    }

    /**
     * Configura eventos globales
     */
    _setupGlobalEvents() {
        // Manejo de visibility change (cuando el usuario cambia de pestaña)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('👋 GestActas en segundo plano');
                } else {
                    console.log('👋 GestActas en primer plano');
                }
            });
        }

        // Manejo de resize
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                console.log('📐 Ventana redimensionada');
            });
        }
    }

    /**
     * Asegura que los meta tags necesarios existan
     */
    _ensureMetaTags() {
        if (typeof document === 'undefined') return;

        const metaTags = [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
            { name: 'theme-color', content: '#764ba2' },
            { charset: 'UTF-8' }
        ];

        metaTags.forEach(tag => {
            const existing = document.querySelector(`meta[${tag.name || 'charset'}="${tag.name || tag.charset}"]`);
            if (!existing) {
                const meta = document.createElement('meta');
                if (tag.charset) {
                    meta.setAttribute('charset', tag.charset);
                } else {
                    meta.setAttribute('name', tag.name);
                    meta.setAttribute('content', tag.content);
                }
                document.head.appendChild(meta);
            }
        });
    }

    /**
     * Configura el manejo de errores global
     */
    _setupErrorHandling() {
        if (typeof window === 'undefined') return;

        // Capturar errores no manejados
        window.addEventListener('error', (event) => {
            console.error('❌ Error global no manejado:', event.error);
            this._showUserError('Se ha producido un error inesperado');
        });

        // Capturar promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promesa rechazada no manejada:', event.reason);
            this._showUserError('Se ha producido un error inesperado');
        });
    }

    /**
     * Muestra un error al usuario
     * @param {string} message - Mensaje de error
     */
    _showUserError(message) {
        if (typeof document !== 'undefined') {
            const existingError = document.getElementById('gestactas-error-notification');
            if (existingError) {
                existingError.remove();
            }

            const errorDiv = document.createElement('div');
            errorDiv.id = 'gestactas-error-notification';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                max-width: 400px;
            `;
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);

            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
}

// Instancia global
let gestactasBootstrap = null;

/**
 * Inicializa GestActas
 * @returns {Promise<Object>} Resultado de la inicialización
 */
async function initGestactas() {
    if (!gestactasBootstrap) {
        gestactasBootstrap = new GestactasBootstrap();
    }
    return await gestactasBootstrap.initialize();
}

/**
 * Obtiene la instancia de bootstrap
 * @returns {GestactasBootstrap} Instancia de bootstrap
 */
function getBootstrap() {
    return gestactasBootstrap;
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GestactasBootstrap, initGestactas, getBootstrap };
}
