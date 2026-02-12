import { Medicine, Withdrawal, OrderItem, Alert, OrderStatus, User, AppSettings, UserPermissions, Task, InventoryAudit, Delivery, ExpiredMedicineLog } from './types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

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
  DELIVERIES: 'deliveries',
  DISPOSALS: 'disposals'
};

export const initialMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Aspirin 100mg',
    location: 'Shelf A1',
    barcode: '4000123456789',
    minStock: 10,
    currentStock: 25,
    piecesPerBox: 20,
    expiryDate: '2025-12-31',
    imageUrl: 'https://picsum.photos/seed/aspirin/200/200'
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    location: 'Shelf B2',
    barcode: '4000987654321',
    minStock: 15,
    currentStock: 5,
    piecesPerBox: 10,
    expiryDate: '2025-06-15',
    imageUrl: 'https://picsum.photos/seed/ibu/200/200'
  }
];

export const initialUsers: User[] = [
  { 
    id: 'u1', 
    username: 'admin', 
    password: 'admin', 
    fullName: 'System Administrator', 
    email: 'admin@feuerwehr-duelmen.de', 
    role: 'admin',
    joinDate: '2023-01-01',
    permissions: {
      addMedicine: true,
      deleteMedicine: true,
      exportReports: true,
      inventoryCheck: true,
      addToOrders: true,
      manageUsers: true,
      sendAlerts: true,
      manageOrders: true,
      fullAdminAccess: true,
      manageBTM: true,
      accessAdminPanel: true,
      managePersonnel: true
    }
  }
];

export const initialWithdrawals: Withdrawal[] = [];
export const initialOrders: OrderItem[] = [];
export const initialAlerts: Alert[] = [];

export const defaultPermissions: UserPermissions = {
  addMedicine: true,
  deleteMedicine: true,
  exportReports: true,
  inventoryCheck: true,
  addToOrders: true,
  manageUsers: false,
  sendAlerts: false,
  manageOrders: false,
  fullAdminAccess: false,
  manageBTM: false
};

export const supervisorPermissions: UserPermissions = {
  addMedicine: true,
  deleteMedicine: true,
  exportReports: true,
  inventoryCheck: true,
  addToOrders: true,
  manageUsers: true,
  sendAlerts: true,
  manageOrders: true,
  fullAdminAccess: false,
  manageBTM: true,
  accessAdminPanel: true,
  managePersonnel: true
};

export const initialSettings: AppSettings = {
  appName: 'Rettungsdienst Dülmen',
  accentColor: '#ffd700',
  language: 'en',
  supervisorPhone: '+49 123 456789',
  supervisorEmail: 'supervisor@feuerwehr-duelmen.de',
  reportEmail: 'reports@feuerwehr-duelmen.de',
  loginBackgroundImageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=2070&auto=format&fit=crop',
  appLogoUrl: 'https://feuerwehr-duelmen.de/wp-content/uploads/2019/12/logo_feuerwehr_duelmen.png',
  vehicles: ['ELW-1', 'HLF-20', 'RTW-1', 'RTW-2', 'NEF-1'],
  theme: 'navy',
  uiLayout: {
    withdrawal: { key: 'withdrawal', label: 'Withdrawal', visible: true },
    inventory: { key: 'inventory', label: 'Inventory', visible: true },
    reports: { key: 'reports', label: 'Reports', visible: true },
    alerts: { key: 'alerts', label: 'Alerts', visible: true },
  }
};

// Firebase helper functions
export const firebaseStorage = {
  // Save array data to Firebase
  saveCollection: async <T extends { id: string }>(collectionName: string, data: T[]) => {
    const batch = writeBatch(db);
    data.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
  },

  // Save single document
  saveDoc: async <T>(collectionName: string, docId: string, data: T) => {
    await setDoc(doc(db, collectionName, docId), data as any);
  },

  // Get all documents from collection
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
  },

  // Subscribe to collection changes (real-time)
  subscribeToCollection: <T>(collectionName: string, callback: (data: T[]) => void) => {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
      callback(data);
    });
  }
};

// Local storage fallback (for offline-first and quick access)
export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: <T,>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};