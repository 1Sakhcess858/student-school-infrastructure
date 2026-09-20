import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(() => {});
  }, []);

  return (
    <>
      <h1>My Subjects</h1>
      <p className="subtitle">All subjects you are enrolled in</p>
      <div className="list">
        {subjects.length === 0 ? (
          <div className="empty">No subjects yet</div>
        ) : (
          subjects.map(s => (
            <div key={s.id} className="list-item">
              <div className="title">{s.code} — {s.name}</div>
              <div className="meta">{s.description}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}