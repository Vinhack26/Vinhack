import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from './router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IncidentsList from './pages/IncidentsList';
import IncidentWorkspace from './pages/IncidentWorkspace';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IncidentsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IncidentWorkspace />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
