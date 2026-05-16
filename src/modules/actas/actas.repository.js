export const actasRepository = {
  async listByJuntaId(juntaId) {
    const { data, error } = await window.supabase
      .from('actas')
      .select('*')
      .eq('junta_id', juntaId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await window.supabase
      .from('actas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async save(acta) {
    const { data, error } = await window.supabase
      .from('actas')
      .insert(acta)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(acta) {
    const { id, ...fields } = acta;

    const { data, error } = await window.supabase
      .from('actas')
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
      .from('actas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  },

  async getLatestByJuntaId(juntaId) {
    const { data, error } = await window.supabase
      .from('actas')
      .select('*')
      .eq('junta_id', juntaId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },
};
