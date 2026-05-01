/**
 * GestActas - Utilidades de Formato Word
 * 
 * Estilos y configuraciones para generar documentos Word profesionales.
 */

import { Document, Packer, Paragraph, TextRun, Table, TableRow, 
         TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType,
         PageBreak, Header, Footer, PageNumber, VerticalAlign, 
         ImageRun, convertInchesToTwip, convertMillimetersToTwip } from 'docx';

class FormatoWord {
    /**
     * Obtiene los colores corporativos para el documento
     */
    static obtenerColores() {
        return {
            primario: '1a2535',      // Azul marino oscuro (títulos/encabezados)
            secundario: '667eea',    // Azul (detalles)
            texto: '000000',         // Negro
            textoClaro: '555555',    // Gris oscuro
            fondoTablaCabecera: 'f0f0f0',  // Gris claro
            fondoTablaPar: 'ffffff',       // Blanco
            fondoTablaImpar: 'f9f9f9',     // Gris muy claro
            borde: 'cccccc',          // Gris medio
            exito: '10b981',          // Verde
            error: 'ef4444',          // Rojo
            pizarra: '764ba2'         // Púrpura (solo detalles mínimos)
        };
    }

    /**
     * Obtiene la configuración de página
     */
    static obtenerConfiguracionPagina() {
        return {
            margins: {
                top: convertMillimetersToTwip(25),    // 2.5 cm
                bottom: convertMillimetersToTwip(25), // 2.5 cm
                left: convertMillimetersToTwip(25),  // 2.5 cm
                right: convertMillimetersToTwip(25)  // 2.5 cm
            }
        };
    }

