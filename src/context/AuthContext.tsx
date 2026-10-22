import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  testConnection,
  requestCalendarToken,
  getCachedAccessToken,
  setCachedAccessToken
} from '../services/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  calendarAccessToken: string | null;
  isCalendarConnected: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  connectCalendar: () => Promise<string>;
  getValidCalendarToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  calendarAccessToken: null,
  isCalendarConnected: false,
  signIn: async () => {},
  signOut: async () => {},
  connectCalendar: async () => '',
  getValidCalendarToken: async () => ''
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarAccessToken, setCalendarTokenState] = useState<string | null>(getCachedAccessToken());

  useEffect(() => {
    // Validate connection to firestore on startup
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setCachedAccessToken(null);
        setCalendarTokenState(null);
      } else {
        setCalendarTokenState(getCachedAccessToken());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.accessToken) {
        setCalendarTokenState(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCalendarTokenState(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      throw err;
    }
  };

  const handleConnectCalendar = async (): Promise<string> => {
    try {
      const token = await requestCalendarToken();
      setCalendarTokenState(token);
      return token;
    } catch (err) {
      console.error('Calendar connection failed:', err);
      throw err;
    }
  };

  const getValidCalendarToken = async (): Promise<string> => {
    const cached = getCachedAccessToken();
    if (cached) {
      setCalendarTokenState(cached);
      return cached;
    }
    return await handleConnectCalendar();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        calendarAccessToken,
        isCalendarConnected: !!calendarAccessToken,
        signIn: handleSignIn,
        signOut: handleSignOut,
        connectCalendar: handleConnectCalendar,
        getValidCalendarToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
