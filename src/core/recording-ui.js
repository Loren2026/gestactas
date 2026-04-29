export function createRecordingController() {
  const waveform = document.getElementById('waveform');
  if (waveform) {
    for (let index = 0; index < 60; index += 1) {
      const bar = document.createElement('div');
      bar.className = 'wave-bar';
      bar.style.height = `${Math.random() * 20 + 8}px`;
      waveform.appendChild(bar);
    }
  }

  let isRecording = false;
  let recordSeconds = 0;
  let recordInterval;
  let waveInterval;

  function formatTime(totalSeconds) {
    return [
      String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
      String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
      String(totalSeconds % 60).padStart(2, '0'),
    ].join(':');
  }

  function toggleRecording() {
    const button = document.getElementById('recBtn');
    if (!button) return;

    if (!isRecording) {
      isRecording = true;
      button.classList.add('recording');
      button.textContent = '⏹';

      recordInterval = setInterval(() => {
        recordSeconds += 1;
        const timer = document.getElementById('recTime');
        if (timer) timer.textContent = formatTime(recordSeconds);
      }, 1000);

      const bars = document.querySelectorAll('.wave-bar');
      waveInterval = setInterval(() => {
        bars.forEach((bar) => {
          bar.style.height = `${Math.random() * 55 + 5}px`;
          bar.classList.add('active');
          bar.style.opacity = `${Math.random() * 0.6 + 0.4}`;
        });
      }, 150);
      return;
    }

    isRecording = false;
    button.classList.remove('recording');
    button.textContent = '⏺';
    clearInterval(recordInterval);
    clearInterval(waveInterval);
    document.querySelectorAll('.wave-bar').forEach((bar) => {
      bar.classList.remove('active');
      bar.style.height = `${Math.random() * 20 + 8}px`;
      bar.style.opacity = '0.4';
    });
  }

  function addMarker() {
    const marker = document.createElement('div');
    marker.className = 'marker-item';
    marker.innerHTML = `<span class="marker-time">${formatTime(recordSeconds)}</span><span>Punto clave</span>`;
    document.getElementById('markersList')?.appendChild(marker);
  }

  return { toggleRecording, addMarker };
}
