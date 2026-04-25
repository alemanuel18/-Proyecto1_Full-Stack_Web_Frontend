const PARTIALS = [
  'partials/auth.html',
  'partials/navbar.html',
  'partials/header.html',
  'partials/grid.html',
  'partials/modal-series.html',
  'partials/modal-confirm.html',
];

window.__appReady = false;

async function loadPartials() {
  const root = document.getElementById('app-root');

  const results = await Promise.all(
    PARTIALS.map(path =>
      fetch(path)
        .then(res => {
          if (!res.ok) throw new Error(`Could not load partial: ${path}`);
          return res.text();
        })
    )
  );

  results.forEach(html => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    while (wrapper.firstChild) {
      root.appendChild(wrapper.firstChild);
    }
  });

  wrapAppScreen();
  window.__appReady = true;
}

function wrapAppScreen() {
  const root = document.getElementById('app-root');
  const appScreen = document.createElement('div');
  appScreen.id = 'app-screen';
  appScreen.className = 'screen hidden';

  // Grab by ID — much more reliable than class selectors
  const ids = ['navbar', 'app-header-wrapper', 'stats-bar', 'series-grid', 'empty-state', 'pagination'];
  // Fall back to grabbing everything that isn't auth-screen or modals
  const authScreen = root.querySelector('#auth-screen');
  const modalOverlay = root.querySelector('#modal-overlay');
  const confirmOverlay = root.querySelector('#confirm-overlay');

  // Move all direct children except auth + modals into app-screen
  const toMove = [];
  root.childNodes.forEach(node => {
    if (
      node !== authScreen &&
      node !== modalOverlay &&
      node !== confirmOverlay
    ) {
      toMove.push(node);
    }
  });
  toMove.forEach(node => appScreen.appendChild(node));

  authScreen.insertAdjacentElement('afterend', appScreen);
}

loadPartials().catch(err => {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:sans-serif;color:#f0ede8;background:#0d0d0f">
      <span style="font-size:48px">⚠️</span>
      <p style="color:#e57373;font-size:16px">${err.message}</p>
      <p style="color:#7a7880;font-size:13px">Sirve el frontend desde un servidor HTTP (no abrir index.html directamente).</p>
    </div>
  `;
});