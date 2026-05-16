import { comunidadesRepository } from './comunidades.repository.js';

const ValidacionComunidadPropietarioGlobal = window.ValidacionComunidadPropietario;
const PROJECT_ID = '5eca96d5-41fc-43e2-8e9a-6c09ff7fc25b';

export const comunidadesService = {
  async list() {
    return await comunidadesRepository.list();
  },

  async getById(id) {
    const comunidad = await comunidadesRepository.getById(id);

    if (!comunidad) {
      throw new Error(`Comunidad con ID ${id} no encontrada`);
    }

    return comunidad;
  },

  async create(datos) {
    const validacion = ValidacionComunidadPropietarioGlobal.validarComunidad(datos);

    if (!validacion.valida) {
      throw new Error(`Comunidad inválida: ${validacion.errores.join(', ')}`);
    }

    const comunidad = {
      nombre: datos.nombre,
      direccion: datos.direccion,
      codigo_postal: datos.codigoPostal,
      ciudad: datos.ciudad,
      provincia: datos.provincia,
      cif: datos.cif || '',
      email: datos.email || '',
      telefono: datos.telefono || '',
      numero_catastral: datos.numeroCatastral || '',
      presidente: datos.presidente || '',
      administrador: datos.administrador || '',
      activo: datos.activo ?? true,
      project_id: datos.project_id || PROJECT_ID,
    };

    return await comunidadesRepository.save(comunidad);
  },

  async update(id, datos) {
    const comunidadActual = await comunidadesRepository.getById(id);

    if (!comunidadActual) {
      throw new Error(`Comunidad con ID ${id} no encontrada`);
    }

    const datosValidados = {
      nombre: datos.nombre ?? comunidadActual.nombre,
      direccion: datos.direccion ?? comunidadActual.direccion,
      codigoPostal: datos.codigoPostal ?? comunidadActual.codigo_postal,
      ciudad: datos.ciudad ?? comunidadActual.ciudad,
      provincia: datos.provincia ?? comunidadActual.provincia,
      cif: datos.cif ?? comunidadActual.cif,
      email: datos.email ?? comunidadActual.email,
      telefono: datos.telefono ?? comunidadActual.telefono,
      numeroCatastral: datos.numeroCatastral ?? comunidadActual.numero_catastral,
      presidente: datos.presidente ?? comunidadActual.presidente,
      administrador: datos.administrador ?? comunidadActual.administrador,
      activo: datos.activo ?? comunidadActual.activo,
    };

    const validacion = ValidacionComunidadPropietarioGlobal.validarComunidad(datosValidados);

    if (!validacion.valida) {
      throw new Error(`Comunidad inválida: ${validacion.errores.join(', ')}`);
    }

    const comunidad = {
      id,
      nombre: datosValidados.nombre,
      direccion: datosValidados.direccion,
      codigo_postal: datosValidados.codigoPostal,
      ciudad: datosValidados.ciudad,
      provincia: datosValidados.provincia,
      cif: datosValidados.cif || '',
      email: datosValidados.email || '',
      telefono: datosValidados.telefono || '',
      numero_catastral: datosValidados.numeroCatastral || '',
      presidente: datosValidados.presidente || '',
      administrador: datosValidados.administrador || '',
      activo: datosValidados.activo,
    };

    return await comunidadesRepository.update(comunidad);
  },

  async delete(id) {
    const comunidad = await comunidadesRepository.getById(id);

    if (!comunidad) {
      throw new Error(`Comunidad con ID ${id} no encontrada`);
    }

    return await comunidadesRepository.delete(id);
  },
};
