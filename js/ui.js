// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  watching:      'Viendo',
  completed:     'Completada',
  dropped:       'Abandonada',
  plan_to_watch: 'Pendiente',
};

// ── Toast ─────────────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast--${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ── Screen switching ──────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(`${name}-screen`).classList.remove('hidden');
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats(list) {
  const count = (s) => list.filter(x => x.status === s).length;
  animateNum('stat-total',     list.length);
  animateNum('stat-watching',  count('watching'));
  animateNum('stat-completed', count('completed'));
  animateNum('stat-dropped',   count('dropped'));
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  if (diff === 0) return;
  let step = 0;
  const iv = setInterval(() => {
    step++;
    el.textContent = Math.round(start + diff * (step / 20));
    if (step >= 20) clearInterval(iv);
  }, 16);
}

// ── Series card ───────────────────────────────────────────────────────────────
function renderCard(series) {
  const card = document.createElement('div');
  card.className = 'series-card';
  card.dataset.id = series.id;

  const statusLabel = STATUS_LABEL[series.status] || series.status;

  const coverHTML = (series.cover_url && series.cover_url !== 'null')
    ? `<img class="card-cover" src="${series.cover_url}" alt="${escHtml(series.title)}" loading="lazy" />`
    : `<div class="card-cover-placeholder">📺</div>`;

  const ratingHTML = series.rating
    ? `<span class="card-rating">
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        ${series.rating}/10
       </span>`
    : `<span class="card-rating card-rating--none">Sin rating</span>`;

  card.innerHTML = `
    ${coverHTML}
    <span class="card-status status--${series.status}">${statusLabel}</span>
    <div class="card-body">
      <div class="card-title">${escHtml(series.title)}</div>
      <div class="card-genre">${escHtml(series.genre != null ? series.genre : '—')}</div>
      <div class="card-meta">
        ${ratingHTML}
        <div class="card-actions">
          <button class="card-btn btn-edit" title="Editar">✎</button>
          <button class="card-btn card-btn--danger btn-delete" title="Eliminar">✕</button>
        </div>
      </div>
    </div>
  `;

  return card;
}

// ── Grid render ───────────────────────────────────────────────────────────────
function renderGrid(list, onEdit, onDelete, onCardClick) {
  const grid  = document.getElementById('series-grid');
  const empty = document.getElementById('empty-state');

  grid.innerHTML = '';

  if (!list || list.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.forEach((s, i) => {
    const card = renderCard(s);
    card.style.animationDelay = `${i * 35}ms`;
    card.querySelector('.btn-edit').addEventListener('click', (e) => { e.stopPropagation(); onEdit(s); });
    card.querySelector('.btn-delete').addEventListener('click', (e) => { e.stopPropagation(); onDelete(s); });
    card.addEventListener('click', () => { if (onCardClick) onCardClick(s); });
    grid.appendChild(card);
  });
}

// ── Pagination ────────────────────────────────────────────────────────────────
function renderPagination(page, totalPages, onPageChange) {
  const el = document.getElementById('pagination');
  el.innerHTML = '';
  if (totalPages <= 1) return;

  const addBtn = (label, target, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled) btn.addEventListener('click', () => onPageChange(target));
    el.appendChild(btn);
  };

  addBtn('←', page - 1, page === 1);
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
      if (p === 2 || p === totalPages - 1) {
        const dots = document.createElement('span');
        dots.textContent = '…';
        dots.style.cssText = 'padding:8px 4px;color:var(--text-dim)';
        el.appendChild(dots);
      }
      continue;
    }
    addBtn(p, p, false, p === page);
  }
  addBtn('→', page + 1, page === totalPages);
}

// ── Modal: open / close ───────────────────────────────────────────────────────
function openModal(series = null) {
  const titleEl = document.getElementById('modal-title');

  // Reset all fields
  ['field-title','field-genre','field-episodes','field-rating','field-description']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('field-status').value = 'plan_to_watch';
  document.getElementById('modal-error').classList.add('hidden');
  document.getElementById('cover-preview').classList.add('hidden');
  document.getElementById('cover-placeholder').classList.remove('hidden');
  document.getElementById('cover-input').value = '';

  if (series) {
    titleEl.textContent = 'Editar serie';
    document.getElementById('field-title').value       = series.title       || '';
    document.getElementById('field-genre').value       = series.genre       || '';
    document.getElementById('field-status').value      = series.status      || 'plan_to_watch';
    document.getElementById('field-rating').value      = series.rating      ?? '';
    document.getElementById('field-episodes').value    = series.episodes    ?? '';
    document.getElementById('field-description').value = series.description || '';

    if (series.cover_url && series.cover_url !== 'null') {
      const preview = document.getElementById('cover-preview');
      preview.src = series.cover_url;
      preview.classList.remove('hidden');
      document.getElementById('cover-placeholder').classList.add('hidden');
    }
  } else {
    titleEl.textContent = 'Nueva serie';
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function openConfirm(onConfirm) {
  const overlay = document.getElementById('confirm-overlay');
  overlay.classList.remove('hidden');

  // Clone to remove old listeners
  const oldBtn = document.getElementById('confirm-delete');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.replaceWith(newBtn);

  newBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    onConfirm();
  });
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
}

// ── Form reading ──────────────────────────────────────────────────────────────
function readModalForm() {
  return {
    title:       document.getElementById('field-title').value.trim(),
    genre:       document.getElementById('field-genre').value.trim(),
    status:      document.getElementById('field-status').value,
    rating:      document.getElementById('field-rating').value   ? parseInt(document.getElementById('field-rating').value)   : null,
    episodes:    document.getElementById('field-episodes').value ? parseInt(document.getElementById('field-episodes').value) : null,
    description: document.getElementById('field-description').value.trim(),
  };
}

function showModalError(msg) {
  const el = document.getElementById('modal-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ── Cover preview setup ───────────────────────────────────────────────────────
function setupCoverPreview() {
  const area        = document.getElementById('cover-upload-area');
  const input       = document.getElementById('cover-input');
  const preview     = document.getElementById('cover-preview');
  const placeholder = document.getElementById('cover-placeholder');

  area.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 1MB', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}