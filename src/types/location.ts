export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface TrackedRoute {
  id?: string;
  userId: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  distance: number; // in meters
  duration: number; // in seconds
  averageSpeed?: number; // in m/s
  maxSpeed?: number; // in m/s
  path: LocationPoint[];
  status: 'active' | 'completed' | 'paused';
  workoutType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationState {
  currentPosition: LocationPoint | null;
  isTracking: boolean;
  route: LocationPoint[];
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  startTime: Date | null;
  error: string | null;
}

export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unavailable';