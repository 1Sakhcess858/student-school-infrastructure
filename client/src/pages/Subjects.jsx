import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setSubjects(await api.getSubjects());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setCode('');
    setName('');
    setDescription('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createSubject({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
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
          <h1>My Subjects</h1>
          <p className="subtitle">All subjects you are enrolled in</p>
        </div>
        <button onClick={() => { reset(); setShowForm(v => !v); }}>
          {showForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Subject</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <FormField label="Code">
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="DB201" required />
            </FormField>
            <FormField label="Name">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Database 2" required />
            </FormField>
            <FormField label="Description (optional)">
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Subject'}</button>
            <button type="button" className="btn-secondary" onClick={() => { reset(); setShowForm(false); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="list">
        {subjects.length === 0 ? (
          <div className="empty">No subjects yet</div>
        ) : subjects.map(s => (
          <div key={s.id} className="list-item">
            <div className="title">{s.code} — {s.name}</div>
            {s.description && <div className="meta">{s.description}</div>}
          </div>
        ))}
      </div>
    </>
  );
}