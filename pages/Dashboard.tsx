
import React, { useState } from 'react';
import { 
  Plus, ArrowLeftRight, Package, ShoppingCart, BarChart3, ClipboardCheck, Lock, ShieldCheck, HelpCircle, Phone, ChevronRight, Bell, Clock, Activity, Zap, Info, AlertTriangle, Settings, Users, Send, AlertCircle, Boxes, ShieldAlert, Headset, Command, CheckCircle, ClipboardList, PenTool, Wrench, Mail, X
} from 'lucide-react';
import { Medicine, OrderItem, Alert, Role, Task, AppSettings, Withdrawal, User } from '../types';

interface DashboardProps {
  t: any;
  onNavigate: (tab: string, extra?: any) => void;
  currentUser: User;
  medicines: Medicine[];
  withdrawals: Withdrawal[];
  orders: OrderItem[];
  alerts: Alert[];
  settings: AppSettings;
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ t, onNavigate, currentUser, settings, alerts }) => {
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactOption = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.location.href = `tel:${settings.supervisorPhone}`;
    } else {
      const subject = encodeURIComponent(`Emergency Contact - ${currentUser.fullName || currentUser.username}`);
      const body = encodeURIComponent(`Message from operator ${currentUser.username}: \n\n`);
      window.location.href = `mailto:${settings.reportEmail || settings.supervisorEmail}?subject=${subject}&body=${body}`;
    }
    setShowContactModal(false);
  };

  const hasAdminAccess = currentUser.role === 'admin' || currentUser.permissions?.accessAdminPanel;
  const permissions = currentUser.permissions;

  // Filter alerts for the feed: targeted to user + special 72h rule for Restocked items
  const recentActivities = alerts
    .filter(a => {
      const isTargeted = !a.targetUserId || a.targetUserId === 'all' || a.targetUserId === currentUser.id;
      if (!isTargeted) return false;

      // Logic: If it's a "Restocked" alert, only show if created within the last 72 hours
      if (a.title.includes('Restocked')) {
        const now = new Date();
        const alertTime = new Date(a.timestamp);
        const diffInHours = (now.getTime() - alertTime.getTime()) / (1000 * 3600);
        return diffInHours <= 72;
      }

      // Show low stock and expiring items in the feed
      if (a.type === 'low_stock' || a.type === 'expiring_soon') {
        return true;
      }

      // Show broadcast/updates
      if (a.type === 'broadcast' || a.type === 'issue_report') {
        return true;
      }

      return false;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getActivityConfig = (activity: Alert) => {
    if (activity.title.includes('Restocked')) {
      return { color: 'bg-emerald-600', icon: <CheckCircle size={16} className="text-white" />, target: 'alerts' };
    }
    switch (activity.type) {
      case 'issue_report': 
      case 'low_stock':
        return { color: 'bg-red-600', icon: <AlertCircle size={16} className="text-white" />, target: 'alerts' };
      case 'task': 
        return { color: 'bg-emerald-600', icon: <ClipboardCheck size={16} className="text-white" />, target: 'profile' };
      case 'expiring_soon':
        return { color: 'bg-orange-600', icon: <Package size={16} className="text-white" />, target: 'alerts' };
      case 'broadcast':
        return { color: 'bg-blue-600', icon: <Info size={16} className="text-white" />, target: 'alerts' };
      default:
        return { color: 'bg-accent text-[#0a1628]', icon: <Info size={16} />, target: 'alerts' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 px-1 md:px-0">
      <header className="flex items-center justify-between py-6 border-b border-white/10 mb-2">
        <div className="min-w-0 cursor-pointer group" onClick={() => onNavigate('profile')}>
          <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight uppercase group-hover:text-accent transition-colors">
            {t.welcome}, {currentUser.username}!
          </h1>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-accent font-black uppercase text-[10px] md:text-sm tracking-[0.4em]">
               {settings.appName}
            </p>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-xs tracking-widest border-l-2 border-accent pl-3 mt-1">
               {currentUser.jobTitle || 'Operational Member'}
            </p>
          </div>
        </div>
        <div onClick={() => onNavigate('profile')} className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-accent overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.4)] cursor-pointer hover:scale-110 transition-transform flex-shrink-0">
          <img src={settings.appLogoUrl} className="w-full h-full object-cover" alt="Logo" />
        </div>
      </header>

      {/* Latest Activity with LIVE indicator */}
      <section className="bg-[#0d1b2e] p-6 md:p-8 rounded-[32px] border border-accent/20 shadow-[0_0_40px_rgba(255,215,0,0.05)] space-y-6 relative overflow-hidden">
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                 <Zap size={18} className="animate-pulse" />
               </div>
               <div className="flex items-center gap-2">
                  <h2 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.latestActivity}</h2>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                    </span>
                    <span className="text-[7px] font-black text-white tracking-widest uppercase">LIVE</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
            {recentActivities.length > 0 ? recentActivities.map((activity) => {
               const config = getActivityConfig(activity);
               return (
                  <div key={activity.id} onClick={() => onNavigate(config.target)} className="bg-[#0a1628] p-4 rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-300 cursor-pointer group flex items-center gap-4 animate-in slide-in-from-bottom-2">
                     <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 duration-500 ${config.color}`}>
                       {config.icon}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-white font-black uppercase text-[10px] md:text-xs truncate">{activity.title}</p>
                       <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase truncate mt-0.5">{activity.description}</p>
                     </div>
                     <div className="text-right hidden sm:block">
                        <p className="text-slate-700 font-black text-[9px] uppercase"><Clock size={10} className="inline mb-0.5 mr-1"/>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
               );
            }) : (
               <div className="py-12 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[40px]">
                  <Activity size={32} className="mx-auto mb-2" />
                  <p className="font-black uppercase tracking-widest text-[10px]">{t.noSignals}</p>
               </div>
            )}
         </div>
      </section>

      {/* Section 1: Operational Logistics */}
      <section className="bg-[#0d1b2e] p-6 md:p-8 rounded-[32px] border border-white/5 shadow-xl space-y-6">
        <div className="flex items-center justify-between px-2 group">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.opsLogistics}</h2>
          <Boxes size={18} className="text-slate-600 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          <DashItem disabled={!permissions?.addMedicine && currentUser.role !== 'admin'} onClick={() => onNavigate('inventory')} icon={<Plus/>} label={t.addMedicine} color="text-emerald-500" />
          <DashItem onClick={() => onNavigate('withdrawal')} icon={<ArrowLeftRight/>} label={t.withdrawal} color="text-amber-500" />
          <DashItem onClick={() => onNavigate('inventory')} icon={<Package/>} label={t.viewStock} color="text-blue-500" />
          <DashItem disabled={!permissions?.manageOrders && currentUser.role !== 'admin'} onClick={() => onNavigate('orders')} icon={<ShoppingCart/>} label={t.orders} color="text-purple-500" />
          <DashItem disabled={!permissions?.exportReports && currentUser.role !== 'admin'} onClick={() => onNavigate('reports')} icon={<BarChart3/>} label={t.reports} color="text-accent" />
          <DashItem disabled={!permissions?.inventoryCheck && currentUser.role !== 'admin'} onClick={() => onNavigate('inventoryCheck')} icon={<ClipboardList/>} label={t.inventoryCheck} color="text-red-500" />
        </div>
      </section>

      {/* Section 2: BTM Vault */}
      <section className="bg-[#0d1b2e] p-6 md:p-8 rounded-[32px] border border-accent/20 shadow-xl space-y-6">
         <div className="flex items-center justify-between px-2 group">
            <h2 className="text-[10px] font-black text-[#ffd700] uppercase tracking-[0.3em]">Controlled Substances Vault</h2>
            <Lock size={18} className="text-[#ffd700] group-hover:scale-110 transition-transform duration-500" />
         </div>
         <button onClick={() => onNavigate('btmControl')} className="w-full bg-[#0a1628] p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-[#ffd700] transition-all">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-[#ffd700]/10 text-[#ffd700] rounded-xl group-hover:rotate-12 duration-500 shadow-accent/10 shadow-lg"><ShieldCheck size={32}/></div>
               <div className="text-left">
                  <p className="text-white font-black uppercase text-xl">{t.btmVault}</p>
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{t.securedArea}</p>
               </div>
            </div>
            <ChevronRight size={24} className="text-slate-700 group-hover:text-[#ffd700] transition-colors" />
         </button>
      </section>

      {/* Section 3: Report and Contacts */}
      <section className="bg-[#0d1b2e] p-6 md:p-8 rounded-[32px] border border-white/5 shadow-xl space-y-6">
        <div className="flex items-center justify-between px-2 group">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.operationalSupport}</h2>
          <Headset size={18} className="text-slate-600 group-hover:-translate-y-0.5 transition-transform" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <DashCard onClick={() => onNavigate('issue')} icon={<Wrench size={20} />} label={t.issue} sublabel="Report Faults" />
           <DashCard onClick={() => setShowContactModal(true)} icon={<ShieldAlert size={20} />} label={t.contactSupervisor} sublabel="Ops Chief" />
        </div>
      </section>

      {/* Section 4: Admin Panel */}
      {hasAdminAccess && (
        <section className="bg-red-600/5 p-6 md:p-8 rounded-[32px] border border-red-500/20 shadow-xl space-y-6">
           <div className="flex items-center justify-between px-2 group">
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">{t.restrictedAccess}</h2>
              <Command size={18} className="text-red-500 group-hover:rotate-45 transition-transform duration-700" />
           </div>
           <div className="grid grid-cols-3 gap-3 md:gap-4">
              <DashItem onClick={() => onNavigate('userManagement')} icon={<Users/>} label={t.users} color="text-red-500" />
              <DashItem onClick={() => onNavigate('admin')} icon={<Settings/>} label={t.adminPanel} color="text-red-500" />
              <DashItem onClick={() => onNavigate('admin', { initialTab: 'broadcast' })} icon={<Bell/>} label="Send Alert" color="text-red-500" />
           </div>
        </section>
      )}

      {/* Contact Supervisor Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-[#0d1b2e] w-full max-w-sm rounded-[32px] border border-white/10 shadow-3xl overflow-hidden">
              <div className="p-6 bg-accent text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-lg font-black uppercase tracking-tight">{t.contactSupervisor}</h2>
                 <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-black/5 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-4">
                 <button 
                  onClick={() => handleContactOption('phone')}
                  className="w-full flex items-center gap-4 bg-[#0a1628] p-6 rounded-2xl border border-white/5 hover:border-accent/40 transition-all text-left"
                 >
                    <div className="p-3 bg-accent/10 text-accent rounded-xl"><Phone size={24}/></div>
                    <div>
                       <p className="text-white font-black uppercase text-sm">Call Hotline</p>
                       <p className="text-slate-500 font-bold text-xs">{settings.supervisorPhone}</p>
                    </div>
                 </button>
                 <button 
                  onClick={() => handleContactOption('email')}
                  className="w-full flex items-center gap-4 bg-[#0a1628] p-6 rounded-2xl border border-white/5 hover:border-accent/40 transition-all text-left"
                 >
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Mail size={24}/></div>
                    <div>
                       <p className="text-white font-black uppercase text-sm">Send Email</p>
                       <p className="text-slate-500 font-bold text-xs truncate max-w-[150px]">{settings.supervisorEmail}</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DashItem = ({ onClick, icon, label, color, disabled }: any) => (
  <button disabled={disabled} onClick={onClick} className={`flex flex-col items-center gap-3 group transition-all duration-500 ${disabled ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
    <div className={`w-full aspect-square flex items-center justify-center rounded-[24px] border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all relative overflow-hidden group-active:scale-95`}>
      <div className={`${color} group-hover:scale-125 transition-transform duration-500`}>{React.cloneElement(icon, { size: 28 })}</div>
    </div>
    <span className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] text-center tracking-[0.1em] leading-tight group-hover:text-white break-words">{label}</span>
  </button>
);

const DashCard = ({ onClick, icon, label, sublabel }: any) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-[#0a1628] p-4 rounded-2xl border border-white/5 hover:border-accent/40 transition-all text-left">
    <div className="p-3 bg-white/5 rounded-xl text-slate-400">{icon}</div>
    <div className="min-w-0">
      <p className="text-white font-black uppercase text-[10px] truncate">{label}</p>
      <p className="text-slate-500 font-bold uppercase text-[7px] tracking-widest truncate">{sublabel}</p>
    </div>
  </button>
);

export default Dashboard;
