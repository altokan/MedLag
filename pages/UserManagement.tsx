
import React, { useState } from 'react';
import { UserPlus, Trash2, X, ShieldCheck, Mail, User as UserIcon, Edit3, CheckSquare, Plus, CheckCircle2, Search, Key, Shield, Briefcase } from 'lucide-react';
import { User as UserType, Role, Task, UserPermissions } from '../types';
import { defaultPermissions } from '../store';

interface UserManagementProps {
  t: any;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  currentUser: UserType;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const JOB_TITLES = [
  'Rettungssanitäter/in',
  'Notfallsanitäter/in',
  'WAL (Wachabteilungsleiter)'
];

const UserManagement: React.FC<UserManagementProps> = ({ t, users, setUsers, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'user' as Role, 
    fullName: '', 
    email: '',
    jobTitle: JOB_TITLES[0],
    permissions: { ...defaultPermissions }
  });

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      password: '',
      role: 'user',
      fullName: '',
      email: '',
      jobTitle: JOB_TITLES[0],
      permissions: { ...defaultPermissions }
    });
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setFormData({
      username: u.username,
      password: u.password || '',
      role: u.role,
      fullName: u.fullName || '',
      email: u.email || '',
      jobTitle: u.jobTitle || JOB_TITLES[0],
      permissions: u.permissions ? { ...u.permissions } : { ...defaultPermissions }
    });
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      alert("Name, Username, and Password are required!");
      return;
    }

    if (selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert("Cannot delete your own active account!");
      return;
    }
    if (confirm("Are you sure you want to permanently remove this member?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setIsModalOpen(false);
    }
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || u.username).toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">Team Manager</h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personnel & Access Control</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          className="bg-accent text-[#0a1628] p-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] md:text-sm shadow-xl active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Add Member</span>
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search member by name..." 
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-[#0d1b2e] border border-white/5 rounded-2xl text-white font-black uppercase text-xs outline-none focus:border-accent shadow-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {filteredUsers.map(u => (
          <button 
            key={u.id}
            onClick={() => handleOpenEdit(u)}
            className="bg-[#0d1b2e] p-4 md:p-6 rounded-[28px] border border-white/5 flex items-center justify-between hover:bg-[#1a2a40] group transition-all text-left shadow-lg"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0a1628] rounded-2xl flex items-center justify-center text-accent text-xl md:text-2xl font-black border border-white/5">
                  {u.username[0].toUpperCase()}
               </div>
               <div className="min-w-0">
                  <h3 className="text-white font-black uppercase text-xs md:text-lg truncate tracking-tight">{u.fullName || u.username}</h3>
                  <p className="text-accent font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-0.5">{u.jobTitle || 'No Title'}</p>
               </div>
            </div>
            <Edit3 size={18} className="text-slate-700 group-hover:text-accent transition-colors" />
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-30">
            <Search size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase text-xs tracking-widest">No members found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
           <div className="bg-[#0d1b2e] w-full max-w-2xl my-auto rounded-[32px] md:rounded-[48px] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-5 md:p-8 bg-accent text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-sm md:text-2xl font-black uppercase tracking-tighter">
                   {selectedUser ? 'Edit Member Profile' : 'Add New Member'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                   <X size={24} />
                 </button>
              </div>

              <div className="p-6 md:p-10 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Full Name *</label>
                       <input value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-xs font-black outline-none focus:border-accent" placeholder="Full Name" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Job Title</label>
                       <select value={formData.jobTitle} onChange={e=>setFormData({...formData, jobTitle: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-[10px] font-black outline-none focus:border-accent">
                          {JOB_TITLES.map(title => <option key={title} value={title}>{title}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Username *</label>
                       <input value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-xs font-black outline-none focus:border-accent" placeholder="Username" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Password *</label>
                       <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-xs font-black outline-none focus:border-accent" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Email (Optional)</label>
                       <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-xs font-black outline-none focus:border-accent" placeholder="Email Address" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Role</label>
                       <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value as Role})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-2xl text-white text-[10px] font-black outline-none focus:border-accent">
                          <option value="user">User Access</option>
                          <option value="supervisor">Supervisor View</option>
                          <option value="admin">System Admin</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5 space-y-4">
                    <h3 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                       <Shield size={16}/> Permissions Matrix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       <PermissionToggle label="Add New Assets" active={formData.permissions.addMedicine} onToggle={() => togglePermission('addMedicine')} />
                       <PermissionToggle label="Delete Assets" active={formData.permissions.deleteMedicine} onToggle={() => togglePermission('deleteMedicine')} />
                       <PermissionToggle label="Export Reports" active={formData.permissions.exportReports} onToggle={() => togglePermission('exportReports')} />
                       <PermissionToggle label="Inventory Audit" active={formData.permissions.inventoryCheck} onToggle={() => togglePermission('inventoryCheck')} />
                       <PermissionToggle label="Manage BTM Vault" active={formData.permissions.manageBTM} onToggle={() => togglePermission('manageBTM')} />
                       <PermissionToggle label="Send Emergency Alarms" active={formData.permissions.sendAlerts} onToggle={() => togglePermission('sendAlerts')} />
                       <PermissionToggle label="Admin Terminal Access" active={formData.permissions.accessAdminPanel} onToggle={() => togglePermission('accessAdminPanel')} />
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-3 pt-6">
                    {selectedUser && (
                       <button 
                         onClick={() => handleDeleteUser(selectedUser.id)} 
                         className="w-full md:w-auto px-8 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                       >
                          <Trash2 size={16}/> Delete Member
                       </button>
                    )}
                    <button 
                      onClick={handleSaveUser} 
                      className="flex-1 py-4 bg-accent text-[#0a1628] rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 size={16}/> {selectedUser ? 'Save Changes' : 'Confirm Addition'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PermissionToggle = ({ label, active, onToggle }: any) => (
  <button onClick={onToggle} className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${active ? 'bg-accent/10 border-accent/40' : 'bg-[#0a1628] border-white/5 opacity-50 hover:opacity-100'}`}>
     <span className={`text-[9px] font-black uppercase ${active ? 'text-accent' : 'text-slate-500'}`}>{label}</span>
     {active ? <CheckCircle2 size={14} className="text-accent" /> : <div className="w-3.5 h-3.5 border border-slate-700 rounded-full" />}
  </button>
);

export default UserManagement;
