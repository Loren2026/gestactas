/**
 * GestActas - Utilidades de Almacenamiento
 * 
 * Utilidades para facilitar el almacenamiento y gestión de datos.
 */

import { indexedDBService } from '../services/indexeddb.service.js';

class StorageUtils {
    /**
     * Guarda datos en localStorage con expiración
     */
    static guardarConExpiracion(clave, valor, minutosExpiracion = 60) {
        try {
            const datos = {
                valor: valor,
                expiracion: Date.now() + (minutosExpiracion * 60 * 1000)
            };
            localStorage.setItem(clave, JSON.stringify(datos));
        } catch (error) {
            console.error('Error al guardar con expiración:', error);
            throw error;
        }
    }

    /**
     * Obtiene datos de localStorage con verificación de expiración
     */
    static obtenerConExpiracion(clave) {
        try {
            const datos = localStorage.getItem(clave);
            
            if (!datos) {
                return null;
            }

            const parseados = JSON.parse(datos);

            if (Date.now() > parseados.expiracion) {
                localStorage.removeItem(clave);
                return null;
            }

            return parseados.valor;
        } catch (error) {
            console.error('Error al obtener con expiración:', error);
            return null;
        }
    }

    /**
     * Limpia datos expirados de localStorage
     */
    static limpiarExpirados() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                const datos = localStorage.getItem(clave);
                
                if (datos) {
                    try {
                        const parseados = JSON.parse(datos);
                        if (parseados.expiracion && Date.now() > parseados.expiracion) {
                            localStorage.removeItem(clave);
                        }
                    } catch (e) {
                        // Ignorar errores de parseo
                    }
                }
            }
        } catch (error) {
            console.error('Error al limpiar expirados:', error);
        }
    }

    /**
     * Guarda la configuración de la aplicación
     */
    static guardarConfiguracion(configuracion) {
        try {
            localStorage.setItem('gestactas_config', JSON.stringify(configuracion));
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            throw error;
        }
    }

    /**
     * Obtiene la configuración de la aplicación
     */
    static obtenerConfiguracion() {
        try {
            const config = localStorage.getItem('gestactas_config');
            return config ? JSON.parse(config) : null;
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            return null;
        }
    }

    /**
     * Guarda las API keys de forma segura
     */
    static guardarAPIKeys(apiKeys) {
        try {
            const config = this.obtenerConfiguracion() || {};
            config.apiKeys = apiKeys;
            this.guardarConfiguracion(config);
        } catch (error) {
            console.error('Error al guardar API keys:', error);
            throw error;
        }
    }

    /**
     * Obtiene las API keys
     */
    static obtenerAPIKeys() {
        try {
            const config = this.obtenerConfiguracion();
            return config?.apiKeys || {};
        } catch (error) {
            console.error('Error al obtener API keys:', error);
            return {};
        }
    }

    /**
     * Convierte un Blob a base64
     */
    static async blobABase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Convierte base64 a Blob
     */
    static base64ABlob(base64, tipo) {
        try {
            const byteCharacters = atob(base64.split(',')[1]);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            
            return new Blob(byteArrays, { type: tipo });
        } catch (error) {
            console.error('Error al convertir base64 a blob:', error);
            throw error;
        }
    }

    /**
     * Descarga un archivo
     */
    static descargarArchivo(contenido, nombreArchivo, tipo) {
        try {
            const blob = new Blob([contenido], { type: tipo });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            throw error;
        }
    }

    /**
     * Comprime un texto usando simple compresión (opcional)
     */
    static comprimirTexto(texto) {
        // Implementación simple de compresión
        return texto
            .replace(/\s+/g, ' ')  // Reducir espacios múltiples
            .replace(/\n\s*\n/g, '\n\n');  // Reducir saltos de línea múltiples
    }

    /**
     * Obtiene el tamaño de almacenamiento usado
     */
    static obtenerTamañoAlmacenamiento() {
        try {
            let total = 0;
            
            for (let clave in localStorage) {
                if (localStorage.hasOwnProperty(clave)) {
                    total += localStorage[clave].length + clave.length;
                }
            }
            
            return {
                localStorage: total,
                localStorageKB: (total / 1024).toFixed(2),
                localStorageMB: (total / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error al obtener tamaño de almacenamiento:', error);
            return { localStorage: 0, localStorageKB: 0, localStorageMB: 0 };
        }
    }

    /**
     * Limpia todos los datos de la aplicación
     */
    static async limpiarTodosLosDatos() {
        try {
            // Limpiar localStorage
            localStorage.clear();
            
            // Limpiar IndexedDB
            const stores = ['comunidades', 'propietarios', 'juntas', 'asistentes', 'grabaciones', 'transcripciones', 'actas', 'exportaciones'];
            
            for (const store of stores) {
                await indexedDBService.clear(store);
            }
            
            console.log('Todos los datos han sido limpiados');
        } catch (error) {
            console.error('Error al limpiar todos los datos:', error);
            throw error;
        }
    }

    /**
     * Exporta todos los datos de la aplicación
     */
    static async exportarTodosLosDatos() {
        try {
            const datos = await indexedDBService.backup();
            const datosJSON = JSON.stringify(datos, null, 2);
            this.descargarArchivo(datosJSON, `gestactas_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            return datos;
        } catch (error) {
            console.error('Error al exportar todos los datos:', error);
            throw error;
        }
    }

    /**
     * Importa datos a la aplicación
     */
    static async importarDatos(archivoJSON) {
        try {
            const datos = JSON.parse(archivoJSON);
            await indexedDBService.restore(datos);
            console.log('Datos importados correctamente');
            return datos;
        } catch (error) {
            console.error('Error al importar datos:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de uso
     */
    static async obtenerEstadisticas() {
        try {
            const stats = {
                comunidades: await indexedDBService.getAll('comunidades'),
                propietarios: await indexedDBService.getAll('propietarios'),
                juntas: await indexedDBService.getAll('juntas'),
                asistentes: await indexedDBService.getAll('asistentes'),
                grabaciones: await indexedDBService.getAll('grabaciones'),
                transcripciones: await indexedDBService.getAll('transcripciones'),
                actas: await indexedDBService.getAll('actas'),
                exportaciones: await indexedDBService.getAll('exportaciones')
            };

            return {
                comunidades: stats.comunidades.length,
                propietarios: stats.propietarios.length,
                juntas: stats.juntas.length,
                asistentes: stats.asistentes.length,
                grabaciones: stats.grabaciones.length,
                transcripciones: stats.transcripciones.length,
                actas: stats.actas.length,
                exportaciones: stats.exportaciones.length,
                almacenamiento: this.obtenerTamañoAlmacenamiento()
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    /**
     * Formatea el tamaño de archivo
     */
    static formatearTamaño(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + tamaños[i];
    }
}

// Exportar la clase
export { StorageUtils };
