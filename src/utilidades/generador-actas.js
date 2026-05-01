/**
 * GestActas - Generador de Actas
 * 
 * Utilidades específicas para generación de actas legales de juntas de propietarios.
 */

class GeneradorActas {
    /**
     * Crea una plantilla de acta vacía
     */
    static plantillaActaVacia() {
        return {
            encabezado: {
                tipo: "ACTA DE JUNTA DE PROPIETARIOS",
                numero: "",
                fecha: "",
                hora_inicio: "",
                hora_fin: "",
                lugar: "",
                comunidad: {
                    nombre: "",
                    direccion: "",
                    cif: "",
                    codigoPostal: "",
                    ciudad: "",
                    provincia: ""
                }
            },
            asistentes: [],
            convocatoria: {
                primera: {
                    fecha: "",
                    hora: "",
                    quorum: "no alcanzado"
                },
                segunda: {
                    fecha: "",
                    hora: "",
                    quorum: ""
                }
            },
            puntos_orden_dia: [],
            parte_declarativa: [],
            parte_deliberativa: [],
            acuerdos_totales: {
                aprobados: 0,
                rechazados: 0,
                aplazados: 0
            },
            cierre: {
                texto: "Siendo las HH:MM se levanta la sesión, habiéndose adoptado los acuerdos que se relacionan en el acta.",
                secretario: "",
                presidente: "",
                fecha_firma: ""
            },
            metadatos: {
                generado_por: "GestActas",
                fecha_generacion: new Date().toISOString(),
                confianza_global: 0,
                alertas_legales: [],
                secciones_confianza: {}
            }
        };
    }

    /**
     * Formatea la parte deliberativa del acta
     */
    static formatearParteDeliberativa(transcripcion, puntosOrdenDia) {
        const deliberacion = [];
        
        deliberacion.push("Una vez realizada la convocatoria, se procede a la constitución de la Junta de Propietarios.");
        deliberacion.push("Se verifica el quorum de asistencia y se declara válidamente constituida la Junta.");
        deliberacion.push("Se procede a la lectura y aprobación, en su caso, del acta de la junta anterior.");
        
        if (puntosOrdenDia && puntosOrdenDia.length > 0) {
            deliberacion.push("Se da cuenta del orden del día, compuesto por los siguientes puntos:");
            puntosOrdenDia.forEach((punto, index) => {
                deliberacion.push(`${index + 1}.- ${punto.titulo}`);
            });
        }
        
        deliberacion.push("Se abre el turno de palabras y se procede a la deliberación de los puntos del orden del día.");
        deliberacion.push("Tras la deliberación correspondiente, se procede a la votación de los puntos del orden del día.");
        
        return deliberacion;
    }

    /**
     * Formatea la parte declarativa del acta
     */
    static formatearParteDeclarativa(comunidad, asistentes) {
        const declaracion = [];
        
        declaracion.push("Se declara que todos los asistentes han sido debidamente convocados de conformidad con lo establecido en la Ley de Propiedad Horizontal.");
        declaracion.push("Se declara que la Junta queda válidamente constituida al alcanzarse el quorum necesario.");
        declaracion.push(`Se declara que los asistentes presentes representan el ${asistentes.reduce((sum, a) => sum + a.coeficiente, 0).toFixed(2)}% de los coeficientes de la comunidad.`);
        
        return declaracion;
    }

