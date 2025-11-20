export interface Workout {
  id?: string;
  userId: string;
  date: string; // ISO date string
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  notes: string;
  duration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutFormData {
  date: string;
  type: Workout['type'];
  notes: string;
  duration?: number;
}

export type WorkoutType = Workout['type'];