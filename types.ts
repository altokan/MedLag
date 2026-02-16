
export type Role = 'admin' | 'user' | 'supervisor';

export interface UserPermissions {
  addMedicine: boolean;
  deleteMedicine: boolean;
  exportReports: boolean;
  inventoryCheck: boolean;
  addToOrders: boolean;
  manageUsers: boolean;
  sendAlerts: boolean;
  manageOrders: boolean;
  fullAdminAccess: boolean;
  manageBTM: boolean;
  accessAdminPanel: boolean;
  managePersonnel: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName?: string;
  email?: string;
  role: Role;
  jobTitle?: string;
  joinDate?: string;
  permissions?: UserPermissions;
}

export interface Medicine {
  id: string;
  name: string;
  location: string;
  barcode: string; 
  serialNumber?: string; 
  minStock: number;
  currentStock: number;
  piecesPerBox: number;
  expiryDate: string;
  imageUrl?: string;
  isBTM?: boolean;
  notes?: string;
}

export interface DeletionLog {
  id: string;
  medicineName: string;
  quantity: number;
  deletedBy: string;
  timestamp: string;
}

export interface Withdrawal {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  userId: string;
  username: string;
  timestamp: string;
  stockBefore: number;
  stockAfter: number;
  signature: string;
  vehicle: string;
  incidentNumber?: string;
  witnessName?: string;
  isBTM?: boolean;
}

export interface ExpiredMedicineLog {
  id: string;
  medicineName: string;
  barcode: string;
  expiryDate: string;
  quantity: number;
  disposedAt: string;
  disposedBy: string;
}

export interface Delivery {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  userId: string;
  username: string;
  timestamp: string;
  expiryDate: string;
  minStockSet: number;
}

export enum OrderStatus {
  ORDERED = 'Ordered',
  IN_PROGRESS = 'In Progress',
  DELIVERED = 'Delivered',
  PENDING = 'Pending'
}

export interface OrderItem {
  id: string;
  medicineId: string;
  medicineName: string;
  status: OrderStatus;
  requestedAt: string;
  quantity?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy?: string;
  status: 'pending' | 'completed';
  createdAt: string;
  type?: 'general' | 'audit' | 'urgent';
}

export interface InventoryAudit {
  id: string;
  auditorId: string;
  auditorUsername: string;
  auditorFullName: string;
  timestamp: string;
  signature: string;
  items: {
    medicineId: string;
    medicineName: string;
    expectedQty: number;
    actualQty: number;
    difference: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: Role;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'issue_report' | 'task' | 'audit_complete' | 'broadcast' | 'security_update';
  title: string;
  description: string;
  timestamp: string;
  status: 'new' | 'in_progress' | 'completed';
  read: boolean;
  medicineId?: string;
  userId?: string; 
  userAction?: string;
  actionTime?: string;
  link?: string;
  targetUserId?: string;
  imageUrl?: string;
  chat?: ChatMessage[];
}

export interface UILayoutItem {
  key: string;
  label: string;
  visible: boolean;
}

export interface AppSettings {
  appName: string;
  accentColor: string;
  supervisorPhone: string;
  supervisorEmail: string;
  reportEmail?: string;
  loginBackgroundImageUrl: string;
  appLogoUrl: string;
  vehicles: string[];
  theme: string;
  uiLayout: Record<string, UILayoutItem>;
  appVersion: string;
  updateUrl: string;
  language: 'en' | 'de';
}
