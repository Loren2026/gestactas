/**
 * GestActas - Servicio de Actas (Bloque 6)
 * 
 * Servicio para la generación de actas legales usando Claude API (claude-sonnet-4-5),
 * con validación legal multi-nivel y sistema de confianza.
 */

import { indexedDBService } from './indexeddb.service.js';
import { ContextoLegal } from '../utilidades/contexto-legal.js';
import { GeneradorActas } from '../utilidades/generador-actas.js';

class ActasService {
    constructor() {
        this.apiKeyClaude = null;
        this.claudeEndpoint = 'https://api.anthropic.com/v1/messages';
        this.isGenerating = false;
        this.progresoGeneracion = 0;
        this.maxTokensTranscripcion = 20000; // Límite para controlar coste
    }

    /**
     * Inicializa el servicio
     */
    async init(apiKeyClaude = null) {
        this.apiKeyClaude = apiKeyClaude;
        await indexedDBService.init();
    }

    /**
     * Genera un acta usando Claude API (Flujo completo de 10 pasos)
     */
    async generarActa(juntaId, opciones = {}) {
        try {
            // PASO 1: Verificar API key
            if (!this.apiKeyClaude) {
                throw new Error('API Key de Claude no configurada. Ve a Configuración para añadirla.');
            }

            this.isGenerating = true;
            this.progresoGeneracion = 5;

            // PASO 2: Obtener la junta completa
            const junta = await this.obtenerJuntaCompleta(juntaId);
            
            if (!junta) {
                throw new Error(`Junta con ID ${juntaId} no encontrada`);
            }

            this.progresoGeneracion = 15;

            // PASO 3: Verificar que hay transcripción
            const transcripcion = await this.obtenerTranscripcionJunta(juntaId);
            
            if (!transcripcion || transcripcion.trim() === '') {
                throw new Error('La junta no tiene transcripción. Debes grabar y transcribir la reunión antes de generar el acta.');
            }

            this.progresoGeneracion = 25;

            // PASO 4: Obtener datos de la comunidad
            const comunidad = await this.obtenerComunidadJunta(junta);
            
            this.progresoGeneracion = 35;

            // PASO 5: Obtener asistentes con sus coeficientes
            const asistentes = await this.obtenerAsistentesJunta(juntaId);

            this.progresoGeneracion = 45;

            // PASO 6: Truncar transcripción si excede el límite de tokens
            const transcripcionTruncada = GeneradorActas.truncarTranscripcion(
                transcripcion, 
                this.maxTokensTranscripcion
            );

            this.progresoGeneracion = 50;

            // PASO 7: Preparar prompt para Claude
            const prompt = this.prepararPromptClaude(junta, transcripcionTruncada, comunidad, asistentes);

            this.progresoGeneracion = 60;

            // PASO 8: Enviar a Claude API
            const respuestaClaude = await this.enviarAClaude(prompt);

            this.progresoGeneracion = 80;

            // PASO 9: Procesar respuesta y validar
            const actaProcesada = await this.procesarRespuestaClaude(respuestaClaude, juntaId, comunidad);

            this.progresoGeneracion = 90;

            // PASO 10: Guardar en IndexedDB
            const actaGuardada = await this.guardarActa(actaProcesada);
            
            this.progresoGeneracion = 100;
            this.isGenerating = false;

            console.log('Acta generada con ID:', actaGuardada.id);
            return actaGuardada;
        } catch (error) {
            this.isGenerating = false;
            console.error('Error al generar acta:', error);
            throw error;
        }
    }

    /**
     * Obtiene la junta completa con todos sus datos
     */
    async obtenerJuntaCompleta(juntaId) {
        const juntasService = (await import('./juntas.service.js')).juntasService;
        return await juntasService.obtenerJunta(juntaId);
    }

