export const transcripcionesRepository = {
  async listByJuntaId(juntaId) {
    const { data, error } = await window.supabase
      .from('transcripciones')
      .select('*')
      .eq('junta_id', juntaId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async listByGrabacionId(grabacionId) {
    const { data, error } = await window.supabase
      .from('transcripciones')
      .select('*')
      .eq('grabacion_id', grabacionId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('transcripciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(transcripcion) {
    const { data, error } = await window.supabase
      .from('transcripciones')
      .insert(transcripcion)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async delete(id) {
    const { error } = await window.supabase
      .from('transcripciones')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  },
};
