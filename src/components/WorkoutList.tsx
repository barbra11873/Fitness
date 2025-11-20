import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Workout } from '../types/workout';
import WorkoutForm from './WorkoutForm';
import { toast } from 'react-toastify';

const WorkoutList: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>();

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(20) // Reduced limit for faster initial load
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workoutData: Workout[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        workoutData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Workout);
      });
      setWorkouts(workoutData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching workouts:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]); // More specific dependency

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
      toast.success('Workout deleted successfully!');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout. Please try again.');
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingWorkout(undefined);
  };

  const handleFormSuccess = () => {
    // The onSnapshot listener will automatically update the list
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-orange-500';
      case 'cardio': return 'bg-red-500';
      case 'flexibility': return 'bg-green-500';
      case 'sports': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'cardio': return '❤️';
      case 'flexibility': return '🧘';
      case 'sports': return '⚽';
      default: return '🏃';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Workouts</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center"
        >
          <span className="mr-2">+</span>
          Add Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-12 rounded-2xl text-center">
          <div className="text-6xl mb-4">🏋️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No workouts yet</h3>
          <p className="text-gray-400 mb-6">Start your fitness journey by adding your first workout!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            Add Your First Workout
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full ${getWorkoutTypeColor(workout.type)} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                    {getWorkoutTypeIcon(workout.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {workout.type} Workout
                      </h3>
                      <span className="text-sm text-gray-400">
                        {new Date(workout.date).toLocaleDateString()}
                      </span>
                    </div>
                    {workout.duration && (
                      <p className="text-sm text-orange-400 mb-2">
                        Duration: {workout.duration} minutes
                      </p>
                    )}
                    {workout.notes && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {workout.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                    title="Edit workout"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => workout.id && handleDelete(workout.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete workout"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <WorkoutForm
          workout={editingWorkout}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default WorkoutList;