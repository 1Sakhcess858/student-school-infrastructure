import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [n, s] = await Promise.all([api.getNotices(), api.getSubjects()]);
      setItems(n);
      setSubjects(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setSubjectId('');
    setTitle('');
    setMessage('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createNotice({
        subject_id: subjectId ? Number(subjectId) : null,
        title: title.trim(),
        message: message.trim(),
      });
      reset();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notices</h1>
          <p className="subtitle">Announcements from your institution</p>
        </div>
        <button onClick={() => { reset(); setShowForm(v => !v); }}>
          {showForm ? 'Cancel' : '+ Add Notice'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Notice</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <FormField label="Subject (optional — leave empty for general)">
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                <option value="">— general notice —</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Practical moved to Lab 3" required />
            </FormField>
            <FormField label="Message">
              <textarea value={message} onChange={e => setMessage(e.target.value)} required />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Notice'}</button>
            <button type="button" className="btn-secondary" onClick={() => { reset(); setShowForm(false); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="list">
        {items.length === 0 ? (
          <div className="empty">No notices yet</div>
        ) : items.map(n => (
          <div key={n.id} className="list-item">
            <div className="title">{n.title}</div>
            <div className="meta">{n.message}</div>
            <div className="meta">{n.created_at}</div>
          </div>
        ))}
      </div>
    </>
  );
}