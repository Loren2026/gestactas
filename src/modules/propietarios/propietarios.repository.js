export const propietariosRepository = {
  async list() {
    const { data, error } = await window.supabase
      .from('propietarios')
      .select('*')
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return data;
  },

  async listByComunidadId(comunidadId) {
    const { data, error } = await window.supabase
      .from('propietarios')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('propietarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(propietario) {
    const { data, error } = await window.supabase
      .from('propietarios')
      .insert(propietario)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(propietario) {
    const { id, ...fields } = propietario;

    const { data, error } = await window.supabase
      .from('propietarios')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async delete(id) {
    const { error } = await window.supabase
      .from('propietarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  },
};
