import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    setEditingId(null);
  }

  function startCreate() { reset(); setShowForm(true); }

  function startEdit(n) {
    setEditingId(n.id);
    setSubjectId(n.subject_id ? String(n.subject_id) : '');
    setTitle(n.title);
    setMessage(n.message);
    setShowForm(true);
    setError('');
  }

  function cancelForm() { reset(); setShowForm(false); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = {
        subject_id: subjectId ? Number(subjectId) : null,
        title: title.trim(),
        message: message.trim(),
      };
      if (editingId) {
        await api.updateNotice(editingId, data);
      } else {
        await api.createNotice(data);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(n) {
    if (!window.confirm(`Delete "${n.title}"?`)) return;
    try {
      await api.deleteNotice(n.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notices</h1>
          <p className="subtitle">Announcements from your institution</p>
        </div>
        {!showForm && <button onClick={startCreate}>+ Add Notice</button>}
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Notice' : 'New Notice'}</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <FormField label="Subject (optional)">
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                <option value="">— general notice —</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title">
              <input value={title} onChange={e => setTitle(e.target.value)} required />
            </FormField>
            <FormField label="Message">
              <textarea value={message} onChange={e => setMessage(e.target.value)} required />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Notice'}
            </button>
            <button type="button" className="btn-secondary" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="list">
        {items.length === 0 ? (
          <div className="empty">No notices yet</div>
        ) : items.map(n => (
          <div key={n.id} className="list-item">
            <div className="content">
              <div className="title">{n.title}</div>
              <div className="meta">{n.message}</div>
              <div className="meta">{n.created_at}</div>
            </div>
            <div className="actions">
              <button className="btn-edit" onClick={() => startEdit(n)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(n)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}