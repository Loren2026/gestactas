export const grabacionesRepository = {
  async list() {
    const { data, error } = await window.supabase
      .from('grabaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async listByJuntaId(juntaId) {
    const { data, error } = await window.supabase
      .from('grabaciones')
      .select('*')
      .eq('junta_id', juntaId)
      .order('orden_segmento', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('grabaciones')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(grabacion) {
    const { data, error } = await window.supabase
      .from('grabaciones')
      .insert(grabacion)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(grabacion) {
    const { id, ...rest } = grabacion;

    const { data, error } = await window.supabase
      .from('grabaciones')
      .update(rest)
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
      .from('grabaciones')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }
};
