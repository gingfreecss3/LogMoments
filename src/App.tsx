import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Capture from './pages/Capture';
import Timeline from './pages/Timeline';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import { Settings } from './components/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { syncService } from './lib/syncService';
import { initializeNetworkListener } from './hooks/useNetworkStatus';
import { testDatabase } from './lib/dbTest';
import { logger } from './lib/logger';
import { ErrorBoundary } from './components/ErrorBoundary';

// A protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    let removeListeners: (() => Promise<void>) | undefined;

    void (async () => {
      try {
        removeListeners = await initializeNetworkListener();
      } catch (error) {
        logger.error('Failed to initialize network listeners', error);
      }
    })();

    return () => {
      if (removeListeners) {
        removeListeners().catch((error) => {
          logger.error('Failed to clean up network listeners', error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    testDatabase()
      .then((success) => {
        logger.info(`Database test completed: ${success ? 'SUCCESS' : 'FAILED'}`);
      })
      .catch((error) => {
        logger.error('Database test execution failed', error);
      });
  }, []);

  useEffect(() => {
    if (!user?.id) {
      syncService.stopAutoSync();
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        await syncService.setUser(user.id);
        if (!isCancelled) {
          syncService.startAutoSync();
        }
      } catch (error) {
        logger.error('Failed to initialize sync service for user', error);
      }
    })();

    return () => {
      isCancelled = true;
      syncService.stopAutoSync();
    };
  }, [user?.id]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings userId={user?.id || ''} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
