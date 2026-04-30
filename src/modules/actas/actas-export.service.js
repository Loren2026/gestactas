/**
 * GestActas - Servicio de exportación de actas
 * Bloque 6 - Exportación a Word (.docx) profesional
 */

class ActasExportService {
    constructor(actaDocxService, docxValidationService) {
        this.docxService = actaDocxService;
        this.validationService = docxValidationService;
    }

    /**
     * Exporta un acta a formato Word (.docx)
     * @param {string|Object} actaInput - ID del acta u objeto con datos del acta
     * @param {Object} options - Opciones de exportación
     * @returns {Promise<Object>} Resultado de la exportación
     */
    async exportActaToDocx(actaInput, options = {}) {
        try {
            const errors = [];
            const warnings = [];

            // 1. Obtener datos del acta
            const actaData = await this._getActaData(actaInput);
            if (!actaData) {
                return this._createExportResult(
                    false,
                    ['No se pudieron obtener los datos del acta'],
                    warnings,
                    null
                );
            }

            // 2. Validar datos del acta
            const contentValidation = this.validationService.validateActaContent(actaData);
            if (!contentValidation.isValid) {
                return this._createExportResult(
                    false,
                    contentValidation.errors,
                    contentValidation.warnings,
                    null,
                    contentValidation.info
                );
            }

            warnings.push(...contentValidation.warnings);

            // 3. Construir documento DOCX
            const docStructure = this.docxService.buildActaDocx(actaData);

            // 4. Generar blob DOCX
            const docxBlob = this.docxService.generateDocxBlob(docStructure);

            // 5. Validar estructura del DOCX (opcional)
            if (options.validateDocx !== false) {
                const docxValidation = await this.validationService.validateDocxStructure(docxBlob);
                if (!docxValidation.isValid) {
                    errors.push(...docxValidation.errors);
                }
                warnings.push(...docxValidation.warnings);
            }

            // 6. Generar nombre de archivo
            const filename = this._generateFilename(actaData, options.filename);

            // 7. Descargar archivo (si está en navegador)
            if (options.download !== false) {
                this._downloadFile(docxBlob, filename);
            }

            return this._createExportResult(
                true,
                [],
                warnings,
                {
                    blob: docxBlob,
                    filename,
                    size: docxBlob.size,
                    type: docxBlob.type
                },
                contentValidation.info,
                contentValidation.stats
            );

        } catch (error) {
            console.error('Error al exportar acta a DOCX:', error);
            return this._createExportResult(
                false,
                [`Error al exportar: ${error.message}`],
                [],
                null
            );
        }
    }

