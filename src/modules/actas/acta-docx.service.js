/**
 * GestActas - Servicio de generación de documentos Word (.docx) profesionales
 * Bloque 6 - Exportación final de actas a formato Word
 */

class ActaDocxService {
    constructor() {
        this.defaultMargins = {
            top: 2.5,    // cm
            right: 2.5,  // cm
            bottom: 2.5, // cm
            left: 2.5    // cm
        };
        
        this.defaultStyles = {
            title: { fontSize: 16, bold: true, alignment: 'center' },
            subtitle: { fontSize: 12, bold: true },
            normal: { fontSize: 11 },
            small: { fontSize: 10 }
        };
    }

    /**
     * Construye un documento Word profesional a partir de los datos del acta
     * @param {Object} actaData - Datos del acta ya estructurados
     * @returns {Object} Objeto con la estructura del documento
     */
    buildActaDocx(actaData) {
        try {
            const docStructure = {
                creator: 'GestActas',
                title: `ACTA ${actaData.junta.tipo.toUpperCase()} - ${actaData.comunidad.nombre}`,
                subject: `Acta de junta de propietarios`,
                keywords: 'junta, propietarios, comunidad, acta',
                sections: []
            };

            // 1. Cabecera institucional
            docStructure.sections.push(this._buildCabecera(actaData));

            // 2. Título principal
            docStructure.sections.push(this._buildTitulo(actaData));

            // 3. Datos de la junta
            docStructure.sections.push(this._buildDatosJunta(actaData));

            // 4. Asistentes y quórum
            docStructure.sections.push(this._buildAsistentesYQuorum(actaData));

            // 5. Orden del día
            docStructure.sections.push(this._buildOrdenDelDia(actaData));

            // 6. Desarrollo y transcripción
            docStructure.sections.push(this._buildDesarrollo(actaData));

            // 7. Votaciones
            docStructure.sections.push(this._buildVotaciones(actaData));

            // 8. Acuerdos adoptados
            docStructure.sections.push(this._buildAcuerdos(actaData));

            // 9. Tareas pendientes
            docStructure.sections.push(this._buildPendientes(actaData));

            // 10. Bloque de firmas
            docStructure.sections.push(this._buildFirmas(actaData));

            return docStructure;

        } catch (error) {
            console.error('Error al construir documento DOCX:', error);
            throw new Error(`Error al construir documento: ${error.message}`);
        }
    }

    /**
     * Genera el blob DOCX final
     * @param {Object} docStructure - Estructura del documento
     * @returns {Blob} Blob del documento DOCX
     */
    generateDocxBlob(docStructure) {
        try {
            // En una implementación real, aquí se usaría una librería como docx.js o docxtemplater
            // Por ahora, generamos una representación en texto que podría ser convertida
            
            let content = this._formatDocumentAsText(docStructure);
            
            // Convertir a blob (en producción, usar docx.js para generar DOCX real)
            const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            return blob;

        } catch (error) {
            console.error('Error al generar blob DOCX:', error);
            throw new Error(`Error al generar blob: ${error.message}`);
        }
    }

