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

function put(path, data) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export const api = {
  health: () => request('/health'),

  login: (student_number, password) => post('/login', { student_number, password }),

  getSubjects: () => request('/subjects'),
  createSubject: (data) => post('/subjects', data),
  updateSubject: (id, data) => put(`/subjects/${id}`, data),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),

  getAssignments: () => request('/assignments'),
  createAssignment: (data) => post('/assignments', data),
  updateAssignment: (id, data) => put(`/assignments/${id}`, data),
  setAssignmentStatus: (id, status) => request(`/assignments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),

  getNotices: () => request('/notices'),
  createNotice: (data) => post('/notices', data),
  updateNotice: (id, data) => put(`/notices/${id}`, data),
  deleteNotice: (id) => request(`/notices/${id}`, { method: 'DELETE' }),

  getTimetable: () => request('/timetable'),
  createTimetable: (data) => post('/timetable', data),
  updateTimetable: (id, data) => put(`/timetable/${id}`, data),
  deleteTimetable: (id) => request(`/timetable/${id}`, { method: 'DELETE' }),

  getProfile: (id) => request(`/profile/${id}`),
  updateProfile: (id, data) => put(`/profile/${id}`, data),
};