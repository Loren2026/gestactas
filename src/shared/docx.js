/**
 * GestActas - Utilidades compartidas para documentos DOCX
 * Bloque 6 - Funciones de ayuda para generación de Word
 */

class DocxUtils {
    /**
     * Formatea una fecha al formato español
     * @param {string|Date} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    static formatDate(date) {
        if (!date) return '';
        
        try {
            const d = new Date(date);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            return d.toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return date.toString();
        }
    }

    /**
     * Formatea una hora al formato español
     * @param {string} time - Hora a formatear (HH:MM)
     * @returns {string} Hora formateada
     */
    static formatTime(time) {
        if (!time) return '';
        
        try {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours, 10);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${period}`;
        } catch (error) {
            console.error('Error al formatear hora:', error);
            return time;
        }
    }

    /**
     * Limpia un texto para uso en nombres de archivo
     * @param {string} text - Texto a limpiar
     * @returns {string} Texto limpio
     */
    static sanitizeFilename(text) {
        if (!text) return '';
        
        // Reemplazar caracteres especiales
        let sanitized = text
            .replace(/[áàäâãå]/gi, 'a')
            .replace(/[éèëê]/gi, 'e')
            .replace(/[íìïî]/gi, 'i')
            .replace(/[óòöôõ]/gi, 'o')
            .replace(/[úùüû]/gi, 'u')
            .replace(/[ñ]/gi, 'n')
            .replace(/[ç]/gi, 'c')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        
        return sanitized;
    }

    /**
     * Convierte un número a formato de moneda
     * @param {number} amount - Cantidad a formatear
     * @param {string} currency - Código de moneda (EUR, USD, etc.)
     * @returns {string} Cantidad formateada
     */
    static formatCurrency(amount, currency = 'EUR') {
        if (amount === null || amount === undefined) return '0,00 €';
        
        try {
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error('Error al formatear moneda:', error);
            return `${amount} ${currency}`;
        }
    }

    /**
     * Calcula el porcentaje de participación
     * @param {number} numerator - Numerador
     * @param {number} denominator - Denominador
     * @returns {string} Porcentaje formateado
     */
    static calculatePercentage(numerator, denominator) {
        if (!denominator || denominator === 0) return '0,00%';
        
        try {
            const percentage = (numerator / denominator) * 100;
            return percentage.toFixed(2).replace('.', ',') + '%';
        } catch (error) {
            console.error('Error al calcular porcentaje:', error);
            return '0,00%';
        }
    }

    /**
     * Genera un nombre único para archivo
     * @param {string} baseName - Nombre base
     * @param {string} extension - Extensión del archivo
     * @returns {string} Nombre único
     */
    static generateUniqueFilename(baseName, extension = 'docx') {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .split('-')[0..5].join('-');
        
        const sanitizedBase = this.sanitizeFilename(baseName);
        
        return `${sanitizedBase}_${timestamp}.${extension}`;
    }

    /**
     * Valida un número de documento de identidad (DNI/NIE)
     * @param {string} dni - Número a validar
     * @returns {boolean} True si es válido
     */
    static validateDNI(dni) {
        if (!dni) return false;
        
        // Eliminar espacios y guiones
        const cleanDNI = dni.replace(/[\s-]/g, '').toUpperCase();
        
        // Validar formato básico (8 o 9 caracteres + letra)
        const dniRegex = /^[XYZ]?\d{7,8}[A-Z]$/;
        if (!dniRegex.test(cleanDNI)) return false;
        
        // Calcular letra de control
        const dniNumber = cleanDNI
            .replace(/^[XYZ]/, match => {
                return { 'X': '0', 'Y': '1', 'Z': '2' }[match];
            })
            .slice(0, -1);
        
        const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const letterIndex = parseInt(dniNumber, 10) % 23;
        const calculatedLetter = letters[letterIndex];
        
        return cleanDNI.slice(-1) === calculatedLetter;
    }

    /**
     * Valida un código postal español
     * @param {string} postalCode - Código postal a validar
     * @returns {boolean} True si es válido
     */
    static validatePostalCode(postalCode) {
        if (!postalCode) return false;
        
        const cpRegex = /^[0-5]\d{4}$/;
        return cpRegex.test(postalCode);
    }

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    static validateEmail(email) {
        if (!email) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Trunca un texto a una longitud máxima
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @param {string} suffix - Sufijo para indicar truncamiento
     * @returns {string} Texto truncado
     */
    static truncateText(text, maxLength, suffix = '...') {
        if (!text) return '';
        
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Escapa caracteres especiales para HTML
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    static escapeHTML(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, char => map[char]);
    }

    /**
     * Formatea un número con separadores de miles
     * @param {number} number - Número a formatear
     * @returns {string} Número formateado
     */
    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        
        try {
            return new Intl.NumberFormat('es-ES').format(number);
        } catch (error) {
            console.error('Error al formatear número:', error);
            return number.toString();
        }
    }

    /**
     * Convierte un objeto a string JSON formateado
     * @param {Object} obj - Objeto a convertir
     * @param {number} indent - Nivel de indentación
     * @returns {string} JSON formateado
     */
    static toJSONString(obj, indent = 2) {
        try {
            return JSON.stringify(obj, null, indent);
        } catch (error) {
            console.error('Error al convertir a JSON:', error);
            return '{}';
        }
    }

    /**
     * Descarga un blob como archivo
     * @param {Blob} blob - Blob a descargar
     * @param {string} filename - Nombre del archivo
     */
    static downloadBlob(blob, filename) {
        if (typeof window === 'undefined') {
            console.log(`Download simulated: ${filename} (${blob.size} bytes)`);
            return;
        }

        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar blob:', error);
            throw new Error(`Error al descargar archivo: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo blob con contenido de texto
     * @param {string} content - Contenido del blob
     * @param {string} mimeType - Tipo MIME del blob
     * @returns {Blob} Blob creado
     */
    static createTextBlob(content, mimeType = 'text/plain') {
        return new Blob([content], { type: mimeType });
    }

    /**
     * Lee el contenido de un blob como texto
     * @param {Blob} blob - Blob a leer
     * @returns {Promise<string>} Contenido del blob
     */
    static async readBlobAsText(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error al leer blob'));
            
            reader.readAsText(blob);
        });
    }

    /**
     * Comprueba si un navegador soporta una característica
     * @param {string} feature - Característica a comprobar
     * @returns {boolean} True si está soportada
     */
    static supportsFeature(feature) {
        switch (feature) {
            case 'blob':
                return typeof Blob !== 'undefined';
            case 'filereader':
                return typeof FileReader !== 'undefined';
            case 'url':
                return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
            case 'download':
                return typeof document !== 'undefined' && 'download' in document.createElement('a');
            default:
                return false;
        }
    }
}

// Exportar las utilidades
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocxUtils;
}
