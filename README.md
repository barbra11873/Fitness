# 💪 Fitness Tracker App

A modern, full-featured fitness tracking web application built with React, TypeScript, and Firebase. Track your workouts, set fitness goals, and monitor your progress with a beautiful, responsive interface.

## 🌟 Features

### **User Authentication**
- Secure user registration and login
- Password reset functionality
- Protected routes and user sessions
- Personalized welcome messages

### **Workout Management**
- **Create Workouts**: Add workouts with date, type, duration, and notes
- **View Workouts**: Display all your workout history
- **Edit Workouts**: Update workout details anytime
- **Delete Workouts**: Remove workouts from your history
- **Workout Types**: Strength, Cardio, Flexibility, Sports, and Custom

### **Goal Setting & Tracking**
- **Set Fitness Goals**: Create goals with targets and deadlines
- **Progress Tracking**: Visual progress bars and completion status
- **Goal Categories**: Weight loss, distance running, strength training, etc.
- **Achievement System**: Track completed goals and milestones

### **Live Location Tracking**
- **GPS Route Tracking**: Track your walks, runs, and outdoor activities
- **Real-time Distance**: Live distance calculation using GPS coordinates
- **Route Visualization**: View your path and route statistics
- **Speed Monitoring**: Track average and maximum speeds
- **Route History**: Save and review completed routes
- **Geolocation API**: Browser-based location tracking with high accuracy

### **Statistics & Analytics**
- **Comprehensive Dashboard**: Overview of your fitness journey
- **Progress Charts**: Visual representation of workout frequency
- **Goal Analytics**: Completion rates and progress tracking
- **Workout Breakdown**: Analysis by workout type and duration

### **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Modern fitness-themed color scheme
- **Smooth Animations**: Interactive hover effects and transitions
- **Glassmorphism Effects**: Contemporary design with backdrop blur
- **Loading States**: Professional loading indicators and feedback

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore Database)
- **Build Tool**: Vite
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Emoji-based iconography
- **Performance**: Lazy loading, optimistic updates, caching

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Copy your Firebase config to `src/firebase.ts`

4. **Configure Firestore Security Rules**
   - Copy the rules from `firestore.rules` to your Firebase Console
   - This ensures proper data security and access control

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Register a new account
   - Start tracking your fitness journey!

## 📊 Database Structure

The app automatically creates and manages these Firestore collections:

- **`users/{userId}`**: User profiles and account information
- **`workouts/{userId}`**: Individual workout records with details
- **`goals/{userId}`**: Fitness goals with progress tracking
- **`routes/{userId}`**: GPS route tracking data with location points, distance, and speed
- **`users/{userId}/schedules/{scheduleId}`**: Activity scheduling and reminders

All data is automatically initialized with sample content when you register.

## 🎯 Key Features Explained

### **Automatic Database Setup**
- No manual configuration required
- Sample data is created automatically during registration
- Collections appear in Firebase Console immediately

### **Real-time Data Sync**
- All changes sync instantly across the app
- Offline support with local caching
- Optimistic updates for better performance

### **Comprehensive Tracking**
- Track multiple workout types
- Set and monitor fitness goals
- View detailed statistics and progress
- Export and analyze your fitness data

### **User Experience**
- Intuitive, modern interface
- Fast loading with lazy components
- Responsive design for all devices
- Error handling and recovery
- Toast notifications for feedback

## 📈 Sample Data Included

When you register, the app automatically creates:
- **Sample Workouts**: Strength training and cardio sessions
- **Fitness Goals**: Weight loss and distance running targets
- **User Profile**: Your account information and preferences

## 🔒 Security & Privacy

- **Firebase Authentication**: Secure user authentication
- **Firestore Security Rules**: Proper data access control
- **User-specific Data**: Each user can only access their own data
- **Encrypted Storage**: All data stored securely in Firebase

## 🎨 Design Philosophy

The app features a modern, fitness-inspired design with:
- **Dark gradient backgrounds** for an immersive experience
- **Bright accent colors** (orange, green, blue, purple) for energy
- **Glassmorphism effects** for contemporary aesthetics
- **Smooth animations** for delightful interactions
- **Emoji integration** for friendly, approachable UI

## 🚀 Deployment

The app is ready for deployment to any static hosting service:

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, Firebase Hosting, etc.).

## 📝 Contributing

This is a personal fitness tracking project. Feel free to fork and customize for your own use!

## 📄 License

This project is open source and available under the MIT License.

---

**Start your fitness journey today! 💪🔥**

Track workouts, set goals, and achieve your fitness dreams with this comprehensive fitness tracking application.
