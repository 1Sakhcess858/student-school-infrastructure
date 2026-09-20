import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../auth';

export default function Protected() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
