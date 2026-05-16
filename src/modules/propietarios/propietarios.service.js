import { propietariosRepository } from './propietarios.repository.js';

const ValidacionComunidadPropietarioGlobal = window.ValidacionComunidadPropietario;

export const propietariosService = {
  async list() {
    return await propietariosRepository.list();
  },

  async listByComunidadId(comunidadId) {
    return await propietariosRepository.listByComunidadId(comunidadId);
  },

  async getById(id) {
    const propietario = await propietariosRepository.getById(id);

    if (!propietario) {
      throw new Error(`Propietario con ID ${id} no encontrado`);
    }

    return propietario;
  },

  async create(datos) {
    const validacion = ValidacionComunidadPropietarioGlobal.validarPropietario(datos);

    if (!validacion.valida) {
      throw new Error(`Propietario inválido: ${validacion.errores.join(', ')}`);
    }

    if (!datos.comunidadId) {
      throw new Error(`Comunidad con ID ${datos.comunidadId} no encontrada`);
    }

    const nombreCompleto = [datos.nombre, datos.apellidos].filter(Boolean).join(' ').trim();

    const referenciaInmueble = [datos.piso, datos.letra].filter(Boolean).join(' ').trim();

    const propietario = {
      comunidad_id: datos.comunidadId,
      nombre_completo: nombreCompleto,
      cargo: datos.cargo || 'propietario',
      dni_nif: datos.dni || '',
      email: datos.email || '',
      telefono: datos.telefono || '',
      direccion_notificaciones: datos.direccion || '',
      coeficiente_participacion: datos.coeficiente,
      referencia_inmueble: referenciaInmueble,
      activo: datos.activo ?? true,
      notas: datos.notas || '',
    };

    return await propietariosRepository.save(propietario);
  },

  async update(id, datos) {
    const propietarioActual = await propietariosRepository.getById(id);

    if (!propietarioActual) {
      throw new Error(`Propietario con ID ${id} no encontrado`);
    }

    const nombreActual = propietarioActual.nombre_completo || '';
    const datosValidados = {
      comunidadId: datos.comunidadId ?? propietarioActual.comunidad_id,
      nombre: datos.nombre ?? nombreActual,
      apellidos: datos.apellidos ?? '',
      dni: datos.dni ?? propietarioActual.dni_nif,
      email: datos.email ?? propietarioActual.email,
      telefono: datos.telefono ?? propietarioActual.telefono,
      direccion: datos.direccion ?? propietarioActual.direccion_notificaciones,
      coeficiente: datos.coeficiente ?? propietarioActual.coeficiente_participacion,
      piso: datos.piso ?? propietarioActual.referencia_inmueble ?? '',
      letra: datos.letra ?? '',
      cargo: datos.cargo ?? propietarioActual.cargo,
      notas: datos.notas ?? propietarioActual.notas,
      activo: datos.activo ?? propietarioActual.activo,
    };

    const validacion = ValidacionComunidadPropietarioGlobal.validarPropietario(datosValidados);

    if (!validacion.valida) {
      throw new Error(`Propietario inválido: ${validacion.errores.join(', ')}`);
    }

    const nombreCompleto = [datos.nombre, datos.apellidos]
      .filter(Boolean)
      .join(' ')
      .trim() || propietarioActual.nombre_completo;

    const referenciaInmueble = [datos.piso, datos.letra]
      .filter(Boolean)
      .join(' ')
      .trim() || propietarioActual.referencia_inmueble || '';

    const propietario = {
      id,
      comunidad_id: datosValidados.comunidadId,
      nombre_completo: nombreCompleto,
      cargo: datosValidados.cargo || 'propietario',
      dni_nif: datosValidados.dni || '',
      email: datosValidados.email || '',
      telefono: datosValidados.telefono || '',
      direccion_notificaciones: datosValidados.direccion || '',
      coeficiente_participacion: datosValidados.coeficiente,
      referencia_inmueble: referenciaInmueble,
      activo: datosValidados.activo,
      notas: datosValidados.notas || '',
    };

    return await propietariosRepository.update(propietario);
  },

  async delete(id) {
    const propietario = await propietariosRepository.getById(id);

    if (!propietario) {
      throw new Error(`Propietario con ID ${id} no encontrado`);
    }

    return await propietariosRepository.delete(id);
  },
};
