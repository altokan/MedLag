// Custom hook for Firebase sync with offline support
import { useState, useEffect, useCallback, useRef } from 'react';
import { firestoreService, COLLECTIONS, enableOffline, onConnectionChange } from './firebase';
import { Medicine, User, Withdrawal, OrderItem, Alert, Task, InventoryAudit, AppSettings, ExpiredMedicineLog, DeletionLog, Delivery } from './types';
import { initialSettings, initialUsers } from './store';

interface UseFirebaseSyncReturn {
  medicines: Medicine[];
  users: User[];
  withdrawals: Withdrawal[];
  orders: OrderItem[];
  alerts: Alert[];
  tasks: Task[];
  audits: InventoryAudit[];
  settings: AppSettings;
  disposals: ExpiredMedicineLog[];
  deletionLogs: DeletionLog[];
  deliveries: Delivery[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  updateMedicines: (medicines: Medicine[]) => Promise<void>;
  updateUsers: (users: User[]) => Promise<void>;
  updateWithdrawals: (withdrawals: Withdrawal[]) => Promise<void>;
  updateOrders: (orders: OrderItem[]) => Promise<void>;
  updateAlerts: (alerts: Alert[]) => Promise<void>;
  updateTasks: (tasks: Task[]) => Promise<void>;
  updateAudits: (audits: InventoryAudit[]) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  updateDisposals: (disposals: ExpiredMedicineLog[]) => Promise<void>;
  updateDeletionLogs: (logs: DeletionLog[]) => Promise<void>;
  updateDeliveries: (deliveries: Delivery[]) => Promise<void>;
  saveSingleMedicine: (medicine: Medicine) => Promise<void>;
  deleteSingleMedicine: (medicineId: string) => Promise<void>;
  saveSingleWithdrawal: (withdrawal: Withdrawal) => Promise<void>;
  saveSingleOrder: (order: OrderItem) => Promise<void>;
  deleteSingleOrder: (orderId: string) => Promise<void>;
  saveSingleAlert: (alert: Alert) => Promise<void>;
  saveSingleTask: (task: Task) => Promise<void>;
  saveSingleUser: (user: User) => Promise<void>;
  syncNow: () => Promise<void>;
}

// Local storage helper for offline fallback
const localCache = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(`firebase_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(`firebase_${key}`, JSON.stringify(value));
  }
};

export const useFirebaseSync = (): UseFirebaseSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // State for all collections
  const [medicines, setMedicines] = useState<Medicine[]>(localCache.get('medicines', []));
  const [users, setUsers] = useState<User[]>(localCache.get('users', initialUsers));
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(localCache.get('withdrawals', []));
  const [orders, setOrders] = useState<OrderItem[]>(localCache.get('orders', []));
  const [alerts, setAlerts] = useState<Alert[]>(localCache.get('alerts', []));
  const [tasks, setTasks] = useState<Task[]>(localCache.get('tasks', []));
  const [audits, setAudits] = useState<InventoryAudit[]>(localCache.get('audits', []));
  const [settings, setSettings] = useState<AppSettings>(localCache.get('settings', initialSettings));
  const [disposals, setDisposals] = useState<ExpiredMedicineLog[]>(localCache.get('disposals', []));
  const [deletionLogs, setDeletionLogs] = useState<DeletionLog[]>(localCache.get('deletionLogs', []));
  const [deliveries, setDeliveries] = useState<Delivery[]>(localCache.get('deliveries', []));

  const unsubscribesRef = useRef<(() => void)[]>([]);
  const initializedRef = useRef(false);

  // Initialize offline support and subscriptions
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      await enableOffline();

      const unsubMedicines = firestoreService.subscribeToCollection<Medicine>(
        COLLECTIONS.MEDICINES,
        (data) => {
          setMedicines(data);
          localCache.set('medicines', data);
        }
      );

      const unsubUsers = firestoreService.subscribeToCollection<User>(
        COLLECTIONS.USERS,
        (data) => {
          const mergedUsers = data.length > 0 ? data : initialUsers;
          setUsers(mergedUsers);
          localCache.set('users', mergedUsers);
        }
      );

      const unsubWithdrawals = firestoreService.subscribeToCollection<Withdrawal>(
        COLLECTIONS.WITHDRAWALS,
        (data) => {
          setWithdrawals(data);
          localCache.set('withdrawals', data);
        },
        'timestamp'
      );

      const unsubOrders = firestoreService.subscribeToCollection<OrderItem>(
        COLLECTIONS.ORDERS,
        (data) => {
          setOrders(data);
          localCache.set('orders', data);
        },
        'requestedAt'
      );

      const unsubAlerts = firestoreService.subscribeToCollection<Alert>(
        COLLECTIONS.ALERTS,
        (data) => {
          setAlerts(data);
          localCache.set('alerts', data);
        },
        'timestamp'
      );

      const unsubTasks = firestoreService.subscribeToCollection<Task>(
        COLLECTIONS.TASKS,
        (data) => {
          setTasks(data);
          localCache.set('tasks', data);
        },
        'createdAt'
      );

      const unsubAudits = firestoreService.subscribeToCollection<InventoryAudit>(
        COLLECTIONS.AUDITS,
        (data) => {
          setAudits(data);
          localCache.set('audits', data);
        },
        'timestamp'
      );

      const unsubDisposals = firestoreService.subscribeToCollection<ExpiredMedicineLog>(
        COLLECTIONS.DISPOSALS,
        (data) => {
          setDisposals(data);
          localCache.set('disposals', data);
        },
        'disposedAt'
      );

      const unsubDeletionLogs = firestoreService.subscribeToCollection<DeletionLog>(
        COLLECTIONS.DELETION_LOGS,
        (data) => {
          setDeletionLogs(data);
          localCache.set('deletionLogs', data);
        },
        'timestamp'
      );

      const unsubDeliveries = firestoreService.subscribeToCollection<Delivery>(
        COLLECTIONS.DELIVERIES,
        (data) => {
          setDeliveries(data);
          localCache.set('deliveries', data);
        },
        'timestamp'
      );

      const unsubSettings = firestoreService.subscribeToDocument<AppSettings>(
        COLLECTIONS.SETTINGS,
        'app_settings',
        (data) => {
          const mergedSettings = data || initialSettings;
          setSettings(mergedSettings);
          localCache.set('settings', mergedSettings);
        }
      );

      unsubscribesRef.current = [
        unsubMedicines, unsubUsers, unsubWithdrawals, unsubOrders,
        unsubAlerts, unsubTasks, unsubAudits, unsubDisposals,
        unsubDeletionLogs, unsubDeliveries, unsubSettings
      ];

      setLastSyncTime(new Date());
    };

    init();
    const unsubConnection = onConnectionChange(setIsOnline);

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubConnection();
    };
  }, []);

  const updateMedicines = useCallback(async (newMedicines: Medicine[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.MEDICINES, newMedicines);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleMedicine = useCallback(async (medicine: Medicine) => {
    await firestoreService.setDocument(COLLECTIONS.MEDICINES, medicine.id, medicine);
  }, []);

  const deleteSingleMedicine = useCallback(async (medicineId: string) => {
    await firestoreService.deleteDocument(COLLECTIONS.MEDICINES, medicineId);
  }, []);

  const updateUsers = useCallback(async (newUsers: User[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.USERS, newUsers);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleUser = useCallback(async (user: User) => {
    await firestoreService.setDocument(COLLECTIONS.USERS, user.id, user);
  }, []);

  const updateWithdrawals = useCallback(async (newWithdrawals: Withdrawal[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.WITHDRAWALS, newWithdrawals);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleWithdrawal = useCallback(async (withdrawal: Withdrawal) => {
    await firestoreService.setDocument(COLLECTIONS.WITHDRAWALS, withdrawal.id, withdrawal);
  }, []);

  const updateOrders = useCallback(async (newOrders: OrderItem[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.ORDERS, newOrders);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleOrder = useCallback(async (order: OrderItem) => {
    await firestoreService.setDocument(COLLECTIONS.ORDERS, order.id, order);
  }, []);

  const deleteSingleOrder = useCallback(async (orderId: string) => {
    await firestoreService.deleteDocument(COLLECTIONS.ORDERS, orderId);
  }, []);

  const updateAlerts = useCallback(async (newAlerts: Alert[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.ALERTS, newAlerts);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleAlert = useCallback(async (alert: Alert) => {
    await firestoreService.setDocument(COLLECTIONS.ALERTS, alert.id, alert);
  }, []);

  const updateTasks = useCallback(async (newTasks: Task[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.TASKS, newTasks);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveSingleTask = useCallback(async (task: Task) => {
    await firestoreService.setDocument(COLLECTIONS.TASKS, task.id, task);
  }, []);

  const updateAudits = useCallback(async (newAudits: InventoryAudit[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.AUDITS, newAudits);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setIsSyncing(true);
    try {
      await firestoreService.setDocument(COLLECTIONS.SETTINGS, 'app_settings', newSettings);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateDisposals = useCallback(async (newDisposals: ExpiredMedicineLog[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.DISPOSALS, newDisposals);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateDeletionLogs = useCallback(async (newLogs: DeletionLog[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.DELETION_LOGS, newLogs);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateDeliveries = useCallback(async (newDeliveries: Delivery[]) => {
    setIsSyncing(true);
    try {
      await firestoreService.syncLocalToFirebase(COLLECTIONS.DELIVERIES, newDeliveries);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [medicinesData, usersData, withdrawalsData, ordersData, alertsData, tasksData] = await Promise.all([
        firestoreService.getAllDocuments<Medicine>(COLLECTIONS.MEDICINES),
        firestoreService.getAllDocuments<User>(COLLECTIONS.USERS),
        firestoreService.getAllDocuments<Withdrawal>(COLLECTIONS.WITHDRAWALS),
        firestoreService.getAllDocuments<OrderItem>(COLLECTIONS.ORDERS),
        firestoreService.getAllDocuments<Alert>(COLLECTIONS.ALERTS),
        firestoreService.getAllDocuments<Task>(COLLECTIONS.TASKS)
      ]);

      setMedicines(medicinesData);
      setUsers(usersData.length > 0 ? usersData : initialUsers);
      setWithdrawals(withdrawalsData);
      setOrders(ordersData);
      setAlerts(alertsData);
      setTasks(tasksData);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    medicines, users, withdrawals, orders, alerts, tasks, audits,
    settings, disposals, deletionLogs, deliveries,
    isOnline, isSyncing, lastSyncTime,
    updateMedicines, updateUsers, updateWithdrawals, updateOrders,
    updateAlerts, updateTasks, updateAudits, updateSettings,
    updateDisposals, updateDeletionLogs, updateDeliveries,
    saveSingleMedicine, deleteSingleMedicine, saveSingleWithdrawal,
    saveSingleOrder, deleteSingleOrder, saveSingleAlert,
    saveSingleTask, saveSingleUser, syncNow
  };
};
