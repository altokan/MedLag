
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Send, X, CheckCircle } from 'lucide-react';
import { Alert, User } from '../types';

interface IssueReportProps {
  t: any;
  onSubmit: (alert: Alert) => void;
  currentUser: User;
}

const IssueReport: React.FC<IssueReportProps> = ({ t, onSubmit, currentUser }) => {
  const [issueType, setIssueType] = useState('Technical Problem');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    const newAlert: Alert = { 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'issue_report', 
      title: `Report: ${issueType}`, 
      description: description, 
      timestamp: new Date().toISOString(), 
      status: 'new', 
      read: false,
      userId: currentUser.id // Link report to user
    };
    onSubmit(newAlert);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setDescription(''); setPhoto(null); }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-40 animate-in zoom-in duration-500">
        <div className="w-12 h-12 md:w-32 md:h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 md:mb-10 border border-emerald-500/20 shadow-2xl">
          <CheckCircle size={24} className="md:w-16 md:h-16" />
        </div>
        <h2 className="text-lg md:text-5xl font-black text-white mb-2 uppercase tracking-tight">Report Sent</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tracking number generated</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3 md:space-y-10 animate-in fade-in duration-500 pb-20 px-1 md:px-0">
      <header>
        <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">{t.issue}</h1>
        <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Maintenance & Faults</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-[#0d1b2e] p-4 md:p-12 rounded-2xl md:rounded-[56px] shadow-2xl border border-white/5 space-y-4 md:space-y-10">
        <div className="space-y-1 md:space-y-2">
          <label className="text-[8px] md:text-xs font-black text-slate-500 uppercase ml-1">{t.problemType}</label>
          <select value={issueType} onChange={e=>setIssueType(e.target.value)} className="w-full p-2.5 md:p-8 bg-[#0a1628] border border-white/5 rounded-lg md:rounded-[32px] text-white font-black uppercase text-[10px] md:text-lg outline-none focus:border-[#ffd700]">
            <option>Technical Problem</option>
            <option>Damaged Medicine</option>
            <option>System Bug</option>
            <option>Other</option>
          </select>
        </div>

        <div className="space-y-1 md:space-y-2">
          <label className="text-[8px] md:text-xs font-black text-slate-500 uppercase ml-1">{t.description}</label>
          <textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2.5 md:p-8 bg-[#0a1628] border border-white/5 rounded-lg md:rounded-[32px] text-white text-[10px] md:text-xl outline-none focus:border-[#ffd700]" placeholder="Describe issue..."></textarea>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-6">
          <PhotoAction icon={<Camera size={18} className="md:w-12 md:h-12" />} label="Camera" />
          <PhotoAction icon={<ImageIcon size={18} className="md:w-12 md:h-12" />} label="Upload" />
        </div>

        <button type="submit" className="w-full bg-[#ffd700] text-[#0a1628] py-3.5 md:py-10 rounded-xl md:rounded-[32px] text-xs md:text-3xl font-black uppercase shadow-2xl flex items-center justify-center space-x-2 md:space-x-6 active:scale-95 transition-all">
          <Send size={16} className="md:w-10 md:h-10" />
          <span>Dispatch Report</span>
        </button>
      </form>
    </div>
  );
};

const PhotoAction = ({ icon, label }: any) => (
    <label className="cursor-pointer bg-[#0a1628] border border-dashed border-white/10 rounded-xl md:rounded-[32px] p-4 md:p-12 flex flex-col items-center justify-center space-y-1 md:space-y-4 text-slate-600 hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all">
        <div>{icon}</div>
        <span className="text-[7px] md:text-xs font-black uppercase tracking-widest">{label}</span>
    </label>
);

export default IssueReport;
