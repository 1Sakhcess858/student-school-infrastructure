import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [status, setStatus] = useState('present');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [r, s, sub] = await Promise.all([
        api.getAttendance(),
        api.getAttendanceSummary(),
        api.getSubjects(),
      ]);
      setRecords(r);
      setSummary(s);
      setSubjects(sub);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setSubjectId('');
    setDate(todayStr());
    setStatus('present');
    setError('');
    setEditingId(null);
  }

  function startCreate() { reset(); setShowForm(true); }

  function startEdit(r) {
    setEditingId(r.id);
    setSubjectId(String(r.subject_id));
    setDate(typeof r.date === 'string' ? r.date.slice(0, 10) : todayStr());
    setStatus(r.status);
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
        subject_id: Number(subjectId),
        date,
        status,
      };
      if (editingId) {
        await api.updateAttendance(editingId, data);
      } else {
        await api.createAttendance(data);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Delete record for ${r.subject_code} on ${r.date}?`)) return;
    try {
      await api.deleteAttendance(r.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function pct(present, total) {
    if (total === 0) return '—';
    return Math.round((present / total) * 100) + '%';
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Attendance</h1>
          <p className="subtitle">Track your class attendance</p>
        </div>
        {!showForm && <button onClick={startCreate}>+ Add Record</button>}
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Record' : 'New Record'}</h3>
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
            <FormField label="Date">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </FormField>
            <FormField label="Status">
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Record'}
            </button>
            <button type="button" className="btn-secondary" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      <h2 className="section-title">Summary by Subject</h2>
      <div className="attendance-summary">
        {summary.length === 0 ? (
          <div className="empty">No subjects yet</div>
        ) : summary.map(s => (
          <div key={s.subject_id} className="summary-card">
            <div className="summary-code">{s.subject_code}</div>
            <div className="summary-name">{s.subject_name}</div>
            <div className="summary-pct">{pct(s.present + s.late, s.total)}</div>
            <div className="summary-breakdown">
              <span className="ok">{s.present}P</span> · <span className="warn">{s.late}L</span> · <span className="bad">{s.absent}A</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Recent Records</h2>
      <div className="list">
        {records.length === 0 ? (
          <div className="empty">No attendance records yet</div>
        ) : records.map(r => {
          const dateStr = typeof r.date === 'string' ? r.date.slice(0, 10) : '';
          return (
            <div key={r.id} className="list-item">
              <div className="content">
                <div className="title">
                  {r.subject_code} · <span className={`status-${r.status}`}>{r.status}</span>
                </div>
                <div className="meta">{dateStr}</div>
              </div>
              <div className="actions">
                <button className="btn-edit" onClick={() => startEdit(r)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(r)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}