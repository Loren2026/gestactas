import { getState, setState } from '../../core/store.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToHtml(markdown = '') {
  let html = escapeHtml(markdown);
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  return html.replace(/<p><\/p>/g, '');
}

function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export function bindActasUi({ router, actasService, juntasService, transcripcionesService }) {
  const costBox = document.getElementById('actaCosteEstimado');
  const contextBox = document.getElementById('actaContextInfo');
  const statusBox = document.getElementById('actaStatus');
  const transcripcionSelect = document.getElementById('actaTranscripcionSelect');
  const templateSelect = document.getElementById('actaTemplateSelect');
  const modelModeOfficial = document.getElementById('actaTemplateModeOfficial');
  const modelModeCustom = document.getElementById('actaTemplateModeCustom');
  const customUpload = document.getElementById('actaCustomTemplateInput');
  const customUploadInfo = document.getElementById('actaCustomTemplateInfo');
  const generateButton = document.getElementById('btnGenerarClaude');
  const editor = document.getElementById('actaMarkdownEditor');
  const preview = document.getElementById('actaMarkdownPreview');
  const saveButton = document.getElementById('btnGuardarActa');
  const finalButton = document.getElementById('btnMarcarFinal');
  const exportPdfButton = document.getElementById('btnExportarPdf');
  const exportDocxButton = document.getElementById('btnExportarDocx');
  const exportTxtButton = document.getElementById('btnExportarTxt');
  const printButton = document.getElementById('btnImprimirActa');
  const exportCustomButton = document.getElementById('btnExportarPlantillaPersonalizada');
  const versionsList = document.getElementById('actaVersionsList');
  const compareSelectA = document.getElementById('actaCompareA');
  const compareSelectB = document.getElementById('actaCompareB');
  const compareBox = document.getElementById('actaCompareBox');
  const tasksTable = document.getElementById('actaTasksTable');
  const autosaveIndicator = document.getElementById('actaAutosaveStatus');

  let currentCustomTemplateBlob = null;
  let autosaveInterval = null;

  function setStatus(message, tone = 'muted') {
    statusBox.dataset.tone = tone;
    statusBox.textContent = message;
  }

  function setAutosave(message, tone = 'muted') {
    autosaveIndicator.dataset.tone = tone;
    autosaveIndicator.textContent = message;
  }

  function getTemplateMode() {
    return modelModeCustom.checked ? 'personalizado' : 'oficial';
  }

  function renderPreview() {
    preview.innerHTML = markdownToHtml(editor.value || '');
  }

  function renderTasks(version) {
    const tasks = version?.tareas_pendientes || [];
    if (!tasks.length) {
      tasksTable.innerHTML = '<tr><td colspan="3">Sin tareas pendientes detectadas.</td></tr>';
      return;
    }
    tasksTable.innerHTML = tasks.map((task) => `<tr><td>${escapeHtml(task.tarea || '')}</td><td>${escapeHtml(task.responsable || '')}</td><td>${escapeHtml(task.fecha_limite || '')}</td></tr>`).join('');
  }

  async function getCurrentActa() {
    const { selectedActaId } = getState();
    if (!selectedActaId) return null;
    return actasService.getById(selectedActaId);
  }

  async function saveEditor(final = false, autosave = false) {
    const { selectedActaId, selectedActaVersionId } = getState();
    if (!selectedActaId || !selectedActaVersionId) return;
    setAutosave(autosave ? 'Guardando automáticamente...' : 'Guardando...', 'warning');
    const acta = await actasService.saveVersionContent({
      actaId: selectedActaId,
      versionId: selectedActaVersionId,
      markdown: editor.value,
      final,
      autosave,
    });
    await renderActa(acta);
    setAutosave(final ? 'Versión final guardada.' : 'Guardado', 'success');
    setStatus(final ? 'Acta marcada como final.' : 'Cambios guardados en borrador.', final ? 'success' : 'muted');
  }

  const debouncedAutosave = debounce(() => saveEditor(false, true), 1200);

  function buildFilename(suffix) {
    const state = getState();
    return `acta-${state.selectedJuntaId || 'gestactas'}-${suffix}`;
  }

  async function renderGenerationContext() {
    const { selectedJuntaId } = getState();
    if (!selectedJuntaId) {
      contextBox.textContent = 'Selecciona una junta para generar su acta.';
      transcripcionSelect.innerHTML = '<option value="">No hay junta activa</option>';
      return;
    }
    const junta = await juntasService.getDetailedById(selectedJuntaId);
    const transcripciones = await transcripcionesService.listByJuntaId(selectedJuntaId);
    contextBox.textContent = `${junta.comunidad?.nombre || 'Comunidad'} · ${junta.fecha_larga || junta.fecha} · ${junta.lugar}`;
    transcripcionSelect.innerHTML = '<option value="">Selecciona transcripción...</option>' + transcripciones.map((item) => `<option value="${item.id}">${item.metodo} · ${item.estado} · ${item.texto_activo.slice(0, 42)}...</option>`).join('');
    const selected = getState().selectedTranscripcionId;
    if (selected && transcripciones.some((item) => item.id === selected)) {
      transcripcionSelect.value = selected;
    } else if (transcripciones[0]) {
      transcripcionSelect.value = transcripciones[0].id;
      setState({ selectedTranscripcionId: transcripciones[0].id });
    }

    const activeTranscription = transcripciones.find((item) => item.id === transcripcionSelect.value);
    if (activeTranscription) {
      const estimate = actasService.estimateGenerationCost({ transcript: activeTranscription.texto_activo || activeTranscription.texto, model: 'claude-3-5-sonnet-latest' });
      costBox.textContent = `Coste estimado antes de generar: ${estimate.estimatedCost.toFixed(4)} € · entrada aprox. ${estimate.inputTokens} tokens`;
    }
  }

  async function renderActa(acta) {
    const active = actasService.getActiveVersion(acta);
    if (!acta || !active) {
      editor.value = '';
      preview.innerHTML = '<p>Sin acta cargada.</p>';
      versionsList.innerHTML = '<div class="card" style="cursor:default">Todavía no hay versiones de acta.</div>';
      compareSelectA.innerHTML = '<option value="">Sin versiones</option>';
      compareSelectB.innerHTML = '<option value="">Sin versiones</option>';
      renderTasks(null);
      return;
    }

    setState({ selectedActaId: acta.id, selectedActaVersionId: active.id });
    editor.value = active.contenido_markdown || '';
    renderPreview();
    renderTasks(active);

    const versions = acta.versiones || [];
    versionsList.innerHTML = versions.map((version) => `
      <div class="card" data-version-id="${version.id}" style="cursor:pointer">
        <div class="card-header"><span class="card-title">Versión ${version.numero_version}</span><span class="card-badge ${version.es_version_final ? 'badge-success' : 'badge-warning'}">${version.es_version_final ? 'Final' : 'Borrador'}</span></div>
        <div class="card-meta"><span class="card-meta-item meta-type">${version.origen}</span><span class="card-meta-item meta-date">💶 ${Number(version.coste_estimado || 0).toFixed(4)} €</span></div>
      </div>`).join('');

    versionsList.querySelectorAll('[data-version-id]').forEach((card) => card.addEventListener('click', async () => {
      const updated = await actasService.setActiveVersion(acta.id, card.dataset.versionId);
      await renderActa(updated);
    }));

    const options = versions.map((version) => `<option value="${version.id}">Versión ${version.numero_version}</option>`).join('');
    compareSelectA.innerHTML = `<option value="">Selecciona versión A</option>${options}`;
    compareSelectB.innerHTML = `<option value="">Selecciona versión B</option>${options}`;
    compareSelectA.value = active.id;
    compareSelectB.value = versions[0]?.id || '';
    renderCompare(acta);
  }

  function renderCompare(acta) {
    const versions = acta?.versiones || [];
    const a = versions.find((item) => item.id === compareSelectA.value);
    const b = versions.find((item) => item.id === compareSelectB.value);
    if (!a || !b) {
      compareBox.innerHTML = '<div class="card" style="cursor:default">Selecciona dos versiones para comparar.</div>';
      return;
    }
    compareBox.innerHTML = `<div class="compare-grid"><div><h4>Versión A</h4><pre>${escapeHtml(a.contenido_texto_plano || '')}</pre></div><div><h4>Versión B</h4><pre>${escapeHtml(b.contenido_texto_plano || '')}</pre></div></div>`;
  }

  async function generateActa() {
    const state = getState();
    if (!state.selectedJuntaId || !transcripcionSelect.value) {
      setStatus('Selecciona junta y transcripción antes de generar.', 'danger');
      return;
    }
    setStatus('Generando acta con Claude...', 'warning');
    try {
      const acta = await actasService.generateFromTranscription({
        juntaId: state.selectedJuntaId,
        transcripcionId: transcripcionSelect.value,
        templateName: templateSelect.value,
        plantillaTipo: getTemplateMode(),
        templateBlob: getTemplateMode() === 'personalizado' ? currentCustomTemplateBlob : null,
        templateNameFile: customUpload.files?.[0]?.name || '',
      });
      await renderActa(acta);
      setStatus('Acta generada correctamente.', 'success');
      setAutosave('Guardado', 'success');
    } catch (error) {
      setStatus(error.message || 'No se pudo generar el acta.', 'danger');
    }
  }

  function applyTemplateModeUi() {
    const custom = getTemplateMode() === 'personalizado';
    customUpload.disabled = !custom;
    exportCustomButton.disabled = !custom;
    customUploadInfo.textContent = custom
      ? 'Sube tu modelo Word personalizado. Se auto-rellenarán propietarios y datos de la junta.'
      : 'Se usará el modelo oficial integrado en la app.';
  }

  async function refresh() {
    await renderGenerationContext();
    const { selectedJuntaId } = getState();
    if (!selectedJuntaId) return;
    const actas = await actasService.listByJuntaId(selectedJuntaId);
    const acta = actas[0] || null;
    await renderActa(acta);
    applyTemplateModeUi();
  }

  templateSelect.innerHTML = actasService.getTemplates().map((item) => `<option value="${item.id}">${item.label}</option>`).join('');
  modelModeOfficial?.addEventListener('change', applyTemplateModeUi);
  modelModeCustom?.addEventListener('change', applyTemplateModeUi);
  customUpload?.addEventListener('change', async () => {
    currentCustomTemplateBlob = customUpload.files?.[0] || null;
    customUploadInfo.textContent = currentCustomTemplateBlob ? `Modelo personalizado cargado: ${currentCustomTemplateBlob.name}` : customUploadInfo.textContent;
  });

  transcripcionSelect?.addEventListener('change', async () => {
    setState({ selectedTranscripcionId: transcripcionSelect.value || null });
    await renderGenerationContext();
  });
  generateButton?.addEventListener('click', generateActa);
  editor?.addEventListener('input', () => {
    renderPreview();
    setAutosave('Pendiente de guardar...', 'warning');
    debouncedAutosave();
  });
  editor?.addEventListener('blur', () => saveEditor(false, true));
  saveButton?.addEventListener('click', () => saveEditor(false, false));
  finalButton?.addEventListener('click', () => saveEditor(true, false));
  exportPdfButton?.addEventListener('click', async () => {
    const acta = await getCurrentActa();
    const version = actasService.getActiveVersion(acta);
    if (acta && version) await actasService.exportPdf(acta, version, `${buildFilename('acta')}.pdf`);
  });
  exportDocxButton?.addEventListener('click', async () => {
    const acta = await getCurrentActa();
    const version = actasService.getActiveVersion(acta);
    if (acta && version) await actasService.exportDocx(acta, version, `${buildFilename('acta')}.docx`);
  });
  exportTxtButton?.addEventListener('click', async () => {
    const acta = await getCurrentActa();
    const version = actasService.getActiveVersion(acta);
    if (acta && version) await actasService.exportTxt(acta, version, `${buildFilename('acta')}.txt`);
  });
  exportCustomButton?.addEventListener('click', async () => {
    const acta = await getCurrentActa();
    const version = actasService.getActiveVersion(acta);
    if (acta && version) await actasService.exportCustomTemplateDocx(acta, version, `${buildFilename('modelo-personalizado')}.docx`);
  });
  printButton?.addEventListener('click', async () => {
    const acta = await getCurrentActa();
    const version = actasService.getActiveVersion(acta);
    if (version) actasService.print(version);
  });
  compareSelectA?.addEventListener('change', async () => renderCompare(await getCurrentActa()));
  compareSelectB?.addEventListener('change', async () => renderCompare(await getCurrentActa()));

  document.addEventListener('gestactas:screen-change', async (event) => {
    if (event.detail?.screenId === 'generar-acta' || event.detail?.screenId === 'acta-preview') {
      await refresh();
    }
  });

  autosaveInterval = setInterval(() => {
    if (document.getElementById('screen-generar-acta')?.classList.contains('active')) {
      saveEditor(false, true);
    }
  }, 30000);

  return { refresh, cleanup: () => clearInterval(autosaveInterval) };
}
