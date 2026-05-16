import { juntasRepository } from './juntas.repository.js';

const ESTADOS_VALIDOS = ['borrador', 'en_curso', 'transcribiendo', 'acta_generada', 'cerrada'];
const TIPOS_VALIDOS = ['ordinaria', 'extraordinaria'];

function normalizeOrdenDia(ordenDia) {
  if (Array.isArray(ordenDia)) {
    return ordenDia.filter(Boolean);
  }

  if (typeof ordenDia === 'string') {
    return ordenDia
      .split('\n')
      .map((item) => item.replace(/^\s*\d+[.)-]?\s*/, '').trim())
      .filter(Boolean);
  }

  return [];
}

export const juntasService = {
  async list() {
    return await juntasRepository.list();
  },

  async listByComunidadId(comunidadId) {
    return await juntasRepository.listByComunidadId(comunidadId);
  },

  async getById(id) {
    const junta = await juntasRepository.getById(id);

    if (!junta) {
      throw new Error(`Junta con ID ${id} no encontrada`);
    }

    return junta;
  },

  async create(datos) {
    if (!datos.comunidadId) {
      throw new Error(`Comunidad con ID ${datos.comunidadId} no encontrada`);
    }

    if (!datos.fechaCelebracion) {
      throw new Error('fechaCelebracion es obligatoria');
    }

    if (!TIPOS_VALIDOS.includes(datos.tipo)) {
      throw new Error(`Tipo inválido: ${datos.tipo}. Tipos válidos: ${TIPOS_VALIDOS.join(', ')}`);
    }

    const estado = datos.estado || 'borrador';

    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`Estado inválido: ${estado}. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    const junta = {
      comunidad_id: datos.comunidadId,
      titulo: datos.titulo || '',
      tipo: datos.tipo,
      fecha_convocatoria: datos.fechaConvocatoria || null,
      fecha_celebracion: datos.fechaCelebracion,
      lugar: datos.lugar || '',
      estado,
      orden_dia: normalizeOrdenDia(datos.ordenDia),
      observaciones: datos.observaciones || '',
      quorum_resumen: datos.quorumResumen || '',
    };

    return await juntasRepository.save(junta);
  },

  async update(id, datos) {
    const juntaActual = await juntasRepository.getById(id);

    if (!juntaActual) {
      throw new Error(`Junta con ID ${id} no encontrada`);
    }

    const tipo = datos.tipo ?? juntaActual.tipo;
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`Tipo inválido: ${tipo}. Tipos válidos: ${TIPOS_VALIDOS.join(', ')}`);
    }

    const estado = datos.estado ?? juntaActual.estado;
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`Estado inválido: ${estado}. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    const fechaCelebracion = datos.fechaCelebracion ?? juntaActual.fecha_celebracion;
    if (!fechaCelebracion) {
      throw new Error('fechaCelebracion es obligatoria');
    }

    const junta = {
      id,
      comunidad_id: datos.comunidadId ?? juntaActual.comunidad_id,
      titulo: datos.titulo ?? juntaActual.titulo,
      tipo,
      fecha_convocatoria: datos.fechaConvocatoria ?? juntaActual.fecha_convocatoria,
      fecha_celebracion: fechaCelebracion,
      lugar: datos.lugar ?? juntaActual.lugar,
      estado,
      orden_dia: datos.ordenDia !== undefined
        ? normalizeOrdenDia(datos.ordenDia)
        : (juntaActual.orden_dia || []),
      observaciones: datos.observaciones ?? juntaActual.observaciones,
      quorum_resumen: datos.quorumResumen ?? juntaActual.quorum_resumen,
      closed_at: estado === 'cerrada'
        ? (juntaActual.closed_at || new Date().toISOString())
        : null,
    };

    return await juntasRepository.update(junta);
  },

  async delete(id) {
    const junta = await juntasRepository.getById(id);

    if (!junta) {
      throw new Error(`Junta con ID ${id} no encontrada`);
    }

    return await juntasRepository.delete(id);
  },

  async cambiarEstado(id, estado) {
    const junta = await juntasRepository.getById(id);

    if (!junta) {
      throw new Error(`Junta con ID ${id} no encontrada`);
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`Estado inválido: ${estado}. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    return await juntasRepository.update({
      id,
      estado,
      closed_at: estado === 'cerrada'
        ? (junta.closed_at || new Date().toISOString())
        : null,
    });
  },
};
