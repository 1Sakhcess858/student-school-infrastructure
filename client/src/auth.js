const KEY = 'student';

export function getStudent() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStudent(student) {
  localStorage.setItem(KEY, JSON.stringify(student));
}

export function clearStudent() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return !!getStudent();
}