import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard.tsx';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-8xl mb-8 animate-bounce">💪</div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            WELCOME TO YOUR
          </h1>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FITNESS JOURNEY
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get ready to transform your body, crush your goals, and become the best version of yourself!
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2 text-orange-400">
              <span className="text-2xl">🏋️</span>
              <span className="font-semibold">Strength</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <span className="text-2xl">❤️</span>
              <span className="font-semibold">Cardio</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <span className="text-2xl">🧘</span>
              <span className="font-semibold">Flexibility</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <span className="text-2xl">🏆</span>
              <span className="font-semibold">Goals</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="inline-flex items-center space-x-2 bg-orange-600/20 px-6 py-3 rounded-full">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-400 border-t-transparent"></div>
              <span className="text-orange-400 font-medium">Preparing your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
