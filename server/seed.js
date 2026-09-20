const bcrypt = require('bcrypt');
const db = require('./db');

const studentNumber = 'ST10455429';
const name = 'Sakhcess';
const email = 'sakhcess@example.com';
const programme = 'Software Development';
const year = 3;
const plainPassword = 'test1234';

const existing = db.prepare('SELECT id FROM students WHERE student_number = ?').get(studentNumber);
if (existing) {
  console.log('Student already exists — skipping');
  process.exit(0);
}

const hash = bcrypt.hashSync(plainPassword, 10);

db.prepare(`
  INSERT INTO students (student_number, name, email, programme, year, password)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(studentNumber, name, email, programme, year, hash);

console.log('Created student:');
console.log('  student_number:', studentNumber);
console.log('  password      :', plainPassword);