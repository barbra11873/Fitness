import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Workout, WorkoutFormData } from '../types/workout';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface WorkoutFormProps {
  workout?: Workout;
  onClose: () => void;
  onSuccess: () => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ workout, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<WorkoutFormData>();

  const isEditing = !!workout;

  useEffect(() => {
    if (workout) {
      setValue('date', workout.date.split('T')[0]); // Convert to date input format
      setValue('type', workout.type);
      setValue('notes', workout.notes);
      setValue('duration', workout.duration || 0);
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setValue('date', today);
    }
  }, [workout, setValue]);

  const onSubmit = async (data: WorkoutFormData) => {
    if (!user) {
      toast.error('You must be logged in to save workouts');
      return;
    }

    setLoading(true);
    try {
      const workoutData = {
        userId: user.uid,
        date: new Date(data.date).toISOString(),
        type: data.type,
        notes: data.notes.trim(),
        duration: data.duration || 0,
        updatedAt: new Date(),
      };

      if (isEditing && workout?.id) {
        await updateDoc(doc(db, 'workouts', workout.id), workoutData);
        toast.success('Workout updated successfully!');
      } else {
        await addDoc(collection(db, 'workouts'), {
          ...workoutData,
          createdAt: new Date(),
        });
        toast.success('Workout added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving workout:', error);
      const errorMessage = error?.message || 'Failed to save workout. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Workout' : 'Add New Workout'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Type
            </label>
            <select
              {...register('type', { required: 'Workout type is required' })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              {...register('duration', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Add workout notes, exercises, or observations..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                isEditing ? 'Update Workout' : 'Add Workout'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;