
import { Medicine, Withdrawal, OrderItem, Alert, OrderStatus, User, AppSettings, UserPermissions } from './types';

export const initialMedicines: Medicine[] = [];

export const initialUsers: User[] = [
  { 
    id: 'u1', 
    username: 'admin', 
    password: 'admin', 
    fullName: 'System Administrator', 
    email: 'admin@feuerwehr-duelmen.de', 
    role: 'admin',
    jobTitle: 'WAL (Wachabteilungsleiter)',
    joinDate: new Date().toISOString().split('T')[0],
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
  manageBTM: false,
  accessAdminPanel: false,
  managePersonnel: false
};

export const initialSettings: AppSettings = {
  appName: 'Feuerwehr Dülmen',
  accentColor: '#ffd700',
  supervisorPhone: '+49 123 456789',
  supervisorEmail: 'leitung@feuerwehr-duelmen.de',
  reportEmail: 'logistik@feuerwehr-duelmen.de',
  loginBackgroundImageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=2070&auto=format&fit=crop',
  appLogoUrl: 'https://feuerwehr-duelmen.de/wp-content/uploads/2019/12/logo_feuerwehr_duelmen.png',
  vehicles: ['ELW-1', 'HLF-20', 'RTW-1', 'RTW-2', 'NEF-1'],
  theme: 'navy',
  uiLayout: {
    withdrawal: { key: 'withdrawal', label: 'Withdrawal', visible: true },
    inventory: { key: 'inventory', label: 'Inventory', visible: true },
    reports: { key: 'reports', label: 'Reports', visible: true },
    alerts: { key: 'alerts', label: 'Alerts', visible: true },
  },
  appVersion: '6.0.0',
  updateUrl: '',
  language: 'de'
};

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  set: <T,>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
