import { setState } from './store.js';

export function createRouter(legacyUi) {
  return {
    goTo(screenId) {
      legacyUi.showScreen(screenId);
      setState({ currentScreen: screenId });
    },
    back() {
      legacyUi.goBack();
    },
  };
}
