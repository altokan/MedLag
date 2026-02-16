
import React, { useState } from 'react';
import { Phone, Mail, ChevronRight, Info, RefreshCw, LogOut, User as UserIcon, Download, X, CheckCircle2, Languages, Globe, Cpu } from 'lucide-react';
import { AppSettings, User } from '../types';

interface SettingsPageProps {
  t: any;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onLogout: () => void;
  currentUser: User;
  onNavigate: (tab: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ t, settings, setSettings, onLogout, currentUser, onNavigate }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleCall = () => { 
    if (settings.supervisorPhone) window.location.href = `tel:${settings.supervisorPhone}`; 
    else alert("No hotline configured.");
  };
  
  const handleCheckUpdate = () => {
    setShowUpdateModal(true);
  };

  const setLanguage = (lang: 'en' | 'de') => {
    setSettings({ ...settings, language: lang });
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700 pb-10 px-1 hyphens-auto break-words">
      {/* User Profile Card */}
      <section onClick={() => onNavigate('profile')} className="bg-[#0d1b2e] p-6 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 bg-[#0a1628] border-2 border-accent rounded-full flex items-center justify-center text-accent text-xl font-black shadow-xl">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg md:text-3xl font-black text-white uppercase group-hover:text-accent transition-colors truncate max-w-[200px] md:max-w-md">
                {currentUser.fullName || currentUser.username}
              </h2>
              <p className="text-slate-500 font-bold uppercase text-[9px] uppercase tracking-widest truncate">
                {currentUser.jobTitle || 'Team Member'}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-700" />
        </div>
      </section>

      {/* Language Selection */}
      <section className="bg-[#0d1b2e] p-5 rounded-[24px] border border-white/5 space-y-4 shadow-xl">
        <h2 className="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-white/5 pb-3 flex items-center gap-2">
          <Languages size={12}/> {t.language}
        </h2>
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => setLanguage('en')}
             className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-black uppercase text-[10px] transition-all ${settings.language === 'en' ? 'bg-accent text-[#0a1628] border-accent shadow-lg shadow-accent/10' : 'bg-[#0a1628] border-white/5 text-slate-500'}`}
           >
             <Globe size={14}/> {t.english}
           </button>
           <button 
             onClick={() => setLanguage('de')}
             className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-black uppercase text-[10px] transition-all ${settings.language === 'de' ? 'bg-accent text-[#0a1628] border-accent shadow-lg shadow-accent/10' : 'bg-[#0a1628] border-white/5 text-slate-500'}`}
           >
             <Globe size={14}/> {t.german}
           </button>
        </div>
      </section>

      {/* Operational Support Section */}
      <section className="bg-[#0d1b2e] p-5 rounded-[24px] border border-white/5 space-y-4 shadow-xl">
        <h2 className="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-white/5 pb-3">
          {t.operationalSupport}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <button onClick={handleCall} className="flex items-center justify-between p-4 bg-[#0a1628] rounded-[20px] border border-white/5 hover:border-accent/30 transition-all text-left">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-accent text-[#0a1628] rounded-xl shadow-lg shadow-accent/10"><Phone size={14}/></div>
                <div>
                  <p className="text-slate-500 font-black uppercase text-[7px]">{t.phone}</p>
                  <p className="text-white font-black text-[10px]">{settings.supervisorPhone}</p>
                </div>
             </div>
             <ChevronRight size={12} className="text-slate-800" />
          </button>
          <button onClick={() => onNavigate('issue')} className="flex items-center justify-between p-4 bg-[#0a1628] rounded-[20px] border border-white/5 hover:border-accent/30 transition-all text-left">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10"><Mail size={14}/></div>
                <div>
                  <p className="text-slate-500 font-black uppercase text-[7px]">{t.email}</p>
                  <p className="text-white font-black text-[10px] truncate max-w-[120px]">{settings.supervisorEmail}</p>
                </div>
             </div>
             <ChevronRight size={12} className="text-slate-800" />
          </button>
        </div>
      </section>

      <div className="space-y-3">
        <section className="bg-[#0a1628] p-4 rounded-[20px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
           <div className="flex items-center gap-2"><Info className="text-slate-700" size={14} /><p className="text-slate-600 font-black uppercase text-[8px] tracking-widest">{t.version} v{settings.appVersion}</p></div>
           <button onClick={handleCheckUpdate} className="bg-white/5 text-accent px-4 py-2 rounded-full font-black uppercase text-[8px] flex items-center gap-1.5 active:scale-95 transition-all"><RefreshCw size={10}/> {t.checkUpdates}</button>
        </section>
        <button onClick={onLogout} className="w-full bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600/20 transition-all">
          {t.logOutSession}
        </button>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
           <div className="bg-[#0d1b2e] w-full max-w-md rounded-[32px] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-6 bg-accent text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-sm md:text-xl font-black uppercase tracking-widest">{t.systemUpdates}</h2>
                 <button onClick={() => setShowUpdateModal(false)} className="p-1 hover:bg-black/10 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-8 text-center">
                 <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto border border-accent/20">
                    <Cpu size={40} className="animate-spin-slow" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Tactical Core Version</p>
                    <h3 className="text-white font-black uppercase text-3xl tracking-tighter">v{settings.appVersion}</h3>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5">
                    {settings.updateUrl ? (
                      <div className="space-y-4">
                         <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                           <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{t.softwareUpdateAvailable}</p>
                           <p className="text-slate-400 text-[9px] font-bold uppercase mt-1">Ready for high-speed deployment</p>
                         </div>
                         <button 
                           onClick={() => window.open(settings.updateUrl, '_blank')}
                           className="w-full py-6 bg-accent text-[#0a1628] rounded-[24px] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-accent/20"
                         >
                            <Download size={24}/> {t.downloadUpdate}
                         </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-4">
                         <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={24}/>
                         </div>
                         <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">{t.systemSynchronized}</p>
                         <p className="text-slate-600 font-bold uppercase text-[8px]">All tactical modules are up to date</p>
                      </div>
                    )}
                 </div>
                 
                 <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                 >
                   Dismiss Console
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
