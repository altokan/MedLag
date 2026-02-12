
import React, { useState, useMemo } from 'react';
import { Lock, ShieldCheck, Plus, ArrowLeftRight, ClipboardCheck, BarChart3, Package, Trash2, X, Check, Save, Table, Printer, Search, AlertTriangle, UserCheck, Activity, Hash, Mail, Download } from 'lucide-react';
import { Medicine, Withdrawal, User, AppSettings } from '../types';

interface BTMControlProps {
  t: any;
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  withdrawals: Withdrawal[];
  setWithdrawals: React.Dispatch<React.SetStateAction<Withdrawal[]>>;
  user: User;
  settings: AppSettings;
}

const BTMControl: React.FC<BTMControlProps> = ({ t, medicines, setMedicines, withdrawals, setWithdrawals, user, settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'withdraw' | 'reports'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [btmSearch, setBtmSearch] = useState('');
  
  const [withdrawalData, setWithdrawalData] = useState({ 
    medicineId: '', 
    quantity: 1, 
    witnessName: '', 
    incidentNumber: '', 
    vehicle: settings.vehicles[0] 
  });

  const btmMedicines = useMemo(() => medicines.filter(m => m.isBTM && m.name.toLowerCase().includes(btmSearch.toLowerCase())), [medicines, btmSearch]);
  const btmWithdrawals = useMemo(() => withdrawals.filter(w => w.isBTM), [withdrawals]);

  const [newBtmMed, setNewBtmMed] = useState<Partial<Medicine>>({ isBTM: true, currentStock: 0, minStock: 5 });

  const handleAddBtm = () => {
    if(!newBtmMed.name || !newBtmMed.barcode) return alert("Required fields missing");
    setMedicines(prev => [...prev, { ...newBtmMed, id: 'btm-' + Math.random().toString(36).substr(2, 9), isBTM: true } as Medicine]);
    setShowAddModal(false);
    setNewBtmMed({ isBTM: true, currentStock: 0, minStock: 5 });
  };

  const handleBTMWithdrawal = () => {
    if (!withdrawalData.medicineId || !withdrawalData.witnessName || !withdrawalData.incidentNumber) return alert("Double verification required: Witness & Incident Number are mandatory!");
    const med = medicines.find(m => m.id === withdrawalData.medicineId);
    if (!med || med.currentStock < withdrawalData.quantity) return alert("Insufficient stock in vault!");

    const newW: Withdrawal = {
      id: Math.random().toString(36).substr(2, 9),
      medicineId: med.id,
      medicineName: med.name,
      quantity: withdrawalData.quantity,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      stockBefore: med.currentStock,
      stockAfter: med.currentStock - withdrawalData.quantity,
      signature: "BTM_AUTH_VERIFIED",
      vehicle: withdrawalData.vehicle,
      isBTM: true,
      witnessName: withdrawalData.witnessName,
      incidentNumber: withdrawalData.incidentNumber
    };

    setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, currentStock: m.currentStock - withdrawalData.quantity } : m));
    setWithdrawals(prev => [newW, ...prev]);
    setWithdrawalData({ medicineId: '', quantity: 1, witnessName: '', incidentNumber: '', vehicle: settings.vehicles[0] });
    alert("BTM Withdrawal recorded successfully.");
  };

  // Export Functions
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Drug,Quantity,Incident #,Witness,Authorized By,Vehicle\n";
    btmWithdrawals.forEach(w => {
      csvContent += `${new Date(w.timestamp).toLocaleString()},${w.medicineName},${w.quantity},${w.incidentNumber},${w.witnessName},${w.username},${w.vehicle}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BTM_VAULT_LOG_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = btmWithdrawals.map(w => `
      <tr>
        <td>${new Date(w.timestamp).toLocaleString()}</td>
        <td>${w.medicineName}</td>
        <td>${w.quantity}</td>
        <td>${w.incidentNumber}</td>
        <td>${w.witnessName}</td>
        <td>${w.username}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>BTM Vault Log - ${settings.appName}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #0a1628; }
            h1 { color: #0a1628; border-bottom: 3px solid #ffd700; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px; }
            th { background-color: #f8fafc; font-weight: bold; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>BTM Controlled Substance Log</h1>
          <p>System: ${settings.appName} | Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date/Time</th><th>Drug Asset</th><th>Qty</th><th>Incident #</th><th>Witness</th><th>Authorized</th>
              </tr>
            </thead>
            <tbody>${content}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const sendByEmail = () => {
    const subject = `BTM Vault Log - ${settings.appName}`;
    const body = encodeURIComponent(`BTM Log generated on ${new Date().toLocaleString()}\n\nTotal Logs: ${btmWithdrawals.length}\nAuthorized Operator: ${user.fullName || user.username}\n\nPlease review the electronic logs in the system.`);
    window.location.href = `mailto:${settings.supervisorEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4 group">
           <div className="p-3 bg-accent text-[#0a1628] rounded-2xl group-hover:rotate-12 transition-transform duration-500"><Lock size={24}/></div>
           <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">{t.btmVault}</h1>
              <p className="text-accent font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                 <ShieldCheck size={14} className="animate-pulse"/> Secure Area Access
              </p>
           </div>
        </div>
        <div className="flex bg-[#0d1b2e] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar shadow-inner">
           <SubTabBtn active={activeSubTab === 'inventory'} onClick={() => setActiveSubTab('inventory')} icon={<Package size={16}/>} label="Stock" />
           <SubTabBtn active={activeSubTab === 'withdraw'} onClick={() => setActiveSubTab('withdraw')} icon={<ArrowLeftRight size={16}/>} label="Withdraw" />
           <SubTabBtn active={activeSubTab === 'reports'} onClick={() => setActiveSubTab('reports')} icon={<BarChart3 size={16}/>} label="Log" />
        </div>
      </header>

      <div className="bg-[#0d1b2e] rounded-[32px] border border-white/5 shadow-3xl overflow-hidden min-h-[450px]">
        {activeSubTab === 'inventory' && (
          <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full max-w-md group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18}/>
                   <input value={btmSearch} onChange={e=>setBtmSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-[#0a1628] rounded-2xl border border-white/5 text-white outline-none focus:border-accent transition-all" placeholder="Search Vault..." />
                </div>
                <button onClick={() => setShowAddModal(true)} className="w-full md:w-auto bg-accent text-[#0a1628] px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 active:scale-95 transition-all">
                   <Plus size={18}/> Add Drug
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {btmMedicines.map(med => (
                   <div key={med.id} className="bg-[#0a1628] p-5 rounded-[28px] border border-white/5 flex items-center justify-between group hover:border-accent/40 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#0d1b2e] rounded-xl text-accent group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                         <div><h3 className="text-white font-black uppercase text-sm">{med.name}</h3><p className="text-slate-500 font-bold text-[8px] uppercase tracking-widest">{med.barcode}</p></div>
                      </div>
                      <div className="text-right"><p className="text-accent font-black text-xl">{med.currentStock}</p><p className="text-slate-600 font-bold text-[7px] uppercase tracking-tighter">Units</p></div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeSubTab === 'withdraw' && (
          <div className="p-6 md:p-10 space-y-8 animate-in slide-in-from-right-4">
             <div className="bg-[#0a1628] p-6 md:p-10 rounded-[40px] border border-white/5 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h2 className="text-lg font-black text-white uppercase tracking-tight">Vault Withdrawal</h2>
                   <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Drug Asset</label><select value={withdrawalData.medicineId} onChange={e=>setWithdrawalData({...withdrawalData, medicineId: e.target.value})} className="w-full p-4 bg-[#0d1b2e] border border-white/10 rounded-xl text-white font-black outline-none focus:border-accent transition-all"><option value="">Select Asset...</option>{btmMedicines.map(m=><option key={m.id} value={m.id}>{m.name} ({m.currentStock})</option>)}</select></div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Quantity</label><input type="number" value={withdrawalData.quantity} onChange={e=>setWithdrawalData({...withdrawalData, quantity: parseInt(e.target.value)||1})} className="w-full p-4 bg-[#0d1b2e] border border-white/10 rounded-xl text-white font-black outline-none focus:border-accent transition-all" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Vehicle</label><select value={withdrawalData.vehicle} onChange={e=>setWithdrawalData({...withdrawalData, vehicle: e.target.value})} className="w-full p-4 bg-[#0d1b2e] border border-white/10 rounded-xl text-white font-black outline-none focus:border-accent transition-all">{settings.vehicles.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                </div>
                <div className="space-y-4">
                   <h2 className="text-lg font-black text-accent uppercase tracking-tight">Authorization</h2>
                   <div className="space-y-1"><label className="text-[10px] font-black text-accent uppercase ml-4 flex items-center gap-2 tracking-widest"><UserCheck size={14}/> {t.witness}</label><input value={withdrawalData.witnessName} onChange={e=>setWithdrawalData({...withdrawalData, witnessName: e.target.value})} className="w-full p-4 bg-[#0d1b2e] border border-accent/20 rounded-xl text-white font-black outline-none focus:border-accent transition-all" placeholder="Witness Full Name" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 flex items-center gap-2 tracking-widest"><Hash size={14}/> {t.incidentNumber}</label><input value={withdrawalData.incidentNumber} onChange={e=>setWithdrawalData({...withdrawalData, incidentNumber: e.target.value})} className="w-full p-4 bg-[#0d1b2e] border border-white/10 rounded-xl text-white font-black outline-none focus:border-accent transition-all" placeholder="Einsatz Nummer" /></div>
                   <button onClick={handleBTMWithdrawal} className="w-full py-5 bg-accent text-[#0a1628] rounded-2xl font-black uppercase text-sm shadow-xl mt-4 active:scale-95 transition-all">Authorized Release</button>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="p-6 space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Vault Ledger</h2>
                <div className="flex gap-2">
                   <button onClick={exportToPDF} className="p-2.5 bg-[#0a1628] rounded-lg text-accent border border-white/5 active:scale-90 transition-all hover:bg-accent/10"><Printer size={18}/></button>
                   <button onClick={exportToExcel} className="p-2.5 bg-[#0a1628] rounded-lg text-emerald-500 border border-white/5 active:scale-90 transition-all hover:bg-emerald-500/10"><Table size={18}/></button>
                   <button onClick={sendByEmail} className="p-2.5 bg-[#0a1628] rounded-lg text-blue-400 border border-white/5 active:scale-90 transition-all hover:bg-blue-400/10"><Mail size={18}/></button>
                </div>
             </div>
             <div className="space-y-3">
                {btmWithdrawals.map(w => (
                   <div key={w.id} className="bg-[#0a1628] p-4 rounded-2xl border-l-4 border-red-500 flex items-center justify-between shadow-xl animate-in slide-in-from-left-2 transition-all hover:translate-x-1">
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs uppercase truncate">{w.medicineName}</p>
                        <p className="text-slate-500 text-[8px] uppercase font-bold truncate tracking-widest">Ref: {w.incidentNumber} • Wit: {w.witnessName}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-red-500 font-black text-lg">-{w.quantity}</p>
                         <p className="text-[7px] text-slate-700 font-bold uppercase">{new Date(w.timestamp).toLocaleDateString()}</p>
                      </div>
                   </div>
                ))}
                {btmWithdrawals.length === 0 && <div className="py-16 text-center opacity-20"><Lock size={48} className="mx-auto mb-2"/><p className="text-[10px] font-black uppercase tracking-widest">No Logs Available</p></div>}
             </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#0d1b2e] w-full max-w-md rounded-[32px] border border-accent/20 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-6 bg-accent text-[#0a1628] flex justify-between items-center">
                 <h2 className="text-lg font-black uppercase tracking-tighter">Vault Entry</h2>
                 <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-4">
                 <input value={newBtmMed.name || ''} onChange={e=>setNewBtmMed({...newBtmMed, name: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-xl text-white font-black outline-none focus:border-accent transition-all" placeholder="Drug Name" />
                 <input value={newBtmMed.barcode || ''} onChange={e=>setNewBtmMed({...newBtmMed, barcode: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-xl text-white font-black outline-none focus:border-accent transition-all" placeholder="Barcode" />
                 <input type="date" value={newBtmMed.expiryDate || ''} onChange={e=>setNewBtmMed({...newBtmMed, expiryDate: e.target.value})} className="w-full bg-[#0a1628] border border-white/5 p-4 rounded-xl text-white font-black outline-none focus:border-accent transition-all" />
                 <button onClick={handleAddBtm} className="w-full py-4 bg-accent text-[#0a1628] rounded-xl font-black uppercase shadow-xl active:scale-95 transition-all">Register in Vault</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SubTabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase transition-all active:scale-90 ${active ? 'bg-accent text-[#0a1628] shadow-lg scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

export default BTMControl;