    /**
     * Obtiene la transcripción de la junta
     */
    async obtenerTranscripcionJunta(juntaId) {
        const junta = await this.obtenerJuntaCompleta(juntaId);
        
        if (!junta.grabaciones || junta.grabaciones.length === 0) {
            return '';
        }

        const transcripcionService = (await import('./transcripcion.service.js')).transcripcionService;
        const grabacion = junta.grabaciones[0];
        const transcripciones = await transcripcionService.obtenerTranscripciones(grabacion.id);
        
        return transcripciones.length > 0 ? transcripciones[0].texto : '';
    }

    /**
     * Obtiene la comunidad de la junta
     */
    async obtenerComunidadJunta(junta) {
        if (!junta.comunidadId) {
            return null;
        }

        const comunidadesService = (await import('./comunidades.service.js')).comunidadesService;
        return await comunidadesService.obtenerComunidad(junta.comunidadId);
    }

    /**
     * Obtiene los asistentes de la junta con coeficientes
     */
    async obtenerAsistentesJunta(juntaId) {
        const juntasService = (await import('./juntas.service.js')).juntasService;
        const junta = await juntasService.obtenerJunta(juntaId);
        
        return junta.asistentes || [];
    }

    /**
     * Prepara el prompt para Claude (Paso 7)
     */
    prepararPromptClaude(junta, transcripcion, comunidad, asistentes) {
        // Obtener contexto legal
        const contextoLegal = ContextoLegal.obtenerContextoCompletoParaClaude();
        
        // Obtener plantilla según tipo de junta
        const plantilla = ContextoLegal.obtenerPlantillaPrompt(junta.tipo);

        // Calcular estadísticas
        const totalCoeficientes = comunidad.propietarios.reduce((sum, p) => sum + (p.coeficiente || 0), 0);
        const coeficientesPresentes = asistentes.reduce((sum, a) => sum + (a.coeficiente || 0), 0);
        const porcentajeAsistencia = totalCoeficientes > 0 ? (coeficientesPresentes / totalCoeficientes * 100).toFixed(2) : 0;

        // Construir prompt
        let prompt = `Eres un abogado especialista en Derecho de Propiedad Horizontal en España. 
Tu tarea es generar actas legales de juntas de propietarios basándote en transcripciones.

${this.construirRolEInstrucciones(plantilla)}

${this.construirContextoLegal(contextoLegal)}

${this.construirPlantillaJSON()}

${this.construirDatosEspecificos(junta, transcripcion, comunidad, asistentes, totalCoeficientes, coeficientesPresentes, porcentajeAsistencia)}

${this.construirInstruccionesProcesamiento(junta.tipo)}

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`;

        return prompt;
    }

    /**
     * Construye el rol e instrucciones del sistema
     */
    construirRolEInstrucciones(plantilla) {
        return `REGLAS FUNDAMENTALES:
1. Usa formato jurídico español formal y preciso
2. Respeta la estructura legal del acta según la Ley de Propiedad Horizontal (LPH)
3. Calcula automáticamente cuotas y coeficientes basándote en los datos
4. Identifica acuerdos por mayoría simple, cualificada o unanimidad
5. Genera el acta en formato JSON estricto
6. Tipo de junta: ${plantilla.rol}
7. Foco: ${plantilla.foco}`;
    }

    /**
     * Construye el contexto legal para el prompt
     */
    construirContextoLegal(contextoLegal) {
        return `CONTEXTO LEGAL (LPH - España):

${contextoLegal.ley}
${contextoLegal.referencia}

ARTÍCULO SOBRE ACTAS:
${contextoLegal.articulo_actas.texto}

MAYORÍAS SEGÚN LPH:
${Object.entries(contextoLegal.mayorias).map(([key, valor]) => 
    `- ${valor.nombre}: ${valor.descripcion}`
).join('\n')}

CÁLCULO DE CUOTAS:
- Cuota de participación = coeficiente / total_coeficientes * 100
- Se expresa en porcentaje con 2 decimales`;
    }

