/**
 * GestActas - Servicio de validación de documentos DOCX
 * Bloque 6 - Validación de estructura y contenido de archivos Word
 */

class DocxValidationService {
    constructor() {
        this.requiredDocxElements = [
            '[Content_Types].xml',
            '_rels/.rels',
            'word/document.xml',
            'word/_rels/document.xml.rels'
        ];

        this.requiredActaFields = [
            'comunidad.nombre',
            'junta.tipo',
            'junta.fecha',
            'junta.hora',
            'junta.lugar'
        ];

        this.minimumTextLength = 100; // caracteres mínimos
    }

    /**
     * Valida la estructura del archivo DOCX
     * @param {Blob} docxBlob - Blob del documento DOCX
     * @returns {Promise<Object>} Resultado de la validación
     */
    async validateDocxStructure(docxBlob) {
        try {
            const errors = [];
            const warnings = [];
            
            // 1. Validar que es un blob válido
            if (!(docxBlob instanceof Blob)) {
                errors.push('El archivo no es un Blob válido');
                return this._createValidationResult(false, errors, warnings);
            }

            // 2. Validar tipo MIME
            const expectedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (docxBlob.type !== expectedMime) {
                warnings.push(`Tipo MIME inesperado: ${docxBlob.type}. Se esperaba: ${expectedMime}`);
            }

            // 3. Validar tamaño del archivo
            if (docxBlob.size === 0) {
                errors.push('El archivo DOCX está vacío');
            } else if (docxBlob.size < 1024) {
                warnings.push('El archivo DOCX parece demasiado pequeño (< 1KB)');
            } else if (docxBlob.size > 10 * 1024 * 1024) {
                warnings.push('El archivo DOCX es muy grande (> 10MB)');
            }

            // 4. En una implementación real, aquí se descomprimiría el ZIP y validarían los archivos internos
            // Por ahora, simulamos la validación
            warnings.push('Validación de estructura interna de ZIP no implementada (requiere librería de descompresión)');

            return this._createValidationResult(errors.length === 0, errors, warnings);

        } catch (error) {
            console.error('Error al validar estructura DOCX:', error);
            return this._createValidationResult(
                false, 
                [`Error en validación: ${error.message}`], 
                []
            );
        }
    }

    /**
     * Valida el contenido del acta antes de generar el DOCX
     * @param {Object} actaData - Datos del acta
     * @returns {Object} Resultado de la validación
     */
    validateActaContent(actaData) {
        const errors = [];
        const warnings = [];
        const info = [];

        // 1. Validar campos obligatorios
        this.requiredActaFields.forEach(fieldPath => {
            const fieldInfo = this._getFieldInfo(fieldPath);
            const value = this._getNestedValue(actaData, fieldPath);
            
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors.push(`Campo obligatorio faltante: ${fieldInfo.name}`);
            } else {
                info.push(`Campo OK: ${fieldInfo.name}`);
            }
        });

        // 2. Validar estructura de la comunidad
        if (!actaData.comunidad) {
            errors.push('Faltan datos de la comunidad');
        } else {
            if (!actaData.comunidad.nombre || actaData.comunidad.nombre.trim() === '') {
                errors.push('Nombre de la comunidad vacío');
            }
        }

        // 3. Validar estructura de la junta
        if (!actaData.junta) {
            errors.push('Faltan datos de la junta');
        } else {
            if (!this._isValidDate(actaData.junta.fecha)) {
                errors.push('Fecha de la junta inválida');
            }
            if (!this._isValidTime(actaData.junta.hora)) {
                warnings.push('Hora de la junta parece inválida');
            }
        }

        // 4. Validar asistentes
        if (!actaData.asistentes || !Array.isArray(actaData.asistentes)) {
            errors.push('Lista de asistentes no es válida');
        } else if (actaData.asistentes.length === 0) {
            warnings.push('No hay asistentes registrados');
        } else {
            // Validar que cada asistente tiene datos mínimos
            const incompleteAsistentes = actaData.asistentes.filter(
                a => !a.nombre || a.nombre.trim() === ''
            );
            if (incompleteAsistentes.length > 0) {
                warnings.push(`${incompleteAsistentes.length} asistentes sin nombre completo`);
            }
        }

        // 5. Validar quórum
        if (!actaData.quorum || actaData.quorum.trim() === '') {
            warnings.push('Quórum no especificado');
        }

        // 6. Validar orden del día
        if (!actaData.orden_dia || !Array.isArray(actaData.orden_dia)) {
            warnings.push('Orden del día no es válido');
        } else if (actaData.orden_dia.length === 0) {
            warnings.push('Orden del día vacío');
        }

        // 7. Validar acuerdos
        if (!actaData.acuerdos || !Array.isArray(actaData.acuerdos)) {
            warnings.push('Lista de acuerdos no es válida');
        } else if (actaData.acuerdos.length === 0) {
            warnings.push('No hay acuerdos registrados');
        }

        // 8. Validar votaciones (si existen)
        if (actaData.votaciones && Array.isArray(actaData.votaciones)) {
            const invalidVotaciones = actaData.votaciones.filter(v => 
                !v.asunto || v.asunto.trim() === ''
            );
            if (invalidVotaciones.length > 0) {
                warnings.push(`${invalidVotaciones.length} votaciones sin asunto`);
            }
        }

        // 9. Validar firmas
        if (!actaData.firmas) {
            warnings.push('Datos de firmas no especificados');
        } else {
            if (!actaData.firmas.presidente || actaData.firmas.presidente.trim() === '') {
                warnings.push('Firma del presidente no especificada');
            }
            if (!actaData.firmas.secretario || actaData.firmas.secretario.trim() === '') {
                warnings.push('Firma del secretario no especificada');
            }
        }

