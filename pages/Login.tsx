
import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
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

  const t = translations[settings.language || 'en'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (foundUser && foundUser.password === password) {
      onLogin(foundUser);
    } else {
      setError(t.authFailed);
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername) return;
    onResetRequest(resetUsername);
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#060e1a] flex flex-col items-center justify-between p-6 overflow-hidden relative font-['Inter']">
      
      {/* Background Image Layer */}
      {settings.loginBackgroundImageUrl && (
        <div 
          className="absolute inset-0 z-0 opacity-20 grayscale scale-110 pointer-events-none transition-all duration-1000"
          style={{ 
            backgroundImage: `url(${settings.loginBackgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px)'
          }}
        />
      )}

      <div className="hidden md:block h-10"></div>

      <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in duration-1000 flex flex-col items-center my-auto">
        
        <div className="text-center mb-6 md:mb-10 w-full">
          <div className="relative inline-block mb-4 md:mb-6">
            <div className="absolute inset-0 bg-accent/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-[-4px] border-2 border-accent/50 rounded-full blur-sm"></div>
            
            <div className="w-24 h-24 md:w-36 md:h-36 bg-[#0a1628] rounded-full flex items-center justify-center border border-white/10 relative z-10 overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.25)]">
              <img 
                src={settings.appLogoUrl} 
                className="w-full h-full object-cover scale-105" 
                alt="Logo" 
              />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase mb-1 drop-shadow-lg">
            {settings.appName.toUpperCase()}
          </h1>
          <p className="text-accent font-black uppercase text-[10px] tracking-[0.4em]">
            RdMedLag
          </p>
        </div>

        <div className="w-full bg-[#0d1b2e]/70 backdrop-blur-xl p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/5 shadow-2xl relative">
          
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                    <UserIcon size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 md:py-5 bg-[#060e1a] border border-white/5 rounded-2xl text-white font-medium text-sm outline-none focus:border-accent/40 transition-all placeholder:text-slate-600"
                    placeholder="Operator Username"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 md:py-5 bg-[#060e1a] border border-white/5 rounded-2xl text-white font-medium text-sm outline-none focus:border-accent/40 transition-all placeholder:text-slate-600"
                    placeholder="Access Key"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-accent transition-colors">
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-accent hover:brightness-110 text-[#0a1628] py-4 md:py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-accent active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <LogIn size={22} strokeWidth={3} /> 
                <span>{t.login}</span>
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setView('forgot')} 
                  className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Request Recovery
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('login')} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><ArrowLeft size={18}/></button>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Recovery</h2>
              </div>
              
              {!resetSuccess ? (
                <form onSubmit={handleRequestReset} className="space-y-6">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                     Provide operational ID for verification.
                   </p>
                   <input 
                      type="text" 
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      className="w-full p-5 bg-[#060e1a] border border-white/5 rounded-2xl text-white font-medium text-sm outline-none focus:border-accent/40"
                      placeholder="OPERATOR ID"
                      required
                   />
                   <button type="submit" className="w-full bg-accent text-[#0a1628] py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">
                     SUBMIT REQUEST
                   </button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-6 animate-in zoom-in">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto border border-accent/20">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-white font-black uppercase text-[12px] tracking-widest">Request Logged</p>
                  <button onClick={() => setView('login')} className="text-accent text-[10px] font-black uppercase tracking-widest underline">
                    Back to Terminal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center py-4 w-full z-10">
         <p className="text-slate-600 font-black uppercase text-[9px] tracking-[0.4em] opacity-40 select-none">
           Developed & Designed by Amjad Altokan
         </p>
      </div>

    </div>
  );
};

export default Login;
