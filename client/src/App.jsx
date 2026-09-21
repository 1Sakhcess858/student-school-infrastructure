import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Protected from './components/Protected';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Assignments from './pages/Assignments';
import Notices from './pages/Notices';
import Timetable from './pages/Timetable';
import Profile from './pages/Profile';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Protected />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="notices" element={<Notices />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}