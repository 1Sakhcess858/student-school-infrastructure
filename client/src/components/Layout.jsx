import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStudent, clearStudent } from '../auth';

export default function Layout() {
  const navigate = useNavigate();
  const student = getStudent();

  function handleLogout() {
    clearStudent();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Student Hub</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/subjects">Subjects</NavLink>
          <NavLink to="/assignments">Assignments</NavLink>
          <NavLink to="/notices">Notices</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>

        <div className="sidebar-footer">
          {student && (
            <div className="who">{student.name}</div>
          )}
          <button className="logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}