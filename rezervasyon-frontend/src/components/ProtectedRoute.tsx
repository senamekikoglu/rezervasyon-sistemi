import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

function ProtectedRoute({ children }: Props) {
  const kullaniciStr = localStorage.getItem('kullanici');

  if (!kullaniciStr) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;