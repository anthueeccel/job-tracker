import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  initializeFirestore,
  setLogLevel,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JobOpportunity } from '../types/job';

// Resolve Firebase configuration dynamically from environment variables (for git/deployment security)
// or local applet configuration
// const resolvedFirebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfig as Record<string, string>)?.apiKey || '',
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as Record<string, string>)?.projectId || '',
//   appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfig as Record<string, string>)?.appId || '',
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as Record<string, string>)?.authDomain || '',
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as Record<string, string>)?.storageBucket || '',
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as Record<string, string>)?.messagingSenderId || '',
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (firebaseConfig as Record<string, string>)?.measurementId || '',
//   oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || (firebaseConfig as Record<string, string>)?.oAuthClientId || '',
//   recaptchaSiteKey: import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || (firebaseConfig as Record<string, string>)?.recaptchaSiteKey || ''
// };
export const resolvedFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfig as Record<string, string>)?.apiKey || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as Record<string, string>)?.projectId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfig as Record<string, string>)?.appId || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as Record<string, string>)?.authDomain || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as Record<string, string>)?.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as Record<string, string>)?.messagingSenderId || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (firebaseConfig as Record<string, string>)?.measurementId || '',
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || (firebaseConfig as Record<string, string>)?.oAuthClientId || '',
  recaptchaSiteKey: import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || (firebaseConfig as Record<string, string>)?.recaptchaSiteKey || ''
};

// Initialize Firebase App and Services
export const app = initializeApp(resolvedFirebaseConfig);
export const FIRESTORE_DATABASE_ID = import.meta.env.VITE_FIRESTORE_DATABASE_ID || (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || 'ai-studio-jobtrackerprotec-67f49dda-dd89-4ce0-b19f-dec97a57a6af';

// Suppress repetitive WebChannel streaming network/transport warnings in proxy environments
setLogLevel('error');

// Configure Firestore with experimentalForceLongPolling to eliminate stream timeouts and 10s transport resets
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  FIRESTORE_DATABASE_ID
);
export const auth = getAuth(app);

// Google Workspace OAuth Scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// In-Memory Token Caching (Required: Never persist in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

// Clear cached token on sign-out or session end
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database connection is pending.');
    }
    return false;
  }
}

// Strip undefined values to satisfy Firestore object schema rules
export function sanitizeForFirestore<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === 'object'
          ? sanitizeForFirestore(item as Record<string, unknown>)
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; accessToken: string | null }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    const user = result.user;
    
    // Upsert user profile in firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, sanitizeForFirestore({
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString()
    }), { merge: true });

    return { user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function requestCalendarToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Calendar access token was not returned.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error) {
    console.error('Failed to obtain Google Calendar access token:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

// Job Opportunity Persistence Helpers
export async function fetchUserJobsFromFirestore(userId: string): Promise<JobOpportunity[]> {
  const jobsPath = `users/${userId}/jobs`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'jobs'));
    const jobs: JobOpportunity[] = [];
    snapshot.forEach((docSnap) => {
      jobs.push(docSnap.data() as JobOpportunity);
    });
    return jobs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, jobsPath);
  }
}

export function subscribeToUserJobs(
  userId: string,
  onUpdate: (jobs: JobOpportunity[]) => void,
  onError?: (err: unknown) => void
) {
  const jobsPath = `users/${userId}/jobs`;
  return onSnapshot(
    collection(db, 'users', userId, 'jobs'),
    (snapshot) => {
      const jobs: JobOpportunity[] = [];
      snapshot.forEach((docSnap) => {
        jobs.push(docSnap.data() as JobOpportunity);
      });
      onUpdate(jobs);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      try {
        handleFirestoreError(error, OperationType.GET, jobsPath);
      } catch {
        // Error info logged in handleFirestoreError
      }
    }
  );
}

export async function saveJobToFirestore(userId: string, job: JobOpportunity): Promise<void> {
  const jobDocPath = `users/${userId}/jobs/${job.id}`;
  try {
    const jobRef = doc(db, 'users', userId, 'jobs', job.id);
    const sanitized = sanitizeForFirestore({
      ...job,
      userId,
      updatedAt: new Date().toISOString()
    });
    await setDoc(jobRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, jobDocPath);
  }
}

export async function deleteJobFromFirestore(userId: string, jobId: string): Promise<void> {
  const jobDocPath = `users/${userId}/jobs/${jobId}`;
  try {
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, jobDocPath);
  }
}

export async function batchSaveJobsToFirestore(userId: string, jobs: JobOpportunity[]): Promise<void> {
  for (const job of jobs) {
    await saveJobToFirestore(userId, job);
  }
}
