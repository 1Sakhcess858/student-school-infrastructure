const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ---- AUTH ----
app.post('/api/login', (req, res) => {
  const { student_number, password } = req.body;
  if (!student_number || !password) {
    return res.status(400).json({ error: 'student_number and password required' });
  }

  const student = db.prepare(
    'SELECT id, student_number, name, email, programme, year, password FROM students WHERE student_number = ?'
  ).get(student_number);

  if (!student) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(password, student.password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { password: _, ...safe } = student;
  res.json({ student: safe });
});

// ---- PROFILE ----
app.get('/api/profile/:id', (req, res) => {
  const student = db.prepare(
    'SELECT id, student_number, name, email, programme, year FROM students WHERE id = ?'
  ).get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.put('/api/profile/:id', (req, res) => {
  const { name, email, programme, year } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }
  try {
    db.prepare(
      'UPDATE students SET name = ?, email = ?, programme = ?, year = ? WHERE id = ?'
    ).run(name, email, programme || null, year || null, req.params.id);
    const student = db.prepare(
      'SELECT id, student_number, name, email, programme, year FROM students WHERE id = ?'
    ).get(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- SUBJECTS ----
app.get('/api/subjects', (req, res) => {
  const rows = db.prepare('SELECT * FROM subjects').all();
  res.json(rows);
});

app.post('/api/subjects', (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  try {
    const info = db.prepare(
      'INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)'
    ).run(code, name, description || null);
    res.status(201).json({ id: info.lastInsertRowid, code, name, description });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- ASSIGNMENTS ----
app.get('/api/assignments', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.code AS subject_code, s.name AS subject_name
    FROM assignments a
    JOIN subjects s ON s.id = a.subject_id
  `).all();
  res.json(rows);
});

app.post('/api/assignments', (req, res) => {
  const { subject_id, title, description, due_date } = req.body;
  if (!subject_id || !title) return res.status(400).json({ error: 'subject_id and title required' });
  try {
    const info = db.prepare(
      'INSERT INTO assignments (subject_id, title, description, due_date) VALUES (?, ?, ?, ?)'
    ).run(subject_id, title, description || null, due_date || null);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- NOTICES ----
app.get('/api/notices', (req, res) => {
  const rows = db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/notices', (req, res) => {
  const { subject_id, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'title and message required' });
  try {
    const info = db.prepare(
      'INSERT INTO notices (subject_id, title, message) VALUES (?, ?, ?)'
    ).run(subject_id || null, title, message);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- AUTO SEED (runs once on startup if DB is empty) ----
const studentCount = db.prepare('SELECT COUNT(*) AS n FROM students').get().n;
if (studentCount === 0) {
  const hash = bcrypt.hashSync('test1234', 10);
  db.prepare(`
    INSERT INTO students (student_number, name, email, programme, year, password)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('ST10455429', 'Sakhcess', 'sakhcess@example.com', 'Software Development', 3, hash);
  console.log('Auto-seeded test student: ST10455429 / test1234');
}

// ---- START ----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});