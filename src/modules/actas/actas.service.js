import { createEmptyActa } from '../../models/acta.js';
import { createActaVersion } from '../../models/acta-version.js';
import { nowIso } from '../../shared/utils.js';

const TEMPLATES = {
  junta_ordinaria: { id: 'junta_ordinaria', label: 'Junta ordinaria' },
  junta_extraordinaria: { id: 'junta_extraordinaria', label: 'Junta extraordinaria' },
  asamblea_general: { id: 'asamblea_general', label: 'Asamblea general' },
  junta_vecinos: { id: 'junta_vecinos', label: 'Junta de vecinos' },
};

function buildOwnersData(propietarios = []) {
  return propietarios.map((item) => ({
    nombre: item.nombre,
    dni: item.dni || 'No consta',
    coeficiente: `${Number(item.cuota_decimal || item.cuota || 0).toFixed(2).replace('.', ',')}%`,
    propiedad: item.identificador || '',
    cargo: item.cargo || 'Propietario',
  }));
}

function buildContext({ junta, transcripcion }) {
  const convocatoria = junta.hora_segunda_convocatoria ? 'segunda convocatoria' : 'primera convocatoria';
  const president = junta.propietarios.find((item) => item.id === junta.comunidad?.presidente_propietario_id);
  const asistentesIds = new Set((junta.asistentes || []).filter((item) => item.presente).map((item) => item.propietario_id));
  const asistentes = junta.propietarios.filter((item) => asistentesIds.has(item.id));

  return {
    comunidad: {
      nombre: junta.comunidad?.nombre || '',
      cif: junta.comunidad?.cif || '',
      administrador: junta.comunidad?.administrador_entidad || '',
    },
    junta: {
      tipo: junta.tipo,
      fecha: junta.fecha,
      fecha_larga: junta.fecha_larga,
      hora: junta.hora_segunda_convocatoria || junta.hora_primera_convocatoria,
      lugar: junta.lugar,
      convocatoria,
      quorum: `${junta.quorum.presentCount}/${junta.quorum.totalOwners} propietarios, ${Number(junta.quorum.presentCoef || 0).toFixed(2)}% coeficiente`,
      orden_dia: junta.orden_dia,
    },
    cargos: {
      presidente: president?.nombre || 'Pendiente',
      secretario: junta.comunidad?.administrador_entidad || 'Pendiente',
    },
    asistentes: buildOwnersData(asistentes),
    transcripcion: {
      id: transcripcion.id,
      metodo: transcripcion.metodo,
      texto: transcripcion.texto_activo || transcripcion.texto || '',
    },
  };
}

