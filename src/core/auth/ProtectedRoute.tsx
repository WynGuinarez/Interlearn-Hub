import { Navigate, useLocation } from 'react-router';
import type { ReactElement } from 'react';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
