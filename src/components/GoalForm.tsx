import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import type { GoalFormData } from '../types/goal';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface GoalFormProps {
  goal?: any; // For editing existing goals
  onClose: () => void;
  onSuccess: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<GoalFormData>({
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description,
      type: goal.type,
      targetValue: goal.targetValue,
      unit: goal.unit,
      targetDate: goal.targetDate?.split('T')[0] || '',
    } : {
      type: 'weight',
      unit: 'kg',
    }
  });

  const selectedType = watch('type');

  const getUnitOptions = (type: string) => {
    switch (type) {
      case 'weight': return ['kg', 'lbs'];
      case 'distance': return ['km', 'miles'];
      case 'time': return ['minutes', 'hours'];
      case 'reps': return ['reps'];
      default: return ['units'];
    }
  };

  const onSubmit = async (data: GoalFormData) => {
    if (!user) {
      console.error('No user authenticated');
      toast.error('You must be logged in');
      return;
    }

    console.log('User authenticated:', user.uid, user.email);

    // Optimistic update - show success immediately
    const isNewGoal = !goal?.id;
    toast.success(isNewGoal ? 'Goal created successfully!' : 'Goal updated successfully!');
    onSuccess();
    onClose();

    // Perform actual database operation in background
    try {
      const goalData = {
        userId: user.uid,
        title: data.title,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue,
        currentValue: goal?.currentValue || 0,
        unit: data.unit,
        targetDate: data.targetDate,
        status: 'active',
        createdAt: goal?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (goal?.id) {
        // Update existing goal
        console.log('Updating goal:', goal.id, goalData);
        await updateDoc(doc(db, 'goals', goal.id), goalData);
        console.log('Goal updated successfully');
      } else {
        // Create new goal
        console.log('Creating new goal:', goalData);
        const docRef = await addDoc(collection(db, 'goals'), goalData);
        console.log('Goal created with ID:', docRef.id);
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      // Revert optimistic update on error
      toast.error(`Failed to save goal to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Note: In a real app, you'd want to revert the UI state here
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {goal ? 'Edit Goal' : 'Set New Goal'}
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
            <label className="block text-sm text-gray-300 mb-2">Goal Title</label>
            <input
              {...register('title', { required: 'Goal title is required' })}
              type="text"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Lose 5kg"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Goal Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weight">Weight Loss</option>
                <option value="distance">Distance</option>
                <option value="time">Time</option>
                <option value="reps">Reps/Strength</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Unit</label>
              <select
                {...register('unit')}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getUnitOptions(selectedType).map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Target Value</label>
            <input
              {...register('targetValue', {
                required: 'Target value is required',
                min: { value: 0.1, message: 'Value must be greater than 0' }
              })}
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5"
            />
            {errors.targetValue && <p className="text-red-400 text-sm mt-1">{errors.targetValue.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Target Date</label>
            <input
              {...register('targetDate', { required: 'Target date is required' })}
              type="date"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.targetDate && <p className="text-red-400 text-sm mt-1">{errors.targetDate.message}</p>}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;