    /**
     * Extrae puntos del orden del día de la transcripción
     */
    static extraerPuntosOrdenDelDia(transcripcion) {
        const puntos = [];
        
        // Patrones comunes para detectar puntos
        const patrones = [
            /punto\s+(\d+)[:\s-]+(.+?)(?=\n|$)/gi,
            /orden\s+del\s+día[:\s-]+(.+?)(?=\n|$)/gi,
            /primer\s+tema[:\s-]+(.+?)(?=\n|$)/gi,
            /segundo\s+tema[:\s-]+(.+?)(?=\n|$)/gi,
            /tercer\s+tema[:\s-]+(.+?)(?=\n|$)/gi
        ];

        transcripcion.split('\n').forEach((linea, index) => {
            patrones.forEach(patron => {
                const match = linea.match(patron);
                if (match) {
                    const numero = match[1] ? parseInt(match[1]) : puntos.length + 1;
                    const titulo = match[2] || match[1];
                    
                    if (!puntos.find(p => p.numero === numero)) {
                        puntos.push({
                            numero: numero,
                            titulo: titulo.trim(),
                            descripcion: "",
                            tipo_votacion: "mayoria_simple",
                            resultados: {
                                a_favor_coeficiente: 0,
                                en_contra_coeficiente: 0,
                                abstencion_coeficiente: 0,
                                a_favor_porcentaje: 0,
                                en_contra_porcentaje: 0,
                                abstencion_porcentaje: 0,
                                resultado: "pendiente"
                            },
                            acuerdo: "",
                            votos_individuales: []
                        });
                    }
                }
            });
        });

        return puntos;
    }

    /**
     * Valida la estructura del acta
     */
    static validarEstructuraActa(acta) {
        const errores = [];
        const advertencias = [];

        // Validar encabezado
        if (!acta.encabezado) {
            errores.push("Falta el encabezado del acta");
        } else {
            if (!acta.encabezado.numero) advertencias.push("Falta el número de acta");
            if (!acta.encabezado.fecha) advertencias.push("Falta la fecha");
            if (!acta.encabezado.hora_inicio) advertencias.push("Falta la hora de inicio");
            if (!acta.encabezado.lugar) advertencias.push("Falta el lugar de celebración");
        }

        // Validar comunidad
        if (!acta.encabezado || !acta.encabezado.comunidad) {
            errores.push("Faltan los datos de la comunidad");
        } else {
            if (!acta.encabezado.comunidad.nombre) errores.push("Falta el nombre de la comunidad");
            if (!acta.encabezado.comunidad.direccion) errores.push("Falta la dirección de la comunidad");
            if (!acta.encabezado.comunidad.cif) advertencias.push("Falta el CIF de la comunidad");
        }

        // Validar asistentes
        if (!acta.asistentes || acta.asistentes.length === 0) {
            errores.push("No hay asistentes registrados");
        }

        // Validar puntos del orden del día
        if (!acta.puntos_orden_dia || acta.puntos_orden_dia.length === 0) {
            advertencias.push("No hay puntos del orden del día");
        }

        // Validar cierre
        if (!acta.cierre) {
            advertencias.push("Falta el cierre del acta");
        }

        return {
            valida: errores.length === 0,
            errores,
            advertencias
        };
    }

    /**
     * Valida los datos legales del acta
     */
    static validarDatosLegales(acta, comunidad) {
        const errores = [];
        const advertencias = [];
        const alertasLegales = [];

        // Validar total de coeficientes
        if (comunidad && comunidad.total_coeficientes) {
            const coeficientesAsistentes = acta.asistentes.reduce((sum, a) => sum + (a.coeficiente || 0), 0);
            if (coeficientesAsistentes > comunidad.total_coeficientes) {
                errores.push(`La suma de coeficientes de asistentes (${coeficientesAsistentes}) excede el total de la comunidad (${comunidad.total_coeficientes})`);
            }
        }

        // Validar porcentajes de participación
        acta.asistentes.forEach(asistente => {
            if (asistente.coeficiente && asistente.cuota_participacion) {
                const cuotaEsperada = (asistente.coeficiente / (comunidad.total_coeficientes || 1)) * 100;
                const diferencia = Math.abs(asistente.cuota_participacion - cuotaEsperada);
                if (diferencia > 0.1) {
                    advertencias.push(`El asistente ${asistente.nombre} tiene una cuota de participación (${asistente.cuota_participacion}%) que difiere significativamente del valor esperado (${cuotaEsperada.toFixed(2)}%)`);
                }
            }
        });

        // Validar resultados de votaciones
        acta.puntos_orden_dia.forEach((punto, index) => {
            if (punto.resultados) {
                const totalVotos = punto.resultados.a_favor_coeficiente + 
                                  punto.resultados.en_contra_coeficiente + 
                                  punto.resultados.abstencion_coeficiente;
                
                const totalPorcentaje = punto.resultados.a_favor_porcentaje + 
                                      punto.resultados.en_contra_porcentaje + 
                                      punto.resultados.abstencion_porcentaje;

                if (totalPorcentaje > 100.1) {
                    errores.push(`El punto ${punto.numero} tiene porcentajes de votos que suman más del 100%`);
                }

                // Validar mayoría requerida
                if (comunidad && comunidad.total_coeficientes && punto.tipo_votacion) {
                    const mayoriaRequerida = this.obtenerMayoriaRequerida(punto.tipo_votacion);
                    const cumplida = this.verificarCumplimientoMayoria(punto.resultados, mayoriaRequerida, comunidad.total_coeficientes);
                    
                    if (!cumplida && punto.resultados.resultado === "aprobado") {
                        alertasLegales.push({
                            tipo: "mayoria_insuficiente",
                            punto: punto.numero,
                            mensaje: `El punto ${punto.numero} requiere ${mayoriaRequerida} pero solo se alcanzó mayoría simple`,
                            severidad: "alta"
                        });
                    }
                }
            }
        });

        return {
            valido: errores.length === 0,
            errores,
            advertencias,
            alertasLegales
        };
    }

