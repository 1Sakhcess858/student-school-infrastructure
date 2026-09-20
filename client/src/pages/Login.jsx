import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { setStudent } from '../auth';

export default function Login() {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { student } = await api.login(studentNumber.trim(), password);
      setStudent(student);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>Student Hub</h1>
        <p className="subtitle">Sign in with your student number</p>

        {error && <div className="error">{error}</div>}

        <label>
          Student Number
          <input
            type="text"
            value={studentNumber}
            onChange={e => setStudentNumber(e.target.value)}
            placeholder="e.g. ST10455429"
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="hint">
          Test login: <strong>ST10455429</strong> / <strong>test1234</strong>
        </p>
      </form>
    </div>
  );
}