
import React, { useState, useRef } from 'react';
import { User, Task, Alert, AppSettings, Withdrawal, ChatMessage } from '../types';
import { 
  LogOut, Mail, Calendar, Key, CheckSquare, ShieldCheck, 
  Lock, Eye, EyeOff, Save, RefreshCw, Bell, PlusCircle, 
  CheckCircle2, Clock, ChevronRight, Package, ClipboardList, X, MessageSquare, Send, Image as ImageIcon, History
} from 'lucide-react';

interface ProfilePageProps {
  t: any;
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  settings: AppSettings;
  withdrawals: Withdrawal[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ t, user, users, setUsers, tasks, setTasks, alerts, setAlerts, onLogout, onNavigate, settings, withdrawals }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(user.password || '');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'withdrawals'>('security');
  const [viewingReport, setViewingReport] = useState<Alert | null>(null);
  
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myReports = alerts.filter(a => a.userId === user.id && a.type === 'issue_report');
  const myWithdrawals = withdrawals.filter(w => w.userId === user.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

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
          read: false 
        };
      }
      return a;
    }));

    if (viewingReport && viewingReport.id === alertId) {
      setViewingReport({
        ...viewingReport,
        chat: [...(viewingReport.chat || []), newMessage]
      });
    }

    setReplyText('');
    setReplyImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReplyImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword === user.password) return;
    setIsUpdatingPassword(true);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
    
    setAlerts(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'security_update',
      title: 'Security Alert: Password Updated',
      description: `User account ${user.username} modified their access key.`,
      timestamp: new Date().toISOString(),
      status: 'new',
      read: false,
    }, ...prev]);

    setTimeout(() => {
      setIsUpdatingPassword(false);
      alert(t.passwordSuccess);
    }, 1000);
  };

  return (
    <div className="space-y-8 md:space-y-16 animate-in fade-in duration-700 pb-32 px-1">
      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-12 border-b border-white/5 pb-12">
        <div className="w-24 h-24 md:w-48 md:h-48 bg-[#0d1b2e] border-4 border-[#ffd700] rounded-full flex items-center justify-center text-[#ffd700] text-4xl md:text-7xl font-black shadow-2xl relative">
          {user.username[0].toUpperCase()}
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-[#0a1628] shadow-lg"><ShieldCheck size={16} className="text-white"/></div>
        </div>
        <div className="text-center md:text-left space-y-2">
           <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tight">{user.fullName || user.username}</h1>
           <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
              <span className="bg-[#ffd700] text-[#0a1628] px-5 py-1.5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl">{user.role} Authority</span>
              <span className="text-accent font-black uppercase text-[9px] md:text-xs tracking-widest px-2">{user.jobTitle || 'Rettungsdienst Member'}</span>
              <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 border-white/10"><Mail size={12}/> {user.email || 'No email registered'}</span>
           </div>
        </div>
      </header>

      <div className="flex bg-[#0d1b2e] p-1.5 rounded-2xl border border-white/5 mb-8 shadow-2xl overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('security')} className={`flex-1 py-4 px-6 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-accent text-[#0a1628] shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}>Security & Profile</button>
        <button onClick={() => setActiveTab('withdrawals')} className={`flex-1 py-4 px-6 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'withdrawals' ? 'bg-accent text-[#0a1628] shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}>Tactical Log</button>
      </div>

      {activeTab === 'security' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <section className="bg-[#0d1b2e] p-8 md:p-12 rounded-[40px] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4"><Lock className="text-[#ffd700]" size={20}/><h3 className="text-white font-black uppercase tracking-widest text-xs">Access Control</h3></div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Update Access Key</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-accent shadow-inner font-black" />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accent transition-colors">{showPassword ? <EyeOff size={22}/> : <Eye size={22}/>}</button>
                        </div>
                    </div>
                    <button onClick={handleUpdatePassword} disabled={isUpdatingPassword || newPassword === user.password} className="w-full py-5 bg-accent text-[#0a1628] rounded-[24px] font-black uppercase text-xs active:scale-95 transition-all shadow-xl disabled:opacity-20">Commit Security Update</button>
                </div>
            </section>

            <section className="bg-[#0d1b2e] p-8 md:p-12 rounded-[40px] border border-white/5 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4"><div className="flex items-center gap-3"><Bell className="text-[#ffd700]" size={20}/><h3 className="text-white font-black uppercase tracking-widest text-xs">My Active Reports</h3></div><button onClick={() => onNavigate('issue')} className="text-accent text-[9px] font-black uppercase flex items-center gap-1.5"><PlusCircle size={14}/> Dispatch New</button></div>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {myReports.length > 0 ? myReports.map(rep => (
                      <div key={rep.id} onClick={() => setViewingReport(rep)} className="bg-[#0a1628] p-5 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-[#1a2a40] cursor-pointer group transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-xl ${rep.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}><MessageSquare size={18}/></div>
                           <div><p className="text-white font-black uppercase text-xs truncate max-w-[150px]">{rep.title}</p><p className="text-slate-600 font-bold text-[8px] uppercase">{rep.status} • {new Date(rep.timestamp).toLocaleDateString()}</p></div>
                        </div>
                        <ChevronRight size={18} className="text-slate-800 group-hover:text-accent transition-colors"/>
                      </div>
                    )) : (
                        <div className="py-20 text-center text-slate-700 font-black uppercase text-[10px] italic tracking-widest border border-dashed border-white/10 rounded-3xl">No operational reports filed</div>
                    )}
                </div>
            </section>
        </div>
      ) : (
        <section className="bg-[#0d1b2e] p-8 md:p-12 rounded-[40px] border border-white/5 shadow-2xl space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3"><History size={24} className="text-accent"/> Personal Withdrawal History</h3>
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{myWithdrawals.length} Missions</span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar">
                {myWithdrawals.length > 0 ? myWithdrawals.map(w => (
                   <div key={w.id} className="bg-[#0a1628] p-6 rounded-[32px] border border-white/5 flex items-center justify-between hover:border-accent/20 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-[#0d1b2e] rounded-2xl text-accent"><Package size={24}/></div>
                         <div className="min-w-0">
                            <p className="text-white font-black uppercase text-sm truncate max-w-[200px]">{w.medicineName}</p>
                            <p className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">{new Date(w.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-white font-black text-xl">-{w.quantity}</p>
                         <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1 bg-white/5 px-2 py-0.5 rounded-lg">{w.vehicle}</p>
                      </div>
                   </div>
                )) : (
                   <div className="py-24 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[40px]">
                      <Package size={48} className="mx-auto mb-4" />
                      <p className="font-black uppercase text-xs tracking-widest">No withdrawal records found</p>
                   </div>
                )}
            </div>
        </section>
      )}

      {viewingReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={() => { setViewingReport(null); setReplyText(''); setReplyImage(null); }}>
           <div className="bg-[#0d1b2e] w-full max-w-2xl rounded-[40px] border border-white/10 shadow-3xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-300" onClick={e=>e.stopPropagation()}>
              <div className="p-6 bg-accent text-[#0a1628] flex justify-between items-center flex-shrink-0 shadow-lg">
                 <h2 className="text-lg font-black uppercase tracking-tighter">Communication Thread</h2>
                 <button onClick={() => { setViewingReport(null); setReplyText(''); setReplyImage(null); }} className="p-1 hover:bg-black/5 rounded-full"><X size={28}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 no-scrollbar bg-[#0a1628]/20">
                 <div className="bg-[#0a1628] p-6 rounded-3xl border border-white/5 shadow-inner">
                    <h3 className="text-white font-black uppercase text-sm mb-2">{viewingReport.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{viewingReport.description}</p>
                 </div>

                 <div className="space-y-4">
                    {(viewingReport.chat || []).map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[85%] rounded-[28px] p-5 shadow-xl ${msg.role === 'admin' ? 'bg-blue-600/10 border border-blue-500/20 rounded-tl-none' : 'bg-accent/10 border border-accent/20 rounded-tr-none'}`}>
                           <p className={`text-[8px] font-black uppercase mb-2 tracking-widest ${msg.role === 'admin' ? 'text-blue-400' : 'text-accent'}`}>{msg.senderName} ({msg.role})</p>
                           <p className="text-white text-xs leading-relaxed">{msg.text}</p>
                           {msg.imageUrl && <img src={msg.imageUrl} className="mt-3 rounded-2xl border border-white/5 max-h-48 w-full object-cover" />}
                           <p className="text-[7px] text-slate-600 font-bold text-right mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {viewingReport.status !== 'completed' && (
                <div className="p-6 bg-[#0a1628] border-t border-white/10 space-y-4 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                   {replyImage && (
                     <div className="relative inline-block mb-3 animate-in zoom-in">
                        <img src={replyImage} className="w-24 h-24 rounded-2xl object-cover border-2 border-accent" />
                        <button onClick={() => setReplyImage(null)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1.5 shadow-xl text-white"><X size={14}/></button>
                     </div>
                   )}
                   <div className="flex gap-3 items-end">
                      <button onClick={() => fileInputRef.current?.click()} className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-accent border border-white/5 transition-all"><ImageIcon size={22}/></button>
                      <div className="flex-1 relative">
                        <textarea 
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Type a message to administration..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-accent h-16 resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => handleSendReply(viewingReport.id)} 
                        disabled={!replyText && !replyImage} 
                        className="p-5 bg-accent text-[#0a1628] rounded-2xl shadow-2xl disabled:opacity-30 disabled:grayscale active:scale-95 transition-all"
                      >
                        <Send size={24}/>
                      </button>
                   </div>
                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
