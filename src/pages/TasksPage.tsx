
import React, { useState } from 'react';
import { CheckSquare, Clock, CheckCircle, User, Calendar, ClipboardCheck, Plus, X, Send, UserCheck } from 'lucide-react';
import { Task, User as UserType } from '../types';

interface TasksPageProps {
  t: any;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: UserType;
  users: UserType[];
  onStartAudit: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ t, tasks, setTasks, user, users, onStartAudit }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    type: 'general' as 'general' | 'audit' | 'urgent'
  });

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedTo) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: user.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: newTask.type
    };

    setTasks(prev => [task, ...prev]);
    setShowAddForm(false);
    setNewTask({ title: '', description: '', assignedTo: '', type: 'general' });
  };

  const userTasks = tasks.filter(tk => tk.assignedTo === user.username || user.role === 'admin' || user.role === 'supervisor');

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-12 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">{t.tasks}</h1>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Assignments & Team Board</p>
        </div>
        {(user.role === 'admin' || user.role === 'supervisor') && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#ffd700] text-[#0a1628] px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={18}/> New Task
          </button>
        )}
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="bg-[#0d1b2e] w-full max-w-xl rounded-[32px] md:rounded-[48px] border border-white/10 shadow-3xl overflow-hidden">
              <div className="p-4 md:p-8 bg-[#ffd700] text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-xs md:text-2xl font-black uppercase">Assign Tactical Duty</h2>
                 <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={24}/></button>
              </div>
              <form onSubmit={handleAddTask} className="p-6 md:p-12 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Objective Title *</label>
                    <input 
                      type="text" 
                      required
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-2xl text-white font-black text-xs md:text-lg outline-none focus:border-[#ffd700]"
                      placeholder="e.g. Weekly Fridge Check"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Assign To *</label>
                        <select 
                          required
                          value={newTask.assignedTo}
                          onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                          className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-2xl text-white font-black text-[10px] md:text-lg outline-none focus:border-[#ffd700]"
                        >
                           <option value="">Select Member</option>
                           {users.map(u => <option key={u.id} value={u.username}>{u.fullName || u.username}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Priority Level</label>
                        <select 
                          value={newTask.type}
                          onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                          className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-2xl text-white font-black text-[10px] md:text-lg outline-none focus:border-[#ffd700]"
                        >
                           <option value="general">General</option>
                           <option value="audit">Inventory Check</option>
                           <option value="urgent">Urgent Ops</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Briefing Details</label>
                    <textarea 
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-2xl text-white text-[10px] md:text-lg outline-none focus:border-[#ffd700]"
                      rows={3}
                      placeholder="Enter specific instructions..."
                    />
                 </div>

                 <button type="submit" className="w-full bg-[#ffd700] text-[#0a1628] py-4 md:py-8 rounded-xl md:rounded-[32px] font-black uppercase text-xs md:text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Send size={20}/> Dispatch Duty
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="space-y-2 md:space-y-4">
        {userTasks.length > 0 ? userTasks.map(tk => (
          <div key={tk.id} className={`bg-[#0d1b2e] p-4 md:p-8 rounded-xl md:rounded-[32px] border ${tk.status === 'completed' ? 'border-emerald-500/20 opacity-50' : 'border-white/5 shadow-xl'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                   {tk.type === 'audit' && <ClipboardCheck size={16} className="text-[#ffd700]"/>}
                   {tk.type === 'urgent' && <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>}
                   <h3 className="text-xs md:text-xl font-black text-white uppercase">{tk.title}</h3>
                </div>
                {tk.description && <p className="text-[9px] md:text-sm text-slate-400 mt-1">{tk.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-4 text-[8px] md:text-xs text-slate-600 font-black uppercase">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg"><User size={10}/> {tk.assignedTo}</span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg"><UserCheck size={10}/> By: {tk.assignedBy || 'Admin'}</span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg"><Calendar size={10}/> {new Date(tk.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 {tk.type === 'audit' && tk.status === 'pending' && tk.assignedTo === user.username && (
                   <button onClick={onStartAudit} className="bg-[#ffd700] text-[#0a1628] px-3 py-1.5 md:px-6 md:py-3 rounded-xl font-black uppercase text-[8px] md:text-xs shadow-lg active:scale-95">
                      Start Check
                   </button>
                 )}
                 {tk.status === 'pending' ? (
                    <button 
                      onClick={() => completeTask(tk.id)} 
                      disabled={tk.assignedTo !== user.username && user.role !== 'admin'}
                      className="p-2 md:p-5 bg-emerald-500/10 text-emerald-500 rounded-xl md:rounded-2xl border border-emerald-500/20 active:scale-90 self-end disabled:opacity-20"
                    >
                      <Clock size={16} className="md:w-8 md:h-8" />
                    </button>
                  ) : (
                    <div className="p-2 md:p-5 text-emerald-500 self-end"><CheckCircle size={16} className="md:w-8 md:h-8" /></div>
                  )}
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-700 font-black uppercase text-[10px] md:text-sm italic border border-dashed border-white/5 rounded-[40px]">No active tasks assigned</div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
