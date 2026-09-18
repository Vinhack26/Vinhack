import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from '../../router';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center animate-pulse mb-4">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