    /**
     * Genera una vista previa del documento
     * @param {string|Object} actaInput - ID del acta u objeto con datos del acta
     * @returns {Promise<Object>} Vista previa del documento
     */
    async previewActa(actaInput) {
        try {
            const actaData = await this._getActaData(actaInput);
            if (!actaData) {
                throw new Error('No se pudieron obtener los datos del acta');
            }

            const docStructure = this.docxService.buildActaDocx(actaData);
            
            return {
                success: true,
                preview: this._formatPreview(docStructure),
                metadata: {
                    comunidad: actaData.comunidad?.nombre,
                    fecha: actaData.junta?.fecha,
                    tipo: actaData.junta?.tipo,
                    asistentes: actaData.asistentes?.length || 0,
                    acuerdos: actaData.acuerdos?.length || 0
                }
            };

        } catch (error) {
            console.error('Error al generar vista previa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Valida un acta antes de exportar
     * @param {string|Object} actaInput - ID del acta u objeto con datos del acta
     * @returns {Promise<Object>} Resultado de la validación
     */
    async validateActaForExport(actaInput) {
        try {
            const actaData = await this._getActaData(actaInput);
            if (!actaData) {
                return {
                    isValid: false,
                    errors: ['No se pudieron obtener los datos del acta'],
                    warnings: []
                };
            }

            const validation = this.validationService.validateActaContent(actaData);
            
            // Generar reporte
            const report = this.validationService.generateValidationReport(validation);
            
            return {
                ...validation,
                report
            };

        } catch (error) {
            console.error('Error al validar acta:', error);
            return {
                isValid: false,
                errors: [`Error en validación: ${error.message}`],
                warnings: []
            };
        }
    }

    /**
     * Comparte un acta exportada (genera enlace para compartir)
     * @param {string|Object} actaInput - ID del acta u objeto con datos del acta
     * @returns {Promise<Object>} Resultado de compartir
     */
    async shareActa(actaInput) {
        try {
            const exportResult = await this.exportActaToDocx(actaInput, {
                download: false,
                validateDocx: false
            });

            if (!exportResult.success) {
                return exportResult;
            }

            // En una implementación real, aquí se subiría el blob a un servicio de almacenamiento
            // y se generaría un enlace compartible
            return {
                success: true,
                message: 'Funcionalidad de compartir no implementada en este entorno de demostración',
                filename: exportResult.file.filename,
                size: exportResult.file.size
            };

        } catch (error) {
            console.error('Error al compartir acta:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Genera un historial de exportaciones (simulado)
     * @param {Object} filters - Filtros para el historial
     * @returns {Promise<Object>} Historial de exportaciones
     */
    async getExportHistory(filters = {}) {
        try {
            // En una implementación real, esto leería de IndexedDB o base de datos
            // Por ahora, simulamos un historial vacío
            return {
                success: true,
                exports: [],
                total: 0,
                filters
            };

        } catch (error) {
            console.error('Error al obtener historial:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ MÉTODOS PRIVADOS ============

    async _getActaData(actaInput) {
        // Si es un objeto, retornarlo directamente
        if (typeof actaInput === 'object' && actaInput !== null) {
            return actaInput;
        }

        // Si es un ID, buscar en el almacén (en una implementación real)
        // Por ahora, retornamos null ya que no hay acceso al almacén
        console.warn('Buscando acta por ID no implementado en este entorno');
        return null;
    }

    _generateFilename(actaData, customFilename) {
        if (customFilename) {
            return customFilename.endsWith('.docx') ? customFilename : `${customFilename}.docx`;
        }

        const comunidad = actaData.comunidad?.nombre || 'Comunidad';
        const fecha = actaData.junta?.fecha || '';
        const tipo = actaData.junta?.tipo || 'Junta';

        // Formatear nombre
        const comunidadSanitized = comunidad.replace(/[^a-zA-Z0-9]/g, '_');
        const fechaSanitized = fecha ? fecha.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
        const tipoSanitized = tipo.replace(/[^a-zA-Z0-9]/g, '_');

        return `${comunidadSanitized}_${tipoSanitized}_${fechaSanitized}.docx`;
    }

    _downloadFile(blob, filename) {
        if (typeof window === 'undefined') {
            console.log(`Download simulated: ${filename} (${blob.size} bytes)`);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    _createExportResult(success, errors, warnings, file, info, stats) {
        return {
            success,
            errors,
            warnings,
            file,
            info,
            stats,
            timestamp: new Date().toISOString()
        };
    }

    _formatPreview(docStructure) {
        let preview = '';

        docStructure.sections.forEach(section => {
            switch (section.type) {
                case 'cabecera':
                    preview += '📋 CABECERA INSTITUCIONAL\n';
                    if (section.content.nombre_comunidad) preview += `  ${section.content.nombre_comunidad}\n`;
                    break;
                case 'titulo':
                    preview += '\n📄 ' + section.content.replace(/\n/g, ' | ') + '\n';
                    break;
                case 'datos_junta':
                    preview += '\n📅 ' + section.content.fecha + ' - ' + section.content.hora + '\n';
                    preview += '📍 ' + section.content.lugar + '\n';
                    break;
                case 'asistentes_quorum':
                    preview += `\n👥 Asistentes: ${section.content.asistentes.length} | Quórum: ${section.content.quorum}\n`;
                    break;
                case 'acuerdos':
                    preview += `\n✅ Acuerdos: ${section.content.length}\n`;
                    section.content.slice(0, 3).forEach((acuerdo, i) => {
                        preview += `  ${i + 1}. ${acuerdo.substring(0, 50)}...\n`;
                    });
                    if (section.content.length > 3) preview += `  ... y ${section.content.length - 3} más\n`;
                    break;
                case 'firmas':
                    preview += '\n✍️ Firmas: ' + section.content.presidente + ' / ' + section.content.secretario + '\n';
                    break;
            }
        });

        return preview;
    }
}

// Exportar el servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActasExportService;
}
