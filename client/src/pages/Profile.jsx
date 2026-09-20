import { useEffect, useState } from 'react';
import { api } from '../api';
import { getStudent, setStudent } from '../auth';
import FormField from '../components/FormField';

export default function Profile() {
  const auth = getStudent();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth) return;
    api.getProfile(auth.id)
      .then(setForm)
      .catch(err => setError(err.message));
  }, []);

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const updated = await api.updateProfile(auth.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        programme: form.programme?.trim() || null,
        year: form.year ? Number(form.year) : null,
      });
      setForm(updated);
      setStudent(updated); // refresh sidebar name
      setMessage('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="subtitle">Loading…</p>;

  return (
    <>
      <h1>My Profile</h1>
      <p className="subtitle">Your academic information</p>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-ok">{message}</div>}

        <div className="form-grid">
          <FormField label="Student Number (read-only)">
            <input value={form.student_number} readOnly />
          </FormField>
          <FormField label="Full Name">
            <input value={form.name} onChange={e => update('name', e.target.value)} required />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </FormField>
          <FormField label="Programme">
            <input value={form.programme || ''} onChange={e => update('programme', e.target.value)} />
          </FormField>
          <FormField label="Year">
            <input type="number" min="1" max="6" value={form.year || ''} onChange={e => update('year', e.target.value)} />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </form>
    </>
  );
}