function toText(markdown = '') {
  return String(markdown).replace(/[#*_`>|-]/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function summarizeShort(structure) {
  const acuerdos = structure?.acuerdos?.length || 0;
  const pendientes = structure?.pendientes?.length || 0;
  return `${acuerdos} acuerdos, ${pendientes} pendientes`;
}

export function createActasService({ repository, juntasService, transcripcionesService, claudeService, exportService }) {
  return {
    getTemplates() {
      return Object.values(TEMPLATES);
    },

    estimateGenerationCost({ transcript, model }) {
      return claudeService.estimateCost({ transcript, model });
    },

    async listByJuntaId(juntaId) {
      const items = await repository.listByJuntaId(juntaId);
      return items.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    },

    async getById(id) {
      return repository.getById(id);
    },

    async buildGenerationContext({ juntaId, transcripcionId }) {
      const junta = await juntasService.getDetailedById(juntaId);
      const transcripcion = await transcripcionesService.getById(transcripcionId);
      if (!junta || !transcripcion) {
        const error = new Error('Faltan junta o transcripción para generar el acta.');
        error.code = 'missing_generation_context';
        throw error;
      }
      return {
        junta,
        transcripcion,
        context: buildContext({ junta, transcripcion }),
      };
    },

    async generateFromTranscription({ juntaId, transcripcionId, templateName = 'junta_ordinaria', plantillaTipo = 'oficial', templateBlob = null, templateNameFile = '' }) {
      const { junta, transcripcion, context } = await this.buildGenerationContext({ juntaId, transcripcionId });
      const result = await claudeService.generateActa({
        templateName,
        context,
        transcript: transcripcion.texto_activo || transcripcion.texto || '',
      });

      const timestamp = nowIso();
      const existing = (await repository.listByJuntaId(juntaId)).find((item) => item.transcripcion_id === transcripcionId);
      const acta = existing || createEmptyActa({
        junta_id: juntaId,
        transcripcion_id: transcripcionId,
        titulo: result.structure.cabecera?.titulo || `Acta ${junta.comunidad?.nombre || ''}`,
        plantilla_tipo: plantillaTipo,
        plantilla_nombre: TEMPLATES[templateName]?.label || TEMPLATES.junta_ordinaria.label,
        plantilla_personalizada_nombre: templateNameFile || '',
        plantilla_personalizada_blob: templateBlob,
        created_at: timestamp,
      });

      const version = createActaVersion({
        acta_id: acta.id,
        junta_id: juntaId,
        transcripcion_id: transcripcionId,
        numero_version: (acta.versiones?.length || 0) + 1,
        origen: acta.versiones?.length ? 'regenerada' : 'claude_api',
        prompt_utilizado: result.prompt,
        modelo_utilizado: result.model,
        contenido_markdown: result.markdown,
        contenido_texto_plano: toText(result.markdown),
        estructura_json: result.structure,
        cabecera_junta_snapshot: context.junta,
        asistentes_snapshot: context.asistentes,
        orden_dia_snapshot: context.junta.orden_dia,
        tareas_pendientes: result.structure.pendientes || [],
        coste_estimado: result.cost.estimatedCost,
        metadata: {
          summarizedTranscript: result.summarizedTranscript,
          validation: result.validation,
        },
      });

      const updated = {
        ...acta,
        titulo: result.structure.cabecera?.titulo || acta.titulo,
        resumen_corto: summarizeShort(result.structure),
        version_activa_id: version.id,
        estado: 'borrador',
        plantilla_tipo: plantillaTipo,
        plantilla_nombre: TEMPLATES[templateName]?.label || acta.plantilla_nombre,
        plantilla_personalizada_nombre: templateNameFile || acta.plantilla_personalizada_nombre,
        plantilla_personalizada_blob: templateBlob || acta.plantilla_personalizada_blob,
        versiones: [...(acta.versiones || []), version],
        updated_at: nowIso(),
      };

      await repository.save(updated);
      return updated;
    },

    getActiveVersion(acta) {
      if (!acta) return null;
      return (acta.versiones || []).find((item) => item.id === acta.version_activa_id) || acta.versiones?.[acta.versiones.length - 1] || null;
    },

    async saveVersionContent({ actaId, versionId, markdown, final = false, autosave = false }) {
      const acta = await repository.getById(actaId);
      if (!acta) return null;
      const versiones = (acta.versiones || []).map((item) => {
        if (item.id !== versionId) return final ? { ...item, es_version_final: false } : item;
        return {
          ...item,
          contenido_markdown: markdown,
          contenido_texto_plano: toText(markdown),
          es_version_final: final ? true : item.es_version_final,
          autosaved_at: autosave ? nowIso() : item.autosaved_at,
          updated_at: nowIso(),
          origen: autosave ? 'manual' : item.origen,
        };
      });
      const updated = {
        ...acta,
        estado: final ? 'final' : 'borrador',
        versiones,
        updated_at: nowIso(),
      };
      await repository.save(updated);
      return updated;
    },

    async setActiveVersion(actaId, versionId) {
      const acta = await repository.getById(actaId);
      if (!acta) return null;
      const updated = { ...acta, version_activa_id: versionId, updated_at: nowIso() };
      await repository.save(updated);
      return updated;
    },

    async exportTxt(acta, version, filename) {
      exportService.exportTxt({ filename, markdown: version.contenido_markdown });
    },
    async exportPdf(acta, version, filename) {
      exportService.exportPdf({ filename, markdown: version.contenido_markdown });
    },
    async exportDocx(acta, version, filename) {
      const actaData = {
        titulo: acta.titulo,
        markdown: version.contenido_markdown,
        estructura: version.estructura_json,
      };
      exportService.exportDocx({ filename, actaData });
    },
    async exportCustomTemplateDocx(acta, version, filename) {
      if (!acta.plantilla_personalizada_blob) {
        const error = new Error('No hay plantilla Word personalizada cargada para esta acta.');
        error.code = 'missing_custom_template';
        throw error;
      }
      const owners = version.asistentes_snapshot || [];
      const replacements = {
        COMUNIDAD_NOMBRE: version.estructura_json?.cabecera?.comunidad || '',
        FECHA_JUNTA: version.estructura_json?.cabecera?.fecha || '',
        HORA_JUNTA: version.estructura_json?.cabecera?.hora || '',
        LUGAR_JUNTA: version.estructura_json?.cabecera?.lugar || '',
        CONVOCATORIA: version.estructura_json?.cabecera?.convocatoria || '',
        ACTA_CONTENIDO: version.contenido_texto_plano,
        PRESIDENTE_FIRMA: version.estructura_json?.firmas?.presidente || '',
        SECRETARIO_FIRMA: version.estructura_json?.firmas?.secretario || '',
      };
      await exportService.exportCustomTemplateDocx({ filename, templateBlob: acta.plantilla_personalizada_blob, replacements, owners });
    },
    print(version) {
      exportService.print(version.contenido_markdown);
    },
  };
}
