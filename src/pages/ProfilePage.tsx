
import React, { useState } from 'react';
import { User, Task, Alert, AppSettings } from '../types';
import { 
  LogOut, Mail, Calendar, Key, CheckSquare, ShieldCheck, 
  Lock, Eye, EyeOff, Save, RefreshCw, Bell, PlusCircle, 
  CheckCircle2, Clock, ChevronRight 
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
}

const ProfilePage: React.FC<ProfilePageProps> = ({ t, user, users, setUsers, tasks, setTasks, alerts, setAlerts, onLogout, onNavigate, settings }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(user.password || '');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const userTasks = tasks.filter(tk => tk.assignedTo === user.username);
  const myReports = alerts.filter(a => a.userId === user.id && a.type === 'issue_report');

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, status } : tk));
  };

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword === user.password) return;
    setIsUpdatingPassword(true);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
    
    const securityAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'security_update',
      title: 'Security Alert: Password Changed',
      description: `Member ${user.username} has updated their access password.`,
      timestamp: new Date().toISOString(),
      status: 'new',
      read: false,
      userAction: user.username
    };
    setAlerts(prev => [securityAlert, ...prev]);

    setTimeout(() => {
      setIsUpdatingPassword(false);
      alert(settings.language === 'en' ? "Password updated successfully!" : "Passwort erfolgreich aktualisiert!");
    }, 1000);
  };

  return (
    <div className="space-y-8 md:space-y-16 animate-in fade-in duration-700 pb-32 px-1">
      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-12 border-b border-white/5 pb-12">
        <div className="w-24 h-24 md:w-48 md:h-48 bg-[#0d1b2e] border-4 border-[#ffd700] rounded-full flex items-center justify-center text-[#ffd700] text-4xl md:text-7xl font-black shadow-2xl relative">
          {user.username[0].toUpperCase()}
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-[#0a1628]"><ShieldCheck size={16} className="text-white"/></div>
        </div>
        <div className="text-center md:text-left space-y-2">
           <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tight">{user.fullName || user.username}</h1>
           <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
              <span className="bg-[#ffd700] text-[#0a1628] px-4 py-1.5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-lg">
                 {user.role} Account
              </span>
              <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
                <Mail size={12}/> {user.email || 'No email assigned'}
              </span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
        {/* Security Section */}
        <section className="bg-[#0d1b2e] p-6 md:p-10 rounded-[40px] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd700] opacity-5 blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
            <Lock className="text-[#ffd700]" size={20}/>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs">Security & Access</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Access Key (Password)</label>
            <div className="relative">
               <input 
                 type={showPassword ? "text" : "password"} 
                 value={newPassword}
                 onChange={e => setNewPassword(e.target.value)}
                 className="w-full bg-[#0a1628] border border-white/5 p-4 md:p-6 rounded-2xl text-white font-black text-sm md:text-xl outline-none focus:border-[#ffd700] transition-all"
               />
               <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#ffd700]">
                 {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
               </button>
            </div>
            <button onClick={handleUpdatePassword} disabled={isUpdatingPassword || newPassword === user.password} className={`w-full py-4 md:py-6 rounded-2xl font-black uppercase text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${newPassword === user.password ? 'bg-white/5 text-slate-600' : 'bg-[#ffd700] text-[#0a1628] active:scale-95'}`}>
              {isUpdatingPassword ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
              Update Access Key
            </button>
          </div>
        </section>

        {/* Issue Tracker Section */}
        <section className="bg-[#0d1b2e] p-6 md:p-10 rounded-[40px] border border-white/5 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Bell className="text-[#ffd700]" size={20}/>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs">My Reports</h3>
            </div>
            <button onClick={() => onNavigate('issue')} className="text-[#ffd700] flex items-center gap-1.5 text-[9px] font-black uppercase">
              <PlusCircle size={14}/> New Report
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {myReports.length > 0 ? myReports.map(rep => (
              <div key={rep.id} className="bg-[#0a1628] p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${rep.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                       {rep.status === 'completed' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                    </div>
                    <div>
                      <p className="text-white font-black uppercase text-[10px] truncate max-w-[120px]">{rep.title}</p>
                      <p className="text-slate-600 font-bold text-[8px] uppercase">{new Date(rep.timestamp).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <ChevronRight size={14} className="text-slate-800"/>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-700 font-black uppercase text-[10px] italic tracking-widest border border-dashed border-white/5 rounded-2xl">No reports found</div>
            )}
          </div>
        </section>
      </div>

      {/* Operational Duties Section */}
      <section className="space-y-8">
         <h2 className="text-sm md:text-xl font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
            <CheckSquare className="text-[#ffd700]" size={20}/> Operational Duties
         </h2>
         <div className="space-y-4">
            {userTasks.length > 0 ? userTasks.map(tk => (
              <div key={tk.id} className="bg-[#0d1b2e] p-6 md:p-10 rounded-[40px] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                 <div className="space-y-2">
                    <h3 className="text-white font-black uppercase text-lg">{tk.title}</h3>
                    <p className="text-slate-400 text-sm">{tk.description}</p>
                 </div>
                 <button 
                   onClick={() => updateTaskStatus(tk.id, 'completed')}
                   className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${tk.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
                 >
                   {tk.status === 'completed' ? 'Completed' : 'Complete Now'}
                 </button>
              </div>
            )) : (
              <div className="py-20 bg-[#0d1b2e] rounded-[40px] border border-dashed border-white/5 text-center">
                 <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">No active duties assigned</p>
              </div>
            )}
         </div>
      </section>

      <div className="pt-10 flex flex-col items-center space-y-4">
          <p className="text-slate-700 font-black uppercase text-[8px] tracking-[0.5em] opacity-40 select-none">Member Since: {user.joinDate || 'N/A'}</p>
          <button onClick={onLogout} className="text-red-500/40 hover:text-red-500 font-black uppercase text-[10px] flex items-center gap-2">
            <LogOut size={14}/> Terminate Active Session
          </button>
      </div>
    </div>
  );
};

export default ProfilePage;
