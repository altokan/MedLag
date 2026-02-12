
import React, { useState, useEffect } from 'react';
import { 
  Home, LogOut, QrCode, AlertTriangle, Settings, 
  ArrowLeftRight, Package, ShoppingCart, BarChart3, 
  HelpCircle, Users, LayoutDashboard, CheckSquare, Activity, ArrowLeft, ClipboardCheck, ShieldCheck, User as UserIcon, Lock, Wifi, WifiOff
} from 'lucide-react';
import { translations } from './translations';
import { User, Medicine, Withdrawal, OrderItem, Alert, AppSettings, Task, InventoryAudit, OrderStatus, Delivery, ExpiredMedicineLog } from './types';
import { initialMedicines, initialUsers, initialAlerts, initialOrders, initialWithdrawals, storage, initialSettings, firebaseStorage, COLLECTIONS } from './store';
import './firebase'; // Initialize Firebase

// Pages - Lazy loading for better performance
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import WithdrawalPage from './pages/WithdrawalPage';
import OrderList from './pages/OrderList';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import IssueReport from './pages/IssueReport';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import TasksPage from './pages/TasksPage';
import InventoryCheck from './pages/InventoryCheck';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/UserManagement';
import BTMControl from './pages/BTMControl';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.get('currentUser', null));
  const [medicines, setMedicines] = useState<Medicine[]>(storage.get('medicines', initialMedicines));
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(storage.get('withdrawals', initialWithdrawals));
  const [disposals, setDisposals] = useState<ExpiredMedicineLog[]>(storage.get('disposals', []));
  const [deliveries, setDeliveries] = useState<Delivery[]>(storage.get('deliveries', []));
  const [orders, setOrders] = useState<OrderItem[]>(storage.get('orders', initialOrders));
  const [alerts, setAlerts] = useState<Alert[]>(storage.get('alerts', initialAlerts));
  const [users, setUsers] = useState<User[]>(storage.get('users', initialUsers));
  const [tasks, setTasks] = useState<Task[]>(storage.get('tasks', []));
  const [audits, setAudits] = useState<InventoryAudit[]>(storage.get('audits', []));
  const [settings, setSettings] = useState<AppSettings>(storage.get('settings', initialSettings));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  
  const [withdrawalCart, setWithdrawalCart] = useState<{medicine: Medicine, quantity: number}[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInitialTab, setAdminInitialTab] = useState<'personnel' | 'broadcast' | 'fleet' | 'branding' | 'updates'>('personnel');
  
  const t = (translations as any)[settings.language] || translations.en;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      // Sync data when back online
      syncDataToFirebase();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to medicines
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<Medicine>(COLLECTIONS.MEDICINES, (data) => {
        if (data.length > 0) {
          setMedicines(data);
          storage.set('medicines', data);
        }
      })
    );

    // Subscribe to users
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<User>(COLLECTIONS.USERS, (data) => {
        if (data.length > 0) {
          setUsers(data);
          storage.set('users', data);
        }
      })
    );

    // Subscribe to withdrawals
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<Withdrawal>(COLLECTIONS.WITHDRAWALS, (data) => {
        setWithdrawals(data);
        storage.set('withdrawals', data);
      })
    );

    // Subscribe to orders
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<OrderItem>(COLLECTIONS.ORDERS, (data) => {
        setOrders(data);
        storage.set('orders', data);
      })
    );

    // Subscribe to alerts
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<Alert>(COLLECTIONS.ALERTS, (data) => {
        setAlerts(data);
        storage.set('alerts', data);
      })
    );

    // Subscribe to tasks
    unsubscribers.push(
      firebaseStorage.subscribeToCollection<Task>(COLLECTIONS.TASKS, (data) => {
        setTasks(data);
        storage.set('tasks', data);
      })
    );

    // Initialize data if empty
    initializeFirebaseData();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Initialize Firebase with default data if empty
  const initializeFirebaseData = async () => {
    try {
      const existingMedicines = await firebaseStorage.getCollection<Medicine>(COLLECTIONS.MEDICINES);
      if (existingMedicines.length === 0) {
        await firebaseStorage.saveCollection(COLLECTIONS.MEDICINES, initialMedicines);
      }

      const existingUsers = await firebaseStorage.getCollection<User>(COLLECTIONS.USERS);
      if (existingUsers.length === 0) {
        await firebaseStorage.saveCollection(COLLECTIONS.USERS, initialUsers);
      }

      await firebaseStorage.saveDoc(COLLECTIONS.SETTINGS, 'app', initialSettings);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error initializing Firebase data:', error);
    }
  };

  // Sync local data to Firebase
  const syncDataToFirebase = async () => {
    try {
      setSyncStatus('syncing');
      await firebaseStorage.saveCollection(COLLECTIONS.MEDICINES, medicines);
      await firebaseStorage.saveCollection(COLLECTIONS.USERS, users);
      await firebaseStorage.saveCollection(COLLECTIONS.WITHDRAWALS, withdrawals);
      await firebaseStorage.saveCollection(COLLECTIONS.ORDERS, orders);
      await firebaseStorage.saveCollection(COLLECTIONS.ALERTS, alerts);
      await firebaseStorage.saveCollection(COLLECTIONS.TASKS, tasks);
      await firebaseStorage.saveDoc(COLLECTIONS.SETTINGS, 'app', settings);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.accentColor]);

  useEffect(() => {
    medicines.forEach(med => {
      if (med.currentStock <= med.minStock) {
        const isAlreadyOrdered = orders.some(o => o.medicineId === med.id);
        if (!isAlreadyOrdered) {
          const newOrder: OrderItem = {
            id: 'auto-' + Math.random().toString(36).substr(2, 9),
            medicineId: med.id,
            medicineName: med.name,
            status: OrderStatus.PENDING,
            requestedAt: new Date().toISOString(),
            quantity: med.piecesPerBox * 2
          };
          setOrders(prev => [...prev, newOrder]);

          const alertExists = alerts.some(a => a.medicineId === med.id && a.type === 'low_stock' && a.status !== 'completed');
          if (!alertExists) {
            const newAlert: Alert = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'low_stock',
              title: `Low Stock: ${med.name}`,
              description: `Item reached threshold (${med.currentStock}/${med.minStock}). Auto-added to procurement list.`,
              timestamp: new Date().toISOString(),
              status: 'new',
              read: false,
              medicineId: med.id
            };
            setAlerts(prev => [newAlert, ...prev]);
          }
        }
      }
    });
  }, [medicines]);

  useEffect(() => { storage.set('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { 
    storage.set('medicines', medicines); 
    if (isOnline && medicines.length > 0) firebaseStorage.saveCollection(COLLECTIONS.MEDICINES, medicines);
  }, [medicines]);
  useEffect(() => { 
    storage.set('withdrawals', withdrawals); 
    if (isOnline && withdrawals.length > 0) firebaseStorage.saveCollection(COLLECTIONS.WITHDRAWALS, withdrawals);
  }, [withdrawals]);
  useEffect(() => { storage.set('disposals', disposals); }, [disposals]);
  useEffect(() => { storage.set('deliveries', deliveries); }, [deliveries]);
  useEffect(() => { 
    storage.set('orders', orders); 
    if (isOnline && orders.length > 0) firebaseStorage.saveCollection(COLLECTIONS.ORDERS, orders);
  }, [orders]);
  useEffect(() => { 
    storage.set('alerts', alerts); 
    if (isOnline && alerts.length > 0) firebaseStorage.saveCollection(COLLECTIONS.ALERTS, alerts);
  }, [alerts]);
  useEffect(() => { 
    storage.set('users', users); 
    if (isOnline && users.length > 0) firebaseStorage.saveCollection(COLLECTIONS.USERS, users);
  }, [users]);
  useEffect(() => { 
    storage.set('tasks', tasks); 
    if (isOnline && tasks.length > 0) firebaseStorage.saveCollection(COLLECTIONS.TASKS, tasks);
  }, [tasks]);
  useEffect(() => { storage.set('audits', audits); }, [audits]);
  useEffect(() => { 
    storage.set('settings', settings); 
    if (isOnline) firebaseStorage.saveDoc(COLLECTIONS.SETTINGS, 'app', settings);
  }, [settings]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'admin' && extra?.tab) {
      setAdminInitialTab(extra.tab);
    } else {
      setAdminInitialTab('personnel');
    }
    setActiveTab(tab);
  };

  const handleUpdateCart = (med: Medicine, delta: number) => {
    setWithdrawalCart(prev => {
      const existing = prev.find(i => i.medicine.id === med.id);
      if (existing) {
        const newQty = Math.max(0, Math.min(med.currentStock, existing.quantity + delta));
        if (newQty === 0) return prev.filter(i => i.medicine.id !== med.id);
        return prev.map(i => i.medicine.id === med.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { medicine: med, quantity: Math.min(med.currentStock, delta) }];
      return prev;
    });
  };

  const handleDisposeMedicine = (med: Medicine, auditorName: string) => {
    const log: ExpiredMedicineLog = {
      id: Math.random().toString(36).substr(2, 9),
      medicineName: med.name,
      barcode: med.barcode,
      expiryDate: med.expiryDate,
      quantity: med.currentStock,
      disposedAt: new Date().toISOString(),
      disposedBy: auditorName
    };
    setDisposals(prev => [log, ...prev]);
    setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: 0 } : m));
  };

  const handleDeliveryComplete = (order: OrderItem, qty: number, expiry: string, minStock: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === order.medicineId) return { ...m, currentStock: m.currentStock + qty, expiryDate: expiry, minStock };
      return m;
    }));
    const newDelivery: Delivery = {
      id: Math.random().toString(36).substr(2, 9),
      medicineId: order.medicineId,
      medicineName: order.medicineName,
      quantity: qty,
      userId: currentUser?.id || '',
      username: currentUser?.username || 'system',
      timestamp: new Date().toISOString(),
      expiryDate: expiry,
      minStockSet: minStock
    };
    setDeliveries(prev => [newDelivery, ...prev]);
    setOrders(prev => prev.filter(o => o.id !== order.id));
    setAlerts(prev => prev.map(a => a.medicineId === order.medicineId ? { ...a, status: 'completed' } : a));
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a1628]">
        <Login onLogin={setCurrentUser} users={users} settings={settings} onResetRequest={() => {}} />
        <div className="mt-auto py-10 text-center opacity-30 select-none">
          <p className="text-slate-500 font-medium text-[8px] md:text-[10px] tracking-[0.5em] uppercase font-modern">{t.developedBy}</p>
        </div>
      </div>
    );
  }

  const userAlerts = alerts.filter(a => !a.targetUserId || a.targetUserId === currentUser.id);
  const unreadCount = userAlerts.filter(a => !a.read && a.status !== 'completed').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard t={t} onNavigate={handleNavigate} role={currentUser.role} username={currentUser.username} fullName={currentUser.fullName} medicines={medicines} withdrawals={withdrawals} orders={orders} alerts={userAlerts} settings={settings} tasks={tasks} permissions={currentUser.permissions} />;
      case 'inventory': return <Inventory t={t} medicines={medicines} setMedicines={setMedicines} role={currentUser.role} onUpdateCartQty={handleUpdateCart} cart={withdrawalCart} onNavigateToWithdrawal={() => setActiveTab('withdrawal')} currentUser={currentUser} onDispose={handleDisposeMedicine} />;
      case 'withdrawal': return <WithdrawalPage t={t} medicines={medicines} user={currentUser} users={users} onComplete={(w) => { 
        setWithdrawals(prev => [...w, ...prev]); 
        setMedicines(prev => prev.map(m => {
          const withdrawn = w.find(wi => wi.medicineId === m.id);
          return withdrawn ? { ...m, currentStock: m.currentStock - withdrawn.quantity } : m;
        }));
        setWithdrawalCart([]);
        setActiveTab('dashboard'); 
      }} externalCart={withdrawalCart} setExternalCart={setWithdrawalCart} settings={settings} />;
      case 'orders': return <OrderList t={t} orders={orders} setOrders={setOrders} medicines={medicines} setMedicines={setMedicines} role={currentUser.role} onDeliveryComplete={handleDeliveryComplete} currentUser={currentUser} settings={settings} />;
      case 'reports': return <Reports t={t} withdrawals={withdrawals} setWithdrawals={setWithdrawals} deliveries={deliveries} disposals={disposals} role={currentUser.role} medicines={medicines} audits={audits} settings={settings} currentUser={currentUser} />;
      case 'alerts': return <Alerts t={t} alerts={userAlerts} setAlerts={setAlerts} user={currentUser} medicines={medicines} onMoveToOrders={(order) => setOrders(prev => [order, ...prev])} onGoToOrders={() => setActiveTab('orders')} />;
      case 'admin': return <AdminPanel t={t} settings={settings} setSettings={setSettings} users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} onSendBroadcast={(msg, tid, lnk, img) => {
         const newAlert: Alert = { id: Math.random().toString(36).substr(2,9), type: 'broadcast', title: tid ? 'Private Message' : t.alarm, description: msg, timestamp: new Date().toISOString(), status: 'new', read: false, targetUserId: tid, link: lnk, imageUrl: img };
         setAlerts(prev => [newAlert, ...prev]);
      }} currentUser={currentUser} initialTab={adminInitialTab} />;
      case 'settings': return <SettingsPage t={t} settings={settings} setSettings={setSettings} onLogout={handleLogout} currentUser={currentUser} onNavigate={setActiveTab} />;
      case 'profile': return <ProfilePage t={t} user={currentUser} users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} alerts={userAlerts} setAlerts={setAlerts} onLogout={handleLogout} onNavigate={setActiveTab} settings={settings} />;
      case 'users': return <UserManagement t={t} users={users} setUsers={setUsers} currentUser={currentUser} tasks={tasks} setTasks={setTasks} />;
      case 'tasks': return <TasksPage t={t} tasks={tasks} setTasks={setTasks} user={currentUser} users={users} onStartAudit={() => setActiveTab('inventoryCheck')} />;
      case 'inventoryCheck': return <InventoryCheck t={t} medicines={medicines} user={currentUser} onComplete={(audit) => { setAudits(prev => [audit, ...prev]); setActiveTab('reports'); }} />;
      case 'issue': return <IssueReport t={t} onSubmit={(alert) => setAlerts(prev => [alert, ...prev])} currentUser={currentUser} />;
      case 'btmControl': return <BTMControl t={t} medicines={medicines} setMedicines={setMedicines} withdrawals={withdrawals} setWithdrawals={setWithdrawals} user={currentUser} settings={settings} />;
      default: return <Dashboard t={t} onNavigate={handleNavigate} role={currentUser.role} username={currentUser.username} fullName={currentUser.fullName} medicines={medicines} withdrawals={withdrawals} orders={orders} alerts={userAlerts} settings={settings} tasks={tasks} permissions={currentUser.permissions} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col md:flex-row font-ui overflow-x-hidden">
      <aside className="hidden md:flex flex-col w-72 bg-[#0d1b2e] border-r border-white/5 fixed inset-y-0 z-50">
        <div className="p-10 text-center border-b border-white/5">
           <div className="w-24 h-24 mx-auto rounded-full p-1 border-2 border-accent shadow-[0_0_25px_rgba(255,215,0,0.3)] bg-[#0a1628] flex items-center justify-center animate-pulse-rotate overflow-hidden">
              <img src={settings.appLogoUrl} className="w-full h-full rounded-full object-cover" alt="Logo" />
           </div>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Home size={20}/>} label={t.dashboard} />
          <SidebarBtn active={activeTab === 'withdrawal'} onClick={() => setActiveTab('withdrawal')} icon={<ArrowLeftRight size={20}/>} label={t.withdrawal} badge={withdrawalCart.length} badgeColor="bg-red-600" />
          <SidebarBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20}/>} label={t.inventory} />
          <SidebarBtn active={activeTab === 'btmControl'} onClick={() => setActiveTab('btmControl')} icon={<Lock size={20}/>} label={t.btmVault} />
          <SidebarBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={20}/>} label={t.orders} badge={orders.length} badgeColor="bg-accent" />
          <SidebarBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20}/>} label={t.reports} />
          <SidebarBtn active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<AlertTriangle size={20}/>} label={t.alarm} badge={unreadCount} />
          <div className="pt-8 pb-2 px-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.userDetails}</div>
          <SidebarBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20}/>} label={t.userDetails} />
          <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label={t.settings} />
        </nav>
      </aside>

      <main className="flex-1 md:ml-72 pb-24 md:pb-6 pt-4 md:pt-14 px-4 md:px-16 flex flex-col min-h-screen relative">
        {/* Online/Offline Status Indicator */}
        <div className={`fixed top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
          isOnline 
            ? syncStatus === 'syncing' 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isOnline ? (
            syncStatus === 'syncing' ? (
              <><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div> Syncing...</>
            ) : (
              <><Wifi size={12} /> Online</>
            )
          ) : (
            <><WifiOff size={12} /> Offline</>
          )}
        </div>

        <div className="absolute top-4 left-4 md:left-16 z-30 animate-in slide-in-from-left-4 duration-500">
           <div onClick={() => setActiveTab('profile')} className="bg-[#0d1b2e]/90 backdrop-blur-xl border-2 border-accent/40 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full flex items-center gap-2 md:gap-4 cursor-pointer hover:border-accent transition-all group active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <div className="w-7 h-7 md:w-11 md:h-11 bg-[#0a1628] text-accent rounded-full flex items-center justify-center text-[10px] md:text-base font-black border-2 border-accent shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                 {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col pr-1 min-w-0">
                 <span className="text-white font-black text-[9px] md:text-[13px] uppercase leading-none tracking-tight group-hover:text-accent transition-colors truncate max-w-[100px] md:max-w-none">{currentUser.fullName || currentUser.username}</span>
                 <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-accent font-bold text-[7px] md:text-[10px] uppercase tracking-[0.2em]">{currentUser.role}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="max-w-5xl mx-auto flex-1 w-full mt-16 md:mt-0">
           {activeTab !== 'dashboard' && (
             <button onClick={() => setActiveTab('dashboard')} className="mb-8 text-accent flex items-center gap-2 font-black uppercase text-xs hover:translate-x-[-4px] transition-transform">
               <ArrowLeft size={16}/> {t.back}
             </button>
           )}
           {renderContent()}
        </div>
        <div className="py-10 mt-auto text-center opacity-30 select-none">
          <p className="text-slate-500 font-medium text-[8px] md:text-[10px] tracking-[0.5em] uppercase font-modern">{t.developedBy}</p>
        </div>
      </main>

      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1b2e]/95 backdrop-blur-xl border-t border-white/5 py-3 px-2 items-center justify-around z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Home size={22} />} label={t.dashboard} />
        <NavBtn active={activeTab === 'withdrawal'} onClick={() => setActiveTab('withdrawal')} icon={<ArrowLeftRight size={22} />} label={t.stockOut} badge={withdrawalCart.length} />
        <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<QrCode size={24} />} label={t.inventory} isScanner />
        <NavBtn active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<AlertTriangle size={22} />} label={t.alarm} badge={unreadCount} />
        <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={22} />} label={t.settings} />
      </nav>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, icon, label, badge, badgeColor }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-accent text-[#0a1628] font-black shadow-[0_10px_20px_rgba(255,215,0,0.2)] scale-[1.03]' : 'text-slate-400 hover:text-white hover:translate-x-1'}`}>
    <div className="flex items-center space-x-3">{icon}<span className="uppercase text-[11px] font-black tracking-widest">{label}</span></div>
    {badge > 0 && <span className={`${badgeColor || 'bg-red-600'} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg`}>{badge}</span>}
  </button>
);

const NavBtn = ({ active, onClick, icon, label, badge, isScanner }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 relative transition-all ${active ? 'text-accent' : 'text-slate-500'} ${isScanner ? 'bg-accent text-[#0a1628] p-3.5 rounded-full -mt-10 shadow-[0_10px_25px_rgba(255,215,0,0.3)] border-4 border-[#0a1628] scale-110' : 'active:scale-90'}`}>
    {icon} 
    {!isScanner && badge > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] px-1.5 rounded-full font-black">{badge}</span>}
    {!isScanner && <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[50px]">{label}</span>}
  </button>
);

export default App;
