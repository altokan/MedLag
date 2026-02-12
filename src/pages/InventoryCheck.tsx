
import React, { useState, useRef } from 'react';
import { ClipboardCheck, Check, AlertCircle, X, Package, ShieldCheck, Signature as SignatureIcon, Save, Activity, Lock, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Medicine, User, InventoryAudit } from '../types';

interface InventoryCheckProps {
  t: any;
  medicines: Medicine[];
  user: User;
  onComplete: (audit: InventoryAudit) => void;
}

const InventoryCheck: React.FC<InventoryCheckProps> = ({ t, medicines, user, onComplete }) => {
  const [actualCounts, setActualCounts] = useState<Record<string, number>>({});
  const [authData, setAuthData] = useState({ fullName: '', username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAuditSubmit = () => {
    if (authData.fullName.trim().toLowerCase() !== user.fullName?.trim().toLowerCase()) {
      alert(t.nameMismatch || "Full Name does not match your profile!");
      return;
    }
    if (authData.username !== user.username || authData.password !== user.password) {
      alert("Verification Failed: Invalid credentials.");
      return;
    }

    // التأكد من أن جميع الخانات تم تعبئتها (اختياري، أو نفترض أن غير المعبأ هو مطابق للنظام)
    const auditItems = medicines.map(med => {
      const actual = actualCounts[med.id] !== undefined ? actualCounts[med.id] : med.currentStock;
      return {
        medicineId: med.id,
        medicineName: med.name,
        expectedQty: med.currentStock,
        actualQty: actual,
        difference: actual - med.currentStock
      };
    });

    setIsSubmitting(true);
    const newAudit: InventoryAudit = {
      id: Math.random().toString(36).substr(2, 9),
      auditorId: user.id,
      auditorUsername: user.username,
      auditorFullName: user.fullName || user.username,
      timestamp: new Date().toISOString(),
      signature: "AUDIT_SIG_" + Math.random().toString(36).substr(2, 5),
      items: auditItems
    };

    setTimeout(() => {
      onComplete(newAudit);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="px-1">
        <h1 className="text-xl md:text-5xl font-black text-white uppercase tracking-tight">{t.inventoryCheck}</h1>
        <p className="text-[9px] md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Full Stock Audit Process</p>
      </header>

      <div className="bg-[#0d1b2e] p-4 md:p-12 rounded-2xl md:rounded-[56px] border border-white/5 shadow-2xl space-y-6 md:space-y-12">
        <div className="space-y-4 md:space-y-8">
           {medicines.map(med => {
             const actualValue = actualCounts[med.id];
             const hasDiff = actualValue !== undefined && actualValue !== med.currentStock;
             const diffVal = actualValue !== undefined ? actualValue - med.currentStock : 0;

             return (
               <div key={med.id} className={`bg-[#0a1628] p-4 md:p-10 rounded-2xl md:rounded-[40px] border transition-all ${hasDiff ? 'border-red-500/40 bg-red-500/[0.02]' : 'border-white/5'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4 md:space-x-8">
                        <div className="w-10 h-10 md:w-20 md:h-20 bg-[#0d1b2e] rounded-xl flex items-center justify-center text-accent border border-white/5">
                            <Package size={20} className="md:w-10 md:h-10" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-2xl font-black text-white uppercase">{med.name}</h3>
                            <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Location: {med.location}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10 items-end">
                       {/* العدد الواجب أن يكون */}
                       <div className="space-y-1">
                          <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t.expected}</label>
                          <div className="bg-[#0d1b2e] border border-white/10 p-3 md:p-5 rounded-xl text-accent font-black text-xs md:text-xl text-center">
                             {med.currentStock}
                          </div>
                       </div>

                       {/* العدد الموجود (خانة الإدخال) */}
                       <div className="space-y-1">
                          <label className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest block font-bold underline decoration-accent">{t.actual}</label>
                          <input 
                            type="number" 
                            placeholder="Input count..." 
                            value={actualCounts[med.id] ?? ''} 
                            onChange={e => setActualCounts({...actualCounts, [med.id]: parseInt(e.target.value)})} 
                            className={`w-full bg-[#0d1b2e] p-3 md:p-5 rounded-xl text-white font-black text-xs md:text-xl text-center outline-none border-2 transition-all ${actualValue === undefined ? 'border-white/10' : hasDiff ? 'border-red-500' : 'border-emerald-500'}`} 
                          />
                       </div>

                       {/* الفرق التلقائي */}
                       <div className="hidden md:block space-y-1">
                          <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t.difference}</label>
                          <div className={`p-3 md:p-5 rounded-xl font-black text-xs md:text-xl text-center border ${hasDiff ? 'bg-red-500/10 text-red-500 border-red-500/20' : actualValue !== undefined ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-slate-600 border-white/5'}`}>
                             {actualValue !== undefined ? (diffVal > 0 ? `+${diffVal}` : diffVal) : '--'}
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  {hasDiff && (
                    <div className="mt-4 p-3 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[9px] md:text-xs font-black uppercase tracking-widest animate-pulse">
                       <AlertTriangle size={14}/> Stock Discrepancy Detected: System expects {med.currentStock} units.
                    </div>
                  )}
               </div>
             );
           })}
        </div>

        <div className="border-t border-white/5 pt-8 md:pt-16 space-y-6 md:space-y-12">
            <h2 className="text-lg md:text-3xl font-black text-accent uppercase tracking-tight text-center">Tactical Identity Confirmation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t.fullName}</label><input type="text" value={authData.fullName} onChange={e => setAuthData({...authData, fullName: e.target.value})} placeholder="Full Profile Name" className="w-full p-4 md:p-6 bg-[#0a1628] border border-white/5 rounded-2xl text-white font-black text-xs md:text-xl outline-none focus:border-accent" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Username</label><input type="text" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} placeholder="Username" className="w-full p-4 md:p-6 bg-[#0a1628] border border-white/5 rounded-2xl text-white font-black text-xs md:text-xl outline-none focus:border-accent" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Password</label><input type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} placeholder="••••••••" className="w-full p-4 md:p-6 bg-[#0a1628] border border-white/5 rounded-2xl text-white font-black text-xs md:text-xl outline-none focus:border-accent" /></div>
                </div>
                <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-sm font-black text-slate-500 uppercase tracking-widest ml-2">{t.signature}</label>
                    <div className="bg-[#0a1628] border border-dashed border-white/10 rounded-2xl md:rounded-[48px] h-32 md:h-64 flex items-center justify-center relative shadow-inner overflow-hidden">
                         <SignatureIcon size={40} className="text-slate-800" />
                         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
                    </div>
                </div>
            </div>
            <button onClick={handleAuditSubmit} disabled={isSubmitting} className="w-full bg-accent text-[#0a1628] py-4 md:py-12 rounded-2xl md:rounded-[56px] font-black uppercase text-sm md:text-3xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:brightness-110">
                {isSubmitting ? <Activity className="animate-spin" /> : <Save />}
                <span>{t.confirmAudit}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCheck;
