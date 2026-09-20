import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Assignments() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getAssignments().then(setItems).catch(() => {});
  }, []);

  return (
    <>
      <h1>Assignments</h1>
      <p className="subtitle">Everything you need to submit</p>
      <div className="list">
        {items.length === 0 ? (
          <div className="empty">No assignments yet</div>
        ) : (
          items.map(a => (
            <div key={a.id} className="list-item">
              <div className="title">{a.title}</div>
              <div className="meta">
                {a.subject_code} · due {a.due_date || 'TBA'} · {a.status}
              </div>
              {a.description && <div className="meta">{a.description}</div>}
            </div>
          ))
        )}
      </div>
    </>
  );
}