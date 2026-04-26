window.__appReady = false;

const PARTIALS = [
  'partials/auth.html',
  'partials/navbar.html',
  'partials/header.html',
  'partials/grid.html',
  'partials/modal-series.html',
  'partials/modal-confirm.html',
];

async function loadPartials() {
  const root = document.getElementById('app-root');

  for (const path of PARTIALS) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load: ${path} (${res.status})`);
    const html = await res.text();
    root.insertAdjacentHTML('beforeend', html);
  }

  // Wrap app elements into #app-screen
  const appScreen = document.createElement('div');
  appScreen.id = 'app-screen';
  appScreen.className = 'screen hidden';

  const authScreen  = document.getElementById('auth-screen');
  const modalSeries = document.getElementById('modal-overlay');
  const modalConfirm = document.getElementById('confirm-overlay');
  const toast       = document.getElementById('toast');

  // Move everything that isn't auth, modals, or toast
  [...root.childNodes].forEach(node => {
    if (node !== authScreen && node !== modalSeries && node !== modalConfirm && node !== toast) {
      appScreen.appendChild(node);
    }
  });

  root.appendChild(appScreen);
  window.__appReady = true;
}

loadPartials().catch(err => {
  console.error('Loader error:', err);
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:sans-serif;color:#f0ede8;background:#0d0d0f">
      <span style="font-size:48px">⚠️</span>
      <p style="color:#e57373">${err.message}</p>
    </div>
  `;
});