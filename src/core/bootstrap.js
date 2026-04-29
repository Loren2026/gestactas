import { createRouter } from './router.js';
import { setState } from './store.js';
import { getDb } from '../db/database.js';
import { mountLegacyUi } from './legacy-ui.js';
import { bindComunidadesUi } from '../modules/comunidades/comunidades.ui.js';
import { bindPropietariosUi } from '../modules/propietarios/propietarios.ui.js';

export async function initializeApp() {
  const db = await getDb();
  const legacyUi = mountLegacyUi();
  const router = createRouter(legacyUi);

  bindComunidadesUi({ db, router });
  bindPropietariosUi({ db, router });

  setState({
    isBootstrapped: true,
    currentScreen: 'dashboard',
  });

  return { db, router };
}
