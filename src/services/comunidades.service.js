/**
 * GestActas - Servicio de Comunidades
 * 
 * Servicio para la gestión completa de comunidades de vecinos.
 */

const indexedDBService = window.indexedDBService;
const ValidacionComunidadPropietario = window.ValidacionComunidadPropietario;

class ComunidadesService {
    /**
     * Crea una nueva comunidad
     */
    async crearComunidad(datosComunidad) {
        try {
            // Validar datos de comunidad
            const validacion = ValidacionComunidadPropietario.validarComunidad(datosComunidad);
            
            if (!validacion.valida) {
                throw new Error(`Comunidad inválida: ${validacion.errores.join(', ')}`);
            }

            const comunidad = {
                nombre: datosComunidad.nombre,
                direccion: datosComunidad.direccion,
                codigoPostal: datosComunidad.codigoPostal,
                ciudad: datosComunidad.ciudad,
                provincia: datosComunidad.provincia,
                cif: datosComunidad.cif || '',
                email: datosComunidad.email || '',
                telefono: datosComunidad.telefono || '',
                numeroCatastral: datosComunidad.numeroCatastral || '',
                presidente: datosComunidad.presidente || '',
                administrador: datosComunidad.administrador || '',
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                activo: true
            };

            const id = await indexedDBService.add('comunidades', comunidad);
            console.log('Comunidad creada con ID:', id);
            return { ...comunidad, id };
        } catch (error) {
            console.error('Error al crear comunidad:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las comunidades
     */
    async obtenerComunidades(filtros = {}) {
        try {
            let comunidades = await indexedDBService.getAll('comunidades');

            // Filtrar por activo
            if (filtros.activo !== undefined) {
                comunidades = comunidades.filter(c => c.activo === filtros.activo);
            }

            // Filtrar por ciudad
            if (filtros.ciudad) {
                comunidades = comunidades.filter(c => 
                    c.ciudad.toLowerCase().includes(filtros.ciudad.toLowerCase())
                );
            }

            // Filtrar por provincia
            if (filtros.provincia) {
                comunidades = comunidades.filter(c => 
                    c.provincia.toLowerCase().includes(filtros.provincia.toLowerCase())
                );
            }

            // Buscar por término
            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                comunidades = comunidades.filter(c => 
                    c.nombre.toLowerCase().includes(busqueda) ||
                    c.direccion.toLowerCase().includes(busqueda) ||
                    c.ciudad.toLowerCase().includes(busqueda) ||
                    c.provincia.toLowerCase().includes(busqueda)
                );
            }

            // Ordenar por nombre
            return comunidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } catch (error) {
            console.error('Error al obtener comunidades:', error);
            throw error;
        }
    }

    /**
     * Obtiene una comunidad por su ID
     */
    async obtenerComunidad(id) {
        try {
            const comunidad = await indexedDBService.get('comunidades', id);
            
            if (!comunidad) {
                throw new Error(`Comunidad con ID ${id} no encontrada`);
            }

            // Obtener propietarios de la comunidad
            const propietarios = await this.obtenerPropietarios(id);

            return {
                ...comunidad,
                propietarios: propietarios
            };
        } catch (error) {
            console.error('Error al obtener comunidad:', error);
            throw error;
        }
    }

    /**
     * Actualiza una comunidad
     */
    async actualizarComunidad(id, datosActualizados) {
        try {
            // Validar datos actualizados
            const validacion = ValidacionComunidadPropietario.validarComunidad(datosActualizados);
            
            if (!validacion.valida) {
                throw new Error(`Comunidad inválida: ${validacion.errores.join(', ')}`);
            }

            const comunidadActual = await indexedDBService.get('comunidades', id);
            
            if (!comunidadActual) {
                throw new Error(`Comunidad con ID ${id} no encontrada`);
            }

            const comunidadActualizada = {
                ...comunidadActual,
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('comunidades', comunidadActualizada);
            console.log('Comunidad actualizada:', id);
            return comunidadActualizada;
        } catch (error) {
            console.error('Error al actualizar comunidad:', error);
            throw error;
        }
    }

    /**
     * Elimina una comunidad
     */
    async eliminarComunidad(id) {
        try {
            // Verificar que la comunidad existe
            const comunidad = await indexedDBService.get('comunidades', id);
            
            if (!comunidad) {
                throw new Error(`Comunidad con ID ${id} no encontrada`);
            }

            // Validar relaciones (Mejora 8)
            const validacion = await ValidacionComunidadPropietario.validarEliminarComunidad(
                id, 
                (comunidadId) => this.obtenerPropietarios(comunidadId)
            );

            if (!validacion.puedeEliminar) {
                throw new Error(validacion.errores.join(', '));
            }

            // Eliminar propietarios de la comunidad
            const propietarios = await this.obtenerPropietarios(id);
            for (const propietario of propietarios) {
                await indexedDBService.delete('propietarios', propietario.id);
            }

            // Eliminar la comunidad
            await indexedDBService.delete('comunidades', id);
            console.log('Comunidad eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar comunidad:', error);
            throw error;
        }
    }

    /**
     * Busca comunidades por término
     */
    async buscarComunidades(termino) {
        try {
            if (!termino || termino.trim() === '') {
                return await this.obtenerComunidades();
            }

            const terminoLower = termino.toLowerCase();
            let comunidades = await indexedDBService.getAll('comunidades');

            comunidades = comunidades.filter(c => 
                c.nombre.toLowerCase().includes(terminoLower) ||
                c.direccion.toLowerCase().includes(terminoLower) ||
                c.ciudad.toLowerCase().includes(terminoLower) ||
                c.provincia.toLowerCase().includes(terminoLower) ||
                c.codigoPostal.includes(terminoLower)
            );

            return comunidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } catch (error) {
            console.error('Error al buscar comunidades:', error);
            throw error;
        }
    }

    /**
     * Obtiene los propietarios de una comunidad
     */
    async obtenerPropietarios(comunidadId) {
        try {
            const propietarios = await indexedDBService.getAll('propietarios');
            
            return propietarios
                .filter(p => p.comunidadId === comunidadId)
                .sort((a, b) => a.nombre.localeCompare(b.nombre));
        } catch (error) {
            console.error('Error al obtener propietarios:', error);
            throw error;
        }
    }

    /**
     * Calcula el coeficiente total de una comunidad
     */
    async calcularCoeficienteTotal(comunidadId) {
        try {
            const propietarios = await this.obtenerPropietarios(comunidadId);
            
            const coeficienteTotal = propietarios.reduce((total, propietario) => {
                return total + (propietario.coeficiente || 0);
            }, 0);

            return {
                comunidadId,
                totalPropietarios: propietarios.length,
                propietariosActivos: propietarios.filter(p => p.activo).length,
                coeficienteTotal,
                coeficientePromedio: propietarios.length > 0 ? coeficienteTotal / propietarios.length : 0
            };
        } catch (error) {
            console.error('Error al calcular coeficiente total:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de una comunidad
     */
    async obtenerEstadisticas(comunidadId) {
        try {
            const comunidad = await this.obtenerComunidad(comunidadId);
            const propietarios = comunidad.propietarios || [];

            // Estadísticas básicas
            const estadisticas = {
                comunidadId,
                totalPropietarios: propietarios.length,
                propietariosActivos: propietarios.filter(p => p.activo).length,
                propietariosInactivos: propietarios.filter(p => !p.activo).length,
                propietariosRepresentantes: propietarios.filter(p => p.representante).length,
                coeficienteTotal: 0,
                coeficientePromedio: 0,
                porcentajeActivo: 0
            };

            // Calcular coeficientes
            estadisticas.coeficienteTotal = propietarios.reduce((total, p) => total + (p.coeficiente || 0), 0);
            estadisticas.coeficientePromedio = propietarios.length > 0 ? 
                estadisticas.coeficienteTotal / propietarios.length : 0;
            
            // Calcular porcentaje de activos
            estadisticas.porcentajeActivo = propietarios.length > 0 ?
                (estadisticas.propietariosActivos / propietarios.length) * 100 : 0;

            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    /**
     * Filtra comunidades con múltiples criterios
     */
    async filtrarComunidades(filtros) {
        try {
            let comunidades = await this.obtenerComunidades();

            // Filtrar por activo
            if (filtros.activo !== undefined) {
                comunidades = comunidades.filter(c => c.activo === filtros.activo);
            }

            // Filtrar por ciudad
            if (filtros.ciudades && filtros.ciudades.length > 0) {
                comunidades = comunidades.filter(c => 
                    filtros.ciudades.includes(c.ciudad)
                );
            }

            // Filtrar por provincia
            if (filtros.provincias && filtros.provincias.length > 0) {
                comunidades = comunidades.filter(c => 
                    filtros.provincias.includes(c.provincia)
                );
            }

            // Filtrar por rango de coeficientes
            if (filtros.coeficienteMin !== undefined || filtros.coeficienteMax !== undefined) {
                for (const comunidad of comunidades) {
                    const stats = await this.calcularCoeficienteTotal(comunidad.id);
                    
                    if (filtros.coeficienteMin !== undefined && stats.coeficienteTotal < filtros.coeficienteMin) {
                        comunidades = comunidades.filter(c => c.id !== comunidad.id);
                    }
                    
                    if (filtros.coeficienteMax !== undefined && stats.coeficienteTotal > filtros.coeficienteMax) {
                        comunidades = comunidades.filter(c => c.id !== comunidad.id);
                    }
                }
            }

            // Filtrar por búsqueda de texto
            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                comunidades = comunidades.filter(c => 
                    c.nombre.toLowerCase().includes(busqueda) ||
                    c.direccion.toLowerCase().includes(busqueda) ||
                    c.ciudad.toLowerCase().includes(busqueda) ||
                    c.provincia.toLowerCase().includes(busqueda)
                );
            }

            return comunidades;
        } catch (error) {
            console.error('Error al filtrar comunidades:', error);
            throw error;
        }
    }

    /**
     * Activa o desactiva una comunidad
     */
    async cambiarEstadoComunidad(id, activo) {
        try {
            const comunidad = await indexedDBService.get('comunidades', id);
            
            if (!comunidad) {
                throw new Error(`Comunidad con ID ${id} no encontrada`);
            }

            const comunidadActualizada = {
                ...comunidad,
                activo: activo,
                fechaActualizacion: new Date().toISOString()
            };

            await indexedDBService.update('comunidades', comunidadActualizada);
            console.log(`Comunidad ${id} ${activo ? 'activada' : 'desactivada'}`);
            
            return comunidadActualizada;
        } catch (error) {
            console.error('Error al cambiar estado de comunidad:', error);
            throw error;
        }
    }

    /**
     * Obtiene ciudades únicas de todas las comunidades
     */
    async obtenerCiudades() {
        try {
            const comunidades = await this.obtenerComunidades();
            const ciudadesUnicas = new Set(comunidades.map(c => c.ciudad));
            
            return Array.from(ciudadesUnicas).sort();
        } catch (error) {
            console.error('Error al obtener ciudades:', error);
            throw error;
        }
    }

    /**
     * Obtiene provincias únicas de todas las comunidades
     */
    async obtenerProvincias() {
        try {
            const comunidades = await this.obtenerComunidades();
            const provinciasUnicas = new Set(comunidades.map(c => c.provincia));
            
            return Array.from(provinciasUnicas).sort();
        } catch (error) {
            console.error('Error al obtener provincias:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const comunidadesService = new ComunidadesService();

window.ComunidadesService = ComunidadesService;
window.comunidadesService = comunidadesService;
