import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">💪</div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<LoadingSpinner />}>
        <LandingPage />
        <ToastContainer />
      </Suspense>
    );
  }

  // Show dashboard for authenticated users
  console.log('Showing Dashboard for authenticated user:', user.email);
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Keep old routes for backward compatibility */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