    /**
     * Construye la plantilla de JSON
     */
    construirPlantillaJSON() {
        return `RESPUESTA EN FORMATO JSON (OBLIGATORIO):

{
  "encabezado": {
    "tipo": "ACTA DE JUNTA DE PROPIETARIOS",
    "numero": "N",
    "fecha": "DD/MM/YYYY",
    "hora_inicio": "HH:MM",
    "hora_fin": "HH:MM",
    "lugar": "Dirección completa",
    "comunidad": {
      "nombre": "Nombre Comunidad",
      "direccion": "Dirección",
      "cif": "CIF",
      "codigoPostal": "CP",
      "ciudad": "Ciudad",
      "provincia": "Provincia"
    }
  },
  "asistentes": [
    {
      "nombre": "Nombre completo",
      "dni": "DNI (si disponible)",
      "piso": "Piso",
      "coeficiente": X.XX,
      "cuota_participacion": X.XX,
      "representante_de": "Nombre (si es representante)",
      "asistio": true/false
    }
  ],
  "convocatoria": {
    "primera": {
      "fecha": "DD/MM/YYYY",
      "hora": "HH:MM",
      "quorum": "alcanzado/no alcanzado"
    },
    "segunda": {
      "fecha": "DD/MM/YYYY",
      "hora": "HH:MM",
      "quorum": "alcanzado/no alcanzado"
    }
  },
  "puntos_orden_dia": [
    {
      "numero": 1,
      "titulo": "Título del punto",
      "descripcion": "Descripción detallada",
      "tipo_votacion": "simple/cualificada/unanimidad/especial_80/especial_66",
      "resultados": {
        "a_favor_coeficiente": X.XX,
        "en_contra_coeficiente": X.XX,
        "abstencion_coeficiente": X.XX,
        "a_favor_porcentaje": X.XX,
        "en_contra_porcentaje": X.XX,
        "abstencion_porcentaje": X.XX,
        "resultado": "aprobado/no aprobado"
      },
      "acuerdo": "Texto completo del acuerdo aprobado",
      "votos_individuales": [
        {
          "nombre": "Nombre propietario",
          "voto": "a_favor/en_contra/abstencion",
          "coeficiente": X.XX
        }
      ]
    }
  ],
  "parte_declarativa": [
    "Declaración 1",
    "Declaración 2"
  ],
  "parte_deliberativa": [
    "Deliberación 1",
    "Deliberación 2"
  ],
  "acuerdos_totales": {
    "aprobados": N,
    "rechazados": N,
    "aplazados": N
  },
  "cierre": {
    "texto": "Siendo las HH:MM se levanta la sesión...",
    "secretario": "Nombre del secretario",
    "presidente": "Nombre del presidente",
    "fecha_firma": "DD/MM/YYYY"
  }
}`;
    }

    /**
     * Construye los datos específicos de la junta
     */
    construirDatosEspecificos(junta, transcripcion, comunidad, asistentes, totalCoeficientes, coeficientesPresentes, porcentajeAsistencia) {
        const asistentesTexto = asistentes.map(a => 
            `- ${a.nombre}${a.dni ? ` (DNI: ${a.dni})` : ''}, Piso: ${a.piso || 'N/A'}, Coeficiente: ${a.coeficiente || 0}${a.representante_de ? `, Representante de: ${a.representante_de}` : ''}`
        ).join('\n');

        const puntosTexto = junta.ordenDelDia ? junta.ordenDelDia.join('\n- ') : 'No especificado en la transcripción';

        return `DATOS DE LA JUNTA:

[Comunidad]
Nombre: ${comunidad.nombre}
Dirección: ${comunidad.direccion}
CIF: ${comunidad.cif || 'No especificado'}
Código Postal: ${comunidad.codigoPostal}
Ciudad: ${comunidad.ciudad}
Provincia: ${comunidad.provincia}

[Junta]
Tipo: ${junta.tipo} (ordinaria/extraordinaria/mixta)
Fecha: ${junta.fecha}
Hora: ${junta.hora}
Lugar: ${junta.lugar}

[Asistentes]
${asistentesTexto}

[Coeficientes totales]
Total coeficientes comunidad: ${totalCoeficientes.toFixed(2)}
Coeficientes presentes: ${coeficientesPresentes.toFixed(2)}
Porcentaje asistencia: ${porcentajeAsistencia}%

[Puntos del orden del día]
- ${puntosTexto}

[Transcripción]
${transcripcion}`;
    }

