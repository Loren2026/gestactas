export function createNavigationController({ navMap, mainTabs, appContent }) {
  let screenHistory = ['dashboard'];
  let currentScreen = 'dashboard';

  function showScreen(id) {
    if (id === currentScreen) return;

    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById(`screen-${id}`)?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active'));
    const navId = navMap[id];
    if (navId) document.getElementById(navId)?.classList.add('active');

    document.querySelectorAll('.swipe-dot').forEach((dot) => dot.classList.remove('active'));
    const activeDot = document.querySelector(`[data-dot="${navId}"]`);
    if (activeDot) activeDot.classList.add('active');

    screenHistory.push(id);
    currentScreen = id;

    if (appContent) appContent.scrollTop = 0;
  }

  function goBack() {
    if (screenHistory.length > 1) {
      screenHistory.pop();
      const previousScreen = screenHistory[screenHistory.length - 1];
      currentScreen = '__back__';
      showScreen(previousScreen);
      screenHistory.pop();
      return;
    }

    showScreen('dashboard');
  }

  function attachSwipeNavigation() {
    if (!appContent) return;

    let touchStartX = 0;
    let touchStartY = 0;

    appContent.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    appContent.addEventListener('touchend', (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaX) <= 60 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.5) return;

      const currentNav = navMap[currentScreen];
      const currentTab = Object.keys(navMap).find((key) => navMap[key] === currentNav && mainTabs.includes(key)) || currentScreen;
      const currentIndex = mainTabs.indexOf(currentTab);

      if (currentIndex === -1) return;

      if (deltaX < 0 && currentIndex < mainTabs.length - 1) {
        showScreen(mainTabs[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        showScreen(mainTabs[currentIndex - 1]);
      }
    }, { passive: true });
  }

  return {
    showScreen,
    goBack,
    attachSwipeNavigation,
    getCurrentScreen: () => currentScreen,
  };
}
