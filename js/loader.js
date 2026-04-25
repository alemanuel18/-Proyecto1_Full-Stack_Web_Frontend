// ── Partial Loader ────────────────────────────────────────────────────────────
// Fetches each HTML partial and injects it into #app-root.
// All other scripts depend on the DOM being ready, so this runs synchronously
// via a top-level await inside an IIFE — partials are loaded before main.js runs.
//
// Why fetch() instead of <iframe> or server-side includes?
// Because we want plain static files (no build step, no SSI server needed),
// and fetch() works perfectly when served over HTTP (e.g. nginx or python -m http.server).

const PARTIALS = [
  'partials/auth.html',
  'partials/navbar.html',
  'partials/header.html',
  'partials/grid.html',
  'partials/modal-series.html',
  'partials/modal-confirm.html',
];

// Mark the app as not ready until partials are loaded
window.__appReady = false;

async function loadPartials() {
  const root = document.getElementById('app-root');

  // Fetch all partials in parallel
  const results = await Promise.all(
    PARTIALS.map(path =>
      fetch(path)
        .then(res => {
          if (!res.ok) throw new Error(`Could not load partial: ${path}`);
          return res.text();
        })
    )
  );

  // Inject sequentially so DOM order matches PARTIALS order
  results.forEach(html => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    // Move children directly into root (no extra wrapper divs)
    while (wrapper.firstChild) {
      root.appendChild(wrapper.firstChild);
    }
  });

  // Wrap the app screen elements in a single div for screen switching
  wrapAppScreen();

  window.__appReady = true;
}

// After injecting, wrap navbar + header + grid into #app-screen
// so showScreen('app') / showScreen('auth') works correctly
function wrapAppScreen() {
  const appScreen = document.createElement('div');
  appScreen.id = 'app-screen';
  appScreen.className = 'screen hidden';

  const root = document.getElementById('app-root');

  // Everything except auth-screen and modals goes into app-screen
  const toWrap = root.querySelectorAll('.navbar, .app-header, .stats-bar, .series-grid, .empty-state, .pagination');
  toWrap.forEach(el => appScreen.appendChild(el));

  // Insert app-screen after auth-screen
  const authScreen = root.querySelector('#auth-screen');
  authScreen.insertAdjacentElement('afterend', appScreen);
}

// Run immediately — other scripts check window.__appReady before executing
loadPartials().catch(err => {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:sans-serif;color:#f0ede8;background:#0d0d0f">
      <span style="font-size:48px">⚠️</span>
      <p style="color:#e57373;font-size:16px">${err.message}</p>
      <p style="color:#7a7880;font-size:13px">Asegúrate de servir el frontend desde un servidor HTTP (no abrir index.html directamente).</p>
    </div>
  `;
});