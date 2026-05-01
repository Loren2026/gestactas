/**
 * GestActas - Servicio de Juntas
 * 
 * Servicio para la gestión completa de juntas de propietarios,
 * incluyendo creación, actualización, eliminación y consulta.
 */

import { indexedDBService } from './indexeddb.service.js';

class JuntasService {
    /**
     * Crea una nueva junta
     */
    async crearJunta(datosJunta) {
        try {
            const junta = {
                comunidadId: datosJunta.comunidadId,
                tipo: datosJunta.tipo, // 'ordinaria' | 'extraordinaria'
                fecha: datosJunta.fecha,
                hora: datosJunta.hora,
                lugar: datosJunta.lugar,
                ordenDelDia: datosJunta.ordenDelDia || [],
                quorumRequerido: datosJunta.quorumRequerido || 0.3, // 30% por defecto
                coeficienteTotal: datosJunta.coeficienteTotal || 100,
                fechaCreacion: new Date().toISOString(),
                estado: 'pendiente' // 'pendiente' | 'en_curso' | 'finalizada'
            };

            const id = await indexedDBService.add('juntas', junta);
            console.log('Junta creada con ID:', id);
            return { ...junta, id };
        } catch (error) {
            console.error('Error al crear junta:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las juntas
     */
    async obtenerJuntas() {
        try {
            const juntas = await indexedDBService.getAll('juntas');
            return juntas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        } catch (error) {
            console.error('Error al obtener juntas:', error);
            throw error;
        }
    }

    /**
     * Obtiene una junta por su ID
     */
    async obtenerJunta(id) {
        try {
            const junta = await indexedDBService.get('juntas', id);
            
            if (!junta) {
                throw new Error(`Junta con ID ${id} no encontrada`);
            }

            // Obtener asistentes de la junta
            const asistentes = await indexedDBService.getByIndex('asistentes', 'juntaId', id);
            
            // Obtener grabaciones de la junta
            const grabaciones = await indexedDBService.getByIndex('grabaciones', 'juntaId', id);
            
            // Obtener actas de la junta
            const actas = await indexedDBService.getByIndex('actas', 'juntaId', id);

            return {
                ...junta,
                asistentes: asistentes,
                grabaciones: grabaciones,
                actas: actas
            };
        } catch (error) {
            console.error('Error al obtener junta:', error);
            throw error;
        }
    }

    /**
     * Actualiza una junta
     */
    async actualizarJunta(id, datosActualizados) {
        try {
            const juntaActual = await indexedDBService.get('juntas', id);
            
            if (!juntaActual) {
                throw new Error(`Junta con ID ${id} no encontrada`);
            }

            const juntaActualizada = {
                ...juntaActual,
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('juntas', juntaActualizada);
            console.log('Junta actualizada:', juntaActualizada);
            return juntaActualizada;
        } catch (error) {
            console.error('Error al actualizar junta:', error);
            throw error;
        }
    }

    /**
     * Elimina una junta
     */
    async eliminarJunta(id) {
        try {
            // Verificar que la junta existe
            const junta = await indexedDBService.get('juntas', id);
            
            if (!junta) {
                throw new Error(`Junta con ID ${id} no encontrada`);
            }

            // Eliminar asistentes asociados
            const asistentes = await indexedDBService.getByIndex('asistentes', 'juntaId', id);
            for (const asistente of asistentes) {
                await indexedDBService.delete('asistentes', asistente.id);
            }

            // Eliminar grabaciones asociadas
            const grabaciones = await indexedDBService.getByIndex('grabaciones', 'juntaId', id);
            for (const grabacion of grabaciones) {
                await indexedDBService.delete('grabaciones', grabacion.id);
            }

            // Eliminar transcripciones asociadas
            for (const grabacion of grabaciones) {
                const transcripciones = await indexedDBService.getByIndex('transcripciones', 'grabacionId', grabacion.id);
                for (const transcripcion of transcripciones) {
                    await indexedDBService.delete('transcripciones', transcripcion.id);
                }
            }

            // Eliminar actas asociadas
            const actas = await indexedDBService.getByIndex('actas', 'juntaId', id);
            for (const acta of actas) {
                // Eliminar exportaciones asociadas
                const exportaciones = await indexedDBService.getByIndex('exportaciones', 'actaId', acta.id);
                for (const exportacion of exportaciones) {
                    await indexedDBService.delete('exportaciones', exportacion.id);
                }
                await indexedDBService.delete('actas', acta.id);
            }

            // Eliminar la junta
            await indexedDBService.delete('juntas', id);
            console.log('Junta eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar junta:', error);
            throw error;
        }
    }

    /**
     * Añade un asistente a una junta
     */
    async añadirAsistente(juntaId, datosAsistente) {
        try {
            const asistente = {
                juntaId: juntaId,
                propietarioId: datosAsistente.propietarioId,
                nombre: datosAsistente.nombre,
                coeficiente: datosAsistente.coeficiente || 0,
                cargo: datosAsistente.cargo, // 'presidente' | 'secretario' | 'propietario'
                representandoA: datosAsistente.representandoA || [],
                asistePresencial: datosAsistente.asistePresencial !== false,
                asisteTelematico: datosAsistente.asisteTelematico || false,
                fechaRegistro: new Date().toISOString()
            };

            const id = await indexedDBService.add('asistentes', asistente);
            console.log('Asistente añadido con ID:', id);
            return { ...asistente, id };
        } catch (error) {
            console.error('Error al añadir asistente:', error);
            throw error;
        }
    }

    /**
     * Elimina un asistente de una junta
     */
    async eliminarAsistente(id) {
        try {
            await indexedDBService.delete('asistentes', id);
            console.log('Asistente eliminado:', id);
        } catch (error) {
            console.error('Error al eliminar asistente:', error);
            throw error;
        }
    }

    /**
     * Calcula el quórum actual de una junta
     */
    async calcularQuorum(juntaId) {
        try {
            const asistentes = await indexedDBService.getByIndex('asistentes', 'juntaId', juntaId);
            const junta = await indexedDBService.get('juntas', juntaId);

            // Calcular coeficiente total de asistentes
            const coeficienteAsistentes = asistentes.reduce((total, asistente) => {
                return total + (asistente.asistePresencial || asistente.asisteTelematico ? asistente.coeficiente : 0);
            }, 0);

            // Calcular porcentaje de quórum
            const porcentajeQuorum = (coeficienteAsistentes / junta.coeficienteTotal) * 100;

            // Verificar si hay quórum
            const hayQuorum = porcentajeQuorum >= (junta.quorumRequerido * 100);

            return {
                coeficienteAsistentes,
                coeficienteTotal: junta.coeficienteTotal,
                porcentajeQuorum,
                hayQuorum,
                quorumRequerido: junta.quorumRequerido * 100,
                asistentesPresentes: asistentes.filter(a => a.asistePresencial || a.asisteTelematico).length,
                totalAsistentes: asistentes.length
            };
        } catch (error) {
            console.error('Error al calcular quórum:', error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de una junta
     */
    async actualizarEstado(juntaId, estado) {
        try {
            const estadosValidos = ['pendiente', 'en_curso', 'finalizada'];
            
            if (!estadosValidos.includes(estado)) {
                throw new Error(`Estado inválido: ${estado}. Estados válidos: ${estadosValidos.join(', ')}`);
            }

            await this.actualizarJunta(juntaId, { estado });
            console.log('Estado de junta actualizado:', estado);
        } catch (error) {
            console.error('Error al actualizar estado de junta:', error);
            throw error;
        }
    }

    /**
     * Busca juntas por filtros
     */
    async buscarJuntas(filtros) {
        try {
            let juntas = await this.obtenerJuntas();

            // Filtrar por tipo
            if (filtros.tipo) {
                juntas = juntas.filter(junta => junta.tipo === filtros.tipo);
            }

            // Filtrar por estado
            if (filtros.estado) {
                juntas = juntas.filter(junta => junta.estado === filtros.estado);
            }

            // Filtrar por fecha (rango)
            if (filtros.fechaInicio) {
                juntas = juntas.filter(junta => new Date(junta.fecha) >= new Date(filtros.fechaInicio));
            }

            if (filtros.fechaFin) {
                juntas = juntas.filter(junta => new Date(junta.fecha) <= new Date(filtros.fechaFin));
            }

            // Filtrar por comunidad
            if (filtros.comunidadId) {
                juntas = juntas.filter(junta => junta.comunidadId === filtros.comunidadId);
            }

            // Filtrar por búsqueda de texto
            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                juntas = juntas.filter(junta => 
                    junta.lugar?.toLowerCase().includes(busqueda) ||
                    junta.ordenDelDia?.some(item => item.toLowerCase().includes(busqueda))
                );
            }

            return juntas;
        } catch (error) {
            console.error('Error al buscar juntas:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const juntasService = new JuntasService();
