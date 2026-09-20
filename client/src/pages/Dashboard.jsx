import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(() => {});
    api.getAssignments().then(setAssignments).catch(() => {});
    api.getNotices().then(setNotices).catch(() => {});
  }, []);

  return (
    <>
      <h1>Welcome, Sakhcess</h1>
      <p className="subtitle">Your academic overview</p>

      <div className="cards">
        <div className="card">
          <div className="value">{subjects.length}</div>
          <div className="label">Subjects</div>
        </div>
        <div className="card">
          <div className="value">{assignments.length}</div>
          <div className="label">Assignments</div>
        </div>
        <div className="card">
          <div className="value">{notices.length}</div>
          <div className="label">Notices</div>
        </div>
      </div>

      <h1 style={{ fontSize: 16, marginBottom: 12 }}>Upcoming Assignments</h1>
      <div className="list">
        {assignments.length === 0 ? (
          <div className="empty">No assignments yet</div>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="list-item">
              <div className="title">{a.title}</div>
              <div className="meta">
                {a.subject_code} · due {a.due_date || 'TBA'} · {a.status}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}