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
  onOptimisticAdd?: (workout: Omit<Workout, 'id'>) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ workout, onClose, onSuccess, onOptimisticAdd }) => {
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
        // For editing, wait for Firebase update
        await updateDoc(doc(db, 'workouts', workout.id), workoutData);
        toast.success('Workout updated successfully!');
        onSuccess();
        onClose();
      } else {
        // For new workouts, use optimistic updates
        const optimisticWorkout: Omit<Workout, 'id'> = {
          ...workoutData,
          createdAt: new Date(),
        };

        // Immediately add to UI (optimistic update)
        if (onOptimisticAdd) {
          onOptimisticAdd(optimisticWorkout);
        }

        // Close modal immediately for better UX
        onSuccess();
        onClose();
        toast.success('Workout added successfully!');

        // Sync with Firebase in background
        try {
          await addDoc(collection(db, 'workouts'), {
            ...workoutData,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error('Error syncing workout to Firebase:', error);
          // Could implement retry logic here if needed
          toast.error('Workout saved locally but failed to sync. Please check your connection.');
        }
      }
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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Workout' : 'Add New Workout'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Date</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            {errors.date && <p className="text-red-400 text-sm">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Workout Type</label>
            <select
              {...register('type', { required: 'Workout type is required' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">Select type</option>
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            {errors.type && <p className="text-red-400 text-sm">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="0"
              {...register('duration', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Add workout notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;