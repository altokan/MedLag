
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ClipboardCheck, Check, AlertCircle, X, Package, ShieldCheck, Save, Activity, Lock, User as UserIcon, AlertTriangle, Table, Printer, Mail, CheckCircle2 } from 'lucide-react';
import { Medicine, User, InventoryAudit, AppSettings } from '../types';

interface InventoryCheckProps {
  t: any;
  medicines: Medicine[];
  user: User;
  onComplete: (audit: InventoryAudit) => void;
  settings: AppSettings;
}

const InventoryCheck: React.FC<InventoryCheckProps> = ({ t, medicines, user, onComplete, settings }) => {
  const [actualCounts, setActualCounts] = useState<Record<string, number>>({});
  const [authData, setAuthData] = useState({ fullName: '', username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExportModal, setShowExportModal] = useState<InventoryAudit | null>(null);

  const auditResults = useMemo(() => {
    return medicines.map(med => {
      const actual = actualCounts[med.id] !== undefined ? actualCounts[med.id] : med.currentStock;
      const expected = med.currentStock;
      const difference = actual - expected;
      const isMatch = actual === expected;
      return { id: med.id, name: med.name, expected, actual, difference, isMatch };
    });
  }, [medicines, actualCounts]);

  const handleAuditSubmit = () => {
    if (!authData.fullName || !authData.password) {
      alert("Authentication Required: Name and key are mandatory.");
      return;
    }
    if (authData.fullName.trim().toLowerCase() !== user.fullName?.trim().toLowerCase()) {
      alert(t.nameMismatch || "Full Name does not match your profile!");
      return;
    }

    setIsSubmitting(true);
    const newAudit: InventoryAudit = {
      id: Math.random().toString(36).substr(2, 9),
      auditorId: user.id,
      auditorUsername: user.username,
      auditorFullName: user.fullName || user.username,
      timestamp: new Date().toISOString(),
      signature: "SIG_" + Math.random().toString(36).substr(2, 5),
      items: auditResults.map(r => ({
        medicineId: r.id,
        medicineName: r.name,
        expectedQty: r.expected,
        actualQty: r.actual,
        difference: r.difference
      }))
    };

    setTimeout(() => {
      onComplete(newAudit);
      setIsSubmitting(false);
      setShowExportModal(newAudit);
    }, 1500);
  };

  const exportPDF = (audit: InventoryAudit) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rows = audit.items.map(item => `
      <tr>
        <td>${item.medicineName}</td>
        <td>${item.expectedQty} (App)</td>
        <td>${item.actualQty} (Store)</td>
        <td style="color: ${item.difference < 0 ? 'red' : 'green'}">${item.difference}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Tactical Audit - ${audit.auditorFullName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0a1628; }
            h1 { border-bottom: 3px solid #ffd700; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; text-transform: uppercase; font-size: 10px; font-weight: 900; }
          </style>
        </head>
        <body>
          <h1>Inventory Audit Report</h1>
          <p>Personnel: <b>${audit.auditorFullName}</b></p>
          <p>Authorized On: <b>${new Date(audit.timestamp).toLocaleString()}</b></p>
          <table>
            <thead><tr><th>Asset Description</th><th>Expected (App)</th><th>Actual (Found)</th><th>Variance</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const emailAudit = (audit: InventoryAudit) => {
    const subject = `Inventory Audit - ${audit.auditorFullName}`;
    const diffs = audit.items.filter(i => i.difference !== 0).map(i => `- ${i.medicineName}: ${i.difference}`).join('%0A');
    const body = `Audit completed by ${audit.auditorFullName}\nDate: ${new Date(audit.timestamp).toLocaleString()}\n\nDiscrepancies:\n${diffs || 'None'}`;
    window.location.href = `mailto:${settings.supervisorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-500 pb-20 px-1">
      <header>
        <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">{t.inventoryCheck}</h1>
        <p className="text-[9px] md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Verification</p>
      </header>

      <div className="bg-[#0d1b2e] p-5 rounded-[40px] border border-white/5 space-y-6 shadow-3xl">
        <div className="space-y-4">
           {auditResults.map(item => (
             <div key={item.id} className={`bg-[#0a1628] p-5 rounded-[28px] border transition-all ${!item.isMatch ? 'border-red-500/40 bg-red-500/[0.02]' : 'border-white/5'}`}>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-white font-black uppercase text-xs truncate max-w-[200px]">{item.name}</h3>
                   <span className={`text-[10px] font-black uppercase ${item.isMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.isMatch ? 'Match' : 'Variance'}
                   </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   <AuditStat label="App Count" val={item.expected} />
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase text-center">In Store</p>
                      <input type="number" placeholder="..." value={actualCounts[item.id] ?? ''} onChange={e => setActualCounts({...actualCounts, [item.id]: parseInt(e.target.value)||0})} className="w-full bg-[#0d1b2e] p-3 rounded-xl border border-white/10 text-white font-black text-center outline-none focus:border-accent text-sm" />
                   </div>
                   <AuditStat label="Difference" val={item.difference} color={item.difference < 0 ? 'text-red-500' : 'text-emerald-500'} />
                </div>
             </div>
           ))}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Auth Signature</h3>
           <input value={authData.fullName} onChange={e=>setAuthData({...authData, fullName: e.target.value})} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-center text-sm outline-none focus:border-accent" placeholder="Full Official Name" />
           <input type="password" value={authData.password} onChange={e=>setAuthData({...authData, password: e.target.value})} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-center text-sm outline-none focus:border-accent" placeholder="Access Key" />
           <button onClick={handleAuditSubmit} disabled={isSubmitting} className="w-full bg-accent text-[#0a1628] py-6 rounded-[32px] font-black uppercase text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
              {isSubmitting ? <Activity className="animate-spin" /> : <Save />}
              <span>Commit Tactical Audit</span>
           </button>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
           <div className="bg-[#0d1b2e] w-full max-w-sm rounded-[48px] border border-emerald-500/20 p-8 space-y-8 animate-in zoom-in">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={40}/></div>
                 <h2 className="text-white font-black uppercase text-xl">Audit Logged</h2>
                 <p className="text-slate-500 font-bold text-[10px] uppercase">Operational database synchronized.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => exportPDF(showExportModal)} className="p-5 bg-white/5 rounded-3xl border border-white/10 text-slate-400 flex flex-col items-center gap-2 font-black uppercase text-[10px]"><Printer size={20}/> PDF</button>
                 <button onClick={() => emailAudit(showExportModal)} className="p-5 bg-white/5 rounded-3xl border border-white/10 text-blue-400 flex flex-col items-center gap-2 font-black uppercase text-[10px]"><Mail size={20}/> Email</button>
              </div>
              <button onClick={() => setShowExportModal(null)} className="w-full py-5 bg-accent text-[#0a1628] rounded-3xl font-black uppercase text-sm">Return to Terminal</button>
           </div>
        </div>
      )}
    </div>
  );
};

const AuditStat = ({ label, val, color = 'text-white' }: any) => (
  <div className="space-y-1 text-center">
     <p className="text-[8px] font-black text-slate-600 uppercase">{label}</p>
     <div className={`bg-[#0d1b2e] p-3 rounded-xl border border-white/5 font-black text-sm ${color}`}>{val > 0 ? `+${val}` : val}</div>
  </div>
);

export default InventoryCheck;
