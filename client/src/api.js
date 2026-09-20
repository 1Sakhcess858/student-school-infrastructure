const BASE = '/api';

async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => request('/health'),
  getSubjects: () => request('/subjects'),
  getAssignments: () => request('/assignments'),
  getNotices: () => request('/notices'),
};