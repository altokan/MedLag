import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYvO-cWxbfURkuwdx9kOz0POUvorKQXE8",
  authDomain: "rdmedlag.firebaseapp.com",
  projectId: "rdmedlag",
  storageBucket: "rdmedlag.firebasestorage.app",
  messagingSenderId: "974221968395",
  appId: "1:974221968395:web:bce6b2c6053c7310e5730e",
  measurementId: "G-G4DYDRYTWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported by browser');
  }
});

export default app;