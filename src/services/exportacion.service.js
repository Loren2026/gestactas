/**
 * GestActas - Servicio de Exportación a Word
 * 
 * Servicio para la exportación de actas a documentos Word (.docx) usando docx.js.
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow,
        TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType,
        PageBreak, Header, Footer, PageNumber, VerticalAlign,
        ImageRun, convertInchesToTwip, convertMillimetersToTwip } = docx;
import { FormatoWord } from '../utilidades/formato-word.js';

class ExportacionService {
    /**
     * Exporta un acta a documento Word
     */
    async exportarActaWord(acta) {
        try {
            if (!acta || !acta.contenido) {
                throw new Error('El acta no tiene contenido válido');
            }

            // Parsear el JSON del acta
            const actaJSON = JSON.parse(acta.contenido);

            // Generar el documento Word
            const doc = await this.generarDocumentoWord(actaJSON);

            // Obtener el nombre del archivo
            const nombreArchivo = FormatoWord.obtenerNombreArchivo(acta);

            // Descargar el archivo
            await this.descargarArchivo(doc, nombreArchivo);

            return {
                exito: true,
                nombreArchivo
            };
        } catch (error) {
            console.error('Error al exportar acta a Word:', error);
            throw error;
        }
    }

    /**
     * Genera el documento Word completo
     */
    async generarDocumentoWord(actaJSON) {
        const children = [];

        // 1. Encabezado con logo
        this.agregarEncabezado(children, actaJSON);

        // 2. Título principal
        children.push(FormatoWord.crearParrafo(
            actaJSON.encabezado?.tipo || 'ACTA DE JUNTA DE PROPIETARIOS',
            'tituloPrincipal'
        ));

        // 3. Datos del encabezado del acta
        this.agregarDatosEncabezadoActa(children, actaJSON);

        // Salto de página
        children.push(new Paragraph({ children: [new PageBreak()] }));

        // 4. Sección de comunidad
        this.agregarSeccionComunidad(children, actaJSON);

        // 5. Sección de convocatoria
        this.agregarSeccionConvocatoria(children, actaJSON);

        // 6. Sección de asistentes
        this.agregarSeccionAsistentes(children, actaJSON);

        // Salto de página
        children.push(new Paragraph({ children: [new PageBreak()] }));

        // 7. Parte declarativa
        this.agregarParteDeclarativa(children, actaJSON);

        // 8. Parte deliberativa
        this.agregarParteDeliberativa(children, actaJSON);

        // 9. Puntos del orden del día
        for (const punto of actaJSON.puntos_orden_dia || []) {
            this.agregarPuntoOrdenDia(children, punto);
            
            // Salto de página después de cada punto (opcional, depende de longitud)
            // children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // 10. Resumen de acuerdos
        this.agregarResumenAcuerdos(children, actaJSON);

        // 11. Cierre y firmas
        this.agregarCierreYFirmas(children, actaJSON);

        // Crear documento
        const doc = new Document({
            sections: [
                {
                    properties: FormatoWord.obtenerConfiguracionPagina(),
                    children: children
                }
            ]
        });

        return doc;
    }

    /**
     * Agrega el encabezado con logo
     */
    agregarEncabezado(children, actaJSON) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'GESTACTAS',
                        font: 'Arial',
                        size: 24,
                        bold: true,
                        color: '1a2535'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            })
        );

        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Gestión Inteligente de Juntas de Propietarios',
                        font: 'Arial',
                        size: 20,
                        color: '667eea'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        children.push(FormatoWord.crearSeparador());
    }

    /**
     * Agrega los datos del encabezado del acta
     */
    agregarDatosEncabezadoActa(children, actaJSON) {
        const encabezado = actaJSON.encabezado || {};

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Acta Nº: ', bold: true, color: '1a2535' }),
                new TextRun({ text: encabezado.numero || '' })
            ]
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Fecha: ', bold: true, color: '1a2535' }),
                new TextRun({ text: FormatoWord.formatearFechaWord(encabezado.fecha) })
            ]
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Hora: ', bold: true, color: '1a2535' }),
                new TextRun({ text: `${encabezado.hora_inicio || ''} - ${encabezado.hora_fin || ''}` })
            ]
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Lugar: ', bold: true, color: '1a2535' }),
                new TextRun({ text: encabezado.lugar || '' })
            ],
            spacing: { after: 400 }
        }));

        children.push(FormatoWord.crearSeparador());
    }

    /**
     * Agrega la sección de comunidad
     */
    agregarSeccionComunidad(children, actaJSON) {
        const comunidad = actaJSON.encabezado?.comunidad || {};

        children.push(FormatoWord.crearParrafo('COMUNIDAD DE PROPIETARIOS', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        const campos = [
            { etiqueta: 'Nombre:', valor: comunidad.nombre },
            { etiqueta: 'Dirección:', valor: comunidad.direccion },
            { etiqueta: 'CIF:', valor: comunidad.cif },
            { etiqueta: 'Código Postal:', valor: comunidad.codigoPostal },
            { etiqueta: 'Ciudad:', valor: comunidad.ciudad },
            { etiqueta: 'Provincia:', valor: comunidad.provincia }
        ];

        campos.forEach(campo => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: campo.etiqueta, bold: true, color: '1a2535' }),
                    new TextRun({ text: ` ${campo.valor || ''}` })
                ],
                spacing: { after: 100 }
            }));
        });

        children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    /**
     * Agrega la sección de convocatoria
     */
    agregarSeccionConvocatoria(children, actaJSON) {
        const convocatoria = actaJSON.convocatoria || {};

        children.push(FormatoWord.crearParrafo('CONVOCATORIA', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Primera convocatoria: ', bold: true }),
                new TextRun({ text: `${FormatoWord.formatearFechaWord(convocatoria.primera?.fecha)} a las ${convocatoria.primera?.hora}` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  Quórum: ', bold: true }),
                new TextRun({ text: convocatoria.primera?.quorum || '' })
            ],
            spacing: { after: 200 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Segunda convocatoria: ', bold: true }),
                new TextRun({ text: `${FormatoWord.formatearFechaWord(convocatoria.segunda?.fecha)} a las ${convocatoria.segunda?.hora}` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  Quórum: ', bold: true }),
                new TextRun({ text: convocatoria.segunda?.quorum || '' })
            ],
            spacing: { after: 300 }
        }));
    }

    /**
     * Agrega la sección de asistentes
     */
    agregarSeccionAsistentes(children, actaJSON) {
        const asistentes = actaJSON.asistentes || [];
        const totalCoeficientes = asistentes.reduce((sum, a) => sum + (a.coeficiente || 0), 0);
        const porcentajeAsistencia = totalCoeficientes;

        children.push(FormatoWord.crearParrafo('ASISTENTES A LA JUNTA', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        // Crear tabla de asistentes
        const filasTabla = [];
        
        // Cabecera
        filasTabla.push(new TableRow({
            tableHeader: true,
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: 'Nombre', bold: true, color: '1a2535' })],
                        alignment: AlignmentType.CENTER
                    })],
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f0f0f0' }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: 'Piso', bold: true, color: '1a2535' })],
                        alignment: AlignmentType.CENTER
                    })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f0f0f0' }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: 'Coeficiente', bold: true, color: '1a2535' })],
                        alignment: AlignmentType.CENTER
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f0f0f0' }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: 'Cuota %', bold: true, color: '1a2535' })],
                        alignment: AlignmentType.CENTER
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f0f0f0' }
                })
            ]
        }));

        // Filas de datos
        asistentes.forEach((asistente, index) => {
            const esPar = index % 2 === 0;
            
            filasTabla.push(new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ 
                                text: `${asistente.nombre}${asistente.representante_de ? ` (Rep. de ${asistente.representante_de})` : ''}`,
                                size: 20
                            })]
                        })],
                        width: { size: 35, type: WidthType.PERCENTAGE },
                        shading: { fill: esPar ? 'ffffff' : 'f9f9f9' }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: asistente.piso || '', size: 20 })]
                        })],
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        shading: { fill: esPar ? 'ffffff' : 'f9f9f9' }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: asistente.coeficiente?.toFixed(2) || '0.00', size: 20 })]
                        })],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        shading: { fill: esPar ? 'ffffff' : 'f9f9f9' }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: asistente.cuota_participacion || '0.00%', size: 20 })]
                        })],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        shading: { fill: esPar ? 'ffffff' : 'f9f9f9' }
                    })
                ]
            }));
        });

        // Tabla completa
        const tabla = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: filasTabla,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }
            }
        });

        children.push(tabla);

        // Resumen de asistentes
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        children.push(new Paragraph({
            children: [
                new TextRun({ text: `Total asistentes: ${asistentes.length}`, bold: true }),
                new TextRun({ text: '  •  ' }),
                new TextRun({ text: `Coeficientes presentes: ${totalCoeficientes.toFixed(2)} (${porcentajeAsistencia.toFixed(2)}%)` })
            ],
            spacing: { after: 300 }
        }));
    }

    /**
     * Agrega la parte declarativa
     */
    agregarParteDeclarativa(children, actaJSON) {
        const declaraciones = actaJSON.parte_declarativa || [];

        children.push(FormatoWord.crearParrafo('PARTE DECLARATIVA', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        if (declaraciones.length === 0) {
            children.push(FormatoWord.crearParrafo('No hay declaraciones.', 'parrafoDestacado'));
        } else {
            declaraciones.forEach((declaracion, index) => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: `${index + 1}. `, bold: true, color: '1a2535' }),
                        new TextRun({ text: declaracion })
                    ],
                    spacing: { after: 200 }
                }));
            });
        }

        children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    /**
     * Agrega la parte deliberativa
     */
    agregarParteDeliberativa(children, actaJSON) {
        const deliberaciones = actaJSON.parte_deliberativa || [];

        children.push(FormatoWord.crearParrafo('PARTE DELIBERATIVA', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        if (deliberaciones.length === 0) {
            children.push(FormatoWord.crearParrafo('No hay deliberaciones.', 'parrafoDestacado'));
        } else {
            deliberaciones.forEach(deliberacion => {
                children.push(FormatoWord.crearParrafo(deliberacion, 'parrafoNormal'));
            });
        }

        children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    /**
     * Agrega un punto del orden del día
     */
    agregarPuntoOrdenDia(children, punto) {
        children.push(FormatoWord.crearParrafo(`PUNTO ${punto.numero}: ${punto.titulo}`, 'tituloPunto'));
        children.push(FormatoWord.crearSeparador());

        // Descripción
        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Descripción: ', bold: true }),
                new TextRun({ text: punto.descripcion || '' })
            ],
            spacing: { after: 200 }
        }));

        // Tipo de votación
        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Tipo de votación: ', bold: true }),
                new TextRun({ text: punto.tipo_votacion || '' })
            ],
            spacing: { after: 200 }
        }));

        // Resultados
        const resultados = punto.resultados || {};
        children.push(new Paragraph({
            children: [new TextRun({ text: 'Resultados de la votación:', bold: true, color: '1a2535' })],
            spacing: { before: 200, after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • A favor: ', bold: true }),
                new TextRun({ text: `${resultados.a_favor_coeficiente?.toFixed(2) || 0} coeficientes (${resultados.a_favor_porcentaje || 0}%)` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • En contra: ', bold: true }),
                new TextRun({ text: `${resultados.en_contra_coeficiente?.toFixed(2) || 0} coeficientes (${resultados.en_contra_porcentaje || 0}%)` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • Abstención: ', bold: true }),
                new TextRun({ text: `${resultados.abstencion_coeficiente?.toFixed(2) || 0} coeficientes (${resultados.abstencion_porcentaje || 0}%)` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • Resultado: ', bold: true }),
                new TextRun({ text: resultados.resultado || '', bold: true, color: resultados.resultado === 'aprobado' ? '10b981' : 'ef4444' })
            ],
            spacing: { after: 300 }
        }));

        // Acuerdo adoptado
        children.push(new Paragraph({
            children: [new TextRun({ text: 'ACUERDO ADOPTADO:', bold: true, color: '1a2535' })],
            spacing: { before: 200, after: 100 }
        }));

        children.push(FormatoWord.crearSeparador());

        children.push(new Paragraph({
            children: [new TextRun({ text: punto.acuerdo || 'Sin acuerdo' })],
            spacing: { before: 200, after: 200, line: 360 },
            shading: { fill: 'f0f7ff' }
        }));

        // Votos individuales
        const votos = punto.votos_individuales || [];
        if (votos.length > 0) {
            children.push(new Paragraph({
                children: [new TextRun({ text: 'Votos individuales:', bold: true, color: '1a2535' })],
                spacing: { before: 200, after: 100 }
            }));

            votos.forEach(voto => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: '  • ', bold: true }),
                        new TextRun({ text: `${voto.nombre}: ${voto.voto}` })
                    ],
                    spacing: { after: 100 }
                }));
            });
        }

        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    /**
     * Agrega el resumen de acuerdos
     */
    agregarResumenAcuerdos(children, actaJSON) {
        const acuerdos = actaJSON.acuerdos_totales || {};

        children.push(FormatoWord.crearParrafo('RESUMEN DE ACUERDOS', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Total de puntos tratados: ', bold: true }),
                new TextRun({ text: `${(acuerdos.aprobados || 0) + (acuerdos.rechazados || 0) + (acuerdos.aplazados || 0)}` })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • Acuerdos aprobados: ', bold: true }),
                new TextRun({ text: `${acuerdos.aprobados || 0}`, color: '10b981' })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • Acuerdos rechazados: ', bold: true }),
                new TextRun({ text: `${acuerdos.rechazados || 0}`, color: 'ef4444' })
            ],
            spacing: { after: 100 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: '  • Acuerdos aplazados: ', bold: true }),
                new TextRun({ text: `${acuerdos.aplazados || 0}`, color: 'f59e0b' })
            ],
            spacing: { after: 300 }
        }));

        children.push(FormatoWord.crearSeparador());
    }

    /**
     * Agrega el cierre y las firmas
     */
    agregarCierreYFirmas(children, actaJSON) {
        const cierre = actaJSON.cierre || {};

        children.push(FormatoWord.crearParrafo('CIERRE DE LA JUNTA', 'subtituloSeccion'));
        children.push(FormatoWord.crearSeparador());

        children.push(FormatoWord.crearParrafo(cierre.texto || '', 'parrafoNormal'));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Fecha de firma: ', bold: true }),
                new TextRun({ text: FormatoWord.formatearFechaWord(cierre.fecha_firma) })
            ],
            spacing: { before: 200, after: 200 }
        }));

        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));

        // Líneas de firma de presidente y secretario
        const anchoLinea = 30;
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(anchoLinea),
                    font: 'Arial',
                    size: 20,
                    color: '1a2535',
                    bold: true
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 50 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Presidente', bold: true, color: '1a2535' }),
                new TextRun({ text: ` ${cierre.presidente || ''}` })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(anchoLinea),
                    font: 'Arial',
                    size: 20,
                    color: '1a2535',
                    bold: true
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 50 }
        }));

        children.push(new Paragraph({
            children: [
                new TextRun({ text: 'Secretario', bold: true, color: '1a2535' }),
                new TextRun({ text: ` ${cierre.secretario || ''}` })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        children.push(FormatoWord.crearSeparador());

        // Nota de conformidad
        children.push(new Paragraph({
            children: [
                new TextRun({ 
                    text: 'En prueba de conformidad, firman las personas que han asistido a esta Junta, en la fecha y lugar indicados.',
                    italics: true,
                    color: '555555'
                })
            ],
            spacing: { before: 200, after: 200 }
        }));
    }

    /**
     * Descarga el archivo Word
     */
    async descargarArchivo(doc, nombreArchivo) {
        try {
            const blob = await Packer.toBlob(doc);
            
            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            console.log(`Documento Word descargado: ${nombreArchivo}`);
        } catch (error) {
            console.error('Error al descargar archivo Word:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const exportacionService = new ExportacionService();
