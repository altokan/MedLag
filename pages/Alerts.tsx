
import React, { useState, useMemo, useRef } from 'react';
import { Bell, History, RefreshCw, X, Download, AlertCircle, Timer, CheckCircle, Package, Info, MessageSquare, Camera, Check, Trash2, Send, Image as ImageIcon, Zap } from 'lucide-react';
import { Alert, User as UserType, Medicine, ChatMessage } from '../types';

interface AlertsProps {
  t: any;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  user: UserType;
  onMoveToOrders: (order: any) => void;
  medicines: Medicine[];
  onGoToOrders?: () => void;
}

const Alerts: React.FC<AlertsProps> = ({ t, alerts, setAlerts, user, medicines }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'history'>('active');
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === 'admin' || user.permissions?.accessAdminPanel;

  const handleSendReply = (alertId: string) => {
    if (!replyText && !replyImage) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.fullName || user.username,
      role: user.role,
      text: replyText,
      imageUrl: replyImage || undefined,
      timestamp: new Date().toISOString()
    };

    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          chat: [...(a.chat || []), newMessage],
          read: isAdmin ? a.read : true 
        };
      }
      return a;
    }));

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({
        ...selectedAlert,
        chat: [...(selectedAlert.chat || []), newMessage]
      });
    }

    setReplyText('');
    setReplyImage(null);
  };

  const updateStatus = (id: string, status: 'new' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      if (!confirm("Confirm Case Resolution? This will archive the thread and move it to History.")) return;
    }

    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { 
          ...a, 
          status, 
          userAction: user.username, 
          actionTime: new Date().toISOString(), 
          read: true 
        };
      }
      return a;
    }));
    
    // Auto-close modal after resolution
    if (status === 'completed') {
      setSelectedAlert(null);
    }
  };

  const handleDeleteAlert = (id: string) => {
    // حذف مباشر بدون تأكيد
    setAlerts(prev => prev.filter(a => a.id !== id));
    setSelectedAlert(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReplyImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'completed' && (!a.targetUserId || a.targetUserId === 'all' || a.targetUserId === user.id || a.targetUserId === undefined));
  const historyAlerts = alerts.filter(a => a.status === 'completed' && (!a.targetUserId || a.targetUserId === 'all' || a.targetUserId === user.id || a.targetUserId === undefined));
  const displayAlerts = viewTab === 'active' ? activeAlerts : historyAlerts;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">{t.alarm}</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Einsatzleitstelle Signals</p>
        </div>
        <div className="flex bg-[#0d1b2e] p-1 rounded-xl border border-white/5 shadow-xl">
           <button onClick={() => setViewTab('active')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${viewTab === 'active' ? 'bg-accent text-[#0a1628] shadow-lg' : 'text-slate-500'}`}>Active</button>
           <button onClick={() => setViewTab('history')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${viewTab === 'history' ? 'bg-accent text-[#0a1628] shadow-lg' : 'text-slate-500'}`}>History</button>
        </div>
      </header>

      <div className="space-y-3">
        {displayAlerts.map(alert => (
          <div key={alert.id} onClick={() => setSelectedAlert(alert)} className={`bg-[#0d1b2e] p-5 rounded-[32px] border transition-all cursor-pointer hover:bg-[#1a2a40] ${alert.read ? 'border-white/5 opacity-60' : 'border-red-600/40 shadow-lg'}`}>
             <div className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${alert.type === 'issue_report' ? 'bg-red-600 text-white' : alert.link ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse' : 'bg-accent text-[#0a1628]'}`}>
                   {alert.type === 'issue_report' ? <AlertCircle size={24}/> : alert.link ? <Download size={24}/> : <Bell size={24}/>}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <h3 className="text-sm font-black uppercase text-white truncate">{alert.title}</h3>
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${alert.status === 'completed' ? 'bg-emerald-600' : 'bg-red-600'}`}>{alert.status}</span>
                   </div>
                   <p className="text-slate-400 text-xs line-clamp-1 mt-1">{alert.description}</p>
                   
                   {alert.link && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); window.open(alert.link, '_blank'); }}
                        className="mt-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase flex items-center gap-3 w-fit shadow-[0_15px_40px_rgba(37,99,235,0.6)] active:scale-95 transition-all border-b-4 border-blue-900 group"
                     >
                        <Download size={20} strokeWidth={4} className="group-hover:scale-125 transition-transform" /> {t.downloadUpdate || 'Download Now'}
                     </button>
                   )}
                   
                   <p className="text-[8px] font-bold text-slate-600 uppercase mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
             </div>
          </div>
        ))}
        {displayAlerts.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
             <Bell size={48} className="mx-auto mb-2" />
             <p className="font-black uppercase text-xs tracking-widest">No signals detected</p>
          </div>
        )}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
           <div className="bg-[#0d1b2e] w-full max-w-2xl my-8 rounded-[40px] border border-white/10 shadow-3xl animate-in zoom-in flex flex-col">
              <div className="p-6 bg-accent text-[#0a1628] flex justify-between items-center shadow-lg flex-shrink-0 sticky top-0 z-10">
                 <h2 className="text-lg font-black uppercase tracking-tighter">Signal Investigation</h2>
                 <div className="flex gap-2">
                    {isAdmin && (
                       <button onClick={() => handleDeleteAlert(selectedAlert.id)} className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                    )}
                    <button onClick={() => setSelectedAlert(null)} className="p-1 hover:bg-black/5 rounded-full transition-transform active:scale-90"><X size={28}/></button>
                 </div>
              </div>

              <div className="p-6 md:p-8 space-y-6 bg-[#0a1628]/30">
                 <div className="bg-[#0a1628] p-6 rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-white font-black uppercase text-lg">{selectedAlert.title}</h3>
                          <p className="text-slate-500 font-bold text-[10px] uppercase">ID: {selectedAlert.id} • {new Date(selectedAlert.timestamp).toLocaleString()}</p>
                       </div>
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${selectedAlert.status === 'completed' ? 'bg-emerald-600' : 'bg-red-600'}`}>{selectedAlert.status}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mt-2">{selectedAlert.description}</p>
                    
                    {selectedAlert.link && (
                      <button 
                        onClick={() => window.open(selectedAlert.link, '_blank')}
                        className="mt-8 w-full py-12 bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white rounded-[48px] font-black uppercase text-2xl shadow-[0_30px_70px_rgba(37,99,235,0.7)] flex flex-col items-center justify-center gap-4 animate-in slide-in-from-bottom-4 active:scale-95 transition-all border-b-[12px] border-blue-950 group"
                      >
                         <div className="flex items-center gap-6">
                            <Download size={64} strokeWidth={4} className="group-hover:scale-110 transition-transform"/> 
                            <div className="text-left">
                               <p className="text-3xl leading-none tracking-tighter">Download Update</p>
                               <p className="text-[14px] opacity-80 font-black tracking-[0.2em] mt-2">Tactical System Version Ready</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2.5 bg-black/40 px-6 py-2.5 rounded-full text-[12px] font-black tracking-widest mt-4 border border-white/10 shadow-2xl">
                            <Zap size={18} className="text-accent animate-pulse" /> SYSTEM SECURE DEPLOYMENT
                         </div>
                      </button>
                    )}

                    {selectedAlert.imageUrl && (
                       <div className="rounded-2xl overflow-hidden border border-white/10 mt-6">
                          <img src={selectedAlert.imageUrl} className="w-full h-auto max-h-64 object-cover" alt="Evidence" />
                       </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Operational Updates</h4>
                    {(selectedAlert.chat || []).map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[28px] p-5 shadow-xl ${msg.role === 'admin' ? 'bg-accent/10 border border-accent/20 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'}`}>
                           <p className={`text-[8px] font-black uppercase mb-1 tracking-widest ${msg.role === 'admin' ? 'text-accent' : 'text-blue-400'}`}>{msg.senderName} ({msg.role})</p>
                           <p className="text-white text-xs leading-relaxed">{msg.text}</p>
                           {msg.imageUrl && (
                              <div className="mt-3 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                                 <img src={msg.imageUrl} className="w-full h-auto max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} />
                              </div>
                           )}
                           <p className="text-[7px] text-slate-600 font-bold mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedAlert.chat || selectedAlert.chat.length === 0) && (
                       <div className="py-10 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest">No communication history recorded</div>
                    )}
                 </div>
              </div>

              <div className="p-6 bg-[#0a1628] border-t border-white/10 space-y-4 flex-shrink-0">
                 {isAdmin && selectedAlert.status !== 'completed' && (
                    <div className="flex gap-2">
                       <button onClick={() => updateStatus(selectedAlert.id, 'in_progress')} className="flex-1 py-3 rounded-2xl bg-blue-600/20 text-blue-500 font-black uppercase text-[10px] border border-blue-500/20 active:scale-95 transition-all">Mark as In-Progress</button>
                       <button onClick={() => updateStatus(selectedAlert.id, 'completed')} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-black uppercase text-[10px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">Mark Resolved</button>
                    </div>
                 )}
                 
                 {selectedAlert.status !== 'completed' && (
                    <div className="space-y-3">
                       {replyImage && (
                          <div className="relative inline-block group">
                             <img src={replyImage} className="w-20 h-20 rounded-xl object-cover border-2 border-accent shadow-xl" />
                             <button onClick={() => setReplyImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg active:scale-75 transition-all"><X size={12}/></button>
                          </div>
                       )}
                       <div className="flex gap-2 items-end">
                          <div className="flex flex-col gap-2">
                             <button onClick={() => cameraInputRef.current?.click()} className="p-3.5 bg-white/5 rounded-xl text-slate-500 hover:text-accent border border-white/5 transition-all"><Camera size={18}/></button>
                             <button onClick={() => fileInputRef.current?.click()} className="p-3.5 bg-white/5 rounded-xl text-slate-500 hover:text-accent border border-white/5 transition-all"><ImageIcon size={18}/></button>
                          </div>
                          <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type tactical update..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-accent h-14 md:h-20 resize-none transition-all" />
                          <button onClick={()=>handleSendReply(selectedAlert.id)} disabled={!replyText && !replyImage} className="p-5 bg-accent text-[#0a1628] rounded-2xl shadow-accent active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"><Send size={24}/></button>
                       </div>
                       <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                       <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
