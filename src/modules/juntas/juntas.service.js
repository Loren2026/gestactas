import { createJuntaDraft } from '../../models/junta.js';
import { nowIso } from '../../shared/utils.js';

function parseOrdenDia(text) {
  return text
    .split('\n')
    .map((item) => item.replace(/^\s*\d+[.)-]?\s*/, '').trim())
    .filter(Boolean);
}

function formatDateLong(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateString}T12:00:00`));
}

function calculateQuorum(propietarios, asistentes) {
  const presentIds = new Set(asistentes.filter((item) => item.presente).map((item) => item.propietario_id));
  const presentOwners = propietarios.filter((propietario) => presentIds.has(propietario.id));
  const totalOwners = propietarios.length;
  const presentCount = presentOwners.length;
  const presentCoef = presentOwners.reduce((sum, propietario) => sum + Number(propietario.cuota_decimal || propietario.cuota || 0), 0);

  return {
    presentCount,
    totalOwners,
    presentCoef: Number(presentCoef.toFixed(2)),
    presentPercent: totalOwners ? Number(((presentCount / totalOwners) * 100).toFixed(2)) : 0,
  };
}

export function createJuntasService({ repository, comunidadesService, propietariosService }) {
  return {
    async bootstrap() {
      const count = await repository.count();
      if (count > 0) return { seeded: false };

      const comunidadId = 'comunidad_astur';
      const propietarios = await propietariosService.listByComunidadId(comunidadId);
      const asistentes = propietarios.slice(0, 3).map((propietario) => ({ propietario_id: propietario.id, presente: true }));
      const quorum = calculateQuorum(propietarios, asistentes);
      const draft = createJuntaDraft({
        id: 'junta_demo_astur_2026',
        comunidad_id: comunidadId,
        tipo: 'Ordinaria',
        fecha: '2026-04-25',
        hora_primera_convocatoria: '18:00',
        hora_segunda_convocatoria: '18:30',
        lugar: 'Portal del edificio, Lugones',
        orden_dia: [
          'Aprobación de cuentas del ejercicio 2025 y presupuesto 2026',
          'Renovación de cargos de la Junta de Gobierno',
          'Ruegos y preguntas',
        ],
        asistentes,
        quorum_porcentaje: quorum.presentPercent,
        quorum_coeficientes: quorum.presentCoef,
      });

      await repository.save(draft);
      return { seeded: true };
    },

    async listDetailed() {
      const juntas = await repository.list();
      const enriched = await Promise.all(juntas.map(async (junta) => {
        const comunidad = await comunidadesService.getById(junta.comunidad_id);
        const propietarios = await propietariosService.listByComunidadId(junta.comunidad_id);
        const quorum = calculateQuorum(propietarios, junta.asistentes || []);
        return {
          ...junta,
          comunidad,
          propietarios,
          quorum,
          fecha_larga: formatDateLong(junta.fecha),
        };
      }));

      return enriched.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    },

    async getDetailedById(id) {
      const junta = await repository.getById(id);
      if (!junta) return null;

      const comunidad = await comunidadesService.getById(junta.comunidad_id);
      const propietarios = await propietariosService.listByComunidadId(junta.comunidad_id);
      const quorum = calculateQuorum(propietarios, junta.asistentes || []);

      return {
        ...junta,
        comunidad,
        propietarios,
        quorum,
        fecha_larga: formatDateLong(junta.fecha),
      };
    },

    async createFromForm(payload) {
      const timestamp = nowIso();
      const propietarios = await propietariosService.listByComunidadId(payload.comunidad_id);
      const asistentes = propietarios.map((propietario) => ({ propietario_id: propietario.id, presente: false }));
      const junta = createJuntaDraft({
        comunidad_id: payload.comunidad_id,
        tipo: payload.tipo,
        fecha: payload.fecha,
        hora_primera_convocatoria: payload.hora_primera_convocatoria,
        hora_segunda_convocatoria: payload.hora_segunda_convocatoria,
        lugar: payload.lugar,
        orden_dia: parseOrdenDia(payload.orden_dia),
        asistentes,
        created_at: timestamp,
        updated_at: timestamp,
      });

      await repository.save(junta);
      return this.getDetailedById(junta.id);
    },

    async updateAsistencia(juntaId, propietarioId, presente) {
      const junta = await repository.getById(juntaId);
      if (!junta) return null;

      const asistentes = [...(junta.asistentes || [])];
      const current = asistentes.find((item) => item.propietario_id === propietarioId);
      if (current) current.presente = presente;
      else asistentes.push({ propietario_id: propietarioId, presente });

      const propietarios = await propietariosService.listByComunidadId(junta.comunidad_id);
      const quorum = calculateQuorum(propietarios, asistentes);
      const updated = {
        ...junta,
        asistentes,
        quorum_porcentaje: quorum.presentPercent,
        quorum_coeficientes: quorum.presentCoef,
        updated_at: nowIso(),
      };

      await repository.save(updated);
      return this.getDetailedById(juntaId);
    },
  };
}
