const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  };
}

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers }
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.reload();
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const authApi = {
  login: (email, password) => api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (body) => api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  })
};

export const incidentApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/incidents?${q}`);
  },
  get: (id) => api(`/incidents/${id}`),
  create: (body) => api('/incidents', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  comment: (id, text) => api(`/incidents/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  delete: (id) => api(`/incidents/${id}`, { method: 'DELETE' }),
  metrics: () => api('/incidents/metrics')
};

export const observabilityApi = {
  dashboard: (range = '24h') => api(`/observability/dashboard?range=${range}`)
};
