import { useEffect, useState } from 'react';
import { api } from '../api';
import { getStudent } from '../auth';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function assignmentClass(a) {
  if (a.status === 'done') return 'ok';
  const d = daysUntil(a.due_date);
  if (d === null) return '';
  if (d < 0) return 'overdue';
  if (d <= 7) return 'soon';
  return '';
}

function dueLabel(a) {
  if (!a.due_date) return 'TBA';
  const d = daysUntil(a.due_date);
  if (a.status === 'done') return `due ${a.due_date}`;
  if (d < 0) return `overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}`;
  if (d === 0) return 'due today';
  if (d === 1) return 'due tomorrow';
  if (d <= 7) return `due in ${d} days`;
  return `due ${a.due_date}`;
}

export default function Dashboard() {
  const student = getStudent();
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(() => {});
    api.getAssignments().then(setAssignments).catch(() => {});
    api.getNotices().then(setNotices).catch(() => {});
  }, []);

  const pendingCount = assignments.filter(a => a.status !== 'done').length;
  const doneCount = assignments.filter(a => a.status === 'done').length;
  const recentNotices = notices.slice(0, 3);

  // sort: overdue first, then soon, then rest, done last
  const sortedAssignments = [...assignments].sort((a, b) => {
    const order = { overdue: 0, soon: 1, '': 2, ok: 3 };
    return order[assignmentClass(a)] - order[assignmentClass(b)];
  });

  return (
    <>
      <h1>Welcome, {student?.name || 'Student'}</h1>
      <p className="subtitle">Your academic overview</p>

      <div className="cards">
        <div className="card">
          <div className="value">{subjects.length}</div>
          <div className="label">Subjects</div>
        </div>
        <div className="card">
          <div className="value">{pendingCount}</div>
          <div className="label">Assignments pending</div>
        </div>
        <div className="card">
          <div className="value">{doneCount}</div>
          <div className="label">Assignments done</div>
        </div>
        <div className="card">
          <div className="value">{notices.length}</div>
          <div className="label">Notices</div>
        </div>
      </div>

      <h2 className="section-title">Assignments</h2>
      <div className="list">
        {sortedAssignments.length === 0 ? (
          <div className="empty">No assignments yet</div>
        ) : sortedAssignments.map(a => {
          const cls = assignmentClass(a);
          return (
            <div key={a.id} className={`list-item assignment ${cls}`}>
              <div className="content">
                <div className={`title ${a.status === 'done' ? 'done' : ''}`}>
                  {a.title}
                </div>
                <div className="meta">
                  {a.subject_code} · {dueLabel(a)} · {a.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Recent Notices</h2>
      <div className="list">
        {recentNotices.length === 0 ? (
          <div className="empty">No notices yet</div>
        ) : recentNotices.map(n => (
          <div key={n.id} className="list-item">
            <div className="content">
              <div className="title">{n.title}</div>
              <div className="meta">{n.message}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}