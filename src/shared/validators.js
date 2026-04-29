export function validateComunidadDraft(draft) {
  const errors = {};

  if (!draft.nombre?.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!draft.localidad?.trim()) errors.localidad = 'La localidad es obligatoria';
  if (!draft.municipio?.trim()) errors.municipio = 'El municipio es obligatorio';
  if (!draft.provincia?.trim()) errors.provincia = 'La provincia es obligatoria';

  return errors;
}

export function validatePropietarioDraft(draft) {
  const errors = {};

  if (!draft.nombre?.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!draft.identificador?.trim()) errors.identificador = 'El identificador es obligatorio';
  if (Number.isNaN(Number(draft.cuota))) errors.cuota = 'La cuota debe ser numérica';

  return errors;
}
