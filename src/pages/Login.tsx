
import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, Phone, X, CheckCircle, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { User, AppSettings } from '../types';
import { translations } from '../translations';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  settings: AppSettings;
  onResetRequest: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, settings, onResetRequest }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetUsername, setResetUsername] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const t = (translations as any)[settings.language] || translations.en;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username === username);
    
    if (foundUser && foundUser.password === password) {
      onLogin(foundUser);
    } else {
      setError(settings.language === 'en' ? "Invalid username or password" : "Ungültiger Benutzername oder Passwort");
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername) return;
    onResetRequest(resetUsername);
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-[420px] z-10 animate-in fade-in zoom-in duration-700 flex flex-col">
        <div className="text-center mb-10 group">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-[#0d1b2e] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-accent shadow-[0_0_45px_rgba(255,213,0,0.3)] overflow-hidden animate-pulse-rotate relative group-hover:scale-105 transition-transform duration-700">
            <div className="absolute inset-0 bg-accent/10 animate-pulse"></div>
            <img 
              src={settings.appLogoUrl} 
              className="w-full h-full object-cover relative z-10 transition-transform duration-1000 group-hover:scale-110" 
              alt="Logo" 
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-1 animate-in slide-in-from-top-4 duration-700">RDMedLag</h1>
          <p className="text-accent font-black uppercase text-[10px] tracking-[0.4em] opacity-60 font-ui animate-in slide-in-from-bottom-2 duration-700">{settings.appName}</p>
        </div>

        <div className="bg-[#0d1b2e]/80 backdrop-blur-xl p-8 md:p-10 rounded-[36px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-12 duration-1000">
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all group-focus-within:scale-110" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#0a1628]/50 border border-white/5 rounded-2xl text-white font-black text-xs md:text-sm outline-none focus:border-accent transition-all placeholder:text-slate-700 focus:bg-[#0a1628]"
                    placeholder="USERNAME"
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all group-focus-within:scale-110" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-[#0a1628]/50 border border-white/5 rounded-2xl text-white font-black text-xs md:text-sm outline-none focus:border-accent transition-all placeholder:text-slate-700 focus:bg-[#0a1628]"
                    placeholder="PASSWORD"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-accent transition-colors">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-tighter animate-shake">{error}</p>}

              <button type="submit" className="w-full bg-accent text-[#0a1628] py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_10px_20px_rgba(255,213,0,0.15)] active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-3 group">
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> 
                <span>{t.login}</span>
              </button>

              <button type="button" onClick={() => setView('forgot')} className="w-full text-slate-500 hover:text-accent text-[9px] font-black uppercase tracking-widest transition-colors hover:underline">
                Request Credential Recovery
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setView('login')} className="p-2 bg-white/5 rounded-full text-slate-400 active:scale-90 transition-all hover:text-white"><ArrowLeft size={16}/></button>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">System Recovery</h2>
              </div>
              {!resetSuccess ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Administrator verification required. Provide your operational identifier for authentication.</p>
                   <input 
                      type="text" 
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      className="w-full p-4 bg-[#0a1628] border border-white/5 rounded-2xl text-white font-black text-sm outline-none focus:border-accent"
                      placeholder="OPERATIONAL ID"
                      required
                   />
                   <button type="submit" className="w-full bg-accent text-[#0a1628] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Notify Root Admin</button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4 animate-in zoom-in">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto border-2 border-accent/20"><CheckCircle size={32} /></div>
                  <p className="text-white font-black uppercase text-[11px]">Dispatch Logged</p>
                  <button onClick={() => setView('login')} className="text-accent text-[10px] font-black uppercase tracking-widest hover:underline">Return to Interface</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
