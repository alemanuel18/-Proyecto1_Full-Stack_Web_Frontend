// ── Config ────────────────────────────────────────────────────────────────────
const API_URL = process.env.API_URL;

// ── Token helpers ─────────────────────────────────────────────────────────────
const token = {
  get:    ()  => localStorage.getItem('token'),
  set:    (t) => localStorage.setItem('token', t),
  remove: ()  => localStorage.removeItem('token'),
};

// ── Base fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const tok = token.get();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // 204 No Content — no body
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ── API ───────────────────────────────────────────────────────────────────────
const api = {
  auth: {
    register: (email, username, password) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      }),

    login: (email, password) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => apiFetch('/auth/me'),
  },

  series: {
    list: ({ page = 1, limit = 20, q = '', sort = 'created_at', order = 'desc', status = '' } = {}) => {
      const params = new URLSearchParams({ page, limit, sort, order });
      if (q)      params.set('q', q);
      if (status) params.set('status', status);
      return apiFetch(`/series?${params}`);
    },

    get: (id) => apiFetch(`/series/${id}`),

    create: (data) =>
      apiFetch('/series', { method: 'POST', body: JSON.stringify(data) }),

    update: (id, data) =>
      apiFetch(`/series/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id) =>
      apiFetch(`/series/${id}`, { method: 'DELETE' }),

    uploadImage: async (id, file) => {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_URL}/series/${id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.get()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo imagen');
      return data;
    },
  },
};