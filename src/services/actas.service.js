/**
 * GestActas - Servicio de Actas
 * 
 * Servicio para la gestión y generación de actas usando Claude API.
 */

import { indexedDBService } from './indexeddb.service.js';

class ActasService {
    constructor() {
        this.apiKeyClaude = null;
        this.claudeEndpoint = 'https://api.anthropic.com/v1/messages';
        this.isGenerating = false;
        this.progresoGeneracion = 0;
    }

    /**
     * Inicializa el servicio
     */
    async init(apiKeyClaude = null) {
        this.apiKeyClaude = apiKeyClaude;
        await indexedDBService.init();
    }

    /**
     * Genera un acta usando Claude API
     */
    async generarActaConClaude(juntaId, opciones = {}) {
        try {
            if (!this.apiKeyClaude) {
                throw new Error('API Key de Claude no configurada');
            }

            this.isGenerating = true;
            this.progresoGeneracion = 0;

            // Obtener la junta
            const juntasService = (await import('./juntas.service.js')).juntasService;
            const junta = await juntasService.obtenerJunta(juntaId);
            
            if (!junta) {
                throw new Error(`Junta con ID ${juntaId} no encontrada`);
            }

            this.progresoGeneracion = 20;

            // Obtener la transcripción más reciente si hay grabaciones
            let textoTranscripcion = '';
            if (junta.grabaciones && junta.grabaciones.length > 0) {
                const transcripcionService = (await import('./transcripcion.service.js')).transcripcionService;
                const grabacion = junta.grabaciones[0];
                const transcripciones = await transcripcionService.obtenerTranscripciones(grabacion.id);
                
                if (transcripciones.length > 0) {
                    textoTranscripcion = transcripciones[0].texto;
                }
            }

            this.progresoGeneracion = 40;

            // Construir el prompt para Claude
            const prompt = this.construirPrompt(junta, textoTranscripcion, opciones);

            // Llamar a la API de Claude
            const respuestaClaude = await this.llamarClaudeAPI(prompt, opciones.modeloClaude);

            this.progresoGeneracion = 80;

            // Guardar el acta generada
            const acta = {
                juntaId: juntaId,
                contenido: respuestaClaude,
                metodo: 'claude_api',
                modelo: opciones.modeloClaude || 'claude-3-5-sonnet-20241022',
                plantilla: opciones.plantilla || 'estandar',
                fecha: new Date().toISOString(),
                estado: 'borrador', // 'borrador' | 'revisado' | 'finalizado'
                version: 1,
                transcripcionUsada: textoTranscripcion ? textoTranscripcion.substring(0, 100) + '...' : ''
            };

            const id = await indexedDBService.add('actas', acta);
            this.progresoGeneracion = 100;
            this.isGenerating = false;

            console.log('Acta generada con ID:', id);
            return { ...acta, id };
        } catch (error) {
            this.isGenerating = false;
            console.error('Error al generar acta con Claude:', error);
            throw error;
        }
    }

    /**
     * Construye el prompt para Claude
     */
    construirPrompt(junta, transcripcion, opciones) {
        const asistentesTexto = junta.asistentes ? junta.asistentes.map(a => 
            `- ${a.nombre} (${a.cargo}, coeficiente: ${a.coeficiente})`
        ).join('\n') : 'No hay asistentes registrados';

        const ordenDelDiaTexto = junta.ordenDelDia ? junta.ordenDelDia.join('\n- ') : 'No especificado';

        let prompt = `Eres un experto en derecho inmobiliario español especializado en actas de juntas de propietarios. 

Genera un acta formal y completa para la siguiente junta:

**DATOS DE LA JUNTA:**
- Tipo: ${junta.tipo}
- Fecha: ${junta.fecha}
- Hora: ${junta.hora}
- Lugar: ${junta.lugar}

**ASISTENTES:**
${asistentesTexto}

**QUÓRUM:**
- Coeficiente total: ${junta.coeficienteTotal}
- Quórum requerido: ${Math.round(junta.quorumRequerido * 100)}%

**ORDEN DEL DÍA:**
- ${ordenDelDiaTexto}`;

        if (transcripcion) {
            prompt += `

**TRANSCRIPCIÓN DE LA REUNIÓN:**
${transcripcion}`;
        }

        prompt += `

**INSTRUCCIONES:**
1. Genera un acta formal en formato jurídico español
2. Incluye todas las secciones estándar: cabecera, asistentes, quórum, orden del día, desarrollo, acuerdos, votaciones y firmas
3. Usa un tono profesional y formal
4. Incluye detalles específicos basados en la transcripción si está disponible
5. Si no hay información específica para alguna sección, usa placeholders apropiados
6. El acta debe estar lista para imprimir y firmar

Formato de salida: Solo el texto del acta, sin comentarios ni explicaciones adicionales.`;

        return prompt;
    }

