import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  refreshProfile: (userId?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  userProfile: null,
  refreshProfile: async () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState<Set<string>>(new Set());

  // Cache for faster subsequent loads
  const [authChecked, setAuthChecked] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    // Check if profile is already loaded to avoid duplicate requests
    if (profileLoaded.has(userId)) {
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile: UserProfile = {
          firstName: 'User',
          lastName: '',
          email: '',
        };
        setUserProfile(defaultProfile);
      }
      // Mark as loaded
      setProfileLoaded(prev => new Set(prev).add(userId));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set fallback profile on error
      setUserProfile({
        firstName: 'User',
        lastName: '',
        email: '',
      });
      // Still mark as loaded to avoid retry loops
      setProfileLoaded(prev => new Set(prev).add(userId));
    }
  };

  const refreshProfile = async (userId?: string) => {
    const id = userId ?? user?.uid;
    if (!id) return;
    // Remove from loaded cache so fetchUserProfile will refetch
    setProfileLoaded(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    await fetchUserProfile(id);
  };

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    let mounted = true;

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!mounted) return;

        setUser(user);
        if (user) {
          await fetchUserProfile(user.uid);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      if (mounted) setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    userProfile,
    refreshProfile,
    login,
    register,
    logout,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};