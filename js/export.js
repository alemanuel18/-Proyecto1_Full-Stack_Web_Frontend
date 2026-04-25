// ── CSV Export ────────────────────────────────────────────────────────────────
// Generated manually from JS — no libraries.
// BOM prefix makes Excel open UTF-8 correctly on Windows.

function exportToCSV(list) {
  if (!list || list.length === 0) {
    showToast('No hay series para exportar', 'error');
    return;
  }

  const STATUS_ES = {
    watching: 'Viendo', completed: 'Completada',
    dropped: 'Abandonada', plan_to_watch: 'Pendiente',
  };

  function cell(val) {
    const s = val === null || val === undefined ? '' : String(val);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  }

  const headers = ['ID','Título','Género','Estado','Rating','Episodios','Descripción','Portada','Creada'];

  const rows = list.map(s => [
    s.id,
    s.title,
    s.genre || '',
    STATUS_ES[s.status] || s.status,
    s.rating    ?? '',
    s.episodes  ?? '',
    s.description || '',
    s.cover_url || '',
    new Date(s.created_at).toLocaleDateString('es-GT'),
  ].map(cell).join(','));

  const csv  = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');

  a.href     = url;
  a.download = `series_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Exportadas ${list.length} series a CSV ✓`);
}