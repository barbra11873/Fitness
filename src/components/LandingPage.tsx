import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register: registerUser } = useAuth();

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 🎉');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await registerUser(data.email, data.password);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        createdAt: new Date(),
      });

      toast.success(`Welcome ${data.firstName}! Your account has been created. 🎉`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="text-8xl mb-8 animate-bounce">💪</div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              WELCOME TO YOUR
            </h1>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FITNESS JOURNEY
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your body, crush your goals, and become the best version of yourself!
              Track workouts, monitor progress, and stay motivated on your fitness adventure.
            </p>

            {/* Fitness Categories */}
            <div className="flex justify-center flex-wrap gap-6 mb-12">
              <div className="flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-full">
                <span className="text-2xl">🏋️</span>
                <span className="text-orange-100 font-medium">Strength Training</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full">
                <span className="text-2xl">❤️</span>
                <span className="text-green-100 font-medium">Cardio Fitness</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full">
                <span className="text-2xl">🧘</span>
                <span className="text-blue-100 font-medium">Flexibility</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full">
                <span className="text-2xl">🏆</span>
                <span className="text-purple-100 font-medium">Goal Tracking</span>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex bg-gray-700/50">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    isLogin
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    !isLogin
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="p-8 space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Welcome Back!</h3>
                    <p className="text-gray-400">Sign in to continue your fitness journey</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      {...loginForm.register('email', { required: 'Email is required' })}
                      type="email"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      {...loginForm.register('password', { required: 'Password is required' })}
                      type="password"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="p-8 space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Join the Journey!</h3>
                    <p className="text-gray-400">Create your account and start transforming</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">First Name</label>
                      <input
                        {...registerForm.register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John"
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Last Name</label>
                      <input
                        {...registerForm.register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      {...registerForm.register('email', { required: 'Email is required' })}
                      type="email"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Password</label>
                    <input
                      {...registerForm.register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      type="password"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Create a strong password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                    <input
                      {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                      type="password"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;