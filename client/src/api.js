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
  updateSubject: (id, data) => request(`/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),

  getAssignments: () => request('/assignments'),
  createAssignment: (data) => post('/assignments', data),
  updateAssignment: (id, data) => request(`/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),

  getNotices: () => request('/notices'),
  createNotice: (data) => post('/notices', data),
  updateNotice: (id, data) => request(`/notices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteNotice: (id) => request(`/notices/${id}`, { method: 'DELETE' }),

  getProfile: (id) => request(`/profile/${id}`),
  updateProfile: (id, data) => request(`/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};