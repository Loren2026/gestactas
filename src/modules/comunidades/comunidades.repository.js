export const comunidadesRepository = {
  async list() {
    const { data, error } = await window.supabase
      .from('comunidades')
      .select('*')
      .order('nombre');

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('comunidades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(comunidad) {
    const { data, error } = await window.supabase
      .from('comunidades')
      .insert(comunidad)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(comunidad) {
    const { id, ...fields } = comunidad;

    const { data, error } = await window.supabase
      .from('comunidades')
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
      .from('comunidades')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  },
};
