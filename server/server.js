require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const { pool, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ---- AUTH ----
app.post('/api/login', async (req, res) => {
  try {
    const { student_number, password } = req.body;
    if (!student_number || !password) {
      return res.status(400).json({ error: 'student_number and password required' });
    }
    const { rows } = await pool.query(
      'SELECT id, student_number, name, email, programme, year, password FROM students WHERE student_number = $1',
      [student_number]
    );
    const student = rows[0];
    if (!student) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, student.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...safe } = student;
    res.json({ student: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- PROFILE ----
app.get('/api/profile/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, student_number, name, email, programme, year FROM students WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile/:id', async (req, res) => {
  try {
    const { name, email, programme, year } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    await pool.query(
      'UPDATE students SET name = $1, email = $2, programme = $3, year = $4 WHERE id = $5',
      [name, email, programme || null, year || null, req.params.id]
    );
    const { rows } = await pool.query(
      'SELECT id, student_number, name, email, programme, year FROM students WHERE id = $1',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- SUBJECTS ----
app.get('/api/subjects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'code and name required' });
    const { rows } = await pool.query(
      'INSERT INTO subjects (code, name, description) VALUES ($1, $2, $3) RETURNING *',
      [code, name, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- ASSIGNMENTS ----
app.get('/api/assignments', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, s.code AS subject_code, s.name AS subject_name
      FROM assignments a
      JOIN subjects s ON s.id = a.subject_id
      ORDER BY a.due_date NULLS LAST, a.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { subject_id, title, description, due_date } = req.body;
    if (!subject_id || !title) return res.status(400).json({ error: 'subject_id and title required' });
    const { rows } = await pool.query(
      'INSERT INTO assignments (subject_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [subject_id, title, description || null, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- NOTICES ----
app.get('/api/notices', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', async (req, res) => {
  try {
    const { subject_id, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });
    const { rows } = await pool.query(
      'INSERT INTO notices (subject_id, title, message) VALUES ($1, $2, $3) RETURNING *',
      [subject_id || null, title, message]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- BOOT ----
(async () => {
  try {
    await init();
    console.log('Database tables ready');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM students');
    if (rows[0].n === 0) {
      const hash = bcrypt.hashSync('test1234', 10);
      await pool.query(
        'INSERT INTO students (student_number, name, email, programme, year, password) VALUES ($1, $2, $3, $4, $5, $6)',
        ['ST10455429', 'Sakhcess', 'sakhcess@example.com', 'Software Development', 3, hash]
      );
      console.log('Auto-seeded test student: ST10455429 / test1234');
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();