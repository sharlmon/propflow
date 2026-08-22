import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Restoring your session…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(user.role)) return <Navigate to="/permission-denied" replace />;
  return <Outlet />;
}
