const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
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

// ---- START ----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});