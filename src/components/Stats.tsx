import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Workout } from '../types/workout';
import type { Goal } from '../types/goal';

const Stats: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch workouts
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid)
        );
        const workoutsSnapshot = await getDocs(workoutsQuery);
        const workoutsData = workoutsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        setWorkouts(workoutsData);

        // Fetch goals
        const goalsQuery = query(
          collection(db, 'goals'),
          where('userId', '==', user.uid)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsData = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Goal[];
        setGoals(goalsData);

      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate statistics
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const workoutsThisWeek = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const activeGoals = goals.filter(goal => goal.status === 'active').length;

  // Group workouts by type
  const workoutTypes = workouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Loading your statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Your Fitness Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            ×
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">🏋️</div>
            <div className="text-white text-3xl font-bold mb-1">{totalWorkouts}</div>
            <div className="text-orange-100 text-sm">Total Workouts</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-white text-3xl font-bold mb-1">{totalDuration}</div>
            <div className="text-green-100 text-sm">Minutes Trained</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-white text-3xl font-bold mb-1">{workoutsThisWeek}</div>
            <div className="text-blue-100 text-sm">This Week</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-white text-3xl font-bold mb-1">{completedGoals}</div>
            <div className="text-purple-100 text-sm">Goals Completed</div>
          </div>
        </div>

        {/* Workout Types Breakdown */}
        <div className="bg-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Workout Types</h3>
          <div className="space-y-3">
            {Object.entries(workoutTypes).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-300 capitalize">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(count / totalWorkouts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(workoutTypes).length === 0 && (
              <p className="text-gray-400 text-center">No workouts recorded yet</p>
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Goals Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{completedGoals}</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{activeGoals}</div>
              <div className="text-gray-300 text-sm">Active</div>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Workouts</h3>
          <div className="space-y-3">
            {workouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="bg-gray-600/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium capitalize">{workout.type} Workout</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(workout.date).toLocaleDateString()}
                      {workout.duration && ` • ${workout.duration} minutes`}
                    </div>
                  </div>
                  <div className="text-orange-400 text-sm">
                    {workout.notes ? workout.notes.substring(0, 30) + '...' : 'No notes'}
                  </div>
                </div>
              </div>
            ))}
            {workouts.length === 0 && (
              <p className="text-gray-400 text-center">No workouts recorded yet</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            Close Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stats;