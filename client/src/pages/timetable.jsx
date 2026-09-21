import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField from '../components/FormField';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [t, s] = await Promise.all([api.getTimetable(), api.getSubjects()]);
      setEntries(t);
      setSubjects(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setSubjectId('');
    setDay('Monday');
    setStartTime('');
    setEndTime('');
    setRoom('');
    setError('');
    setEditingId(null);
  }

  function startCreate() { reset(); setShowForm(true); }

  function startEdit(t) {
    setEditingId(t.id);
    setSubjectId(String(t.subject_id));
    setDay(t.day_of_week);
    setStartTime(t.start_time);
    setEndTime(t.end_time);
    setRoom(t.room || '');
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
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        room: room.trim() || null,
      };
      if (editingId) {
        await api.updateTimetable(editingId, data);
      } else {
        await api.createTimetable(data);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!window.confirm(`Delete ${t.subject_code} on ${t.day_of_week}?`)) return;
    try {
      await api.deleteTimetable(t.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Timetable</h1>
          <p className="subtitle">Your weekly class schedule</p>
        </div>
        {!showForm && <button onClick={startCreate}>+ Add Class</button>}
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Class' : 'New Class'}</h3>
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
            <FormField label="Day">
              <select value={day} onChange={e => setDay(e.target.value)} required>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Start Time">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </FormField>
            <FormField label="End Time">
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </FormField>
            <FormField label="Room (optional)">
              <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Lab 3" />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Class'}
            </button>
            <button type="button" className="btn-secondary" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="timetable">
        {DAYS.map(d => {
          const dayEntries = entries.filter(e => e.day_of_week === d);
          return (
            <div key={d} className="day-column">
              <h3 className="day-header">{d}</h3>
              {dayEntries.length === 0 ? (
                <div className="empty small">—</div>
              ) : dayEntries.map(e => (
                <div key={e.id} className="class-card">
                  <div className="class-time">
                    {e.start_time}–{e.end_time}
                  </div>
                  <div className="class-title">{e.subject_code}</div>
                  <div className="class-subject">{e.subject_name}</div>
                  {e.room && <div className="class-room">{e.room}</div>}
                  <div className="class-actions">
                    <button className="btn-edit" onClick={() => startEdit(e)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(e)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}