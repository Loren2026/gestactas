/**
 * GestActas - Contexto Legal LPH
 * 
 * Centraliza el contexto legal español sobre juntas de propietarios
 * según la Ley de Propiedad Horizontal (LPH) y normativa vigente.
 */

class ContextoLegal {
    /**
     * Obtiene el artículo de la LPH para actas de juntas
     */
    static obtenerArticuloActa() {
        return {
            articulo: "Artículo 16 de la Ley de Propiedad Horizontal",
            texto: "El acta de la junta de propietarios deberá contener:\n" +
                   "- Lugar, fecha y hora de celebración\n" +
                   "- Relación de asistentes con indicación de sus cuotas\n" +
                   "- Puntos del orden del día\n" +
                   "- Texto de los acuerdos adoptados\n" +
                   "- Resultado de las votaciones\n" +
                   "- Votos a favor, en contra y abstenciones",
            referencia: "Real Decreto Legislativo 1/2024, de 19 de octubre"
        };
    }

    /**
     * Obtiene las mayorías según la LPH
     */
    static obtenerMayorias() {
        return {
            mayoria_simple: {
                nombre: "Mayoría Simple",
                descripcion: "Más de la mitad de los votos presentes",
                calculo: "a_favor > (total_presentes / 2)",
                uso: "Acuerdos ordinarios: aprobación de actas, cuentas anuales, presupuestos"
            },
            mayoria_cualificada: {
                nombre: "Mayoría Cualificada",
                descripcion: "3/5 partes de los votos totales (o presentes + presentes representados) Y la mayoría de los propietarios",
                calculo: "a_favor >= 0.60 * total_coeficientes Y (a_favor_propietarios > total_propietarios / 2)",
                uso: "Obras, mejora servicios, cambio de elementos comunes, alteración de cuotas"
            },
            unanimidad: {
                nombre: "Unanimidad",
                descripcion: "Todos los propietarios (100%)",
                calculo: "a_favor == total_coeficientes",
                uso: "Modificación del título constitutivo, cambio de estatutos, división de piso en varios"
            },
            mayoria_especial_80: {
                nombre: "Mayoría Especial 80%",
                descripcion: "80% de los votos totales",
                calculo: "a_favor >= 0.80 * total_coeficientes",
                uso: "Instalación de infraestructuras para accesibilidad, eliminación de barreras arquitectónicas"
            },
            mayoria_especial_66: {
                nombre: "Mayoría Especial 2/3",
                descripcion: "66% de los votos totales",
                calculo: "a_favor >= 0.66 * total_coeficientes",
                uso: "Actos sobre elementos comunes que no requieren unanimidad ni mayoría cualificada"
            }
        };
    }

    /**
     * Obtiene la estructura estándar de un acta en España
     */
    static obtenerEstructuraActa() {
        return {
            encabezado: {
                tipo: "ACTA DE JUNTA DE PROPIETARIOS",
                campos_obligatorios: [
                    "tipo_junta (ordinaria/extraordinaria/mixta)",
                    "numero_acta",
                    "fecha",
                    "hora_inicio",
                    "hora_fin",
                    "lugar",
                    "comunidad (nombre, direccion, cif, codigo_postal, ciudad, provincia)"
                ]
            },
            convocatoria: {
                descripcion: "Información sobre la convocatoria (primera y segunda)",
                campos_obligatorios: [
                    "primera_convocatoria (fecha, hora, quorum)",
                    "segunda_convocatoria (fecha, hora, quorum)"
                ]
            },
            asistentes: {
                descripcion: "Relación de propietarios asistentes",
                campos_obligatorios: [
                    "nombre_completo",
                    "dni (si está disponible)",
                    "piso",
                    "coeficiente",
                    "cuota_participacion (%)",
                    "representante_de (si aplica)",
                    "asistio (true/false)"
                ]
            },
            puntos_orden_dia: {
                descripcion: "Puntos tratados en la junta",
                campos_obligatorios: [
                    "numero",
                    "titulo",
                    "descripcion",
                    "tipo_votacion (simple/cualificada/unanimidad/especial_80/especial_66)",
                    "resultados (a_favor_coeficiente, en_contra_coeficiente, abstencion_coeficiente, porcentajes)",
                    "acuerdo (texto completo)",
                    "votos_individuales (lista con cada voto)"
                ]
            },
            parte_declarativa: {
                descripcion: "Declaraciones previas a la deliberación",
                ejemplo: "Se declara que todos los asistentes han sido debidamente convocados..."
            }
        };
    }

