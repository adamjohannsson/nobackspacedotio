import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}