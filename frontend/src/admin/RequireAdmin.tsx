import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../store/useAuth';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