    /**
     * Obtiene artículos de la LPH relevantes por tema
     */
    static obtenerArticulosPorTema(tema) {
        const articulos = {
            junta_obligatoria: {
                tema: "Junta de propietarios",
                articulo: "Artículo 16 LPH",
                texto: "La junta de propietarios, presidida por el presidente de la comunidad, tiene la facultad de decidir sobre los asuntos que tengan por objeto la conservación, adecuación y mejora del inmueble, sus servicios generales y las actuaciones de urgencia."
            },
            mayorias: {
                tema: "Mayorías de votación",
                articulo: "Artículo 17 LPH",
                texto: "Los acuerdos se adoptarán por mayoría de los votos de todos los propietarios que, supongan la mayoría de las cuotas de participación en la comunidad. Para la validez de los acuerdos se requerirá que las cuotas de los propietarios que voten a favor representen más del cincuenta por ciento del total de las cuotas de participación."
            },
            obras: {
                tema: "Obras y mejoras",
                articulo: "Artículo 10 LPH",
                texto: "La realización de obras o el establecimiento de nuevos servicios comunes, que impliquen modificación del título constitutivo o de los estatutos, requerirá el acuerdo unánime de todos los propietarios. Las obras que no impliquen modificación del título constitutivo ni de los estatutos requerirán el acuerdo de la mayoría de los propietarios que, a su vez, representen la mayoría de las cuotas de participación."
            },
            cuotas: {
                tema: "Cuotas de participación",
                articulo: "Artículo 9 LPH",
                texto: "Corresponde a la comunidad, a través de sus órganos de gobierno, la conservación, adecuada utilización y mejora de los elementos comunes, incluidos los servicios, instalaciones y accesorios, y la satisfacción del pago de los gastos generales de la comunidad."
            },
            presidentes: {
                tema: "Presidente y Administrador",
                articulo: "Artículo 13 LPH",
                texto: "El presidente será nombrado por la junta de propietarios, que también podrá acordar su remoción, mediante acuerdo adoptado por la mayoría de los propietarios que, a su vez, representen la mayoría de las cuotas de participación."
            }
        };

        return articulos[tema] || null;
    }

    /**
     * Obtiene la mayoría requerida según el tipo de acuerdo
     */
    static obtenerMayoriaRequerida(tipo_acuerdo) {
        const mapas = {
            "cuentas_anuales": "mayoria_simple",
            "presupuesto_anual": "mayoria_simple",
            "aprobacion_actas": "mayoria_simple",
            "obras_ordinarias": "mayoria_cualificada",
            "mejora_servicios": "mayoria_cualificada",
            "alteracion_cuotas": "unanimidad",
            "modificacion_estatutos": "unanimidad",
            "division_piso": "unanimidad",
            "eliminacion_barreras": "mayoria_especial_80",
            "instalacion_accesibilidad": "mayoria_especial_80",
            "actos_elementos_comunes": "mayoria_especial_66"
        };

        return mapas[tipo_acuerdo] || "mayoria_simple";
    }

    /**
     * Obtiene plantilla de prompt para Claude según tipo de junta
     */
    static obtenerPlantillaPrompt(tipo_junta) {
        const plantillas = {
            ordinaria: {
                rol: "acta_junta_ordinaria",
                foco: "cuentas anuales, presupuesto, aprobación de actas anteriores",
                contexto_adicional: "Las juntas ordinarias suelen celebrarse anualmente para tratar la gestión económica de la comunidad."
            },
            extraordinaria: {
                rol: "acta_junta_extraordinaria",
                foco: "obras, reformas, modificaciones estatutarias, asuntos urgentes",
                contexto_adicional: "Las juntas extraordinarias se convocan para tratar asuntos específicos que no pueden esperar a la junta ordinaria."
            },
            mixta: {
                rol: "acta_junta_mixta",
                foco "combinación de asuntos ordinarios y extraordinarios",
                contexto_adicional: "Las juntas mixtas tratan tanto asuntos ordinarios como extraordinarios en la misma reunión."
            }
        };

        return plantillas[tipo_junta] || plantillas.ordinaria;
    }

