// ── App State ─────────────────────────────────────────────────────────────────
const state = {
  user:       null,
  seriesList: [],
  allSeries:  [],   // unfiltered, for CSV + stats
  page:       1,
  totalPages: 1,
  limit:      20,
  query:      '',
  status:     '',
  sort:       'created_at',
  order:      'desc',
  editingId:  null,
};

// ── Boot: wait for loader.js to finish injecting partials ─────────────────────
function waitForPartials(cb) {
  if (window.__appReady) { cb(); return; }
  const iv = setInterval(() => {
    if (window.__appReady) { clearInterval(iv); cb(); }
  }, 20);
}

document.addEventListener('DOMContentLoaded', () => {
  waitForPartials(init);
});

async function init() {
  setupCoverPreview();   // ui.js — needs cover-input in DOM
  setupAuthTabs();
  setupAuthForms();
  setupAppEvents();

  // Restore session if token exists
  if (token.get()) {
    try {
      const user = await api.auth.me();
      loginSuccess(user);
    } catch {
      token.remove();
      showScreen('auth');
    }
  } else {
    showScreen('auth');
  }
}

// ── Auth tabs ─────────────────────────────────────────────────────────────────
function setupAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('login-form').classList.toggle('hidden', target !== 'login');
      document.getElementById('register-form').classList.toggle('hidden', target !== 'register');
    });
  });
}

// ── Auth forms ────────────────────────────────────────────────────────────────
function setupAuthForms() {
  // Login
  const loginBtn = document.getElementById('login-btn');
  loginBtn.addEventListener('click', async () => {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!email || !password) {
      errEl.textContent = 'Completa todos los campos.';
      errEl.classList.remove('hidden');
      return;
    }

    loginBtn.disabled    = true;
    loginBtn.textContent = 'Entrando...';
    try {
      const res = await api.auth.login(email, password);
      token.set(res.token);
      loginSuccess(res.user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = 'Entrar';
    }
  });

  // Enter key on login fields
  ['login-email','login-password'].forEach(id =>
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') loginBtn.click();
    })
  );

  // Register
  const regBtn = document.getElementById('register-btn');
  regBtn.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl    = document.getElementById('register-error');
    errEl.classList.add('hidden');

    if (!username || !email || !password) {
      errEl.textContent = 'Completa todos los campos.';
      errEl.classList.remove('hidden');
      return;
    }

    regBtn.disabled    = true;
    regBtn.textContent = 'Creando cuenta...';
    try {
      const res = await api.auth.register(email, username, password);
      token.set(res.token);
      loginSuccess(res.user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      regBtn.disabled    = false;
      regBtn.textContent = 'Crear cuenta';
    }
  });
}

// ── Login success ─────────────────────────────────────────────────────────────
function loginSuccess(user) {
  state.user = user;
  document.getElementById('nav-username').textContent = `@${user.username}`;
  showScreen('app');
  loadSeries();
}

// ── App events ────────────────────────────────────────────────────────────────
function setupAppEvents() {
  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    token.remove();
    state.user = null;
    showScreen('auth');
  });

  // Add series
  document.getElementById('add-series-btn').addEventListener('click', () => {
    state.editingId = null;
    openModal(null);
  });

  // Empty state button
  document.getElementById('empty-add-btn').addEventListener('click', () => {
    state.editingId = null;
    openModal(null);
  });

  // Search (debounced)
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value.trim();
      state.page  = 1;
      loadSeries();
    }, 350);
  });

  // Status pills
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.status = pill.dataset.status;
      state.page   = 1;
      loadSeries();
    });
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    const [sort, order] = e.target.value.split('|');
    state.sort  = sort;
    state.order = order;
    state.page  = 1;
    loadSeries();
  });

  // CSV export
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    exportToCSV(state.allSeries);
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Modal save
  document.getElementById('modal-save').addEventListener('click', handleSave);

  // Confirm dialog close
  document.getElementById('confirm-close').addEventListener('click', closeConfirm);
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConfirm();
  });
}

// ── Load series ───────────────────────────────────────────────────────────────
async function loadSeries() {
  try {
    const res = await api.series.list({
      page: state.page, limit: state.limit,
      q: state.query, sort: state.sort,
      order: state.order, status: state.status,
    });

    state.seriesList = res.data || [];
    state.totalPages = res.total_pages || 1;

    renderGrid(state.seriesList, handleEdit, handleDeletePrompt);
    renderPagination(state.page, state.totalPages, p => {
      state.page = p;
      loadSeries();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loadAllForExport();
  } catch (err) {
    showToast('Error cargando series: ' + err.message, 'error');
  }
}

// Load full list (unfiltered) for stats + CSV
async function loadAllForExport() {
  try {
    const res = await api.series.list({ page: 1, limit: 100, sort: 'created_at', order: 'desc' });
    state.allSeries = res.data || [];
    updateStats(state.allSeries);
  } catch { /* silent */ }
}

// ── Save (create or update) ───────────────────────────────────────────────────
async function handleSave() {
  const form = readModalForm();

  if (!form.title) {
    showModalError('El título es obligatorio.');
    return;
  }

  const btn = document.getElementById('modal-save');
  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  try {
    const payload = {
      title: form.title, genre: form.genre,
      status: form.status, description: form.description,
    };
    if (form.rating   !== null) payload.rating   = form.rating;
    if (form.episodes !== null) payload.episodes = form.episodes;

    let seriesId = state.editingId;

    if (state.editingId) {
      await api.series.update(state.editingId, payload);
    } else {
      const created = await api.series.create(payload);
      seriesId = created.id;
    }

    // Upload image if selected
    const coverInput = document.getElementById('cover-input');
    if (coverInput.files[0]) {
      await api.series.uploadImage(seriesId, coverInput.files[0]);
    }

    closeModal();
    showToast(state.editingId ? 'Serie actualizada ✓' : 'Serie creada ✓');
    if (!state.editingId) state.page = 1;
    loadSeries();
  } catch (err) {
    showModalError(err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Guardar';
  }
}

// ── Edit / Delete ─────────────────────────────────────────────────────────────
function handleEdit(series) {
  state.editingId = series.id;
  openModal(series);
}

function handleDeletePrompt(series) {
  openConfirm(async () => {
    try {
      await api.series.delete(series.id);
      showToast('Serie eliminada');
      if (state.seriesList.length === 1 && state.page > 1) state.page--;
      loadSeries();
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error');
    }
  });
}