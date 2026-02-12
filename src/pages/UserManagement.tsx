
import React, { useState } from 'react';
import { UserPlus, Trash2, X, Key, ShieldCheck, Mail, Calendar, User as UserIcon, Edit3, CheckSquare, Plus, ClipboardCheck } from 'lucide-react';
import { User as UserType, Role, Task } from '../types';

interface UserManagementProps {
  t: any;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  currentUser: UserType;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ t, users, setUsers, currentUser, tasks, setTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' as Role, fullName: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UserType>>({});
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: '', type: 'general' as 'general' | 'audit' });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) return;
    setUsers(prev => [...prev, { 
      id: Math.random().toString(36).substr(2,9), 
      username: newUser.username, 
      password: newUser.password,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      joinDate: new Date().toISOString().split('T')[0]
    }]);
    setIsModalOpen(false);
    setNewUser({ username: '', password: '', role: 'user', fullName: '', email: '' });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...editData } : u));
    setSelectedUser({ ...selectedUser, ...editData } as UserType);
    setEditMode(false);
  };

  const assignTask = () => {
    if (!selectedUser || !newTaskData.title) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskData.title,
      description: newTaskData.type === 'audit' ? 'Perform comprehensive inventory audit.' : 'General duty assignment.',
      assignedTo: selectedUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: newTaskData.type
    };
    setTasks(prev => [task, ...prev]);
    setShowTaskForm(false);
    setNewTaskData({ title: '', type: 'general' });
  };

  const userTasks = selectedUser ? tasks.filter(tk => tk.assignedTo === selectedUser.username) : [];

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-500 pb-12">
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tight">{t.users}</h1>
          <p className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Personnel Access Control</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#ffd700] text-[#0a1628] px-4 md:px-12 py-3 md:py-6 rounded-2xl md:rounded-[40px] flex items-center space-x-2 font-black uppercase text-[10px] md:text-xl shadow-2xl active:scale-95 transition-all">
          <UserPlus size={18} className="md:w-8 md:h-8" />
          <span className="hidden sm:inline">Add Member</span>
        </button>
      </header>

      <div className="bg-[#0d1b2e] rounded-[32px] md:rounded-[56px] shadow-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px] md:min-w-full">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] md:text-[13px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 md:px-12 py-4 md:py-10">Member Profile</th>
                <th className="px-6 md:px-12 py-4 md:py-10">Access Level</th>
                <th className="px-6 md:px-12 py-4 md:py-10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr 
                  key={u.id} 
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => { setSelectedUser(u); setEditData(u); setEditMode(false); }}
                >
                  <td className="px-6 md:px-12 py-4 md:py-12">
                      <div className="flex items-center space-x-3 md:space-x-8">
                          <div className="w-10 h-10 md:w-20 md:h-20 bg-[#0a1628] border border-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-[#ffd700] font-black text-xs md:text-3xl shadow-inner">
                              {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col space-y-0.5 md:space-y-1">
                            <span className="font-black text-white text-xs md:text-3xl uppercase tracking-tight">{u.username}</span>
                            <span className="text-[9px] md:text-sm text-slate-500 font-bold uppercase">{u.fullName || 'No Name Set'}</span>
                          </div>
                      </div>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-12">
                    <span className={`px-3 md:px-8 py-1.5 md:py-4 rounded-xl md:rounded-3xl text-[9px] md:text-[13px] font-black uppercase inline-flex items-center space-x-2 shadow-xl ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-[#0a1628] text-slate-400 border border-white/5'}`}>
                      <ShieldCheck size={12} className="md:w-5 md:h-5" />
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-12 text-right">
                      <div className="flex justify-end space-x-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm('Delete user?')) setUsers(prev => prev.filter(x=>x.id!==u.id)); }} 
                            className="p-3 md:p-6 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 size={14} className="md:w-7 md:h-7" />
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1b2e] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[64px] shadow-2xl border border-white/10">
            <div className="sticky top-0 p-4 md:p-12 bg-[#ffd700] flex justify-between items-center text-[#0a1628] z-10 shadow-lg">
              <h2 className="text-xs md:text-3xl font-black uppercase tracking-tight">{t.userDetails}</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors"><X size={18} className="md:w-10 md:h-10" /></button>
            </div>
            <div className="p-6 md:p-16 space-y-6 md:space-y-12">
              {!editMode ? (
                <div className="space-y-8 md:space-y-16">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 md:space-x-12">
                      <div className="w-20 h-20 md:w-32 md:h-32 bg-[#0a1628] border-2 border-[#ffd700] rounded-3xl md:rounded-[48px] flex items-center justify-center text-3xl md:text-6xl text-[#ffd700] font-black shadow-2xl">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tight">{selectedUser.username}</h3>
                        <p className="text-[#ffd700] font-black uppercase text-[10px] md:text-lg mt-2 tracking-widest">{selectedUser.role} Account</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <InfoBox label={t.fullName} value={selectedUser.fullName || '---'} icon={<UserIcon size={16}/>} />
                    <InfoBox label={t.email} value={selectedUser.email || '---'} icon={<Mail size={16}/>} />
                  </div>

                  <div className="space-y-4 md:space-y-6 border-t border-white/5 pt-10">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] md:text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                           <CheckSquare size={16} className="text-[#ffd700]"/> Assignments
                       </h4>
                       <button onClick={() => setShowTaskForm(true)} className="text-[#ffd700] flex items-center gap-1.5 text-[9px] md:text-xs font-black uppercase">
                          <Plus size={14}/> New Task
                       </button>
                    </div>

                    {showTaskForm && (
                      <div className="bg-[#0a1628] p-4 md:p-8 rounded-2xl border border-[#ffd700]/20 space-y-4 animate-in slide-in-from-top-4">
                         <input 
                           type="text" 
                           placeholder="Task Title (e.g. Monthly Stock Check)"
                           value={newTaskData.title}
                           onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                           className="w-full bg-[#0d1b2e] border border-white/5 p-3 rounded-xl text-white outline-none"
                         />
                         <div className="flex gap-2">
                            <button onClick={() => setNewTaskData({...newTaskData, type: 'general'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border ${newTaskData.type === 'general' ? 'bg-[#ffd700] text-[#0a1628]' : 'bg-transparent text-slate-500 border-white/5'}`}>General</button>
                            <button onClick={() => setNewTaskData({...newTaskData, type: 'audit'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border ${newTaskData.type === 'audit' ? 'bg-[#ffd700] text-[#0a1628]' : 'bg-transparent text-slate-500 border-white/5'}`}>Audit</button>
                         </div>
                         <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowTaskForm(false)} className="flex-1 py-2 text-slate-500 text-[9px] font-black uppercase">Cancel</button>
                            <button onClick={assignTask} className="flex-1 py-2 bg-[#ffd700] text-[#0a1628] rounded-lg text-[9px] font-black uppercase">Assign Now</button>
                         </div>
                      </div>
                    )}

                    <div className="space-y-3 md:space-y-4">
                        {userTasks.length > 0 ? userTasks.map(tk => (
                            <div key={tk.id} className="bg-[#0a1628] p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-white/5 flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-3">
                                   {tk.type === 'audit' ? <ClipboardCheck size={16} className="text-[#ffd700]"/> : <CheckSquare size={16} className="text-slate-500"/>}
                                   <span className="text-[11px] md:text-xl text-white font-black uppercase">{tk.title}</span>
                                </div>
                                <span className={`text-[9px] md:text-[13px] font-black uppercase px-3 md:px-5 py-1 md:py-2 rounded-xl ${tk.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{tk.status}</span>
                            </div>
                        )) : (
                            <p className="text-slate-700 text-[10px] md:text-sm font-black uppercase text-center py-8 italic tracking-widest">No active duties found</p>
                        )}
                    </div>
                  </div>

                  <button onClick={() => setEditMode(true)} className="w-full bg-[#0a1628] text-[#ffd700] py-4 md:py-10 rounded-2xl md:rounded-[48px] font-black uppercase text-xs md:text-2xl border border-[#ffd700]/30 flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
                    <Edit3 size={20} className="md:w-8 md:h-8"/> {t.edit} Member
                  </button>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-10">
                  <InputGroup label={t.fullName} value={editData.fullName || ''} onChange={v => setEditData({...editData, fullName: v})} />
                  <InputGroup label={t.email} value={editData.email || ''} onChange={v => setEditData({...editData, email: v})} />
                  <InputGroup label={t.password} value={editData.password || ''} onChange={v => setEditData({...editData, password: v})} />
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase ml-2">Access Rights</label>
                    <select 
                      value={editData.role} 
                      onChange={e => setEditData({...editData, role: e.target.value as Role})}
                      className="w-full p-4 md:p-10 bg-[#0a1628] border border-white/5 rounded-2xl md:rounded-[48px] text-white font-black text-xs md:text-2xl outline-none focus:border-[#ffd700] transition-all"
                    >
                      <option value="user">USER (Restricted)</option>
                      <option value="admin">ADMIN (Full Control)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 md:gap-8 pt-6">
                    <button onClick={() => setEditMode(false)} className="flex-1 bg-white/5 text-slate-500 py-4 md:py-10 rounded-2xl md:rounded-[48px] font-black uppercase text-[10px] md:text-xl">Discard</button>
                    <button onClick={handleUpdateUser} className="flex-1 bg-[#ffd700] text-[#0a1628] py-4 md:py-10 rounded-2xl md:rounded-[48px] font-black uppercase text-[10px] md:text-xl shadow-2xl active:scale-95 transition-all">Commit Changes</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1b2e] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[64px] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-4 md:p-10 bg-[#ffd700] flex justify-between items-center text-[#0a1628]">
              <h2 className="text-xs md:text-2xl font-black uppercase tracking-tight">Onboard New Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-black/5 rounded-full"><X size={18} className="md:w-8 md:h-8" /></button>
            </div>
            <div className="p-6 md:p-14 space-y-4 md:space-y-10">
                <div className="space-y-4 md:space-y-6">
                    <InputGroup label="System Username (Required)" value={newUser.username} onChange={v => setNewUser({...newUser, username: v})} />
                    <InputGroup label="Access Key / Password (Required)" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} />
                    <InputGroup label="Full Display Name (Optional)" value={newUser.fullName} onChange={v => setNewUser({...newUser, fullName: v})} />
                    <InputGroup label="Work Email (Optional)" value={newUser.email} onChange={v => setNewUser({...newUser, email: v})} />
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase ml-2">Access Type</label>
                        <select 
                            value={newUser.role} 
                            onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                            className="w-full p-4 md:p-10 bg-[#0a1628] border border-white/5 rounded-2xl md:rounded-[48px] text-white font-black text-xs md:text-2xl"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <button onClick={handleAddUser} className="w-full bg-[#ffd700] text-[#0a1628] py-4 md:py-10 rounded-2xl md:rounded-[48px] font-black uppercase text-[10px] md:text-2xl shadow-2xl active:scale-95 transition-all">Create Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-[#0a1628] p-4 md:p-10 rounded-2xl md:rounded-[40px] border border-white/5 shadow-inner">
    <p className="text-[9px] md:text-[13px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">{icon}{label}</p>
    <p className="text-[11px] md:text-2xl font-black text-white break-all">{value}</p>
  </div>
);

const InputGroup = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full p-4 md:p-10 bg-[#0a1628] border border-white/5 rounded-2xl md:rounded-[48px] text-white font-black text-xs md:text-2xl outline-none focus:border-[#ffd700] transition-all" 
    />
  </div>
);

export default UserManagement;