    /**
     * Valida un acuerdo según la LPH
     */
    static validarAcuerdoLegal(acuerdo, comunidad) {
        const errores = [];
        const advertencias = [];

        // Validar mayoría requerida
        const mayoriaRequerida = this.obtenerMayoriaRequerida(acuerdo.tipo);
        const mayorias = this.obtenerMayorias();

        if (mayoriaRequerida !== "mayoria_simple" && !this.verificarCumplimientoMayoria(acuerdo, mayoriaRequerida, comunidad)) {
            errores.push(`El acuerdo "${acuerdo.titulo}" requiere ${mayorias[mayoriaRequerida].nombre} pero solo se alcanzó mayor simple`);
        }

        // Validar que haya texto de acuerdo
        if (!acuerdo.acuerdo || acuerdo.acuerdo.trim() === "") {
            errores.push(`El punto "${acuerdo.titulo}" no tiene texto de acuerdo`);
        }

        // Validar que hay votos individuales
        if (!acuerdo.votos_individuales || acuerdo.votos_individuales.length === 0) {
            advertencias.push(`El punto "${acuerdo.titulo}" no tiene registro de votos individuales`);
        }

        return {
            valido: errores.length === 0,
            errores,
            advertencias
        };
    }

    /**
     * Verifica si se cumplió la mayoría requerida
     */
    static verificarCumplimientoMayoria(acuerdo, tipoMayoría, comunidad) {
        const mayorias = this.obtenerMayorias();
        const mayoria = mayorias[tipoMayoria];

        switch (tipoMayoria) {
            case "mayoria_simple":
                return acuerdo.resultados.a_favor_coeficiente > (comunidad.total_coeficientes / 2);

            case "mayoria_cualificada":
                const coeficienteCumplido = acuerdo.resultados.a_favor_coeficiente >= (comunidad.total_coeficientes * 0.60);
                const propietariosCumplido = acuerdo.votos_individuales.filter(v => v.voto === "a_favor").length > (comunidad.total_propietarios / 2);
                return coeficienteCumplido && propietariosCumplido;

            case "unanimidad":
                return acuerdo.resultados.a_favor_coeficiente === comunidad.total_coeficientes;

            case "mayoria_especial_80":
                return acuerdo.resultados.a_favor_coeficiente >= (comunidad.total_coeficientes * 0.80);

            case "mayoria_especial_66":
                return acuerdo.resultados.a_favor_coeficiente >= (comunidad.total_coeficientes * 0.66);

            default:
                return false;
        }
    }

    /**
     * Obtiene ejemplos de redacción legal para actas
     */
    static obtenerEjemplosRedaccion() {
        return {
            apertura: "Reunidos los asistentes en primera convocatoria a las {hora} del día {fecha} en {lugar}, se procede a la celebración de la Junta de Propietarios de la Comunidad de Propietarios de {nombre_comunidad}, situada en {direccion}, con CIF {cif}.",
            quorum: "Se verifica el quorum necesario, encontrándose presentes propietarios que representan el {porcentaje}% de los coeficientes de la comunidad, por lo que la Junta queda válidamente constituida.",
            deliberacion: "Tras la deliberación correspondiente y debatidos los puntos del orden del día, se procede a la votación de los mismos.",
            acuerdo_aprobado: "El punto {numero} del orden del día es aprobado por {porcentaje}% de los votos representados, con {a_favor} votos a favor, {en_contra} en contra y {abstencion} abstenciones.",
            acuerdo_rechazado: "El punto {numero} del orden del día es rechazado por no alcanzar la mayoría necesaria, con {a_favor} votos a favor y {en_contra} en contra.",
            cierre: "No habiendo más asuntos que tratar, y siendo las {hora}, el Presidente declara finalizada la sesión, levantándose acta que se firma por los presentes."
        };
    }

    /**
     * Obtiene referencias legales completas para el prompt de Claude
     */
    static obtenerContextoCompletoParaClaude() {
        return {
            ley: "Ley de Propiedad Horizontal (LPH)",
            referencia: "Real Decreto Legislativo 1/2024, de 19 de octubre",
            articulo_actas: this.obtenerArticuloActa(),
            mayorias: this.obtenerMayorias(),
            estructura: this.obtenerEstructuraActa(),
            ejemplos_redaccion: this.obtenerEjemplosRedaccion()
        };
    }
}

// Exportar la clase
export { ContextoLegal };