    /**
     * Construye las instrucciones de procesamiento
     */
    construirInstruccionesProcesamiento(tipoJunta) {
        return `INSTRUCCIONES DE PROCESAMIENTO:

1. Analiza la transcripción para extraer:
   - Qué asistentes estuvieron presentes
   - Qué puntos se discutieron
   - Cómo votó cada asistente
   - Qué acuerdos se tomaron

2. Calcula automáticamente:
   - Cuotas de participación (coeficiente/total*100)
   - Resultados de votaciones (suma coeficientes)
   - Mayorías necesarias según el tipo de punto
   - Porcentajes de votos

3. Genera el acta con:
   - Lenguaje jurídico formal
   - Cita de artículos de la LPH cuando corresponda
   - Texto de acuerdos redactado como si fuera el documento final
   - Cálculos correctos y consistentes

4. Determina el tipo de mayoría necesaria para cada punto:
   - Cuentas anuales, presupuesto, aprobación actas: mayoría simple
   - Obras ordinarias, mejora servicios: mayoría cualificada (3/5)
   - Alteración cuotas, modificación estatutos: unanimidad
   - Eliminación barreras arquitectónicas: mayoría especial 80%

5. Tipo de junta: ${tipoJunta}`;
    }

    /**
     * Envía el prompt a Claude API (Paso 8)
     */
    async enviarAClaude(prompt) {
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
                    model: 'claude-sonnet-4-5', // Modelo aprobado
                    max_tokens: 8192,
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
     * Procesa la respuesta de Claude (Paso 9)
     */
    async procesarRespuestaClaude(respuestaClaude, juntaId, comunidad) {
        try {
            // Extraer JSON de la respuesta
            const jsonMatch = respuestaClaude.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('La respuesta de Claude no contiene un JSON válido');
            }

            const actaJSON = JSON.parse(jsonMatch[0]);

            // Validación Nivel 1: Estructura JSON
            const validacion1 = GeneradorActas.validarEstructuraActa(actaJSON);
            
            if (!validacion1.valida) {
                throw new Error(`Estructura de acta inválida: ${validacion1.errores.join(', ')}`);
            }

            // Validación Nivel 2: Cálculos
            await this.validarCalculos(actaJSON, comunidad);

            // Validación Nivel 3: Mayorías
            const validacionLegal = GeneradorActas.validarDatosLegales(actaJSON, comunidad);
            
            // Calcular confianza de secciones
            const seccionesConfianza = this.calcularConfianzaSecciones(actaJSON);

            // Construir metadatos
            const metadatos = {
                generado_por: "GestActas",
                fecha_generacion: new Date().toISOString(),
                modelo: "claude-sonnet-4-5",
                confianza_global: this.calcularConfianzaGlobal(seccionesConfianza),
                alertas_legales: validacionLegal.alertasLegales || [],
                secciones_confianza: seccionesConfianza,
                validacion_nivel1: validacion1,
                validacion_nivel2: { valida: true, errores: [], advertencias: [] },
                validacion_nivel3: {
                    valida: validacionLegal.valida,
                    errores: validacionLegal.errores,
                    advertencias: validacionLegal.advertencias
                }
            };

            return {
                ...actaJSON,
                metadatos
            };
        } catch (error) {
            console.error('Error al procesar respuesta de Claude:', error);
            throw error;
        }
    }

