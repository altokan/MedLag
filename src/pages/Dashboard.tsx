
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowLeftRight, Package, ShoppingCart, BarChart3, ClipboardCheck, Lock, ShieldCheck, HelpCircle, Phone, ChevronRight
} from 'lucide-react';
import { Medicine, OrderItem, Alert, Role, Task, AppSettings, Withdrawal } from '../types';

interface DashboardProps {
  t: any;
  onNavigate: (tab: string, extra?: any) => void;
  role: Role;
  username: string;
  fullName?: string;
  medicines: Medicine[];
  withdrawals: Withdrawal[];
  orders: OrderItem[];
  alerts: Alert[];
  settings: AppSettings;
  tasks: Task[];
  permissions?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ t, onNavigate, role, username, fullName, medicines, withdrawals, orders, alerts, settings, tasks, permissions }) => {
  const handleCall = () => { 
    if(confirm(t.callConfirm)) {
      window.location.href = `tel:${settings.supervisorPhone}`;
    }
  };

  const hasAdminAccess = role === 'admin' || permissions?.accessAdminPanel;
  const hasPersonnelAccess = role === 'admin' || permissions?.managePersonnel || permissions?.manageUsers;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-1000 pb-12">
      <header className="flex items-center justify-between px-1 py-4 md:py-6 border-b border-white/5 mb-4 md:mb-8">
        <div className="space-y-1 md:space-y-2 cursor-pointer group active:scale-95 transition-all duration-300" onClick={() => onNavigate('profile')}>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-5xl font-black text-white tracking-tight leading-none shrink-0 group-hover:text-accent transition-colors">{t.welcome}, {username}!</h1>
            <p className="text-accent font-black uppercase text-[8px] md:text-sm tracking-[0.2em] opacity-80 mt-1 md:mt-1.5">{settings.appName}</p>
          </div>
        </div>
        <div onClick={() => onNavigate('profile')} className="w-20 h-20 md:w-36 md:h-36 bg-[#0d1b2e] border-2 border-accent rounded-full flex items-center justify-center p-0 shadow-[0_0_30px_rgba(255,215,0,0.25)] overflow-hidden shrink-0 ml-2 cursor-pointer hover:rotate-3 hover:scale-105 transition-all duration-500 group animate-in zoom-in">
          <img src={settings.appLogoUrl} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" alt="App Logo" />
        </div>
      </header>

      <div className="space-y-6 md:space-y-8">
        <section className="bg-[#0d1b2e] p-4 md:p-10 rounded-3xl md:rounded-[48px] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
          <h2 className="text-[9px] md:text-[10px] font-black mb-4 md:mb-6 text-slate-500 uppercase tracking-[0.2em] px-2 opacity-50">{t.opsLogistics}</h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
            <DashItem onClick={() => onNavigate('inventory')} icon={<Plus/>} label={t.addMedicine} color="text-emerald-500" />
            <DashItem onClick={() => onNavigate('withdrawal')} icon={<ArrowLeftRight/>} label={t.withdrawal} color="text-amber-500" />
            <DashItem onClick={() => onNavigate('inventory')} icon={<Package/>} label={t.viewStock} color="text-blue-500" />
            <DashItem onClick={() => onNavigate('orders')} icon={<ShoppingCart/>} label={t.orders} color="text-purple-500" />
            <DashItem onClick={() => onNavigate('reports')} icon={<BarChart3/>} label={t.reports} color="text-accent" />
            <DashItem onClick={() => onNavigate('inventoryCheck')} icon={<ClipboardCheck/>} label={t.inventoryCheck} color="text-red-500" />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {permissions?.manageBTM ? (
            <div className="bg-[#0d1b2e] p-5 md:p-7 rounded-[28px] md:rounded-[40px] border border-white/5 shadow-xl flex items-center justify-between group hover:border-accent transition-all cursor-pointer active:scale-[0.98] duration-300" onClick={() => onNavigate('btmControl')}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl group-hover:bg-accent group-hover:text-[#0a1628] transition-all duration-500 group-hover:scale-110">
                  <Lock size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm md:text-lg tracking-tighter leading-tight">{t.btmVault}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">{t.securedArea}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-800 group-hover:text-accent transition-all group-hover:translate-x-1" size={16} />
            </div>
          ) : (
             <div className="bg-[#0d1b2e]/40 p-5 md:p-7 rounded-[28px] md:rounded-[40px] border border-white/5 flex items-center gap-4 opacity-40 cursor-not-allowed">
                <div className="p-3 bg-slate-800 text-slate-500 rounded-2xl"><ShieldCheck size={20}/></div>
                <div>
                   <h3 className="text-slate-500 font-black uppercase text-sm md:text-lg tracking-tighter leading-tight">{t.btmVault}</h3>
                   <p className="text-slate-700 font-bold uppercase text-[7px] md:text-[9px] tracking-widest">{t.restrictedAccess}</p>
                </div>
             </div>
          )}

          <div className="bg-[#0d1b2e] p-5 md:p-7 rounded-[28px] md:rounded-[40px] border border-white/5 shadow-xl space-y-3">
             <h2 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] opacity-50 ml-1">{t.operationalSupport}</h2>
             <div className="flex gap-3">
                <button onClick={() => onNavigate('issue')} className="flex-1 bg-[#0a1628] p-2.5 rounded-xl flex items-center justify-center gap-2 border border-white/5 hover:border-accent transition-all active:scale-95 group min-w-0">
                   <HelpCircle className="text-accent group-hover:scale-110 transition-transform flex-shrink-0" size={14} />
                   <span className="text-white font-black uppercase text-[8px] md:text-[9px] truncate">{t.issue}</span>
                </button>
                <button onClick={handleCall} className="flex-1 bg-[#0a1628] p-2.5 rounded-xl flex items-center justify-center gap-2 border border-white/5 hover:border-accent transition-all active:scale-95 group min-w-0">
                   <Phone className="text-accent group-hover:scale-110 transition-transform flex-shrink-0" size={14} />
                   <span className="text-white font-black uppercase text-[8px] md:text-[9px] truncate">{t.contactSupervisor}</span>
                </button>
             </div>
          </div>
        </div>

        {(hasAdminAccess || hasPersonnelAccess) && (
          <div className="bg-[#0d1b2e] p-4 md:p-10 rounded-3xl md:rounded-[48px] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-[9px] md:text-[10px] font-black mb-4 md:mb-6 text-slate-500 uppercase tracking-[0.2em] px-2 opacity-50">{t.adminPanel}</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {hasPersonnelAccess && (
                <button onClick={() => onNavigate('admin', { tab: 'personnel' })} className="bg-[#0a1628] p-3 md:p-8 rounded-2xl md:rounded-[40px] flex flex-col items-center justify-center space-y-2 md:space-y-3 border border-white/5 hover:border-accent/30 transition-all active:scale-95 shadow-xl group">
                  <DashIcon icon={<Plus size={20}/>} color="text-accent" />
                  <span className="font-black text-[7px] md:text-[10px] text-slate-300 text-center uppercase tracking-widest leading-tight group-hover:text-white transition-colors">{t.personnel}</span>
                </button>
              )}
              {hasAdminAccess && (
                <button onClick={() => onNavigate('admin', { tab: 'broadcast' })} className="bg-[#0a1628] p-3 md:p-8 rounded-2xl md:rounded-[40px] flex flex-col items-center justify-center space-y-2 md:space-y-3 border border-white/5 hover:border-accent/30 transition-all active:scale-95 shadow-xl group">
                  <DashIcon icon={<ShieldCheck size={20}/>} color="text-accent" />
                  <span className="font-black text-[7px] md:text-[10px] text-slate-300 text-center uppercase tracking-widest leading-tight group-hover:text-white transition-colors">{t.adminPanel}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashIcon = ({ icon, color }: any) => (
  <div className={`${color} group-hover:scale-125 transition-transform duration-500`}>
    {React.cloneElement(icon, { size: 24 })}
  </div>
);

const DashItem = ({ onClick, icon, label, color }: any) => (
  <button onClick={onClick} className="bg-[#0a1628] p-4 md:p-8 rounded-2xl md:rounded-[40px] flex flex-col items-center justify-center space-y-2 md:space-y-3 border border-white/5 hover:border-accent/30 transition-all active:scale-95 group shadow-lg">
    <div className={`${color || 'text-accent'} group-hover:scale-125 transition-all duration-500`}>
      {React.cloneElement(icon, { size: 20, className: "md:w-6 md:h-6" })}
    </div>
    <span className="font-black text-[6px] md:text-[10px] text-slate-300 text-center uppercase tracking-widest leading-tight transition-colors group-hover:text-white truncate w-full">{label}</span>
  </button>
);

export default Dashboard;