    /**
     * Obtiene la mayoría requerida según el tipo de votación
     */
    static obtenerMayoriaRequerida(tipoVotacion) {
        const mapas = {
            "mayoria_simple": "mayoría simple (>50% coeficientes presentes)",
            "mayoria_cualificada": "mayoría cualificada (≥60% coeficientes y >50% propietarios)",
            "unanimidad": "unanimidad (100%)",
            "especial_80": "mayoría especial 80%",
            "especial_66": "mayoría especial 2/3 (≥66%)"
        };

        return mapas[tipoVotacion] || "mayoría simple";
    }

    /**
     * Verifica si se cumplió la mayoría requerida
     */
    static verificarCumplimientoMayoria(resultados, tipoMayoría, totalCoeficientes) {
        if (!resultados || !totalCoeficientes) return false;

        switch (tipoMayoría) {
            case "mayoría simple (>50% coeficientes presentes)":
                return resultados.a_favor_coeficiente > ((resultados.a_favor_coeficiente + resultados.en_contra_coeficiente + resultados.abstencion_coeficiente) / 2);

            case "mayoría cualificada (≥60% coeficientes y >50% propietarios)":
                const coeficienteCumplido = resultados.a_favor_coeficiente >= (totalCoeficientes * 0.60);
                return coeficienteCumplido;

            case "unanimidad (100%)":
                return resultados.a_favor_coeficiente === totalCoeficientes;

            case "mayoría especial 80%":
                return resultados.a_favor_coeficiente >= (totalCoeficientes * 0.80);

            case "mayoría especial 2/3 (≥66%)":
                return resultados.a_favor_coeficiente >= (totalCoeficientes * 0.66);

            default:
                return false;
        }
    }

    /**
     * Calcula las cuotas de participación de los asistentes
     */
    static calcularCuotasParticipacion(asistentes, totalCoeficientes) {
        return asistentes.map(asistente => ({
            ...asistente,
            cuota_participacion: totalCoeficientes > 0 ? 
                ((asistente.coeficiente || 0) / totalCoeficientes * 100).toFixed(2) : 
                "0.00"
        }));
    }

