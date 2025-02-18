import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import Editor from './components/Editor';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Account from './components/Account';
import Stats from './components/Stats';
import Leaderboard from './components/Leaderboard';
import About from './components/About';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { font, theme } = useThemeStore();
  const { initializeAuth, loading } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
  }, [theme, font]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="min-h-screen editor-container flex items-center justify-center">
        <div className="animate-pulse opacity-75">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/write" element={<Editor />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <Stats />
              </PrivateRoute>
            }
          />
          {/* Redirect old routes */}
          <Route path="/editor" element={<Navigate to="/write" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;