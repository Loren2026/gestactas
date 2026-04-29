import { setState, getState } from '../../core/store.js';
import { buildConvocatoriaDocx, createDocxFile, downloadBlob } from '../../shared/docx.js';

function formatDateShort(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(`${dateString}T12:00:00`));
}

function formatCoef(value) {
  return Number(value || 0).toFixed(2).replace('.', ',');
}

function getCurrentHora(junta) {
  return junta.hora_segunda_convocatoria || junta.hora_primera_convocatoria || '';
}

function convocatoriaFilename(junta, comunidad) {
  const safeCommunity = (comunidad?.nombre || 'comunidad').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return `convocatoria-${safeCommunity || 'gestactas'}-${junta.fecha || 'sin-fecha'}.docx`;
}

export function bindJuntasUi({ router, juntasService, comunidadesService }) {
  const listContainer = document.getElementById('juntasList');
  const comunidadSelect = document.getElementById('juntaComunidadSelect');
  const tipoSelect = document.getElementById('juntaTipoSelect');
  const fechaInput = document.getElementById('juntaFechaInput');
  const primeraConvInput = document.getElementById('hora1conv');
  const segundaConvInput = document.getElementById('hora2conv');
  const lugarInput = document.getElementById('juntaLugarInput');
  const ordenDiaInput = document.getElementById('juntaOrdenDiaInput');
  const createButton = document.getElementById('btnCrearJunta');
  const previewButton = document.getElementById('btnPreviewConvocatoria');
  const downloadButton = document.getElementById('btnDescargarConvocatoria');
  const shareButton = document.getElementById('btnEnviarConvocatoria');

  async function renderComunidadOptions() {
    const comunidades = await comunidadesService.list();
    comunidadSelect.innerHTML = '<option value="">Seleccionar comunidad...</option>' + comunidades.map((comunidad, index) => `
      <option value="${comunidad.id}" ${index === 0 ? 'selected' : ''}>${comunidad.nombre}</option>`).join('');
  }

  function renderJuntasList(juntas) {
    listContainer.innerHTML = juntas.map((junta) => `
      <div class="card" data-junta-id="${junta.id}" style="cursor:pointer">
        <div class="card-header"><span class="card-title">${junta.comunidad?.nombre || 'Comunidad'}</span><span class="card-badge badge-warning">${formatDateShort(junta.fecha)}</span></div>
        <div class="card-meta"><span class="card-meta-item meta-time">🕐 ${getCurrentHora(junta)}h</span><span class="card-meta-item meta-location">📍 ${junta.lugar}</span><span class="card-meta-item meta-type">📋 ${junta.orden_dia.length} puntos</span></div>
      </div>`).join('');

    listContainer.querySelectorAll('[data-junta-id]').forEach((card) => {
      card.addEventListener('click', async () => {
        const juntaId = card.dataset.juntaId;
        await openJuntaDetail(juntaId);
        router.goTo('junta-detail');
      });
    });
  }

  function renderJuntaDetail(junta) {
    document.getElementById('juntaDetailTitle').textContent = `Junta — ${junta.comunidad?.nombre || ''}`;
    document.getElementById('juntaDetailTipo').textContent = `Junta ${junta.tipo}`;
    document.getElementById('juntaDetailEstado').textContent = junta.estado;
    document.getElementById('juntaDetailFecha').textContent = `📅 ${junta.fecha_larga}`;
    document.getElementById('juntaDetailHora').textContent = `🕐 ${getCurrentHora(junta)}h — 2.ª convocatoria`;
    document.getElementById('juntaDetailLugar').textContent = `📍 ${junta.lugar}`;

    const presidenta = junta.propietarios.find((item) => item.id === junta.comunidad?.presidente_propietario_id)?.nombre || 'Pendiente de asignar';
    const secretario = junta.comunidad?.administrador_entidad || 'Pendiente de asignar';
    document.getElementById('juntaDetailPreside').textContent = `👤 Preside: ${presidenta}`;
    document.getElementById('juntaDetailSecretario').textContent = `📝 Secretario: ${secretario}`;

    document.getElementById('juntaOrdenDiaList').innerHTML = junta.orden_dia.map((point, index) => `
      <div class="orden-item"><span class="orden-num">${index + 1}</span><span class="orden-text">${point}</span></div>`).join('');

    const presentIds = new Set((junta.asistentes || []).filter((item) => item.presente).map((item) => item.propietario_id));
    const asistentesList = document.getElementById('juntaAsistentesList');
    asistentesList.innerHTML = junta.propietarios.map((propietario) => {
      const checked = presentIds.has(propietario.id);
      return `
        <div class="checkbox-row" data-propietario-id="${propietario.id}">
          <div class="checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
          <div class="checkbox-info"><div class="checkbox-name">${propietario.nombre}</div><div class="checkbox-detail">${propietario.identificador} · ${formatCoef(propietario.cuota_decimal || propietario.cuota)}% · ${propietario.cargo}</div></div>
        </div>`;
    }).join('');

    document.getElementById('juntaAsistentesTitle').textContent = `Asistentes (${junta.quorum.presentCount}/${junta.quorum.totalOwners})`;
    document.getElementById('juntaQuorumResumen').textContent = `Quórum: ${formatCoef(junta.quorum.presentCoef)}% de cuota presente · ${formatCoef(junta.quorum.presentPercent)}% de propietarios`;

    asistentesList.querySelectorAll('[data-propietario-id]').forEach((row) => {
      row.addEventListener('click', async () => {
        const propietarioId = row.dataset.propietarioId;
        const active = row.querySelector('.checkbox')?.classList.contains('checked');
        const updated = await juntasService.updateAsistencia(junta.id, propietarioId, !active);
        setState({ selectedJuntaId: updated.id });
        renderJuntaDetail(updated);
      });
    });
  }

  async function openJuntaDetail(juntaId) {
    const junta = await juntasService.getDetailedById(juntaId);
    if (!junta) return;
    setState({ selectedJuntaId: junta.id });
    renderJuntaDetail(junta);
  }

  async function refresh() {
    const juntas = await juntasService.listDetailed();
    renderJuntasList(juntas);

    const { selectedJuntaId } = getState();
    const activeId = selectedJuntaId || juntas[0]?.id;
    if (activeId) {
      await openJuntaDetail(activeId);
    }
  }

  function buildConvocatoriaPayload() {
    const comunidadNombre = comunidadSelect.options[comunidadSelect.selectedIndex]?.text || 'Comunidad';
    const ordenDia = ordenDiaInput.value.split('\n').map((line) => line.replace(/^\s*\d+[.)-]?\s*/, '').trim()).filter(Boolean);
    return {
      comunidadNombre,
      fecha: fechaInput.value,
      hora: segundaConvInput.value || primeraConvInput.value,
      lugar: lugarInput.value,
      ordenDia,
    };
  }

  async function buildCurrentConvocatoriaDocument() {
    const { selectedJuntaId } = getState();
    const junta = await juntasService.getDetailedById(selectedJuntaId);
    if (!junta) return null;

    const filename = convocatoriaFilename(junta, junta.comunidad);
    const blob = buildConvocatoriaDocx({
      comunidadNombre: junta.comunidad?.nombre || 'Comunidad',
      fecha: junta.fecha,
      hora: getCurrentHora(junta),
      lugar: junta.lugar,
      ordenDia: junta.orden_dia,
    });

    return {
      junta,
      filename,
      blob,
      file: createDocxFile(blob, filename),
    };
  }

  async function downloadCurrentConvocatoriaFromDetail() {
    const documentPayload = await buildCurrentConvocatoriaDocument();
    if (!documentPayload) return;
    downloadBlob(documentPayload.blob, documentPayload.filename);
  }

  async function shareCurrentConvocatoriaFromDetail() {
    const documentPayload = await buildCurrentConvocatoriaDocument();
    if (!documentPayload) return;

    const canShareFile = typeof navigator !== 'undefined'
      && typeof navigator.share === 'function'
      && typeof navigator.canShare === 'function'
      && navigator.canShare({ files: [documentPayload.file] });

    if (canShareFile) {
      await navigator.share({
        title: `Convocatoria ${documentPayload.junta.comunidad?.nombre || 'GestActas'}`,
        text: 'Convocatoria de junta en formato Word editable.',
        files: [documentPayload.file],
      });
      return;
    }

    downloadBlob(documentPayload.blob, documentPayload.filename);
  }

  previewButton?.addEventListener('click', () => {
    const payload = buildConvocatoriaPayload();
    const blob = buildConvocatoriaDocx(payload);
    downloadBlob(blob, `convocatoria-previa-${payload.fecha || 'sin-fecha'}.docx`);
  });

  createButton?.addEventListener('click', async () => {
    const junta = await juntasService.createFromForm({
      comunidad_id: comunidadSelect.value,
      tipo: tipoSelect.value,
      fecha: fechaInput.value,
      hora_primera_convocatoria: primeraConvInput.value,
      hora_segunda_convocatoria: segundaConvInput.value,
      lugar: lugarInput.value,
      orden_dia: ordenDiaInput.value,
    });

    setState({ selectedJuntaId: junta.id });
    await refresh();
    router.goTo('junta-detail');
  });

  downloadButton?.addEventListener('click', downloadCurrentConvocatoriaFromDetail);
  shareButton?.addEventListener('click', async () => {
    try {
      await shareCurrentConvocatoriaFromDetail();
    } catch (error) {
      console.error('No se pudo compartir la convocatoria:', error);
      await downloadCurrentConvocatoriaFromDetail();
    }
  });

  return renderComunidadOptions().then(refresh);
}
