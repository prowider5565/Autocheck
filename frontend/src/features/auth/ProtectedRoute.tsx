import { Navigate, Outlet } from 'react-router-dom';
import { SplashScreen } from '../../components/ui';
import type { User } from '../../types';

export function ProtectedRoute({
  currentUser,
  authResolved,
}: {
  currentUser: User | null;
  authResolved: boolean;
}) {
  if (!authResolved) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
