
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Trash2, Calendar, ShoppingCart, X, ChevronRight, Package, ExternalLink, Download, Bell, Image as ImageIcon, Archive, History, ShieldCheck, RefreshCw } from 'lucide-react';
import { Alert, User as UserType, OrderItem, OrderStatus, Medicine } from '../types';

interface AlertsProps {
  t: any;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  user: UserType;
  onMoveToOrders: (order: OrderItem) => void;
  medicines: Medicine[];
  // Added onGoToOrders to fix type error in App.tsx
  onGoToOrders?: () => void;
}

const Alerts: React.FC<AlertsProps> = ({ t, alerts, setAlerts, user, onMoveToOrders, medicines, onGoToOrders }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (selectedAlert && !selectedAlert.read && selectedAlert.status !== 'completed') {
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, read: true } : a));
    }
  }, [selectedAlert, setAlerts]);

  const updateStatus = (id: string, status: 'new' | 'in_progress' | 'completed') => {
    setAlerts(prev => prev.map(a => a.id === id ? { 
      ...a, 
      status, 
      userAction: user.username, 
      actionTime: new Date().toISOString(), 
      read: true 
    } : a));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { 
      ...a, 
      status: 'completed', 
      userAction: user.username, 
      actionTime: new Date().toISOString(), 
      read: true 
    } : a));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'low_stock': return 'bg-amber-500 text-[#0a1628] border-amber-500/30';
      case 'expiring_soon': return 'bg-red-500 text-white border-red-500/30';
      case 'broadcast': return 'bg-blue-600 text-white border-blue-500/30';
      case 'security_update': return 'bg-emerald-600 text-white border-emerald-500/30';
      default: return 'bg-slate-700 text-white border-white/10';
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'completed');
  const historyAlerts = alerts.filter(a => a.status === 'completed');
  const displayAlerts = viewTab === 'active' ? activeAlerts : historyAlerts;

  return (
    <div className="space-y-4 md:space-y-10 animate-in fade-in duration-500 pb-20 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">{t.alerts}</h1>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Intelligence</p>
        </div>
        <div className="flex bg-[#0d1b2e] p-1.5 rounded-2xl border border-white/5 shadow-inner">
           <button 
             onClick={() => setViewTab('active')} 
             className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase transition-all flex items-center gap-2 ${viewTab === 'active' ? 'bg-accent text-[#0a1628] shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
           >
             <Bell size={14}/> Active {activeAlerts.length > 0 && <span className="bg-red-600 text-white px-1.5 rounded-full text-[8px]">{activeAlerts.length}</span>}
           </button>
           <button 
             onClick={() => setViewTab('history')} 
             className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-xs font-black uppercase transition-all flex items-center gap-2 ${viewTab === 'history' ? 'bg-accent text-[#0a1628] shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
           >
             <History size={14}/> History Logs
           </button>
        </div>
      </header>

      <div className="space-y-3 md:space-y-6">
        {displayAlerts.length > 0 ? displayAlerts.map(alert => (
          <div key={alert.id} className={`bg-[#0d1b2e] rounded-2xl md:rounded-[40px] p-4 md:p-8 border ${alert.read ? 'border-white/5 opacity-70' : 'border-accent/30 shadow-[0_10px_30px_rgba(255,215,0,0.05)]'} cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group`} onClick={() => setSelectedAlert(alert)}>
            {!alert.read && alert.status !== 'completed' && <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-accent animate-pulse"></div>}
            <div className="flex gap-4 md:gap-8 items-start">
              <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[28px] flex items-center justify-center border shadow-xl flex-shrink-0 ${getTypeStyle(alert.type)}`}>
                {alert.link ? <RefreshCw size={24} className="md:w-10 md:h-10 animate-spin-slow" /> : alert.type === 'broadcast' ? <Bell size={24} className="md:w-10 md:h-10" /> : <AlertTriangle size={24} className="md:w-10 md:h-10" />}
              </div>
              <div className="flex-1 min-w-0 space-y-1 md:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs md:text-xl font-black uppercase text-white truncate pr-2">{alert.title}</h3>
                  <span className="text-[7px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest whitespace-nowrap">{new Date(alert.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-400 text-[10px] md:text-base font-medium leading-relaxed line-clamp-2 md:line-clamp-3">{alert.description}</p>
                {alert.imageUrl && <div className="mt-2 w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden border border-white/5 shadow-inner"><img src={alert.imageUrl} className="w-full h-full object-cover"/></div>}
              </div>
              {viewTab === 'active' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); }}
                  className="p-2 text-red-500/20 hover:text-red-500 transition-all active:scale-75"
                >
                  <Trash2 size={16} className="md:w-6 md:h-6"/>
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="py-32 text-center opacity-20 bg-[#0d1b2e] rounded-[48px] border border-dashed border-white/10 flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><History size={40}/></div>
             <p className="text-sm md:text-xl font-black uppercase tracking-[0.3em]">Vault Empty</p>
             <p className="text-[10px] uppercase font-bold mt-2 tracking-widest">No intelligence found in this category</p>
          </div>
        )}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAlert(null)}>
          <div className="bg-[#0d1b2e] w-full max-w-xl rounded-[32px] md:rounded-[56px] shadow-3xl border border-white/10 overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 md:p-10 flex justify-between items-center ${getTypeStyle(selectedAlert.type)}`}>
               <div className="flex items-center gap-3">
                  <ShieldCheck size={24}/>
                  <h2 className="text-xs md:text-2xl font-black uppercase tracking-tighter">Mission Briefing</h2>
               </div>
               <button onClick={() => setSelectedAlert(null)} className="p-2 hover:rotate-90 transition-transform"><X size={24} className="md:w-8 md:h-8" /></button>
            </div>
            <div className="p-8 md:p-14 space-y-8">
              <div className="space-y-3">
                 <h3 className="text-xl md:text-4xl font-black text-white uppercase leading-none tracking-tighter">{selectedAlert.title}</h3>
                 <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] flex items-center gap-2"><Clock size={12}/> Received: {new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>
              <div className="bg-[#0a1628] p-6 rounded-[28px] border border-white/5">
                 <p className="text-slate-300 text-sm md:text-xl leading-relaxed font-medium">{selectedAlert.description}</p>
              </div>
              
              {selectedAlert.link && (
                <button 
                  onClick={() => window.open(selectedAlert.link, '_blank')}
                  className="w-full bg-[#ffd700] text-[#0a1628] py-6 rounded-[32px] font-black uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 animate-bounce"
                >
                  <Download size={24}/> Download New Version
                </button>
              )}

              {selectedAlert.imageUrl && <div className="rounded-[28px] overflow-hidden border border-white/5 shadow-2xl"><img src={selectedAlert.imageUrl} className="w-full h-auto max-h-80 object-contain bg-black/40" /></div>}
              
              <div className="flex gap-3 pt-6">
                {selectedAlert.status !== 'completed' ? (
                  <>
                    <button onClick={() => updateStatus(selectedAlert.id, 'completed')} className="flex-1 bg-emerald-600 text-white py-4 md:py-8 rounded-2xl md:rounded-[32px] font-black uppercase text-[10px] md:text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                       <CheckCircle size={20}/> Mark as Resolved
                    </button>
                    <button onClick={() => deleteAlert(selectedAlert.id)} className="p-4 md:p-8 bg-red-600/10 text-red-500 rounded-2xl md:rounded-[32px] border border-red-500/20 active:scale-95 transition-all">
                       <Trash2 size={24}/>
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-[#0a1628] p-6 rounded-[32px] border border-emerald-500/20 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-2">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle size={24}/></div>
                    <div className="text-center">
                       <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-1">Archived intelligence</p>
                       <p className="text-emerald-500 font-bold uppercase text-[10px] md:text-sm">Processed by <span className="font-black">@{selectedAlert.userAction}</span></p>
                       <p className="text-slate-700 font-bold text-[8px] md:text-[9px] mt-1 uppercase tracking-tighter">{new Date(selectedAlert.actionTime || '').toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Alerts;
