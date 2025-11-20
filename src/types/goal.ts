export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description: string;
  type: 'weight' | 'distance' | 'time' | 'reps' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string; // kg, lbs, km, miles, minutes, hours, reps, etc.
  targetDate: string; // ISO date string
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  title: string;
  description: string;
  type: Goal['type'];
  targetValue: number;
  unit: string;
  targetDate: string;
}

export type GoalType = Goal['type'];
export type GoalStatus = Goal['status'];