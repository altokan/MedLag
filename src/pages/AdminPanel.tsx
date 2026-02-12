
import React, { useState, useEffect, useRef } from 'react';
import { Truck, Users, Palette, Trash2, Bell, Globe, RefreshCw, Save, Monitor, Smartphone, CloudLightning, Shield, Phone, Check, UserPlus, X, Mail, Lock, Send, Camera, Edit2, Plus, Settings, ChevronRight, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import { AppSettings, User, Role, UserPermissions, Task } from '../types';
import { defaultPermissions } from '../store';

const colors = [
  { name: 'Gold', hex: '#ffd700' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
];

const permissionLabels: Record<keyof UserPermissions, string> = {
  addMedicine: "Add Inventory Items",
  deleteMedicine: "Delete Inventory Items",
  exportReports: "Export System Reports",
  inventoryCheck: "Perform Stock Audits",
  addToOrders: "Manage Procurement List",
  manageUsers: "Full User Control",
  sendAlerts: "Dispatch System Alarms",
  manageOrders: "Process Deliveries",
  fullAdminAccess: "Root Admin Rights",
  manageBTM: "Access BTM Secure Vault",
  accessAdminPanel: "Open Admin Interface",
  managePersonnel: "Onboard Team Members"
};

interface AdminPanelProps {
  t: any;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onSendBroadcast: (msg: string, targetUserId?: string, link?: string, imageUrl?: string) => void;
  currentUser: User;
  initialTab?: 'personnel' | 'broadcast' | 'fleet' | 'branding' | 'updates';
}

type AdminTab = 'personnel' | 'broadcast' | 'fleet' | 'branding' | 'updates';

const AdminPanel: React.FC<AdminPanelProps> = ({ t, settings, setSettings, users, setUsers, tasks, setTasks, onSendBroadcast, currentUser, initialTab }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'personnel');
  
  // Personnel State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'user' as Role,
    fullName: '',
    email: '',
    permissions: { ...defaultPermissions }
  });

  // Fleet State
  const [newVehicle, setNewVehicle] = useState('');

  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | string>('all');

  // Updates State
  const [updateVersion, setUpdateVersion] = useState(settings.latestVersion || 'v5.17.1');
  const [updateUrl, setUpdateUrl] = useState(settings.latestUpdateUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleSaveUser = () => {
    if (!userFormData.username || (!editingUser && !userFormData.password)) {
      alert("Username and Password are required.");
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
      alert("Profile updated.");
    } else {
      if (users.some(u => u.username === userFormData.username)) {
        alert("Username already exists.");
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...userFormData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      alert("Member onboarded.");
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) return alert("Security: Cannot delete self.");
    if (confirm("Delete this member?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleTogglePerm = (key: keyof UserPermissions) => {
    setUserFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const handleAddVehicle = () => {
    if (!newVehicle.trim()) return;
    setSettings(prev => ({ ...prev, vehicles: [...prev.vehicles, newVehicle.trim()] }));
    setNewVehicle('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSettings(prev => ({ ...prev, appLogoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="px-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{t.adminPanel}</h1>
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-xs tracking-[0.4em] flex items-center gap-2 animate-pulse"><Shield size={14} className="text-accent"/> {settings.appName}</p>
        </div>
      </header>

      <div className="flex items-center gap-1.5 bg-[#0d1b2e] p-1.5 rounded-[28px] md:rounded-[40px] overflow-x-auto no-scrollbar border border-white/5 shadow-2xl sticky top-4 z-40 backdrop-blur-xl">
        <AdminTabBtn active={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} icon={<Users size={18}/>} label="Personnel" />
        <AdminTabBtn active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} icon={<Bell size={18}/>} label="Alarms" />
        <AdminTabBtn active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={<Truck size={18}/>} label="Fleet" />
        <AdminTabBtn active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<Palette size={18}/>} label="Identity" />
        <AdminTabBtn active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} icon={<RefreshCw size={18}/>} label="System" />
      </div>

      <div className="bg-[#0d1b2e] rounded-[40px] md:rounded-[72px] border border-white/5 shadow-3xl overflow-hidden min-h-[600px]">
        
        {activeTab === 'personnel' && (
          <div className="p-6 md:p-12 space-y-10">
             <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">Team Roster</h2>
                <button 
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormData({ username: '', password: '', role: 'user', fullName: '', email: '', permissions: { ...defaultPermissions } });
                    setShowUserModal(true);
                  }} 
                  className="bg-accent text-[#0a1628] px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <UserPlus size={20}/> Onboard Member
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(u => (
                  <div key={u.id} className="bg-[#0a1628] p-6 rounded-[36px] border border-white/5 flex items-center justify-between group hover:border-accent/40 transition-all">
                     <div className="flex items-center gap-4 cursor-pointer" onClick={() => {
                        setEditingUser(u);
                        setUserFormData({ 
                          username: u.username, 
                          password: u.password || '', 
                          role: u.role, 
                          fullName: u.fullName || '', 
                          email: u.email || '', 
                          permissions: u.permissions || { ...defaultPermissions } 
                        });
                        setShowUserModal(true);
                     }}>
                        <div className="w-16 h-16 bg-[#0d1b2e] border-2 border-accent/20 rounded-full flex items-center justify-center text-accent font-black text-2xl">{u.username[0].toUpperCase()}</div>
                        <div className="min-w-0">
                           <h3 className="text-white font-black uppercase text-sm truncate max-w-[120px]">{u.fullName || u.username}</h3>
                           <p className="text-accent/60 font-bold uppercase text-[8px] tracking-widest">{u.role}</p>
                        </div>
                     </div>
                     <button onClick={() => deleteUser(u.id)} className="p-3 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="p-6 md:p-16 animate-in fade-in">
             <div className="max-w-2xl mx-auto bg-[#0a1628] p-8 md:p-12 rounded-[56px] border border-white/5 shadow-3xl space-y-8">
                <div className="text-center space-y-2">
                   <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20"><Bell size={40}/></div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tight">Mission Alarm</h2>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Target Unit</label>
                      <select 
                        value={broadcastTarget} 
                        onChange={e => setBroadcastTarget(e.target.value)}
                        className="w-full bg-[#0d1b2e] border border-white/5 p-5 rounded-2xl text-white font-black outline-none"
                      >
                         <option value="all">ALL UNITS (BROADCAST)</option>
                         {users.map(u => <option key={u.id} value={u.id}>MEMBER: {u.fullName || u.username}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Dispatch Message</label>
                      <textarea 
                        value={broadcastMsg} 
                        onChange={e => setBroadcastMsg(e.target.value)}
                        className="w-full bg-[#0d1b2e] border border-white/5 p-6 rounded-3xl text-white font-bold outline-none focus:border-red-500/50 min-h-[150px]" 
                        placeholder="Type tactical update..." 
                      />
                   </div>
                </div>
                <button 
                  onClick={() => {
                    if (!broadcastMsg) return;
                    onSendBroadcast(broadcastMsg, broadcastTarget === 'all' ? undefined : broadcastTarget);
                    setBroadcastMsg('');
                    alert("Alarm dispatched.");
                  }} 
                  className="w-full bg-red-600 text-white py-6 rounded-[32px] font-black uppercase text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                   <Send size={24}/> Dispatch Alarm
                </button>
             </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="p-6 md:p-12 space-y-12 animate-in fade-in">
             <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                   <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">Fleet Management</h2>
                </div>
                <div className="flex gap-4">
                   <input 
                     value={newVehicle} 
                     onChange={e => setNewVehicle(e.target.value)} 
                     className="flex-1 bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white font-black outline-none" 
                     placeholder="New Unit ID (e.g. NEF-02)" 
                   />
                   <button onClick={handleAddVehicle} className="bg-accent text-[#0a1628] px-10 rounded-2xl font-black uppercase text-xs flex items-center gap-2 active:scale-95 transition-all">
                      <Plus size={20}/> Register Unit
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {settings.vehicles.map((v, i) => (
                      <div key={i} className="bg-[#0a1628] p-6 rounded-[32px] border border-white/5 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <Truck className="text-slate-700" size={24}/>
                            <span className="text-white font-black uppercase tracking-tight">{v}</span>
                         </div>
                         <button onClick={() => setSettings(p => ({...p, vehicles: p.vehicles.filter((_, idx) => idx !== i)}))} className="text-red-500/20 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="p-6 md:p-12 space-y-12 animate-in slide-in-from-bottom-4">
             <div className="max-w-4xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2"><Palette className="text-accent" /> Identity</h3>
                      <div className="relative group mx-auto md:mx-0 w-44 h-44">
                        <div className="w-44 h-44 bg-[#0a1628] border-2 border-dashed border-accent/20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl relative">
                            <img src={settings.appLogoUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => fileInputRef.current?.click()} className="text-white flex flex-col items-center gap-2">
                                  <Camera size={28}/> <span className="font-black text-[10px] uppercase">Upload Logo</span>
                              </button>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">System Name</label><input value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white font-black outline-none focus:border-accent" /></div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Accent Color</label>
                          <div className="grid grid-cols-3 gap-2">
                            {colors.map(c => (
                              <button key={c.hex} onClick={() => setSettings({...settings, accentColor: c.hex})} className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${settings.accentColor === c.hex ? 'border-white' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c.hex }}>{settings.accentColor === c.hex && <Check size={20} className="text-white" />}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2"><Phone className="text-accent" /> Support Contacts</h3>
                      <div className="space-y-4">
                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Hotline Phone</label><input value={settings.supervisorPhone} onChange={e => setSettings({...settings, supervisorPhone: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white font-black" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Supervisor Email</label><input value={settings.supervisorEmail} onChange={e => setSettings({...settings, supervisorEmail: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white font-black" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Reports Auto-Email</label><input value={settings.reportEmail} onChange={e => setSettings({...settings, reportEmail: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-5 rounded-2xl text-white font-black" /></div>
                      </div>
                   </div>
                </div>
                <button onClick={() => alert("Identity Updated.")} className="w-full bg-accent text-[#0a1628] py-6 rounded-[32px] font-black uppercase text-xl shadow-2xl active:scale-95 transition-all">Save All Identity Changes</button>
             </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="p-6 md:p-16 animate-in slide-in-from-top-8 space-y-12">
             <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><CloudLightning size={40}/></div>
                   <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">System Versioning</h2>
                   <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status: <span className="text-emerald-500">Cloud Sync Active</span></p>
                </div>
                <div className="bg-[#0a1628] p-10 rounded-[48px] border border-white/5 shadow-3xl text-center space-y-8">
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white uppercase">Software Distribution</h3>
                     <p className="text-slate-500 text-xs">Manage updates for operational units</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-[#0d1b2e] rounded-3xl border border-white/5 text-left"><p className="text-slate-500 font-black text-[9px] uppercase mb-1">Target Version</p><input value={updateVersion} onChange={e=>setUpdateVersion(e.target.value)} className="w-full bg-transparent text-white font-black text-xl outline-none" /></div>
                      <div className="p-5 bg-[#0d1b2e] rounded-3xl border border-white/5 text-left"><p className="text-slate-500 font-black text-[9px] uppercase mb-1">Asset Source URL</p><input value={updateUrl} onChange={e=>setUpdateUrl(e.target.value)} className="w-full bg-transparent text-white font-black text-xl outline-none" /></div>
                   </div>
                   <button onClick={() => {
                     setSettings(prev => ({...prev, latestVersion: updateVersion, latestUpdateUrl: updateUrl}));
                     onSendBroadcast(`A newer build (${updateVersion}) is available. Distribution initialized.`, undefined, updateUrl);
                     alert("System update broadcasted to all units.");
                   }} className="w-full bg-emerald-600 text-white py-6 rounded-[32px] font-black uppercase text-xl shadow-2xl active:scale-95 transition-all">Publish Build Artifact</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in overflow-y-auto">
           <div className="bg-[#0d1b2e] w-full max-w-3xl rounded-[48px] border border-white/10 shadow-3xl overflow-hidden my-auto">
              <div className="p-8 bg-accent text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase tracking-tighter">{editingUser ? 'Edit Member' : 'Onboard Member'}</h2>
                 <button onClick={() => setShowUserModal(false)}><X size={32}/></button>
              </div>
              <div className="p-8 md:p-12 space-y-10 max-h-[75vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Full Operational Name</label><input value={userFormData.fullName} onChange={e => setUserFormData({...userFormData, fullName: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white font-black outline-none focus:border-accent" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Login Identifier</label><input value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white font-black outline-none focus:border-accent" /></div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Access Key</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white font-black outline-none focus:border-accent" />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showPass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                      </div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Clearance Level</label><select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as Role})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white font-black outline-none"><option value="user">User</option><option value="supervisor">Supervisor</option><option value="admin">Admin</option></select></div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest flex items-center gap-2"><Settings size={14}/> Permissions Protocol</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {Object.keys(permissionLabels).map((key) => (
                          <div key={key} onClick={() => handleTogglePerm(key as keyof UserPermissions)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${userFormData.permissions[key as keyof UserPermissions] ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-[#0a1628] border-white/5 text-slate-600 hover:border-white/10'}`}>
                             <span className="text-[10px] font-black uppercase tracking-tight">{permissionLabels[key as keyof UserPermissions]}</span>
                             {userFormData.permissions[key as keyof UserPermissions] ? <ToggleRight size={28}/> : <ToggleLeft size={28} className="opacity-20" />}
                          </div>
                       ))}
                    </div>
                 </div>

                 <button onClick={handleSaveUser} className="w-full bg-accent text-[#0a1628] py-6 rounded-[32px] font-black uppercase text-xl shadow-2xl active:scale-95 transition-all">
                    {editingUser ? 'Update Profile' : 'Confirm Member Deployment'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AdminTabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2.5 px-6 md:px-10 py-4 md:py-6 rounded-[24px] md:rounded-[40px] text-[10px] md:text-sm font-black uppercase transition-all whitespace-nowrap active:scale-90 shadow-lg ${active ? 'bg-accent text-[#0a1628] shadow-xl' : 'text-slate-500 hover:text-white'}`}>
    {icon} <span className="tracking-widest">{label}</span>
  </button>
);

export default AdminPanel;