    /**
     * Valida los datos del acta antes de generar el documento
     * @param {Object} actaData - Datos del acta
     * @returns {Object} Resultado de la validación
     */
    validateActaData(actaData) {
        const errors = [];
        const warnings = [];

        // Campos obligatorios
        const requiredFields = [
            { path: 'comunidad.nombre', name: 'Nombre de la comunidad' },
            { path: 'junta.tipo', name: 'Tipo de junta' },
            { path: 'junta.fecha', name: 'Fecha de la junta' },
            { path: 'junta.hora', name: 'Hora de la junta' },
            { path: 'junta.lugar', name: 'Lugar de la junta' }
        ];

        requiredFields.forEach(field => {
            const value = this._getNestedValue(actaData, field.path);
            if (!value || value.toString().trim() === '') {
                errors.push(`Campo obligatorio faltante: ${field.name}`);
            }
        });

        // Validar asistentes
        if (!actaData.asistentes || actaData.asistentes.length === 0) {
            warnings.push('No hay asistentes registrados en el acta');
        }

        // Validar quórum
        if (!actaData.quorum || actaData.quorum.trim() === '') {
            warnings.push('No se ha especificado el quórum de la reunión');
        }

        // Validar acuerdos
        if (!actaData.acuerdos || actaData.acuerdos.length === 0) {
            warnings.push('No se han registrado acuerdos en el acta');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // ============ MÉTODOS PRIVADOS DE CONSTRUCCIÓN ============

    _buildCabecera(actaData) {
        return {
            type: 'cabecera',
            content: {
                nombre_comunidad: actaData.comunidad.nombre,
                direccion: actaData.comunidad.direccion,
                cif: actaData.comunidad.cif || '',
                presidente: actaData.comunidad.presidente || '',
                secretario: actaData.comunidad.secretario || ''
            }
        };
    }

    _buildTitulo(actaData) {
        return {
            type: 'titulo',
            style: this.defaultStyles.title,
            content: `ACTA DE JUNTA DE PROPIETARIOS\n${actaData.junta.tipo.toUpperCase()} Nº ${actaData.junta.convocatoria}`
        };
    }

    _buildDatosJunta(actaData) {
        return {
            type: 'datos_junta',
            style: this.defaultStyles.subtitle,
            content: {
                fecha: this._formatDate(actaData.junta.fecha),
                hora: actaData.junta.hora,
                lugar: actaData.junta.lugar
            }
        };
    }

    _buildAsistentesYQuorum(actaData) {
        return {
            type: 'asistentes_quorum',
            content: {
                asistentes: actaData.asistentes || [],
                quorum: actaData.quorum || ''
            }
        };
    }

    _buildOrdenDelDia(actaData) {
        return {
            type: 'orden_dia',
            style: this.defaultStyles.subtitle,
            content: actaData.orden_dia || []
        };
    }

    _buildDesarrollo(actaData) {
        return {
            type: 'desarrollo',
            style: this.defaultStyles.normal,
            content: actaData.desarrollo || ''
        };
    }

    _buildVotaciones(actaData) {
        return {
            type: 'votaciones',
            style: this.defaultStyles.normal,
            content: actaData.votaciones || []
        };
    }

    _buildAcuerdos(actaData) {
        return {
            type: 'acuerdos',
            style: this.defaultStyles.normal,
            content: actaData.acuerdos || []
        };
    }

    _buildPendientes(actaData) {
        return {
            type: 'pendientes',
            style: this.defaultStyles.small,
            content: actaData.pendientes || []
        };
    }

    _buildFirmas(actaData) {
        return {
            type: 'firmas',
            style: this.defaultStyles.normal,
            content: {
                presidente: actaData.firmas?.presidente || '',
                secretario: actaData.firmas?.secretario || '',
                lugar_firma: actaData.firmas?.lugar_firma || '',
                fecha_firma: actaData.firmas?.fecha_firma || new Date().toISOString().split('T')[0]
            }
        };
    }

    // ============ UTILIDADES ============

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    _formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            return date.toLocaleDateString('es-ES', options);
        } catch (error) {
            return dateString;
        }
    }

    _formatDocumentAsText(docStructure) {
        // En una implementación real, esto generaría XML de Word
        // Por ahora, generamos texto formateado
        let text = '';
        
        docStructure.sections.forEach(section => {
            switch (section.type) {
                case 'cabecera':
                    text += this._formatCabeceraAsText(section.content);
                    break;
                case 'titulo':
                    text += '\n\n' + section.content + '\n\n';
                    break;
                case 'datos_junta':
                    text += this._formatDatosJuntaAsText(section.content);
                    break;
                case 'asistentes_quorum':
                    text += this._formatAsistentesAsText(section.content);
                    break;
                case 'orden_dia':
                    text += this._formatOrdenDiaAsText(section.content);
                    break;
                case 'desarrollo':
                    text += '\nDESARROLLO:\n' + section.content + '\n';
                    break;
                case 'votaciones':
                    text += this._formatVotacionesAsText(section.content);
                    break;
                case 'acuerdos':
                    text += this._formatAcuerdosAsText(section.content);
                    break;
                case 'pendientes':
                    text += this._formatPendientesAsText(section.content);
                    break;
                case 'firmas':
                    text += this._formatFirmasAsText(section.content);
                    break;
            }
        });

        return text;
    }