    /**
     * Llama a la API de Claude
     */
    async llamarClaudeAPI(prompt, modelo) {
        try {
            const respuesta = await fetch(this.claudeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKeyClaude,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: modelo || 'claude-3-5-sonnet-20241022',
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(`Error en Claude API: ${errorData.error?.message || respuesta.statusText}`);
            }

            const datos = await respuesta.json();
            return datos.content[0].text;
        } catch (error) {
            console.error('Error al llamar a Claude API:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las actas de una junta
     */
    async obtenerActas(juntaId) {
        try {
            const actas = await indexedDBService.getByIndex('actas', 'juntaId', juntaId);
            return actas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        } catch (error) {
            console.error('Error al obtener actas:', error);
            throw error;
        }
    }

    /**
     * Obtiene un acta por su ID
     */
    async obtenerActa(id) {
        try {
            const acta = await indexedDBService.get('actas', id);
            
            if (!acta) {
                throw new Error(`Acta con ID ${id} no encontrada`);
            }

            return acta;
        } catch (error) {
            console.error('Error al obtener acta:', error);
            throw error;
        }
    }

    /**
     * Actualiza el contenido de un acta
     */
    async actualizarActa(id, nuevoContenido) {
        try {
            const actaActual = await indexedDBService.get('actas', id);
            
            if (!actaActual) {
                throw new Error(`Acta con ID ${id} no encontrada`);
            }

            const actaActualizada = {
                ...actaActual,
                contenido: nuevoContenido,
                fechaEdicion: new Date().toISOString()
            };

            await indexedDBService.update('actas', actaActualizada);
            console.log('Acta actualizada:', id);
            return actaActualizada;
        } catch (error) {
            console.error('Error al actualizar acta:', error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de un acta
     */
    async actualizarEstadoActa(id, nuevoEstado) {
        try {
            const estadosValidos = ['borrador', 'revisado', 'finalizado'];
            
            if (!estadosValidos.includes(nuevoEstado)) {
                throw new Error(`Estado inválido: ${nuevoEstado}. Estados válidos: ${estadosValidos.join(', ')}`);
            }

            const actaActual = await indexedDBService.get('actas', id);
            
            if (!actaActual) {
                throw new Error(`Acta con ID ${id} no encontrada`);
            }

            const actaActualizada = {
                ...actaActual,
                estado: nuevoEstado,
                fechaEstado: new Date().toISOString()
            };

            await indexedDBService.update('actas', actaActualizada);
            console.log('Estado de acta actualizado:', nuevoEstado);
            return actaActualizada;
        } catch (error) {
            console.error('Error al actualizar estado de acta:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva versión de un acta
     */
    async crearNuevaVersion(id, nuevoContenido) {
        try {
            const actaActual = await indexedDBService.get('actas', id);
            
            if (!actaActual) {
                throw new Error(`Acta con ID ${id} no encontrada`);
            }

            const nuevaVersion = {
                ...actaActual,
                id: undefined, // Para que se genere un nuevo ID
                contenido: nuevoContenido,
                version: actaActual.version + 1,
                fecha: new Date().toISOString(),
                actaPadreId: id
            };

            const nuevoId = await indexedDBService.add('actas', nuevaVersion);
            console.log('Nueva versión de acta creada:', nuevoId);
            return { ...nuevaVersion, id: nuevoId };
        } catch (error) {
            console.error('Error al crear nueva versión de acta:', error);
            throw error;
        }
    }

    /**
     * Elimina un acta
     */
    async eliminarActa(id) {
        try {
            // Verificar si hay exportaciones asociadas
            const exportaciones = await indexedDBService.getByIndex('exportaciones', 'actaId', id);
            
            if (exportaciones.length > 0) {
                throw new Error('No se puede eliminar el acta porque tiene exportaciones asociadas');
            }

            await indexedDBService.delete('actas', id);
            console.log('Acta eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar acta:', error);
            throw error;
        }
    }

    /**
     * Valida el contenido de un acta
     */
    async validarActa(acta) {
        try {
            const errores = [];
            const advertencias = [];

            // Validaciones obligatorias
            if (!acta.contenido || acta.contenido.trim() === '') {
                errores.push('El contenido del acta está vacío');
            }

            const contenido = acta.contenido.toLowerCase();

            // Verificar secciones obligatorias
            const seccionesObligatorias = [
                { termino: 'acta de junta', mensaje: 'Falta el título del acta' },
                { termino: 'asistentes', mensaje: 'Falta la sección de asistentes' },
                { termino: 'quórum', mensaje: 'Falta la sección de quórum' },
                { termino: 'orden del día', mensaje: 'Falta la sección de orden del día' },
                { termino: 'acuerdos', mensaje: 'Falta la sección de acuerdos' }
            ];

            seccionesObligatorias.forEach(seccion => {
                if (!contenido.includes(seccion.termino)) {
                    advertencias.push(seccion.mensaje);
                }
            });

            // Verificar longitud mínima
            if (acta.contenido.length < 500) {
                advertencias.push('El acta parece demasiado corta');
            }

            // Verificar fechas
            if (contenido.includes('[fecha]') || contenido.includes('[lugar]')) {
                advertencias.push('Hay placeholders sin rellenar');
            }

            return {
                valida: errores.length === 0,
                errores,
                advertencias,
                puntuacion: this.calcularPuntuacionValidacion(errores, advertencias)
            };
        } catch (error) {
            console.error('Error al validar acta:', error);
            throw error;
        }
    }

    /**
     * Calcula una puntuación de validación (0-100)
     */
    calcularPuntuacionValidacion(errores, advertencias) {
        const penalizacionErrores = errores.length * 25;
        const penalizacionAdvertencias = advertencias.length * 5;
        return Math.max(0, 100 - penalizacionErrores - penalizacionAdvertencias);
    }

    /**
     * Obtiene el progreso actual de la generación
     */
    obtenerProgreso() {
        return {
            isGenerating: this.isGenerating,
            progreso: this.progresoGeneracion
        };
    }

    /**
     * Cancela la generación en curso
     */
    cancelarGeneracion() {
        this.isGenerating = false;
        this.progresoGeneracion = 0;
        console.log('Generación de acta cancelada');
    }
}

// Exportar instancia singleton
const actasService = new ActasService();
