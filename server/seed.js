require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool, init } = require('./db');

(async () => {
  await init();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM students');
  if (rows[0].n > 0) {
    console.log('Students already exist — skipping');
    process.exit(0);
  }
  const hash = bcrypt.hashSync('test1234', 10);
  await pool.query(
    'INSERT INTO students (student_number, name, email, programme, year, password) VALUES ($1, $2, $3, $4, $5, $6)',
    ['ST10455429', 'Sakhcess', 'sakhcess@example.com', 'Software Development', 3, hash]
  );
  console.log('Created student: ST10455429 / test1234');
  await pool.end();
})();