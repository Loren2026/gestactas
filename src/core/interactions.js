export function mountSharedInteractions() {
  document.querySelectorAll('.tabs').forEach((group) => {
    group.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        group.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });

  document.querySelectorAll('.checkbox-row').forEach((row) => {
    row.addEventListener('click', () => {
      const checkbox = row.querySelector('.checkbox');
      checkbox?.classList.toggle('checked');
      if (checkbox) checkbox.textContent = checkbox.classList.contains('checked') ? '✓' : '';
    });
  });

  document.querySelectorAll('.option-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.option-card').forEach((item) => item.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

export function setupFieldBadges() {
  function toggleFieldBadge(element) {
    if (element.textContent.includes('IA')) {
      element.textContent = '✏️ MANUAL';
      element.style.background = 'var(--warning-bg)';
      element.style.color = 'var(--warning)';
      const block = element.closest('[style*="background:rgba(59"]');
      if (block) block.style.background = 'var(--bg-input)';
      const bordered = element.closest('[style*="border:1px"]');
      if (bordered) bordered.style.border = 'none';
      return;
    }

    if (element.textContent.includes('MANUAL') && !element.textContent.includes('🔖')) {
      element.innerHTML = '🤖 IA';
      element.style.background = 'var(--accent-glow)';
      element.style.color = 'var(--accent)';
    }
  }

  document.addEventListener('click', (event) => {
    const badge = event.target.closest('[style*="cursor:pointer"]');
    if (badge && (badge.textContent.includes('IA') || badge.textContent.includes('MANUAL'))) {
      toggleFieldBadge(badge);
    }
  });

  return { toggleFieldBadge };
}

export function setupAutoSecondConv() {
  return function autoSecondConv() {
    const firstCall = document.getElementById('hora1conv');
    const secondCall = document.getElementById('hora2conv');
    if (!firstCall?.value || !secondCall) return;

    const [hours, minutes] = firstCall.value.split(':').map(Number);
    let nextHours = hours;
    let nextMinutes = minutes + 30;

    if (nextMinutes >= 60) {
      nextMinutes -= 60;
      nextHours += 1;
    }

    if (nextHours >= 24) nextHours = 0;

    secondCall.value = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
  };
}

export function setupUploads() {
  function simulateUpload() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;

    uploadArea.parentElement.style.display = 'none';
    document.getElementById('uploadedDoc').style.display = 'block';
  }

  function removeUpload() {
    document.getElementById('uploadedDoc').style.display = 'none';
    document.getElementById('uploadArea').parentElement.style.display = 'block';
  }

  return { simulateUpload, removeUpload };
}
