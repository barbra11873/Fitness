import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import type { LocationPoint, LocationState, TrackedRoute } from '../types/location';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LocationTracker: React.FC = () => {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [locationState, setLocationState] = useState<LocationState>({
    currentPosition: null,
    isTracking: false,
    route: [],
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    startTime: null,
    error: null,
  });

  const [routeName, setRouteName] = useState('');
  const [workoutType, setWorkoutType] = useState('cardio');

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1: LocationPoint, point2: LocationPoint): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({ ...prev, error: 'Geolocation is not supported by this browser' }));
      return false;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'denied') {
        setLocationState(prev => ({ ...prev, error: 'Location permission denied. Please enable location access.' }));
        return false;
      }
      return true;
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return true;
    }
  };

  // Start location tracking
  const startTracking = async () => {
    if (!user) {
      toast.error('You must be logged in to track location');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    if (!routeName.trim()) {
      toast.error('Please enter a route name');
      return;
    }

    setLocationState(prev => ({
      ...prev,
      isTracking: true,
      route: [],
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      startTime: new Date(),
      error: null,
    }));

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
        };

        setLocationState(prev => {
          const newRoute = [...prev.route, newPoint];
          let newDistance = prev.distance;

          // Calculate distance if we have at least 2 points
          if (newRoute.length >= 2) {
            const lastTwoPoints = newRoute.slice(-2);
            newDistance += calculateDistance(lastTwoPoints[0], lastTwoPoints[1]);
          }

          // Calculate duration
          const duration = prev.startTime ? (Date.now() - prev.startTime.getTime()) / 1000 : 0;

          // Calculate speeds
          const averageSpeed = duration > 0 ? newDistance / duration : 0;
          const currentSpeed = newPoint.speed || 0;
          const maxSpeed = Math.max(prev.maxSpeed, currentSpeed);

          return {
            ...prev,
            currentPosition: newPoint,
            route: newRoute,
            distance: newDistance,
            duration,
            averageSpeed,
            maxSpeed,
          };
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location tracking error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationState(prev => ({ ...prev, error: errorMessage }));
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    // Update duration every second
    intervalRef.current = setInterval(() => {
      setLocationState(prev => ({
        ...prev,
        duration: prev.startTime ? (Date.now() - prev.startTime.getTime()) / 1000 : 0,
      }));
    }, 1000);

    toast.success('Location tracking started! 🏃‍♂️');
  };

  // Stop location tracking
  const stopTracking = async () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save route to Firebase if we have data
    if (locationState.route.length > 0 && user && locationState.startTime) {
      try {
        const routeData: Omit<TrackedRoute, 'id'> = {
          userId: user.uid,
          name: routeName,
          startTime: locationState.startTime,
          endTime: new Date(),
          distance: locationState.distance,
          duration: locationState.duration,
          averageSpeed: locationState.averageSpeed,
          maxSpeed: locationState.maxSpeed,
          path: locationState.route,
          status: 'completed',
          workoutType,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await addDoc(collection(db, 'routes'), routeData);
        toast.success('Route saved successfully! 📍');
      } catch (error) {
        console.error('Error saving route:', error);
        toast.error('Failed to save route');
      }
    }

    setLocationState(prev => ({
      ...prev,
      isTracking: false,
      startTime: null,
    }));

    if (locationState.route.length > 0) {
      toast.success('Location tracking stopped! 🛑');
    }
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format speed
  const formatSpeed = (mps: number): string => {
    const kmh = mps * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full mr-4">
          <span className="text-white text-2xl">📍</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Live Location Tracker</h2>
      </div>

      {/* Route Setup */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Route Name
          </label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g., Morning Run, Evening Walk"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            disabled={locationState.isTracking}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Workout Type
          </label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            disabled={locationState.isTracking}
          >
            <option value="cardio">Cardio</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tracking Controls */}
      <div className="mb-6">
        {!locationState.isTracking ? (
          <button
            onClick={startTracking}
            disabled={!routeName.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
          >
            🚀 Start Location Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            🛑 Stop Tracking & Save Route
          </button>
        )}
      </div>

      {/* Error Display */}
      {locationState.error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{locationState.error}</p>
        </div>
      )}

      {/* Live Stats */}
      {locationState.isTracking && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{formatDistance(locationState.distance)}</div>
            <div className="text-sm text-gray-300">Distance</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{formatDuration(locationState.duration)}</div>
            <div className="text-sm text-gray-300">Duration</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400">{formatSpeed(locationState.averageSpeed)}</div>
            <div className="text-sm text-gray-300">Avg Speed</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-400">{locationState.route.length}</div>
            <div className="text-sm text-gray-300">Points</div>
          </div>
        </div>
      )}

      {/* Current Location */}
      {locationState.currentPosition && (
        <div className="bg-gray-700/30 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">📍 Current Location</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Latitude:</span>
              <span className="text-white ml-2">{locationState.currentPosition.latitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-300">Longitude:</span>
              <span className="text-white ml-2">{locationState.currentPosition.longitude.toFixed(6)}</span>
            </div>
            {locationState.currentPosition.accuracy && (
              <div>
                <span className="text-gray-300">Accuracy:</span>
                <span className="text-white ml-2">±{locationState.currentPosition.accuracy.toFixed(0)}m</span>
              </div>
            )}
            {locationState.currentPosition.speed && (
              <div>
                <span className="text-gray-300">Speed:</span>
                <span className="text-white ml-2">{formatSpeed(locationState.currentPosition.speed)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Preview */}
      {locationState.route.length > 1 && (
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">🗺️ Route Preview</h3>
          <div className="text-sm text-gray-300 mb-2">
            Tracking {locationState.route.length} location points
          </div>
          <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-gray-400 text-sm">Map visualization would go here</div>
              <div className="text-gray-500 text-xs mt-1">
                (Integrate with Google Maps or Mapbox for full map view)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">📋 How to Use:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Enter a route name and select workout type</li>
          <li>• Click "Start Location Tracking" to begin</li>
          <li>• Allow location permission when prompted</li>
          <li>• Walk, run, or move around to track your route</li>
          <li>• Click "Stop Tracking" to save your route</li>
          <li>• Routes are automatically saved to your profile</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationTracker;