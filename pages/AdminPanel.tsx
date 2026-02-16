
import React, { useState, useRef } from 'react';
import { Truck, Users, Palette, Trash2, Bell, Shield, Send, Plus, Edit2, Check, X, Search, Camera, UserPlus, ShieldCheck, Image as ImageIcon, CheckCircle2, AlertTriangle, Mail, Phone, Settings, UsersRound, Upload, Car, Paintbrush, Save, Monitor, Download, Ambulance, Cpu, Image, Activity, Settings2, Smartphone } from 'lucide-react';
import { AppSettings, User, Role, Task } from '../types';
import UserManagement from './UserManagement';

interface AdminPanelProps {
  t: any;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onSendBroadcast: (msg: string, targetUserIds?: string[], link?: string, imageUrl?: string, title?: string) => void;
  currentUser: User;
  initialTab?: 'team_manager' | 'broadcast' | 'fleet' | 'branding' | 'system';
}

const PRESET_COLORS = [
  { name: 'Fire Engine Red', color: '#ef4444' },
  { name: 'Rescue Blue', color: '#3b82f6' },
  { name: 'Paramedic Green', color: '#10b981' },
  { name: 'Tactical Yellow', color: '#ffd700' },
  { name: 'Ops Orange', color: '#f97316' },
  { name: 'Navy Command', color: '#1e40af' },
  { name: 'Pure White', color: '#ffffff' },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  t, settings, setSettings, users, setUsers, 
  onSendBroadcast, initialTab, currentUser, tasks, setTasks
}) => {
  const [activeTab, setActiveTab] = useState<any>(initialTab || 'team_manager');
  
  // Branding states
  const [brandingData, setBrandingData] = useState({ ...settings });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // System states
  const [systemData, setSystemData] = useState({ appVersion: settings.appVersion, updateUrl: settings.updateUrl });

  // Broadcast/Alarm states
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastImage, setBroadcastImage] = useState<string | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]); 
  const bFileInputRef = useRef<HTMLInputElement>(null);
  const bCameraInputRef = useRef<HTMLInputElement>(null);

  // Fleet Management
  const [newVehicle, setNewVehicle] = useState('');
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null);
  const [editedVehicleName, setEditedVehicleName] = useState('');

  const handleCommitBranding = () => {
    setSettings({ ...settings, ...brandingData });
    alert(t.systemUpdated);
  };

  const handleSystemUpdate = () => {
    setSettings({ ...settings, ...systemData });
    if (systemData.updateUrl && systemData.updateUrl !== settings.updateUrl) {
      onSendBroadcast(
        `Critical Software Update v${systemData.appVersion} is ready for deployment. Please download and install immediately.`, 
        undefined, 
        systemData.updateUrl, 
        undefined, 
        "Tactical System Update"
      );
    }
    alert(t.systemUpdated);
  };

  const handleImageUpload = (type: 'logo' | 'bg', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') setBrandingData({ ...brandingData, appLogoUrl: reader.result as string });
      else setBrandingData({ ...brandingData, loginBackgroundImageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleBroadcastImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBroadcastImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDispatchAlarm = () => {
    if (!broadcastMsg && !broadcastImage) return;
    onSendBroadcast(
      broadcastMsg, 
      selectedTargets.length > 0 ? selectedTargets : undefined, 
      undefined, 
      broadcastImage || undefined
    );
    setBroadcastMsg('');
    setBroadcastImage(null);
    setSelectedTargets([]);
    alert("Tactical Alarm Dispatched");
  };

  const toggleTarget = (userId: string) => {
    setSelectedTargets(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddVehicle = () => {
    if (!newVehicle) return;
    if (settings.vehicles.includes(newVehicle)) return alert("Vehicle already exists");
    setSettings({ ...settings, vehicles: [...settings.vehicles, newVehicle] });
    setNewVehicle('');
  };

  const handleRemoveVehicle = (v: string) => {
    if (confirm(`Remove vehicle ${v} from fleet?`)) {
      setSettings({ ...settings, vehicles: settings.vehicles.filter(item => item !== v) });
    }
  };

  const startEditVehicle = (index: number) => {
    setEditingVehicleIndex(index);
    setEditedVehicleName(settings.vehicles[index]);
  };

  const saveEditedVehicle = () => {
    if (editingVehicleIndex === null || !editedVehicleName) return;
    const newVehicles = [...settings.vehicles];
    newVehicles[editingVehicleIndex] = editedVehicleName;
    setSettings({ ...settings, vehicles: newVehicles });
    setEditingVehicleIndex(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24 px-1 md:px-0">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tight">Admin Terminal</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Operational Command Console</p>
        </div>
      </header>

      <div className="flex bg-[#0d1b2e] p-1.5 rounded-2xl border border-white/5 shadow-xl overflow-x-auto no-scrollbar gap-1">
        <TabBtn active={activeTab === 'team_manager'} onClick={() => setActiveTab('team_manager')} icon={<UsersRound size={18}/>} label={t.teamManager} />
        <TabBtn active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} icon={<Bell size={18}/>} label={t.alarms} />
        <TabBtn active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={<Car size={18}/>} label={t.fleet} />
        <TabBtn active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<Paintbrush size={18}/>} label={t.appStyle} />
        <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Monitor size={18}/>} label={t.system} />
      </div>

      <div className="bg-[#0d1b2e] rounded-[32px] md:rounded-[48px] border border-white/5 shadow-2xl min-h-[500px] overflow-hidden">
        
        {activeTab === 'branding' && (
          <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">App Identity (Logo)</label>
                  <div onClick={() => logoInputRef.current?.click()} className="w-32 h-32 md:w-48 md:h-48 bg-[#0a1628] border-4 border-accent rounded-full mx-auto lg:mx-0 flex items-center justify-center overflow-hidden shadow-accent relative group cursor-pointer shadow-xl transition-all hover:scale-105">
                    <img src={brandingData.appLogoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Logo" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={24} className="text-white mb-1" />
                      <span className="text-[8px] font-black uppercase text-white">{t.changeLogo}</span>
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])} />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Login Background Image</label>
                  <div onClick={() => bgInputRef.current?.click()} className="w-full h-24 md:h-36 bg-[#0a1628] border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center overflow-hidden group cursor-pointer relative shadow-xl hover:border-accent/40 transition-all">
                    {brandingData.loginBackgroundImageUrl ? (
                      <img src={brandingData.loginBackgroundImageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="BG" />
                    ) : (
                      <Image size={32} className="text-slate-700" />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-white mb-1" />
                      <span className="text-[8px] font-black uppercase text-white">Upload from Device</span>
                    </div>
                  </div>
                  <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload('bg', e.target.files[0])} />
                </div>
              </div>

              <div className="space-y-6">
                <BrandingInput label="Application Display Name" value={brandingData.appName} onChange={(v:string) => setBrandingData({...brandingData, appName: v})} icon={<Smartphone size={14}/>} />
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2"><Palette size={14}/> Theme Color</label>
                  <div className="flex flex-wrap gap-2 px-1">
                    {PRESET_COLORS.map(p => (
                      <button key={p.color} onClick={() => setBrandingData({...brandingData, accentColor: p.color})} className={`w-8 h-8 rounded-full border-2 transition-all ${brandingData.accentColor.toLowerCase() === p.color.toLowerCase() ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: p.color }} />
                    ))}
                    <input type="color" value={brandingData.accentColor} onChange={e => setBrandingData({...brandingData, accentColor: e.target.value})} className="h-8 w-8 rounded-full cursor-pointer bg-transparent border-none overflow-hidden" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                   <h3 className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Support & Reporting</h3>
                   <div className="grid grid-cols-1 gap-4">
                      <BrandingInput label="Supervisor Hotline" value={brandingData.supervisorPhone} onChange={(v:string) => setBrandingData({...brandingData, supervisorPhone: v})} icon={<Phone size={14}/>} />
                      <BrandingInput label="Supervisor Email" value={brandingData.supervisorEmail} onChange={(v:string) => setBrandingData({...brandingData, supervisorEmail: v})} icon={<Mail size={14}/>} />
                      <BrandingInput label="Report Submission Email" value={brandingData.reportEmail || ''} onChange={(v:string) => setBrandingData({...brandingData, reportEmail: v})} icon={<Activity size={14}/>} />
                   </div>
                </div>
              </div>
            </div>
            
            <button onClick={handleCommitBranding} className="w-full bg-accent text-[#0a1628] py-8 rounded-[32px] font-black uppercase text-xl shadow-accent active:scale-95 transition-all flex items-center justify-center gap-4 hover:brightness-110 shadow-2xl">
               <ShieldCheck size={24}/> {t.tacticalUpdate}
            </button>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-in fade-in">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-600/20 shadow-red-600/10"><Bell size={32}/></div>
                <h2 className="text-2xl font-black text-white uppercase">{t.emergencyBroadcast}</h2>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Target Personnel</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button onClick={() => setSelectedTargets([])} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all ${selectedTargets.length === 0 ? 'bg-accent text-[#0a1628] border-accent shadow-lg' : 'bg-white/5 text-slate-500 border-white/5'}`}>Send to All</button>
                      {users.map(u => (
                        <button key={u.id} onClick={() => toggleTarget(u.id)} className={`p-3 rounded-xl text-[9px] font-black uppercase border transition-all truncate ${selectedTargets.includes(u.id) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white/5 text-slate-500 border-white/5'}`}>{u.fullName || u.username}</button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Visual Evidence / Photo</label>
                   {broadcastImage ? (
                      <div className="relative inline-block group animate-in zoom-in">
                         <img src={broadcastImage} className="w-full max-h-48 rounded-2xl object-cover border-2 border-accent shadow-xl" />
                         <button onClick={() => setBroadcastImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg active:scale-75 transition-all"><X size={16}/></button>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => bCameraInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-8 bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-accent hover:border-accent/40 transition-all"><Camera size={24}/><span className="text-[8px] font-black uppercase">Capture Camera</span></button>
                         <button onClick={() => bFileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-8 bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-accent hover:border-accent/40 transition-all"><ImageIcon size={24}/><span className="text-[8px] font-black uppercase">Upload Image</span></button>
                         <input ref={bFileInputRef} type="file" accept="image/*" onChange={handleBroadcastImage} className="hidden" />
                         <input ref={bCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleBroadcastImage} className="hidden" />
                      </div>
                   )}
                </div>

                <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} className="w-full bg-[#0a1628] border border-white/10 p-6 rounded-[28px] text-white text-base outline-none focus:border-red-600 transition-all shadow-inner min-h-[120px]" placeholder="Type briefing message..." />
                
                <button onClick={handleDispatchAlarm} className="w-full bg-red-600 text-white py-6 rounded-[28px] font-black uppercase text-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"><Send size={24}/> Dispatch Tactical Alarm</button>
             </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-in fade-in">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-blue-600/10"><Truck size={32}/></div>
                <h2 className="text-2xl font-black text-white uppercase">{t.fleetManagement}</h2>
             </div>

             <div className="space-y-6">
                <div className="flex gap-2">
                   <input 
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    placeholder="Vehicle ID (e.g. RTW-3)"
                    className="flex-1 bg-[#0a1628] border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-accent"
                   />
                   <button 
                    onClick={handleAddVehicle}
                    className="bg-accent text-[#0a1628] px-6 rounded-xl font-black uppercase text-xs active:scale-95"
                   >
                     Add
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {settings.vehicles.map((v, idx) => (
                     <div key={idx} className="bg-[#0a1628] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-accent/40 transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <Ambulance size={20} className="text-slate-500 group-hover:text-accent transition-colors flex-shrink-0" />
                           {editingVehicleIndex === idx ? (
                             <div className="flex items-center gap-2 w-full">
                               <input 
                                 value={editedVehicleName} 
                                 onChange={e => setEditedVehicleName(e.target.value)}
                                 className="flex-1 bg-navy-800 border border-accent/40 rounded px-2 py-1 text-xs text-white outline-none"
                                 autoFocus
                               />
                               <button onClick={saveEditedVehicle} className="text-emerald-500"><Check size={18}/></button>
                               <button onClick={() => setEditingVehicleIndex(null)} className="text-red-500"><X size={18}/></button>
                             </div>
                           ) : (
                             <span className="text-white font-black uppercase text-sm truncate">{v}</span>
                           )}
                        </div>
                        {editingVehicleIndex !== idx && (
                          <div className="flex items-center gap-2">
                             <button onClick={() => startEditVehicle(idx)} className="p-2 text-slate-500 hover:text-accent transition-colors">
                                <Edit2 size={16}/>
                             </button>
                             <button onClick={() => handleRemoveVehicle(v)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors">
                                <Trash2 size={18}/>
                             </button>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-12 animate-in fade-in">
             <div className="text-center space-y-4"><div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto border border-accent/20"><Monitor size={32}/></div><h2 className="text-2xl font-black text-white uppercase">{t.softwareDistribution}</h2></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-widest">Version Tag</label><input value={systemData.appVersion} onChange={e => setSystemData({ ...systemData, appVersion: e.target.value })} className="w-full bg-[#0a1628] border border-white/10 p-6 rounded-2xl text-white font-black outline-none focus:border-accent" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-widest">Distribution Link</label><input value={systemData.updateUrl} onChange={e => setSystemData({ ...systemData, updateUrl: e.target.value })} className="w-full bg-[#0a1628] border border-white/10 p-6 rounded-2xl text-white font-black outline-none focus:border-accent" placeholder="https://..." /></div>
             </div>
             <button onClick={handleSystemUpdate} className="w-full bg-accent text-[#0a1628] py-8 rounded-[32px] font-black uppercase text-xl shadow-accent active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"><Settings2 size={24}/> Commit System Update</button>
          </div>
        )}

        {activeTab === 'team_manager' && <div className="p-4 md:p-10"><UserManagement t={t} users={users} setUsers={setUsers} currentUser={currentUser} tasks={tasks} setTasks={setTasks} /></div>}
      </div>
    </div>
  );
};

const BrandingInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-widest flex items-center gap-2">{icon} {label}</label>
    <input value={value} onChange={e=>onChange(e.target.value)} className="w-full bg-[#0a1628] border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-accent transition-all shadow-inner" />
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-4 rounded-xl text-[10px] md:text-sm font-black uppercase transition-all whitespace-nowrap active:scale-95 ${active ? 'bg-accent text-[#0a1628] shadow-accent shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

export default AdminPanel;
