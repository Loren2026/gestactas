/**
 * GestActas - Servicio de Propietarios
 * 
 * Servicio para la gestión completa de propietarios.
 */

import { indexedDBService } from './indexeddb.service.js';
import { ValidacionComunidadPropietario } from '../utilidades/validacion-comunidad-propietario.js';

class PropietariosService {
    /**
     * Crea un nuevo propietario
     */
    async crearPropietario(datosPropietario) {
        try {
            // Validar datos de propietario
            const validacion = ValidacionComunidadPropietario.validarPropietario(datosPropietario);
            
            if (!validacion.valida) {
                throw new Error(`Propietario inválido: ${validacion.errores.join(', ')}`);
            }

            // Verificar que la comunidad existe
            const comunidad = await indexedDBService.get('comunidades', datosPropietario.comunidadId);
            
            if (!comunidad) {
                throw new Error(`Comunidad con ID ${datosPropietario.comunidadId} no encontrada`);
            }

            const propietario = {
                comunidadId: datosPropietario.comunidadId,
                nombre: datosPropietario.nombre,
                apellidos: datosPropietario.apellidos,
                dni: datosPropietario.dni || '',
                email: datosPropietario.email || '',
                telefono: datosPropietario.telefono || '',
                direccion: datosPropietario.direccion,
                codigoPostal: datosPropietario.codigoPostal,
                ciudad: datosPropietario.ciudad,
                coeficiente: datosPropietario.coeficiente,
                piso: datosPropietario.piso,
                letra: datosPropietario.letra || '',
                representante: datosPropietario.representante || false,
                representanteNombre: datosPropietario.representanteNombre || '',
                fechaRegistro: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                activo: true
            };

            const id = await indexedDBService.add('propietarios', propietario);
            console.log('Propietario creado con ID:', id);
            return { ...propietario, id };
        } catch (error) {
            console.error('Error al crear propietario:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los propietarios
     */
    async obtenerPropietarios(filtros = {}) {
        try {
            let propietarios = await indexedDBService.getAll('propietarios');

            // Filtrar por comunidad
            if (filtros.comunidadId) {
                propietarios = propietarios.filter(p => p.comunidadId === filtros.comunidadId);
            }

            // Filtrar por activo
            if (filtros.activo !== undefined) {
                propietarios = propietarios.filter(p => p.activo === filtros.activo);
            }

            // Filtrar por representante
            if (filtros.representante !== undefined) {
                propietarios = propietarios.filter(p => p.representante === filtros.representante);
            }

            // Filtrar por rango de coeficientes
            if (filtros.coeficienteMin !== undefined) {
                propietarios = propietarios.filter(p => p.coeficiente >= filtros.coeficienteMin);
            }

            if (filtros.coeficienteMax !== undefined) {
                propietarios = propietarios.filter(p => p.coeficiente <= filtros.coeficienteMax);
            }

            // Buscar por término
            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                propietarios = propietarios.filter(p => 
                    p.nombre.toLowerCase().includes(busqueda) ||
                    p.apellidos.toLowerCase().includes(busqueda) ||
                    p.dni.toLowerCase().includes(busqueda) ||
                    p.email.toLowerCase().includes(busqueda) ||
                    p.direccion.toLowerCase().includes(busqueda)
                );
            }

            // Ordenar por apellidos, luego nombre
            return propietarios.sort((a, b) => {
                const comparacionApellidos = a.apellidos.localeCompare(b.apellidos);
                if (comparacionApellidos !== 0) return comparacionApellidos;
                return a.nombre.localeCompare(b.nombre);
            });
        } catch (error) {
            console.error('Error al obtener propietarios:', error);
            throw error;
        }
    }

    /**
     * Obtiene los propietarios de una comunidad
     */
    async obtenerPropietariosComunidad(comunidadId, filtros = {}) {
        try {
            return await this.obtenerPropietarios({
                ...filtros,
                comunidadId: comunidadId
            });
        } catch (error) {
            console.error('Error al obtener propietarios de comunidad:', error);
            throw error;
        }
    }

    /**
     * Obtiene un propietario por su ID
     */
    async obtenerPropietario(id) {
        try {
            const propietario = await indexedDBService.get('propietarios', id);
            
            if (!propietario) {
                throw new Error(`Propietario con ID ${id} no encontrado`);
            }

            // Obtener comunidad del propietario
            const comunidad = await indexedDBService.get('comunidades', propietario.comunidadId);

            return {
                ...propietario,
                comunidad: comunidad
            };
        } catch (error) {
            console.error('Error al obtener propietario:', error);
            throw error;
        }
    }

    /**
     * Actualiza un propietario
     */
    async actualizarPropietario(id, datosActualizados) {
        try {
            // Validar datos actualizados
            const validacion = ValidacionComunidadPropietario.validarPropietario(datosActualizados);
            
            if (!validacion.valida) {
                throw new Error(`Propietario inválido: ${validacion.errores.join(', ')}`);
            }

            const propietarioActual = await indexedDBService.get('propietarios', id);
            
            if (!propietarioActual) {
                throw new Error(`Propietario con ID ${id} no encontrado`);
            }

            // Si se cambia de comunidad, verificar que la nueva existe
            if (datosActualizados.comunidadId && datosActualizados.comunidadId !== propietarioActual.comunidadId) {
                const comunidad = await indexedDBService.get('comunidades', datosActualizados.comunidadId);
                
                if (!comunidad) {
                    throw new Error(`Comunidad con ID ${datosActualizados.comunidadId} no encontrada`);
                }
            }

            const propietarioActualizado = {
                ...propietarioActual,
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('propietarios', propietarioActualizado);
            console.log('Propietario actualizado:', id);
            return propietarioActualizado;
        } catch (error) {
            console.error('Error al actualizar propietario:', error);
            throw error;
        }
    }

    /**
     * Elimina un propietario
     */
    async eliminarPropietario(id) {
        try {
            // Verificar que el propietario existe
            const propietario = await indexedDBService.get('propietarios', id);
            
            if (!propietario) {
                throw new Error(`Propietario con ID ${id} no encontrado`);
            }

            // Validar relaciones (Mejora 8)
            const validacion = await ValidacionComunidadPropietario.validarEliminarPropietario(
                id,
                (propietarioId) => this.obtenerJuntasPropietario(propietarioId)
            );

            if (!validacion.puedeEliminar) {
                throw new Error(validacion.errores.join(', '));
            }

            // Eliminar el propietario
            await indexedDBService.delete('propietarios', id);
            console.log('Propietario eliminado:', id);
        } catch (error) {
            console.error('Error al eliminar propietario:', error);
            throw error;
        }
    }

    /**
     * Asigna un propietario a una comunidad diferente
     */
    async asignarComunidad(propietarioId, nuevaComunidadId) {
        try {
            // Verificar que el propietario existe
            const propietario = await indexedDBService.get('propietarios', propietarioId);
            
            if (!propietario) {
                throw new Error(`Propietario con ID ${propietarioId} no encontrado`);
            }

            // Verificar que la nueva comunidad existe
            const comunidad = await indexedDBService.get('comunidades', nuevaComunidadId);
            
            if (!comunidad) {
                throw new Error(`Comunidad con ID ${nuevaComunidadId} no encontrada`);
            }

            // Actualizar comunidad del propietario
            const propietarioActualizado = {
                ...propietario,
                comunidadId: nuevaComunidadId,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('propietarios', propietarioActualizado);
            console.log(`Propietario ${propietarioId} asignado a comunidad ${nuevaComunidadId}`);
            
            return propietarioActualizado;
        } catch (error) {
            console.error('Error al asignar comunidad:', error);
            throw error;
        }
    }

    /**
     * Importa propietarios desde CSV (Mejora 3)
     */
    async importarPropietariosCSV(archivoCSV, comunidadId) {
        try {
            // Leer el archivo CSV
            const textoCSV = await this.leerArchivoCSV(archivoCSV);
            
            // Validar CSV
            const validacion = ValidacionComunidadPropietario.validarImportacionCSV(textoCSV);
            
            if (!validacion.valida) {
                throw new Error(`CSV inválido: ${validacion.errores.join(', ')}`);
            }

            // Mostrar advertencias si las hay
            if (validacion.advertencias.length > 0) {
                console.warn('Advertencias de importación:', validacion.advertencias);
            }

            // Importar filas válidas
            let importadas = 0;
            let fallidas = 0;
            
            for (const filaValida of validacion.filasValidas) {
                try {
                    await this.crearPropietario({
                        ...filaValida.datos,
                        comunidadId: comunidadId
                    });
                    importadas++;
                } catch (error) {
                    console.error(`Error al importar fila ${filaValida.numeroFila}:`, error);
                    fallidas++;
                }
            }

            console.log(`Importación completada: ${importadas} exitosas, ${fallidas} fallidas`);
            
            return {
                total: validacion.totalFilas,
                importadas,
                fallidas,
                filasInvalidas: validacion.filasInvalidas.length
            };
        } catch (error) {
            console.error('Error al importar propietarios:', error);
            throw error;
        }
    }

    /**
     * Exporta propietarios de una comunidad a CSV (Mejora 3)
     */
    async exportarPropietariosCSV(comunidadId) {
        try {
            const propietarios = await this.obtenerPropietariosComunidad(comunidadId);
            
            if (propietarios.length === 0) {
                throw new Error('No hay propietarios para exportar');
            }

            // Crear encabezados
            const encabezados = [
                'Nombre',
                'Apellidos',
                'DNI',
                'Email',
                'Teléfono',
                'Dirección',
                'Código Postal',
                'Ciudad',
                'Coeficiente',
                'Piso',
                'Letra',
                'Representante',
                'Nombre Representante',
                'Activo'
            ];

            // Crear filas de datos
            const filas = propietarios.map(p => [
                p.nombre,
                p.apellidos,
                p.dni || '',
                p.email || '',
                p.telefono || '',
                p.direccion,
                p.codigoPostal,
                p.ciudad,
                p.coeficiente,
                p.piso,
                p.letra || '',
                p.representante ? 'Si' : 'No',
                p.representanteNombre || '',
                p.activo ? 'Si' : 'No'
            ]);

            // Crear CSV
            const filasCSV = filas.map(fila => fila.join(';'));
            const csv = [encabezados.join(';'), ...filasCSV].join('\n');

            // Descargar archivo
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `propietarios_comunidad_${comunidadId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Exportados ${propietarios.length} propietarios a CSV`);
            
            return {
                exportados: propietarios.length,
                archivo: a.download
            };
        } catch (error) {
            console.error('Error al exportar propietarios:', error);
            throw error;
        }
    }

    /**
     * Lee un archivo CSV
     */
    async leerArchivoCSV(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsText(archivo, 'UTF-8');
        });
    }

    /**
     * Busca propietarios por término
     */
    async buscarPropietarios(termino) {
        try {
            if (!termino || termino.trim() === '') {
                return await this.obtenerPropietarios();
            }

            const terminoLower = termino.toLowerCase();
            return await this.obtenerPropietarios({ busqueda: terminoLower });
        } catch (error) {
            console.error('Error al buscar propietarios:', error);
            throw error;
        }
    }

    /**
     * Activa o desactiva un propietario
     */
    async cambiarEstadoPropietario(id, activo) {
        try {
            const propietario = await indexedDBService.get('propietarios', id);
            
            if (!propietario) {
                throw new Error(`Propietario con ID ${id} no encontrado`);
            }

            const propietarioActualizado = {
                ...propietario,
                activo: activo,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('propietarios', propietarioActualizado);
            console.log(`Propietario ${id} ${activo ? 'activado' : 'desactivado'}`);
            
            return propietarioActualizado;
        } catch (error) {
            console.error('Error al cambiar estado de propietario:', error);
            throw error;
        }
    }

    /**
     * Obtiene las juntas en las que ha participado un propietario
     */
    async obtenerJuntasPropietario(propietarioId) {
        try {
            const asistentes = await indexedDBService.getByIndex('asistentes', 'propietarioId', propietarioId);
            
            if (!asistentes) {
                return [];
            }

            const juntasIds = [...new Set(asistentes.map(a => a.juntaId))];
            const juntas = [];

            for (const juntaId of juntasIds) {
                const junta = await indexedDBService.get('juntas', juntaId);
                if (junta) {
                    juntas.push(junta);
                }
            }

            return juntas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        } catch (error) {
            console.error('Error al obtener juntas del propietario:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de propietarios de una comunidad
     */
    async obtenerEstadisticasPropietarios(comunidadId) {
        try {
            const propietarios = await this.obtenerPropietariosComunidad(comunidadId);

            const estadisticas = {
                comunidadId,
                totalPropietarios: propietarios.length,
                propietariosActivos: propietarios.filter(p => p.activo).length,
                propietariosInactivos: propietarios.filter(p => !p.activo).length,
                propietariosRepresentantes: propietarios.filter(p => p.representante).length,
                coeficienteTotal: 0,
                coeficientePromedio: 0,
                coeficienteMaximo: 0,
                coeficienteMinimo: 100,
                porcentajeRepresentantes: 0
            };

            // Calcular estadísticas de coeficientes
            const coeficientes = propietarios.map(p => p.coeficiente);
            
            if (coeficientes.length > 0) {
                estadisticas.coeficienteTotal = coeficientes.reduce((sum, c) => sum + c, 0);
                estadisticas.coeficientePromedio = estadisticas.coeficienteTotal / coeficientes.length;
                estadisticas.coeficienteMaximo = Math.max(...coeficientes);
                estadisticas.coeficienteMinimo = Math.min(...coeficientes);
            }

            // Calcular porcentaje de representantes
            estadisticas.porcentajeRepresentantes = propietarios.length > 0 ?
                (estadisticas.propietariosRepresentantes / propietarios.length) * 100 : 0;

            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas de propietarios:', error);
            throw error;
        }
    }

    /**
     * Obtiene distribución de coeficientes de una comunidad
     */
    async obtenerDistribucionCoeficientes(comunidadId, intervalos = 5) {
        try {
            const propietarios = await this.obtenerPropietariosComunidad(comunidadId);
            const coeficientes = propietarios.map(p => p.coeficiente);

            // Crear intervalos
            const maxCoeficiente = Math.max(...coeficientes, 100);
            const tamanoIntervalo = maxCoeficiente / intervalos;
            
            const distribucion = [];
            
            for (let i = 0; i < intervalos; i++) {
                const min = i * tamanoIntervalo;
                const max = (i + 1) * tamanoIntervalo;
                
                const count = coeficientes.filter(c => c >= min && c < max).length;
                
                distribucion.push({
                    intervalo: `${Math.round(min)}% - ${Math.round(max)}%`,
                    min: Math.round(min),
                    max: Math.round(max),
                    count,
                    porcentaje: propietarios.length > 0 ? (count / propietarios.length) * 100 : 0
                });
            }

            return {
                comunidadId,
                intervalos,
                distribucion,
                totalPropietarios: propietarios.length
            };
        } catch (error) {
            console.error('Error al obtener distribución de coeficientes:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const propietariosService = new PropietariosService();