    /**
     * Obtiene los estilos predefinidos del acta
     */
    static obtenerEstilos() {
        return {
            // Título principal
            tituloPrincipal: {
                font: 'Arial',
                size: 32,
                bold: true,
                color: '1a2535',
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 400
                }
            },

            // Subtítulo de sección (mayúsculas)
            subtituloSeccion: {
                font: 'Arial',
                size: 28,
                bold: true,
                color: '1a2535',
                allCaps: true,
                spacing: {
                    before: 400,
                    after: 200
                }
            },

            // Título de punto
            tituloPunto: {
                font: 'Arial',
                size: 24,
                bold: true,
                color: '1a2535',
                spacing: {
                    before: 300,
                    after: 200
                }
            },

            // Etiqueta de campo
            etiquetaCampo: {
                font: 'Arial',
                size: 20,
                bold: true,
                color: '1a2535'
            },

            // Párrafo normal
            parrafoNormal: {
                font: 'Arial',
                size: 22,
                color: '000000',
                spacing: {
                    after: 200
                }
            },

            // Párrafo destacado (cursiva)
            parrafoDestacado: {
                font: 'Arial',
                size: 22,
                italics: true,
                color: '555555',
                spacing: {
                    after: 200
                }
            },

            // Texto de acuerdo (caja sombreada)
            textoAcuerdo: {
                font: 'Arial',
                size: 22,
                color: '000000',
                shading: {
                    fill: 'f0f7ff',
                    type: 'solid'
                },
                spacing: {
                    before: 200,
                    after: 200,
                    line: 360
                }
            },

            // Firma
            firma: {
                font: 'Arial',
                size: 20,
                color: '000000',
                alignment: AlignmentType.CENTER
            },

            // Línea de firma
            lineaFirma: {
                width: convertInchesToTwip(2),
                style: BorderStyle.SINGLE,
                size: 6,
                color: '1a2535'
            },

            // Tabla encabezado
            tablaEncabezado: {
                font: 'Arial',
                size: 20,
                bold: true,
                color: '1a2535',
                shading: {
                    fill: 'f0f0f0',
                    type: 'solid'
                }
            },

            // Tabla fila
            tablaFila: {
                font: 'Arial',
                size: 20,
                color: '000000'
            }
        };
    }

    /**
     * Obtiene el formato de la tabla de asistentes
     */
    static obtenerFormatoTablaAsistentes() {
        return {
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                {
                    // Cabecera de la tabla
                    tableHeader: true,
                    cells: [
                        { text: 'Nombre', width: 35 },
                        { text: 'Piso', width: 15 },
                        { text: 'Coeficiente', width: 25 },
                        { text: 'Cuota %', width: 25 }
                    ]
                }
            ],
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }
            }
        };
    }

    /**
     * Obtiene el formato de la tabla de resultados
     */
    static obtenerFormatoTablaResultados() {
        return {
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }
            }
        };
    }

    /**
     * Formatea una fecha para el documento Word
     */
    static formatearFechaWord(fecha) {
        if (!fecha) return '';
        
        const fechaObj = new Date(fecha);
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const año = fechaObj.getFullYear();
        
        return `${dia}/${mes}/${año}`;
    }

    /**
     * Formatea una hora para el documento Word
     */
    static formatearHoraWord(hora) {
        if (!hora) return '';
        return hora;
    }

    /**
     * Obtiene el logo de GestActas en base64
     */
    static obtenerLogoBase64() {
        // Logo simplificado de GestActas en formato SVG convertido a base64
        // Un texto estilizado "GA" con colores corporativos
        const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#1a2535" rx="10"/>
            <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="white" text-anchor="middle">GA</text>
        </svg>`;
        
        // Convertir SVG a base64
        const base64 = btoa(unescape(encodeURIComponent(svgLogo)));
        return `data:image/svg+xml;base64,${base64}`;
    }

    /**
     * Crea un párrafo con texto y formato específico
     */
    static crearParrafo(texto, estilo = 'parrafoNormal') {
        const estilos = this.obtenerEstilos();
        const estiloAplicado = estilos[estilo] || estilos.parrafoNormal;
        
        return new Paragraph({
            children: [
                new TextRun({
                    text: texto,
                    font: estiloAplicado.font,
                    size: estiloAplicado.size,
                    bold: estiloAplicado.bold,
                    italics: estiloAplicado.italics,
                    color: estiloAplicado.color
                })
            ],
            alignment: estiloAplicado.alignment,
            spacing: estiloAplicado.spacing,
            shading: estiloAplicado.shading
        });
    }

    /**
     * Crea un título con nivel de encabezado
     */
    static crearTitulo(texto, nivel = HeadingLevel.HEADING_2) {
        return new Paragraph({
            text: texto,
            heading: nivel,
            spacing: {
                before: 400,
                after: 200
            }
        });
    }

    /**
     * Crea un separador (línea horizontal)
     */
    static crearSeparador() {
        return new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(80),
                    font: 'Arial',
                    size: 20,
                    color: 'cccccc'
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
                before: 200,
                after: 200
            }
        });
    }

    /**
     * Crea una línea de firma
     */
    static crearLineaFirma(nombre = '') {
        return new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(30),
                    font: 'Arial',
                    size: 20,
                    color: '1a2535',
                    bold: true
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
                before: 100,
                after: 50
            }
        });
    }

    /**
     * Escapa caracteres especiales para XML
     */
    static escaparXML(texto) {
        if (!texto) return '';
        
        return texto
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Obtiene el nombre del archivo de exportación
     */
    static obtenerNombreArchivo(acta) {
        if (!acta || !acta.contenido) {
            return 'Acta_GestActas.docx';
        }

        try {
            const actaJSON = JSON.parse(acta.contenido);
            const numeroActa = actaJSON.encabezado?.numero || 'X';
            const nombreComunidad = actaJSON.encabezado?.comunidad?.nombre || 'Comunidad';
            const fecha = actaJSON.encabezado?.fecha || new Date().toISOString();
            
            // Limpiar nombre de comunidad para nombre de archivo
            const nombreLimpio = nombreComunidad
                .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')
                .trim()
                .substring(0, 30); // Limitar longitud
            
            const fechaFormateada = this.formatearFechaWord(fecha).replace(/\//g, '-');
            
            return `Acta_N${numeroActa}_${nombreLimpio}_${fechaFormateada}.docx`;
        } catch (error) {
            console.error('Error al generar nombre de archivo:', error);
            return `Acta_${new Date().toISOString().split('T')[0]}.docx`;
        }
    }

    /**
     * Obtiene la configuración para saltos de página en tablas
     */
    static obtenerConfiguracionSaltoPaginaTabla() {
        return {
            allowBreakAcrossPages: false, // Evitar que las filas se dividan entre páginas
            pageBreakBefore: false
        };
    }
}

// Exportar la clase
export { FormatoWord };
