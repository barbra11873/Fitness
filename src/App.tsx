import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('AppContent render:', { user: !!user, loading, userEmail: user?.email });

  // Show loading screen during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-gray-400">Preparing your fitness dashboard</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    console.log('Showing LandingPage for unauthenticated user');
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  // Show dashboard for authenticated users
  console.log('Showing Dashboard for authenticated user:', user.email);
  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Keep old routes for backward compatibility */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