    _formatCabeceraAsText(cabecera) {
        let text = '';
        if (cabecera.nombre_comunidad) text += cabecera.nombre_comunidad.toUpperCase() + '\n';
        if (cabecera.direccion) text += cabecera.direccion + '\n';
        if (cabecera.cif) text += 'CIF: ' + cabecera.cif + '\n';
        if (cabecera.presidente) text += 'Presidente: ' + cabecera.presidente + '\n';
        if (cabecera.secretario) text += 'Secretario: ' + cabecera.secretario + '\n';
        return text + '\n';
    }

    _formatDatosJuntaAsText(datos) {
        return `Fecha: ${datos.fecha}\nHora: ${datos.hora}\nLugar: ${datos.lugar}\n\n`;
    }

    _formatAsistentesAsText(asistentesData) {
        let text = '\nASISTENTES Y QUÓRUM:\n\n';
        text += asistentesData.quorum + '\n\n';
        
        if (asistentesData.asistentes.length > 0) {
            text += 'Lista de asistentes:\n';
            asistentesData.asistentes.forEach((asistente, index) => {
                text += `${index + 1}. ${asistente.nombre}`;
                if (asistente.dni) text += ` (DNI: ${asistente.dni})`;
                if (asistente.coeficiente) text += ` - Coef: ${asistente.coeficiente}`;
                text += '\n';
            });
        }
        
        return text + '\n';
    }

    _formatOrdenDiaAsText(ordenDia) {
        let text = '\nORDEN DEL DÍA:\n\n';
        ordenDia.forEach((item, index) => {
            text += `${index + 1}. ${item}\n`;
        });
        return text + '\n';
    }

    _formatVotacionesAsText(votaciones) {
        if (votaciones.length === 0) return '\n';
        
        let text = '\nVOTACIONES:\n\n';
        votaciones.forEach((votacion, index) => {
            text += `Votación ${index + 1}: ${votacion.asunto}\n`;
            text += `A favor: ${votacion.a_favor} | En contra: ${votacion.en_contra} | Abstenciones: ${votacion.abstenciones}\n`;
            text += `Participación: ${votacion.porcentaje_participacion}% | Resultado: ${votacion.resultado}\n`;
            if (votacion.decision_aprobada) {
                text += `Decisión: ${votacion.decision_aprobada}\n`;
            }
            text += '\n';
        });
        return text;
    }

    _formatAcuerdosAsText(acuerdos) {
        if (acuerdos.length === 0) return '\n';
        
        let text = '\nACUERDOS ADOPTADOS:\n\n';
        acuerdos.forEach((acuerdo, index) => {
            text += `${index + 1}. ${acuerdo}\n`;
        });
        return text + '\n';
    }

    _formatPendientesAsText(pendientes) {
        if (pendientes.length === 0) return '\n';
        
        let text = '\nTAREAS PENDIENTES:\n\n';
        pendientes.forEach((pendiente, index) => {
            text += `- ${pendiente}\n`;
        });
        return text + '\n';
    }

    _formatFirmasAsText(firmas) {
        let text = '\n\nEn ${firmas.lugar_firma}, a ${this._formatDate(firmas.fecha_firma)}\n\n\n';
        text += '_____________________________________\n';
        text += `El Presidente\n${firmas.presidente}\n\n\n`;
        text += '_____________________________________\n';
        text += `El Secretario\n${firmas.secretario}\n`;
        return text;
    }
}

// Exportar el servicio
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActaDocxService;
}