    /**
     * Calcula los resultados de una votación
     */
    static calcularResultadosVotacion(votosIndividuales, asistentesPresentes) {
        const resultados = {
            a_favor_coeficiente: 0,
            en_contra_coeficiente: 0,
            abstencion_coeficiente: 0,
            a_favor_porcentaje: 0,
            en_contra_porcentaje: 0,
            abstencion_porcentaje: 0,
            resultado: "pendiente"
        };

        if (!votosIndividuales || votosIndividuales.length === 0) {
            return resultados;
        }

        // Calcular coeficientes por tipo de voto
        votosIndividuales.forEach(voto => {
            const coeficiente = voto.coeficiente || 0;
            
            switch (voto.voto) {
                case "a_favor":
                    resultados.a_favor_coeficiente += coeficiente;
                    break;
                case "en_contra":
                    resultados.en_contra_coeficiente += coeficiente;
                    break;
                case "abstencion":
                    resultados.abstencion_coeficiente += coeficiente;
                    break;
            }
        });

        // Calcular porcentajes
        const totalVotos = resultados.a_favor_coeficiente + 
                           resultados.en_contra_coeficiente + 
                           resultados.abstencion_coeficiente;

        if (totalVotos > 0) {
            resultados.a_favor_porcentaje = (resultados.a_favor_coeficiente / totalVotos * 100).toFixed(2);
            resultados.en_contra_porcentaje = (resultados.en_contra_coeficiente / totalVotos * 100).toFixed(2);
            resultados.abstencion_porcentaje = (resultados.abstencion_coeficiente / totalVotos * 100).toFixed(2);
        }

        // Determinar resultado
        if (resultados.a_favor_coeficiente > (totalVotos / 2)) {
            resultados.resultado = "aprobado";
        } else if (resultados.en_contra_coeficiente > (totalVotos / 2)) {
            resultados.resultado = "rechazado";
        } else {
            resultados.resultado = "empate";
        }

        return resultados;
    }

    /**
     * Calcula la confianza global del acta
     */
    static calcularConfianzaGlobal(acta) {
        if (!acta || !acta.secciones_confianza) {
            return 0;
        }

        const confianzas = Object.values(acta.secciones_confianza);
        if (confianzas.length === 0) {
            return 0;
        }

        const suma = confianzas.reduce((total, conf) => total + conf.score, 0);
        return Math.round(suma / confianzas.length);
    }

    /**
     * Calcula el nivel de confianza de una sección
     */
    static calcularConfianzaSeccion(transcripcion, keywords, longitud) {
        let score = 50; // Score base
        const razones = [];

        // Longitud adecuada
        if (longitud > 50 && longitud < 1000) {
            score += 20;
            razones.push("Longitud adecuada");
        } else if (longitud <= 50) {
            score -= 20;
            razones.push("Texto muy breve");
        }

        // Presencia de palabras clave
        if (keywords && keywords.length > 0) {
            const keywordsEncontradas = keywords.filter(kw => 
                transcripcion.toLowerCase().includes(kw.toLowerCase())
            ).length;
            
            const porcentaje = (keywordsEncontradas / keywords.length) * 100;
            
            if (porcentaje >= 70) {
                score += 20;
                razones.push(`Se encontraron ${keywordsEncontradas}/${keywords.length} palabras clave`);
            } else if (porcentaje >= 40) {
                score += 10;
                razones.push(`Se encontraron ${keywordsEncontradas}/${keywords.length} palabras clave (parcial)`);
            } else {
                score -= 10;
                razones.push(`Solo se encontraron ${keywordsEncontradas}/${keywords.length} palabras clave`);
            }
        }

        // Redacción clara (sin muchas repeticiones)
        const palabras = transcripcion.split(/\s+/);
        const repeticiones = palabras.length - new Set(palabras).length;
        const ratioRepeticiones = repeticiones / palabras.length;
        
        if (ratioRepeticiones < 0.3) {
            score += 10;
            razones.push("Redacción clara y variada");
        } else if (ratioRepeticiones > 0.5) {
            score -= 15;
            razones.push("Muchas repeticiones en el texto");
        }

        // Limitar score entre 0 y 100
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            razon: razones.join("; ")
        };
    }

    /**
     * Trunca la transcripción al límite de tokens especificado
     */
    static truncarTranscripcion(transcripcion, maxTokens = 20000) {
        if (!transcripcion) return "";
        
        // Estimación aproximada: 1 token ≈ 4 caracteres (para español)
        const maxCaracteres = maxTokens * 4;
        
        if (transcripcion.length <= maxCaracteres) {
            return transcripcion;
        }
        
        // Truncar y añadir nota
        const transcripcionTruncada = transcripcion.substring(0, maxCaracteres);
        const nota = `\n\n[NOTA: La transcripción ha sido truncada a ${maxTokens} tokens para controlar el coste. El texto completo tenía ${transcripcion.length} caracteres.]`;
        
        return transcripcionTruncada + nota;
    }
}

// Exportar la clase
export { GeneradorActas };