    /**
     * Valida los cálculos del acta (Nivel 2)
     */
    async validarCalculos(acta, comunidad) {
        const errores = [];

        // Validar total de coeficientes de asistentes
        const coeficientesAsistentes = acta.asistentes.reduce((sum, a) => sum + (a.coeficiente || 0), 0);
        
        if (comunidad && comunidad.propietarios) {
            const totalComunidad = comunidad.propietarios.reduce((sum, p) => sum + (p.coeficiente || 0), 0);
            
            if (coeficientesAsistentes > totalComunidad) {
                errores.push(`Los coeficientes de asistentes (${coeficientesAsistentes}) exceden el total de la comunidad (${totalComunidad})`);
            }

            // Validar cuotas de participación
            acta.asistentes.forEach(asistente => {
                if (asistente.coeficiente && asistente.cuota_participacion) {
                    const cuotaEsperada = (asistente.coeficiente / totalComunidad * 100).toFixed(2);
                    const diferencia = Math.abs(parseFloat(asistente.cuota_participacion) - parseFloat(cuotaEsperada));
                    
                    if (diferencia > 0.5) {
                        console.warn(`Cuota de participación incorrecta para ${asistente.nombre}: esperado ${cuotaEsperada}%, recibido ${asistente.cuota_participacion}%`);
                    }
                }
            });
        }

        if (errores.length > 0) {
            throw new Error(`Errores en cálculos: ${errores.join(', ')}`);
        }
    }

    /**
     * Calcula la confianza de cada sección
     */
    calcularConfianzaSecciones(acta) {
        const seccionesConfianza = {};

        // Confianza en puntos del orden del día
        if (acta.puntos_orden_dia) {
            acta.puntos_orden_dia.forEach((punto, index) => {
                const keywords = [`punto ${punto.numero}`, punto.titulo.toLowerCase(), "votación", "acuerdo"];
                const longitud = punto.acuerdo ? punto.acuerdo.length : 0;
                
                seccionesConfianza[`punto_${punto.numero}`] = GeneradorActas.calcularConfianzaSeccion(
                    punto.acuerdo || "",
                    keywords,
                    longitud
                );
            });
        }

        // Confianza en asistentes
        if (acta.asistentes) {
            const asistentesTexto = JSON.stringify(acta.asistentes);
            seccionesConfianza["asistentes"] = GeneradorActas.calcularConfianzaSeccion(
                asistentesTexto,
                ["nombre", "coeficiente", "asistio", "dni"],
                asistentesTexto.length
            );
        }

        // Confianza en encabezado
        if (acta.encabezado) {
            const encabezadoTexto = JSON.stringify(acta.encabezado);
            seccionesConfianza["encabezado"] = GeneradorActas.calcularConfianzaSeccion(
                encabezadoTexto,
                ["fecha", "hora", "lugar", "comunidad"],
                encabezadoTexto.length
            );
        }

        return seccionesConfianza;
    }

    /**
     * Calcula la confianza global del acta
     */
    calcularConfianzaGlobal(seccionesConfianza) {
        const confianzas = Object.values(seccionesConfianza);
        
        if (confianzas.length === 0) {
            return 50;
        }

        const suma = confianzas.reduce((total, conf) => total + conf.score, 0);
        return Math.round(suma / confianzas.length);
    }

    /**
     * Guarda el acta en IndexedDB (Paso 10)
     */
    async guardarActa(acta) {
        const actaParaGuardar = {
            juntaId: acta.juntaId || null,
            contenido: JSON.stringify(acta),
            metodo: 'claude_api',
            modelo: 'claude-sonnet-4-5',
            fecha: new Date().toISOString(),
            estado: 'borrador',
            version: 1,
            confianza: acta.metadatos?.confianza_global || 0,
            alertas_legales: acta.metadatos?.alertas_legales || [],
            validacion: acta.metadatos
        };

        const id = await indexedDBService.add('actas', actaParaGuardar);
        return { ...actaParaGuardar, id };
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
     * Elimina un acta
     */
    async eliminarActa(id) {
        try {
            await indexedDBService.delete('actas', id);
            console.log('Acta eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar acta:', error);
            throw error;
        }
    }

    /**
     * Obtiene el progreso de generación
     */
    obtenerProgresoGeneracion() {
        return {
            isGenerating: this.isGenerating,
            progreso: this.progresoGeneracion
        };
    }
}

// Exportar instancia singleton
const actasService = new ActasService();
