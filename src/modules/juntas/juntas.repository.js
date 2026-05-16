export const juntasRepository = {
  async list() {
    const { data, error } = await window.supabase
      .from('juntas')
      .select('*')
      .order('fecha_celebracion', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async listByComunidadId(comunidadId) {
    const { data, error } = await window.supabase
      .from('juntas')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .order('fecha_celebracion', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('juntas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(junta) {
    const { data, error } = await window.supabase
      .from('juntas')
      .insert(junta)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(junta) {
    const { id, ...fields } = junta;

    const { data, error } = await window.supabase
      .from('juntas')
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
      .from('juntas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  },
};