        // 10. Validar longitud mínima del contenido
        const totalLength = this._calculateContentLength(actaData);
        if (totalLength < this.minimumTextLength) {
            warnings.push(`Contenido del acta parece muy corto (${totalLength} caracteres)`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            info,
            stats: {
                totalAsistentes: actaData.asistentes?.length || 0,
                totalAcuerdos: actaData.acuerdos?.length || 0,
                totalVotaciones: actaData.votaciones?.length || 0,
                contentLength: totalLength
            }
        };
    }

    /**
     * Valida que una plantilla es correcta
     * @param {Object} template - Datos de la plantilla
     * @returns {Object} Resultado de la validación
     */
    validateTemplate(template) {
        const errors = [];
        const warnings = [];

        if (!template) {
            errors.push('La plantilla está vacía');
            return this._createValidationResult(false, errors, warnings);
        }

        // Validar campos obligatorios de la plantilla
        if (!template.nombre || template.nombre.trim() === '') {
            errors.push('La plantilla no tiene nombre');
        }

        if (!template.tipo || template.tipo.trim() === '') {
            errors.push('La plantilla no tiene tipo especificado');
        }

        // Validar estructura de secciones
        if (!template.secciones || !Array.isArray(template.secciones)) {
            errors.push('La plantilla no tiene secciones definidas');
        } else if (template.secciones.length === 0) {
            warnings.push('La plantilla no tiene secciones');
        }

        // Validar configuración de márgenes
        if (template.margins) {
            const { top, right, bottom, left } = template.margins;
            if (top < 1 || top > 5) warnings.push('Margen superior fuera de rango recomendado (1-5 cm)');
            if (right < 1 || right > 5) warnings.push('Margen derecho fuera de rango recomendado (1-5 cm)');
            if (bottom < 1 || bottom > 5) warnings.push('Margen inferior fuera de rango recomendado (1-5 cm)');
            if (left < 1 || left > 5) warnings.push('Margen izquierdo fuera de rango recomendado (1-5 cm)');
        }

        return this._createValidationResult(errors.length === 0, errors, warnings);
    }

    /**
     * Genera un reporte detallado de validación
     * @param {Object} validationResult - Resultado de la validación
     * @returns {string} Reporte formateado
     */
    generateValidationReport(validationResult) {
        let report = '=== REPORTE DE VALIDACIÓN ===\n\n';
        
        report += `Estado: ${validationResult.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n\n`;
        
        if (validationResult.errors && validationResult.errors.length > 0) {
            report += 'ERRORES:\n';
            validationResult.errors.forEach((error, index) => {
                report += `  ${index + 1}. ${error}\n`;
            });
            report += '\n';
        }
        
        if (validationResult.warnings && validationResult.warnings.length > 0) {
            report += 'ADVERTENCIAS:\n';
            validationResult.warnings.forEach((warning, index) => {
                report += `  ${index + 1}. ${warning}\n`;
            });
            report += '\n';
        }
        
        if (validationResult.info && validationResult.info.length > 0) {
            report += 'INFORMACIÓN:\n';
            validationResult.info.forEach((info, index) => {
                report += `  ${index + 1}. ${info}\n`;
            });
            report += '\n';
        }
        
        if (validationResult.stats) {
            report += 'ESTADÍSTICAS:\n';
            report += `  Asistentes: ${validationResult.stats.totalAsistentes}\n`;
            report += `  Acuerdos: ${validationResult.stats.totalAcuerdos}\n`;
            report += `  Votaciones: ${validationResult.stats.totalVotaciones}\n`;
            report += `  Longitud del contenido: ${validationResult.stats.contentLength} caracteres\n`;
        }
        
        return report;
    }

    // ============ MÉTODOS PRIVADOS ============

    _createValidationResult(isValid, errors, warnings) {
        return {
            isValid,
            errors,
            warnings,
            timestamp: new Date().toISOString()
        };
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    _getFieldInfo(fieldPath) {
        const fieldMap = {
            'comunidad.nombre': { name: 'Nombre de la comunidad' },
            'junta.tipo': { name: 'Tipo de junta' },
            'junta.fecha': { name: 'Fecha de la junta' },
            'junta.hora': { name: 'Hora de la junta' },
            'junta.lugar': { name: 'Lugar de la junta' }
        };
        return fieldMap[fieldPath] || { name: fieldPath };
    }

    _isValidDate(dateString) {
        if (!dateString) return false;
        
        try {
            const date = new Date(dateString);
            return date instanceof Date && !isNaN(date);
        } catch (error) {
            return false;
        }
    }

    _isValidTime(timeString) {
        if (!timeString) return false;
        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    _calculateContentLength(actaData) {
        let length = 0;
        
        if (actaData.comunidad?.nombre) length += actaData.comunidad.nombre.length;
        if (actaData.junta?.tipo) length += actaData.junta.tipo.length;
        if (actaData.orden_dia) length += actaData.orden_dia.join(' ').length;
        if (actaData.desarrollo) length += actaData.desarrollo.length;
        if (actaData.acuerdos) length += actaData.acuerdos.join(' ').length;
        if (actaData.votaciones) {
            actaData.votaciones.forEach(v => {
                if (v.asunto) length += v.asunto.length;
                if (v.decision_aprobada) length += v.decision_aprobada.length;
            });
        }
        
        return length;
    }
}

// Exportar el servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocxValidationService;
}
