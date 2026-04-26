// ── Detail Drawer ─────────────────────────────────────────────────────────────

const STATUS_LABEL_DETAIL = {
  watching:      'Viendo',
  completed:     'Completada',
  dropped:       'Abandonada',
  plan_to_watch: 'Pendiente',
};

let _detailOnEdit   = null;
let _detailOnDelete = null;

function openDetail(series, onEdit, onDelete) {
  _detailOnEdit   = onEdit;
  _detailOnDelete = onDelete;

  // Cover
  const cover       = document.getElementById('detail-cover');
  const placeholder = document.getElementById('detail-cover-placeholder');
  if (series.cover_url) {
    cover.src = series.cover_url;
    cover.classList.remove('hidden');
    placeholder.style.display = 'none';
  } else {
    cover.classList.add('hidden');
    placeholder.style.display = 'flex';
  }

  // Status badge
  const badge = document.getElementById('detail-status-badge');
  badge.textContent = STATUS_LABEL_DETAIL[series.status] || series.status;
  badge.className   = `card-status status--${series.status}`;

  // Text fields
  document.getElementById('detail-title').textContent = series.title || '';
  document.getElementById('detail-genre').textContent = series.genre || '';

  // Stats
  document.getElementById('detail-rating').textContent =
    series.rating ? `${series.rating} / 10 ⭐` : '—';

  document.getElementById('detail-episodes').textContent =
    series.episodes != null ? `${series.episodes} ep.` : '—';

  document.getElementById('detail-created').textContent =
    series.created_at ? new Date(series.created_at).toLocaleDateString('es-GT') : '—';

  document.getElementById('detail-updated').textContent =
    series.updated_at ? new Date(series.updated_at).toLocaleDateString('es-GT') : '—';

  // Description
  const descWrap = document.getElementById('detail-desc-wrap');
  const descEl   = document.getElementById('detail-description');
  if (series.description) {
    descEl.textContent = series.description;
    descWrap.classList.remove('hidden');
  } else {
    descWrap.classList.add('hidden');
  }

  // Store series id on edit/delete buttons
  document.getElementById('detail-edit-btn').dataset.id   = series.id;
  document.getElementById('detail-delete-btn').dataset.id = series.id;

  // Show overlay
  document.getElementById('detail-overlay').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
}

function setupDetailEvents() {
  document.getElementById('detail-close').addEventListener('click', closeDetail);

  // Close on overlay click
  document.getElementById('detail-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetail();
  });

  // Edit button
  document.getElementById('detail-edit-btn').addEventListener('click', () => {
    closeDetail();
    if (_detailOnEdit) _detailOnEdit();
  });

  // Delete button
  document.getElementById('detail-delete-btn').addEventListener('click', () => {
    closeDetail();
    if (_detailOnDelete) _detailOnDelete();
  });
}