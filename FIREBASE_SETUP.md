# Firebase Setup Guide for Fitness App

## 🚀 Quick Setup

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** authentication
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Choose "Start in test mode" or "Start in production mode"

### 2. Update Security Rules
Copy the following rules to your Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read and write their own workouts
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Users can read and write their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Allow test collection for debugging (remove in production)
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Update Firebase Config
Update `src/firebase.ts` with your Firebase project config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📊 Database Collections

Your app will create these collections automatically:

### `users/{userId}`
- User profile data
- Created when user registers
- Contains: email, firstName, lastName, createdAt, updatedAt

### `workouts/{userId}`
- User's workout records
- Contains: date, type, notes, duration, createdAt, updatedAt
- All workouts are user-specific

### `goals/{userId}`
- User's fitness goals
- Contains: title, description, type, targetValue, currentValue, unit, targetDate, status
- Progress tracking for each goal

## 🧪 Testing Database Setup

1. **Start the app**: `npm run dev`
2. **Register a new account** with email/password and name
3. **Database automatically initializes** with sample data during registration
4. **Login and start using the app** - all data appears in Firebase Console
5. **Check Firebase Console** - you should see:
   - `users` collection with your profile
   - `workouts` collection with sample workouts
   - `goals` collection with sample goals

## 🔧 Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify rules allow authenticated users to write

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password authentication in Firebase Console
- Go to Authentication → Sign-in method → Enable Email/Password

### Data not showing in Firebase Console
- Check browser console for errors
- Verify Firebase config is correct
- Ensure Firestore is enabled in your project
- Try the "Test Connection" and "Initialize Database" buttons

### Collections not visible
- Collections are created automatically when first document is added
- Use "Initialize Database" to create sample data
- Check Firestore Database → Data tab in Firebase Console

## 📱 App Features

Once setup is complete, your fitness app includes:

- ✅ **User Authentication** (Register/Login/Logout)
- ✅ **Personalized Dashboard** with welcome message
- ✅ **Workout Management** (Create, Read, Update, Delete)
- ✅ **Goal Setting & Tracking** with progress bars
- ✅ **Statistics Dashboard** with comprehensive analytics
- ✅ **Responsive Design** for all devices
- ✅ **Real-time Data Sync** with Firebase

## 🎯 Next Steps

1. Complete Firebase setup above
2. Test the app functionality
3. Customize the design and features as needed
4. Deploy to production when ready

Happy coding! 💪🔥