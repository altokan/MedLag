// Firebase Configuration with Offline Support
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYvO-cWxbfURkuwdx9kOz0POUvorKQXE8",
  authDomain: "rdmedlag.firebaseapp.com",
  projectId: "rdmedlag",
  storageBucket: "rdmedlag.firebasestorage.app",
  messagingSenderId: "974221968395",
  appId: "1:974221968395:web:bce6b2c6053c7310e5730e",
  measurementId: "G-G4DYDRYTWG"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Enable offline persistence
let persistenceEnabled = false;

export const enableOffline = async () => {
  if (persistenceEnabled) return;
  try {
    await enableIndexedDbPersistence(db);
    persistenceEnabled = true;
    console.log('✅ Offline persistence enabled');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence enabled in one tab only');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support offline persistence');
    }
  }
};

// Collection names
export const COLLECTIONS = {
  MEDICINES: 'medicines',
  USERS: 'users',
  WITHDRAWALS: 'withdrawals',
  ORDERS: 'orders',
  ALERTS: 'alerts',
  TASKS: 'tasks',
  AUDITS: 'audits',
  SETTINGS: 'settings',
  DISPOSALS: 'disposals',
  DELETION_LOGS: 'deletionLogs',
  DELIVERIES: 'deliveries'
};

// Generic Firestore operations
export const firestoreService = {
  // Subscribe to collection with real-time updates
  subscribeToCollection: <T>(
    collectionName: string,
    callback: (data: T[]) => void,
    orderField?: string
  ) => {
    const collRef = collection(db, collectionName);
    const q = orderField ? query(collRef, orderBy(orderField, 'desc')) : collRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        _docId: doc.id
      })) as T[];
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
    });
  },

  // Subscribe to single document
  subscribeToDocument: <T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ) => {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data(), _docId: snapshot.id } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}/${docId}:`, error);
    });
  },

  // Set document (create or overwrite)
  setDocument: async <T extends object>(
    collectionName: string,
    docId: string,
    data: T
  ) => {
    const docRef = doc(db, collectionName, docId);
    const cleanData = { ...data, updatedAt: Timestamp.now() };
    delete (cleanData as any)._docId;
    await setDoc(docRef, cleanData, { merge: true });
  },

  // Delete document
  deleteDocument: async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },

  // Get all documents
  getAllDocuments: async <T>(collectionName: string): Promise<T[]> => {
    const collRef = collection(db, collectionName);
    const snapshot = await getDocs(collRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      _docId: doc.id
    })) as T[];
  },

  // Sync local data to Firebase
  syncLocalToFirebase: async <T extends { id: string }>(
    collectionName: string,
    localData: T[]
  ) => {
    const batch = writeBatch(db);
    localData.forEach(item => {
      const { id, ...data } = item as any;
      const docRef = doc(db, collectionName, id);
      batch.set(docRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
    });
    await batch.commit();
  }
};

// Connection status listener
export const onConnectionChange = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial status
  callback(navigator.onLine);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export { db, app };
