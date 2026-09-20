import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

export default function Assignments() {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [a, s] = await Promise.all([api.getAssignments(), api.getSubjects()]);
      setItems(a);
      setSubjects(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setSubjectId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createAssignment({
        subject_id: Number(subjectId),
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
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
          <h1>Assignments</h1>
          <p className="subtitle">Everything you need to submit</p>
        </div>
        <button onClick={() => { reset(); setShowForm(v => !v); }}>
          {showForm ? 'Cancel' : '+ Add Assignment'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Assignment</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <FormField label="Subject">
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
                <option value="">— choose a subject —</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="SQL Normalisation Exercise" required />
            </FormField>
            <FormField label="Description (optional)">
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </FormField>
            <FormField label="Due Date">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Assignment'}</button>
            <button type="button" className="btn-secondary" onClick={() => { reset(); setShowForm(false); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="list">
        {items.length === 0 ? (
          <div className="empty">No assignments yet</div>
        ) : items.map(a => (
          <div key={a.id} className="list-item">
            <div className="title">{a.title}</div>
            <div className="meta">
              {a.subject_code} · due {a.due_date || 'TBA'} · {a.status}
            </div>
            {a.description && <div className="meta">{a.description}</div>}
          </div>
        ))}
      </div>
    </>
  );
}