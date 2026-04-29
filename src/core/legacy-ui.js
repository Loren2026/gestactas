import { MAIN_TABS, NAV_MAP } from './ui-config.js';
import { createNavigationController } from './navigation.js';
import {
  mountSharedInteractions,
  setupAutoSecondConv,
  setupFieldBadges,
  setupUploads,
} from './interactions.js';
import { createRecordingController } from './recording-ui.js';

export function mountLegacyUi() {
  const appContent = document.getElementById('appContent');

  const navigation = createNavigationController({
    navMap: NAV_MAP,
    mainTabs: MAIN_TABS,
    appContent,
  });

  navigation.attachSwipeNavigation();
  mountSharedInteractions();

  const recording = createRecordingController();
  const { toggleFieldBadge } = setupFieldBadges();
  const autoSecondConv = setupAutoSecondConv();
  const { simulateUpload, removeUpload } = setupUploads();

  window.showScreen = navigation.showScreen;
  window.goBack = navigation.goBack;
  window.toggleRecording = recording.toggleRecording;
  window.addMarker = recording.addMarker;
  window.autoSecondConv = autoSecondConv;
  window.simulateUpload = simulateUpload;
  window.removeUpload = removeUpload;
  window.toggleFieldBadge = toggleFieldBadge;

  return {
    showScreen: navigation.showScreen,
    goBack: navigation.goBack,
    navMap: NAV_MAP,
    mainTabs: MAIN_TABS,
  };
}
