import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  role: Role;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    // If they are logged in but trying to access the wrong role's page,
    // redirect them to their actual dashboard.
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}
