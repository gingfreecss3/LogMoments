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

// A protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

initializeNetworkListener().catch(console.error);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // Run database test on app load
    testDatabase().then(success => {
      console.log('Database test completed:', success ? 'SUCCESS' : 'FAILED');
    });

    // Initialize sync service with current user
    if (user?.id) {
      syncService.setUser(user.id);
      syncService.startAutoSync();
    }
    
    // Clean up on unmount
    return () => {
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