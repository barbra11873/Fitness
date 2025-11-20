import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import WorkoutList from './WorkoutList';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Dashboard: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const displayName = (
    userProfile?.firstName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Fitness Champion'
  ).replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter

  // Debug logging to see what name is being used
  console.log('Dashboard displayName debug:', {
    userProfileFirstName: userProfile?.firstName,
    userDisplayName: user?.displayName,
    userEmail: user?.email,
    finalDisplayName: displayName
  });
  const capitalize = (s: string) => s ? (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) : s;
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Banner Skeleton */}
          <div className="bg-orange-600 text-white py-6 px-4 mb-8 rounded-lg animate-pulse">
            <div className="container mx-auto text-center">
              <div className="h-8 bg-orange-500 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-orange-400 rounded w-48 mx-auto"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse">
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-600 rounded-full mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-16 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-600 rounded w-32"></div>
                      <div className="h-3 bg-gray-600 rounded w-20"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-12 bg-gray-600 rounded"></div>
                      <div className="h-6 w-14 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Welcome Banner */}
      {(userProfile || user) && (
        <div className="bg-orange-600 text-white py-6 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2">
              Welcome {capitalize(displayName)} 😊
            </h1>
            <p className="text-orange-100">Ready to crush your fitness goals today!</p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => {
                  setEditedName(userProfile?.firstName || user?.displayName || '');
                  setIsEditing(true);
                }}
                className="text-sm bg-orange-700/30 hover:bg-orange-700/50 px-3 py-1 rounded transition-colors"
              >
                Edit Name
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                    toast.success('Logged out successfully');
                  } catch (error) {
                    toast.error('Error logging out');
                  }
                }}
                className="text-sm bg-red-600/30 hover:bg-red-600/50 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>

            {isEditing && (
              <div className="mt-3 flex items-center justify-center space-x-2">
                <input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-1 rounded text-black text-sm"
                  placeholder="First name"
                />
                <button
                  onClick={async () => {
                    if (!user) return toast.error('No user signed in');
                    const newName = editedName.trim();
                    if (!newName) return toast.error('Name cannot be empty');
                    setSavingName(true);
                    try {
                      const userDocRef = doc(db, 'users', user.uid);
                      await setDoc(userDocRef, { firstName: newName }, { merge: true });
                      // Removed localFirstName state, relying on refreshProfile() to update global profile
                      try {
                        await refreshProfile();
                      } catch (err) {
                        console.warn('refreshProfile failed', err);
                      }
                      setIsEditing(false);
                      toast.success('Name updated');
                    } catch (err) {
                      console.error('Failed to update name', err);
                      toast.error('Failed to update name');
                    } finally {
                      setSavingName(false);
                    }
                  }}
                  className="bg-white text-orange-600 px-3 py-1 rounded font-medium text-sm"
                  disabled={savingName}
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded bg-orange-700/30 text-white text-sm hover:bg-orange-700/50"
                  disabled={savingName}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Fitness Dashboard
          </h1>
          <p className="text-xl text-orange-400 mb-4">Track your progress, crush your goals!</p>

          {/* Motivational Quote */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 max-w-2xl mx-auto">
            <blockquote className="text-gray-300 italic text-lg mb-2">
              "The only bad workout is the one that didn't happen."
            </blockquote>
            <cite className="text-orange-400 font-medium">— Fitness Proverb</cite>
          </div>
        </div>

        {/* Today's Workout Highlight */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Today's Workout</h2>
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🏋️</div>
              <div className="text-orange-100 font-medium">Upper Body</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-orange-100 font-medium">45 Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-orange-100 font-medium">High Intensity</div>
            </div>
          </div>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105">
            Start Today's Workout
          </button>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">💪</div>
            <div className="text-white text-3xl font-bold mb-1">5</div>
            <div className="text-orange-100 text-sm font-medium">Total Workouts</div>
            <div className="text-orange-200 text-xs mt-2">This Week</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🔥</div>
            <div className="text-white text-3xl font-bold mb-1">2.4k</div>
            <div className="text-green-100 text-sm font-medium">Calories Burned</div>
            <div className="text-green-200 text-xs mt-2">This Month</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-white text-3xl font-bold mb-1">320</div>
            <div className="text-blue-100 text-sm font-medium">Active Minutes</div>
            <div className="text-blue-200 text-xs mt-2">This Week</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-white text-3xl font-bold mb-1">3</div>
            <div className="text-purple-100 text-sm font-medium">Goals Achieved</div>
            <div className="text-purple-200 text-xs mt-2">This Month</div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Weekly Progress</h3>
          <div className="grid grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-gray-400 text-sm mb-2">{day}</div>
                <div className="h-20 bg-gray-700 rounded-lg flex items-end justify-center pb-2">
                  <div
                    className="bg-gradient-to-t from-orange-500 to-red-500 rounded-lg w-8 transition-all duration-500"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  ></div>
                </div>
                <div className="text-white text-xs mt-1 font-medium">
                  {Math.floor(Math.random() * 90 + 10)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Goals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              Active Goals
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Lose 5kg</span>
                  <span className="text-green-400 text-sm">60% Complete</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="text-gray-400 text-xs mt-1">Target: March 2024</div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Run 10km</span>
                  <span className="text-blue-400 text-sm">30% Complete</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="text-gray-400 text-xs mt-1">Target: April 2024</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center">
                <span className="text-2xl mb-2">🏋️</span>
                <span className="text-sm">Start Workout</span>
              </button>
              <button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center">
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm">View Stats</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center">
                <span className="text-2xl mb-2">🎯</span>
                <span className="text-sm">Set Goal</span>
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex flex-col items-center">
                <span className="text-2xl mb-2">📝</span>
                <span className="text-sm">Log Progress</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workout Management */}
        <div className="bg-gray-800 rounded-lg p-6">
          <WorkoutList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;