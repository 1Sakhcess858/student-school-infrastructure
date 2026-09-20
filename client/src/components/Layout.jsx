import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Student Hub</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/subjects">Subjects</NavLink>
          <NavLink to="/assignments">Assignments</NavLink>
          <NavLink to="/notices">Notices</NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}