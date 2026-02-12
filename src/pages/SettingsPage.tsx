
import React from 'react';
import { Languages, Moon, Sun, Phone, Mail, ChevronRight, Info, RefreshCw, LogOut, Palette, User as UserIcon, Download, Globe } from 'lucide-react';
import { AppSettings, User, Language } from '../types';

interface SettingsPageProps {
  t: any;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onLogout: () => void;
  currentUser: User;
  onNavigate: (tab: string) => void;
}

const APP_VERSION = '5.16.0';

const SettingsPage: React.FC<SettingsPageProps> = ({ t, settings, setSettings, onLogout, currentUser, onNavigate }) => {
  const handleCall = () => { 
    if (settings.supervisorPhone) window.location.href = `tel:${settings.supervisorPhone}`; 
    else alert("No hotline configured.");
  };
  
  const handleCheckUpdate = () => {
    const current = APP_VERSION.split('.').map(Number);
    const target = (settings.latestVersion || APP_VERSION).replace('v', '').split('.').map(Number);
    
    let isNewer = false;
    for (let i = 0; i < 3; i++) {
      if (target[i] > current[i]) {
        isNewer = true;
        break;
      } else if (target[i] < current[i]) {
        break;
      }
    }

    if (isNewer && settings.latestUpdateUrl) {
      alert(`New version (${settings.latestVersion}) detected. Opening download link...`);
      window.open(settings.latestUpdateUrl, '_blank');
    } else {
      alert(`System is up to date. Current Version: v${APP_VERSION}`);
    }
  };

  const changeLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700 pb-10 px-1">
      {/* User Profile Card */}
      <section onClick={() => onNavigate('profile')} className="bg-[#0d1b2e] p-6 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 bg-[#0a1628] border-2 border-accent rounded-full flex items-center justify-center text-accent text-xl font-black shadow-xl">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg md:text-3xl font-black text-white uppercase group-hover:text-accent transition-colors">
                {currentUser.fullName || currentUser.username}
              </h2>
              <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                {currentUser.email || (settings.language === 'en' ? 'View Profile' : 'Profil anzeigen')}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-700" />
        </div>
      </section>

      {/* Language Selection Section */}
      <section className="bg-[#0d1b2e] p-5 md:p-8 rounded-[24px] md:rounded-[40px] border border-white/5 space-y-4 shadow-xl">
        <h2 className="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-white/5 pb-3 flex items-center gap-2">
          <Globe size={14} className="text-accent" /> {settings.language === 'en' ? 'Interface Language' : 'Sprache'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => changeLanguage('en')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${settings.language === 'en' ? 'bg-accent border-accent text-[#0a1628]' : 'bg-[#0a1628] border-white/5 text-slate-500'}`}
          >
            <span className="text-lg mb-1">🇺🇸</span>
            <span className="font-black uppercase text-[10px]">English</span>
          </button>
          <button 
            onClick={() => changeLanguage('de')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${settings.language === 'de' ? 'bg-accent border-accent text-[#0a1628]' : 'bg-[#0a1628] border-white/5 text-slate-500'}`}
          >
            <span className="text-lg mb-1">🇩🇪</span>
            <span className="font-black uppercase text-[10px]">Deutsch</span>
          </button>
        </div>
      </section>

      {/* Operational Support Section */}
      <section className="bg-[#0d1b2e] p-5 rounded-[24px] border border-white/5 space-y-4 shadow-xl">
        <h2 className="text-slate-500 font-black uppercase tracking-widest text-[9px] border-b border-white/5 pb-3">
          {settings.language === 'en' ? 'Operational Support' : 'Operativer Support'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <button onClick={handleCall} className="flex items-center justify-between p-4 bg-[#0a1628] rounded-[20px] border border-white/5 hover:border-accent/30 transition-all">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-accent text-[#0a1628] rounded-xl"><Phone size={14}/></div>
                <div className="text-left">
                  <p className="text-slate-500 font-black uppercase text-[7px]">{t.phone}</p>
                  <p className="text-white font-black text-[10px]">{settings.supervisorPhone}</p>
                </div>
             </div>
             <ChevronRight size={12} className="text-slate-800" />
          </button>
          <button onClick={() => onNavigate('issue')} className="flex items-center justify-between p-4 bg-[#0a1628] rounded-[20px] border border-white/5 hover:border-accent/30 transition-all">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl"><Mail size={14}/></div>
                <div className="text-left">
                  <p className="text-slate-500 font-black uppercase text-[7px]">{t.email}</p>
                  <p className="text-white font-black text-[10px]">{settings.supervisorEmail}</p>
                </div>
             </div>
             <ChevronRight size={12} className="text-slate-800" />
          </button>
        </div>
      </section>

      <div className="space-y-3">
        <section className="bg-[#0a1628] p-4 rounded-[20px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
           <div className="flex items-center gap-2"><Info className="text-slate-700" size={14} /><p className="text-slate-600 font-black uppercase text-[8px] tracking-widest">Version v{APP_VERSION}</p></div>
           <button onClick={handleCheckUpdate} className="bg-white/5 text-accent px-4 py-2 rounded-full font-black uppercase text-[8px] flex items-center gap-1.5 active:scale-95 transition-all"><RefreshCw size={10}/> {settings.language === 'en' ? 'Check Updates' : 'Updates prüfen'}</button>
        </section>
        <button onClick={onLogout} className="w-full bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
          {settings.language === 'en' ? 'Log Out Session' : 'Sitzung beenden'}
        </button>
      </div>
    </div>
  );
};
export default SettingsPage;
