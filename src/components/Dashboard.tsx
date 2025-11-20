import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkoutList from './WorkoutList';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-800 to-red-900">
      {/* Welcome Banner */}
      {userProfile && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-center">
            <h1 className="text-2xl font-bold">
              Welcome {userProfile.firstName} 😊
            </h1>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Fitness Dashboard
          </h1>
          <p className="text-3xl text-orange-300 font-semibold">Track your progress, crush your goals!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Workouts This Week</p>
                <p className="text-white text-3xl font-bold">5</p>
              </div>
              <div className="text-orange-200 text-4xl">💪</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Calories Burned</p>
                <p className="text-white text-3xl font-bold">2,450</p>
              </div>
              <div className="text-green-200 text-4xl">🔥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Minutes</p>
                <p className="text-white text-3xl font-bold">320</p>
              </div>
              <div className="text-blue-200 text-4xl">⏱️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Goals Achieved</p>
                <p className="text-white text-3xl font-bold">3</p>
              </div>
              <div className="text-purple-200 text-4xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Workout */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full mr-4">
                <span className="text-white text-2xl">🏋️</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Today's Workout</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-orange-400 font-semibold mb-2">Upper Body Strength</h3>
                <p className="text-gray-300 text-sm">Bench Press • Push-ups • Shoulder Press</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-green-400 text-sm">45 minutes</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Start Workout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 p-3 rounded-full mr-4">
                <span className="text-white text-2xl">📈</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Monday</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-green-400 text-sm">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tuesday</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                  <span className="text-blue-400 text-sm">70%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Wednesday</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                  <span className="text-orange-400 text-sm">90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-full mr-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Fitness Goals</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Lose 5kg</h3>
                  <p className="text-gray-400 text-sm">Target: March 2024</p>
                </div>
                <div className="text-right">
                  <span className="text-green-400 text-sm">60% Complete</span>
                  <div className="w-16 bg-gray-600 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Run 10km</h3>
                  <p className="text-gray-400 text-sm">Target: April 2024</p>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 text-sm">30% Complete</span>
                  <div className="w-16 bg-gray-600 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-3 rounded-full mr-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                Start Workout
              </button>
              <button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                Log Progress
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                Set Goal
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                View Stats
              </button>
            </div>
          </div>
        </div>

        {/* Workout Management Section */}
        <div className="mt-12">
          <WorkoutList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;