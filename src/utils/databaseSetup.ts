import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize Firestore collections with sample data
 * This ensures collections exist and can be seen in Firebase console
 */
export const initializeDatabase = async (userId: string) => {
  try {
    console.log('Initializing database for user:', userId);

    // Create sample user profile if it doesn't exist
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      email: 'sample@example.com',
      firstName: 'Sample',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
    console.log('✅ User profile initialized');

    // Create sample workouts
    const sampleWorkouts = [
      {
        userId,
        date: new Date().toISOString(),
        type: 'strength',
        notes: 'Upper body strength training',
        duration: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        type: 'cardio',
        notes: 'Morning run',
        duration: 30,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
    ];

    for (const workout of sampleWorkouts) {
      await addDoc(collection(db, 'workouts'), workout);
    }
    console.log('✅ Sample workouts added');

    // Create sample goals
    const sampleGoals = [
      {
        userId,
        title: 'Lose 5kg',
        description: 'Weight loss goal for better health',
        type: 'weight',
        targetValue: 5,
        currentValue: 2,
        unit: 'kg',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        title: 'Run 10km',
        description: 'Build endurance with long distance running',
        type: 'distance',
        targetValue: 10,
        currentValue: 3,
        unit: 'km',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const goal of sampleGoals) {
      await addDoc(collection(db, 'goals'), goal);
    }
    console.log('✅ Sample goals added');

    console.log('🎉 Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Test database connection and permissions
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');

    // Try to read from a collection (this will create it if it doesn't exist)
    const testDoc = await addDoc(collection(db, 'test'), {
      test: true,
      timestamp: new Date(),
    });

    console.log('✅ Database connection successful, test document created:', testDoc.id);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  try {
    // Note: In a real app, you'd want to delete test documents
    // For now, we'll just log that cleanup would happen
    console.log('🧹 Test data cleanup would happen here');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};