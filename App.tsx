
import React, { useState, useEffect, useRef } from 'react';
import { Home, LogOut, Settings, ArrowLeftRight, Package, ShoppingCart, BarChart3, User as UserIcon, ArrowLeft, Bell, CheckCircle, Scan, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { translations } from './translations';
import { User, Medicine, Withdrawal, OrderItem, Alert, AppSettings, Task, InventoryAudit, OrderStatus, Delivery, ExpiredMedicineLog, DeletionLog } from './types';
import { initialUsers, storage, initialSettings } from './store';
import { useFirebaseSync } from './useFirebaseSync';

// Pages
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
import InventoryCheck from './pages/InventoryCheck';
import ProfilePage from './pages/ProfilePage';
import BTMControl from './pages/BTMControl';
import UserManagement from './pages/UserManagement';

const App: React.FC = () => {
  // Firebase Sync Hook - Real-time data from Firestore with offline support
  const firebase = useFirebaseSync();

  // Local state for current user (stored locally for session)
  const [currentUser, setCurrentUser] = useState<User | null>(storage.get('currentUser', null));
  
  // Use Firebase data with local fallback
  const medicines = firebase.medicines;
  const users = firebase.users.length > 0 ? firebase.users : initialUsers;
  const withdrawals = firebase.withdrawals;
  const orders = firebase.orders;
  const alerts = firebase.alerts;
  const tasks = firebase.tasks;
  const audits = firebase.audits;
  const settings = firebase.settings || initialSettings;
  const disposals = firebase.disposals;
  const deletionLogs = firebase.deletionLogs;
  const deliveries = firebase.deliveries;

  // Lifted Cart State for Badges (local only)
  const [cart, setCart] = useState<{medicine: Medicine, quantity: number}[]>(storage.get('activeCart', []));

  const [activeTab, setActiveTab] = useState('dashboard');
  const [navHistory, setNavHistory] = useState<string[]>(['dashboard']);
  const [adminTab, setAdminTab] = useState<any>('team_manager');

  const [prefilledWithdrawal, setPrefilledWithdrawal] = useState<Medicine | null>(null);
  const [withdrawalSuccessList, setWithdrawalSuccessList] = useState<Withdrawal[] | null>(null);

  const t = translations[settings.language || 'de'];

  // Ref to track previous medicine states for restock detection
  const prevMedicinesRef = useRef<Medicine[]>(medicines);

  // Notification Counts
  const unreadAlertsCount = alerts.filter(a => !a.read).length;
  const cartItemCount = cart.length;

  // --- STOCK MONITORING, AUTO-ORDERING & ALERTS LOGIC ---
  useEffect(() => {
    medicines.forEach(med => {
      const prevMed = prevMedicinesRef.current.find(m => m.id === med.id);
      
      // CASE 1: Restocked
      if (prevMed && prevMed.currentStock <= prevMed.minStock && med.currentStock > med.minStock) {
        const newAlert: Alert = {
          id: 'restock-' + med.id + '-' + Date.now(),
          type: 'broadcast',
          title: `Restocked: ${med.name}`,
          description: `${med.name} ist wieder verfügbar. Aktueller Bestand: ${med.currentStock}.`,
          timestamp: new Date().toISOString(),
          status: 'new',
          read: false,
          medicineId: med.id
        };
        firebase.saveSingleAlert(newAlert);
      }

      // CASE 2: Low Stock
      if (med.currentStock <= med.minStock) {
        const existingLowAlert = alerts.find(a => a.medicineId === med.id && a.type === 'low_stock' && a.status !== 'completed');
        if (!existingLowAlert) {
          const newAlert: Alert = {
            id: 'low-' + med.id + '-' + Date.now(),
            type: 'low_stock',
            title: `Low Stock: ${med.name}`,
            description: `Bestandsmangel: Nur noch ${med.currentStock} Einheiten verfügbar.`,
            timestamp: new Date().toISOString(),
            status: 'new',
            read: false,
            medicineId: med.id
          };
          firebase.saveSingleAlert(newAlert);
        }

        // Auto-Ordering
        const alreadyOrdered = orders.find(o => o.medicineId === med.id && o.status !== OrderStatus.DELIVERED);
        if (!alreadyOrdered) {
          const newOrder: OrderItem = {
            id: 'ord-' + Math.random().toString(36).substr(2, 9),
            medicineId: med.id,
            medicineName: med.name,
            status: OrderStatus.PENDING,
            requestedAt: new Date().toISOString()
          };
          firebase.saveSingleOrder(newOrder);
        }
      }
    });

    prevMedicinesRef.current = medicines;
  }, [medicines]);

  // --- EXPIRY MONITORING ---
  useEffect(() => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    medicines.forEach(med => {
      const expDate = new Date(med.expiryDate);
      if (expDate <= thirtyDays && expDate >= now) {
        const existingAlert = alerts.find(a => a.medicineId === med.id && a.type === 'expiring_soon');
        if (!existingAlert) {
          const newAlert: Alert = {
            id: 'exp-' + med.id + '-' + Date.now(),
            type: 'expiring_soon',
            title: `${t.expiredMedicine}: ${med.name}`,
            description: `Ablaufdatum rückt näher: ${med.expiryDate}.`,
            timestamp: new Date().toISOString(),
            status: 'new',
            read: false,
            medicineId: med.id
          };
          firebase.saveSingleAlert(newAlert);
        }
      }
    });
  }, [medicines, t]);

  // Theme styling
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    const styleId = 'dynamic-theme-style';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      .bg-accent { background-color: ${settings.accentColor} !important; }
      .text-accent { color: ${settings.accentColor} !important; }
      .border-accent { border-color: ${settings.accentColor} !important; }
      .shadow-accent { box-shadow: 0 0 25px ${settings.accentColor}66 !important; }
      .logo-pulse { filter: drop-shadow(0 0 8px ${settings.accentColor}88); animation: logo-glow 2s infinite alternate; }
      @keyframes logo-glow { from { filter: drop-shadow(0 0 4px ${settings.accentColor}44); } to { filter: drop-shadow(0 0 15px ${settings.accentColor}aa); } }
    `;
  }, [settings.accentColor]);

  // Withdrawal success toast
  useEffect(() => {
    if (withdrawalSuccessList) {
      const timer = setTimeout(() => setWithdrawalSuccessList(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [withdrawalSuccessList]);

  // Local storage for session
  useEffect(() => { storage.set('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { storage.set('activeCart', cart); }, [cart]);

  // Navigation handlers
  const handleNavigate = (tab: string, extra?: any) => { 
    if (tab === activeTab) return;
    if (tab === 'admin' && extra?.tab) setAdminTab(extra.tab);
    setNavHistory(prev => [...prev, tab]);
    setActiveTab(tab); 
  };

  const handleBack = () => {
    if (navHistory.length <= 1) return;
    const newHistory = [...navHistory];
    newHistory.pop();
    const prevTab = newHistory[newHistory.length - 1];
    setNavHistory(newHistory);
    setActiveTab(prevTab);
  };

  // Medicine operations with Firebase sync
  const handleSetMedicines = (updater: Medicine[] | ((prev: Medicine[]) => Medicine[])) => {
    const newMedicines = typeof updater === 'function' ? updater(medicines) : updater;
    newMedicines.forEach(med => {
      const existing = medicines.find(m => m.id === med.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(med)) {
        firebase.saveSingleMedicine(med);
      }
    });
  };

  const handleSaveMedicine = (updatedMed: Medicine) => {
    firebase.saveSingleMedicine(updatedMed);
  };

  // Withdrawal with Firebase sync
  const completeWithdrawal = (results: Withdrawal[]) => {
    results.forEach(w => firebase.saveSingleWithdrawal(w));
    
    results.forEach(withdrawal => {
      const med = medicines.find(m => m.id === withdrawal.medicineId);
      if (med) {
        firebase.saveSingleMedicine({
          ...med,
          currentStock: med.currentStock - withdrawal.quantity
        });
      }
    });

    setWithdrawalSuccessList(results);
    setCart([]);
    setActiveTab('dashboard');
    setNavHistory(['dashboard']);
  };

  // Orders with Firebase sync
  const handleSetOrders = (updater: OrderItem[] | ((prev: OrderItem[]) => OrderItem[])) => {
    const newOrders = typeof updater === 'function' ? updater(orders) : updater;
    firebase.updateOrders(newOrders);
  };

  const handleDeliveryComplete = (orderId: string, receivedQty: number, expiryDate: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const med = medicines.find(m => m.id === order.medicineId);
    if (med) {
      firebase.saveSingleMedicine({
        ...med,
        currentStock: med.currentStock + receivedQty,
        expiryDate: expiryDate
      });
    }

    firebase.deleteSingleOrder(orderId);
    alert(t.systemUpdated);
  };

  // Alerts with Firebase sync
  const handleSetAlerts = (updater: Alert[] | ((prev: Alert[]) => Alert[])) => {
    const newAlerts = typeof updater === 'function' ? updater(alerts) : updater;
    firebase.updateAlerts(newAlerts);
  };

  // Users with Firebase sync
  const handleSetUsers = (updater: User[] | ((prev: User[]) => User[])) => {
    const newUsers = typeof updater === 'function' ? updater(users) : updater;
    firebase.updateUsers(newUsers);
  };

  // Tasks with Firebase sync
  const handleSetTasks = (updater: Task[] | ((prev: Task[]) => Task[])) => {
    const newTasks = typeof updater === 'function' ? updater(tasks) : updater;
    firebase.updateTasks(newTasks);
  };

  // Settings with Firebase sync
  const handleSetSettings = (updater: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    const newSettings = typeof updater === 'function' ? updater(settings) : updater;
    firebase.updateSettings(newSettings);
  };

  // Withdrawals with Firebase sync
  const handleSetWithdrawals = (updater: Withdrawal[] | ((prev: Withdrawal[]) => Withdrawal[])) => {
    const newWithdrawals = typeof updater === 'function' ? updater(withdrawals) : updater;
    firebase.updateWithdrawals(newWithdrawals);
  };

  // Broadcast
  const handleSendBroadcast = (msg: string, targetUserIds?: string[], link?: string, imageUrl?: string, title?: string) => {
    const newAlert: Alert = {
      id: 'brd-' + Math.random().toString(36).substr(2, 9),
      type: 'broadcast',
      title: title || 'System Broadcast',
      description: msg,
      timestamp: new Date().toISOString(),
      status: 'new',
      read: false,
      link,
      imageUrl,
      targetUserId: targetUserIds ? targetUserIds[0] : 'all'
    };
    firebase.saveSingleAlert(newAlert);
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard t={t} onNavigate={handleNavigate} currentUser={currentUser} medicines={medicines} withdrawals={withdrawals} orders={orders} alerts={alerts} settings={settings} tasks={tasks} />;
      case 'inventory': return <Inventory t={t} medicines={medicines} setMedicines={handleSetMedicines} role={currentUser.role} onUpdateCartQty={(med) => { setPrefilledWithdrawal(med); handleNavigate('withdrawal'); }} cart={cart} onNavigateToWithdrawal={()=>{}} currentUser={currentUser} settings={settings} onLoggedDeletion={(log) => firebase.updateDeletionLogs([log, ...deletionLogs])} prefilledData={null} onPrefillHandled={() => {}} onSaveSuccess={handleSaveMedicine} />;
      case 'withdrawal': return <WithdrawalPage t={t} medicines={medicines} user={currentUser} users={users} onComplete={completeWithdrawal} prefilledMed={prefilledWithdrawal} onPrefillHandled={() => setPrefilledWithdrawal(null)} settings={settings} cart={cart} setCart={setCart} />;
      case 'reports': return <Reports t={t} withdrawals={withdrawals} setWithdrawals={handleSetWithdrawals} deliveries={deliveries} disposals={disposals} deletionLogs={deletionLogs} role={currentUser.role} medicines={medicines} audits={audits} settings={settings} currentUser={currentUser} />;
      case 'alerts': return <Alerts t={t} alerts={alerts} setAlerts={handleSetAlerts} user={currentUser} medicines={medicines} onMoveToOrders={()=>{}} />;
      case 'admin': return <AdminPanel t={t} settings={settings} setSettings={handleSetSettings} users={users} setUsers={handleSetUsers} tasks={tasks} setTasks={handleSetTasks} currentUser={currentUser} initialTab={adminTab} onSendBroadcast={handleSendBroadcast} />;
      case 'userManagement': return <UserManagement t={t} users={users} setUsers={handleSetUsers} currentUser={currentUser} tasks={tasks} setTasks={handleSetTasks} />;
      case 'settings': return <SettingsPage t={t} settings={settings} setSettings={handleSetSettings} onLogout={() => setCurrentUser(null)} currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'profile': return <ProfilePage t={t} user={currentUser} users={users} setUsers={handleSetUsers} tasks={tasks} setTasks={handleSetTasks} alerts={alerts} setAlerts={handleSetAlerts} onLogout={() => setCurrentUser(null)} onNavigate={handleNavigate} settings={settings} withdrawals={withdrawals} />;
      case 'btmControl': return <BTMControl t={t} medicines={medicines} setMedicines={handleSetMedicines} withdrawals={withdrawals} setWithdrawals={handleSetWithdrawals} user={currentUser} settings={settings} />;
      case 'inventoryCheck': return <InventoryCheck t={t} medicines={medicines} user={currentUser} onComplete={(a) => firebase.updateAudits([a, ...audits])} settings={settings} />;
      case 'orders': return <OrderList t={t} orders={orders} setOrders={handleSetOrders} medicines={medicines} setMedicines={handleSetMedicines} role={currentUser.role} onDeliveryComplete={handleDeliveryComplete} currentUser={currentUser} settings={settings} />;
      case 'issue': return <IssueReport t={t} onSubmit={(a) => firebase.saveSingleAlert(a)} currentUser={currentUser} />;
      default: return null;
    }
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} users={users} settings={settings} onResetRequest={() => {}} />;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col md:flex-row overflow-x-hidden break-words">
      {/* Connection Status Indicator */}
      <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${
        firebase.isOnline 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
        {firebase.isOnline ? (
          <>
            <Cloud size={14} />
            <span>Online</span>
            {firebase.isSyncing && <RefreshCw size={12} className="animate-spin" />}
          </>
        ) : (
          <>
            <CloudOff size={14} />
            <span>Offline</span>
          </>
        )}
      </div>

      <aside className="hidden md:flex flex-col w-72 bg-[#0d1b2e] border-r border-white/5 fixed inset-y-0 z-50 transition-colors duration-500">
        <div className="p-10 text-center border-b border-white/5 relative">
           <img src={settings.appLogoUrl} className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-accent logo-pulse relative z-10" alt="Logo" />
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto no-scrollbar">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => handleNavigate('dashboard')} icon={<Home size={20}/>} label={t.dashboard} />
          <SidebarBtn active={activeTab === 'inventory'} onClick={() => handleNavigate('inventory')} icon={<Package size={20}/>} label={t.inventory} />
          <SidebarBtn active={activeTab === 'withdrawal'} onClick={() => handleNavigate('withdrawal')} icon={<ArrowLeftRight size={20}/>} label={t.withdrawal} badge={cartItemCount > 0 ? cartItemCount : null} />
          <SidebarBtn active={activeTab === 'orders'} onClick={() => handleNavigate('orders')} icon={<ShoppingCart size={20}/>} label={t.orders} />
          <SidebarBtn active={activeTab === 'reports'} onClick={() => handleNavigate('reports')} icon={<BarChart3 size={20}/>} label={t.reports} />
          <SidebarBtn active={activeTab === 'alerts'} onClick={() => handleNavigate('alerts')} icon={<Bell size={20}/>} label={t.alarms} badge={unreadAlertsCount > 0 ? unreadAlertsCount : null} />
          <SidebarBtn active={activeTab === 'profile'} onClick={() => handleNavigate('profile')} icon={<UserIcon size={20}/>} label={t.profile} />
          <SidebarBtn active={false} onClick={() => setCurrentUser(null)} icon={<LogOut size={20}/>} label={t.logout} />
        </nav>
      </aside>

      <main className="flex-1 md:ml-72 pb-32 md:pb-6 pt-6 md:pt-10 px-4 md:px-16 relative min-h-screen flex flex-col">
        {activeTab !== 'dashboard' && (
          <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase w-fit">
            <ArrowLeft size={14} className="text-accent" /> {t.back}
          </button>
        )}
        <div className="max-w-5xl mx-auto w-full flex-1">
          {renderContent()}
        </div>
        
        {withdrawalSuccessList && (
           <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-md animate-in slide-in-from-top-10 duration-500">
              <div className="bg-emerald-600 p-6 rounded-[32px] shadow-2xl border border-white/20 flex flex-col gap-3">
                 <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <CheckCircle size={24} className="text-white"/>
                    <h3 className="font-black uppercase text-sm">Withdrawal Successful</h3>
                 </div>
                 <div className="space-y-1">
                    {withdrawalSuccessList.map(w => (
                       <div key={w.id} className="flex justify-between items-center text-white/90 text-xs">
                          <span className="font-bold uppercase">{w.medicineName}</span>
                          <span className="font-black">Qty: {w.quantity}</span>
                       </div>
                    ))}
                 </div>
                 <p className="text-[9px] font-bold text-white/60 uppercase text-center mt-2">Closing in 5 seconds...</p>
              </div>
           </div>
        )}

        <div className="text-center pt-12 pb-4 opacity-30 text-[8px] font-black uppercase tracking-[0.4em] select-none">
          Developed & Designed by Amjad Altokan
        </div>
      </main>

      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1b2e]/98 backdrop-blur-2xl border-t border-white/5 py-5 items-center justify-around z-40 px-2 rounded-t-[36px] shadow-3xl">
        <NavBtn active={activeTab === 'dashboard'} onClick={() => handleNavigate('dashboard')} icon={<Home size={22} />} label={t.dashboard} />
        <NavBtn active={activeTab === 'withdrawal'} onClick={() => handleNavigate('withdrawal')} icon={<ArrowLeftRight size={22} />} label={t.withdrawal} badge={cartItemCount > 0 ? cartItemCount : null} />
        <NavBtn active={activeTab === 'inventory'} onClick={() => handleNavigate('inventory')} icon={<Scan size={28} />} label="Scan" isScanner />
        <NavBtn active={activeTab === 'alerts'} onClick={() => handleNavigate('alerts')} icon={<Bell size={22} />} label={t.alerts} badge={unreadAlertsCount > 0 ? '•' : null} />
        <NavBtn active={activeTab === 'settings'} onClick={() => handleNavigate('settings')} icon={<Settings size={22} />} label={t.settings} />
      </nav>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${active ? 'bg-accent text-[#0a1628] font-black shadow-accent' : 'text-slate-400 hover:text-white'}`}>
    <div className="flex items-center gap-3">
      {icon} <span className="uppercase text-[11px] tracking-widest break-words leading-tight">{label}</span>
    </div>
    {badge && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const NavBtn = ({ active, onClick, icon, label, isScanner, badge }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 active:scale-75 transition-all relative ${active ? 'text-accent' : 'text-slate-500'} ${isScanner ? 'bg-accent text-[#0a1628] p-4 rounded-full -mt-16 shadow-accent border-4 border-[#0a1628]' : ''}`}>
    <div className="relative">
        {icon}
        {badge && (
            <span className={`absolute -top-2 -right-2 bg-red-600 text-white rounded-full flex items-center justify-center font-black animate-in zoom-in duration-300 ${badge === '•' ? 'w-2 h-2 p-0' : 'min-w-[16px] h-4 text-[9px] px-1'}`}>
                {badge}
            </span>
        )}
    </div>
    {!isScanner && <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>}
  </button>
);

export default App;
