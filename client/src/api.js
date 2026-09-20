const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

function post(path, data) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export const api = {
  health: () => request('/health'),

  login: (student_number, password) => post('/login', { student_number, password }),

  getSubjects: () => request('/subjects'),
  createSubject: (data) => post('/subjects', data),

  getAssignments: () => request('/assignments'),
  createAssignment: (data) => post('/assignments', data),

  getNotices: () => request('/notices'),
  createNotice: (data) => post('/notices', data),

  getProfile: (id) => request(`/profile/${id}`),
  updateProfile: (id, data) => request(`/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};