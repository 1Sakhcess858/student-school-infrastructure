import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Notices() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getNotices().then(setItems).catch(() => {});
  }, []);

  return (
    <>
      <h1>Notices</h1>
      <p className="subtitle">Announcements from your institution</p>
      <div className="list">
        {items.length === 0 ? (
          <div className="empty">No notices yet</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="list-item">
              <div className="title">{n.title}</div>
              <div className="meta">{n.message}</div>
              <div className="meta">{n.created_at}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}