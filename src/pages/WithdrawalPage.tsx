
import React, { useState, useRef, useEffect } from 'react';
import { Search, QrCode, Camera, Check, X, User as UserIcon, Package, Trash2, ShieldCheck, Lock, AlertCircle, ShoppingCart, Truck, Ambulance, Hash } from 'lucide-react';
import { Medicine, Withdrawal, User, AppSettings } from '../types';

interface WithdrawalPageProps {
  t: any;
  medicines: Medicine[];
  user: User;
  users: User[];
  onComplete: (withdrawals: Withdrawal[]) => void;
  externalCart: {medicine: Medicine, quantity: number}[];
  setExternalCart: React.Dispatch<React.SetStateAction<{medicine: Medicine, quantity: number}[]>>;
  settings: AppSettings;
}

const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ t, medicines, user, users, onComplete, externalCart, setExternalCart, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authData, setAuthData] = useState({ fullName: '', username: '', password: '', vehicle: '', incidentNumber: '' });
  const [authError, setAuthError] = useState('');

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.barcode.includes(searchTerm)
  );

  const addToCart = () => {
    if (!selectedMedicine) return;
    if (quantity <= 0 || quantity > selectedMedicine.currentStock) {
      alert("Invalid quantity");
      return;
    }
    
    setExternalCart(prev => {
      const existing = prev.find(i => i.medicine.id === selectedMedicine.id);
      if (existing) {
        return prev.map(i => i.medicine.id === selectedMedicine.id 
          ? { ...i, quantity: Math.min(i.medicine.currentStock, i.quantity + quantity) } 
          : i
        );
      }
      return [...prev, { medicine: selectedMedicine, quantity }];
    });
    
    setSelectedMedicine(null);
    setQuantity(1);
    setSearchTerm('');
  };

  const handleFinalize = () => {
    if (!authData.vehicle) {
      setAuthError(t.selectVehicle || "Selection Required: Please select a vehicle");
      return;
    }
    if (authData.fullName.trim().toLowerCase() !== user.fullName?.trim().toLowerCase()) {
      setAuthError("Identity mismatch: Full Name must match your profile.");
      return;
    }
    
    const verifiedUser = users.find(u => u.username === authData.username && u.password === authData.password);
    if (!verifiedUser || verifiedUser.id !== user.id) {
      setAuthError("Auth Failed: Invalid username or password");
      return;
    }

    const signature = "SIG_" + Math.random().toString(36).substr(2, 9);
    const results: Withdrawal[] = externalCart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      medicineId: item.medicine.id,
      medicineName: item.medicine.name,
      quantity: item.quantity,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      stockBefore: item.medicine.currentStock,
      stockAfter: item.medicine.currentStock - item.quantity,
      signature,
      vehicle: authData.vehicle,
      incidentNumber: authData.incidentNumber
    }));

    onComplete(results);
  };

  useEffect(() => {
    let timer: any;
    if (isScanning) {
      timer = setTimeout(() => {
        const randomMed = medicines[Math.floor(Math.random() * medicines.length)];
        setSearchTerm(randomMed.barcode);
        setIsScanning(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isScanning, medicines]);

  return (
    <div className="space-y-3 md:space-y-8 animate-in fade-in duration-500 pb-12 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-white tracking-tight uppercase">{t.withdrawal}</h1>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Medical Inventory Exit</p>
        </div>
        {externalCart.length > 0 && (
          <button 
            onClick={() => { setAuthError(''); setShowConfirmModal(true); }}
            className="bg-[#ffd700] text-[#0a1628] px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm shadow-xl flex items-center gap-2 animate-bounce"
          >
            <Check size={18}/> {t.finalizeWithdrawal} ({externalCart.length})
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!selectedMedicine ? (
            <div className="space-y-3 md:space-y-6">
              <div className="relative">
                <Search className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5 md:w-6 md:h-6" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-16 pr-20 md:pr-40 py-2.5 md:py-6 bg-[#0d1b2e] border border-white/5 rounded-xl md:rounded-3xl text-xs md:text-xl text-white outline-none focus:border-[#ffd700]/50"
                />
                <button 
                  onClick={() => setIsScanning(true)}
                  className="absolute right-1 md:right-3 inset-y-1 md:inset-y-3 bg-[#ffd700] text-[#0a1628] px-2 md:px-8 rounded-lg md:rounded-2xl flex items-center space-x-1 md:space-x-2 font-black uppercase text-[8px] md:text-sm active:scale-95"
                >
                  <QrCode size={14} className="md:w-6 md:h-6" />
                  <span>Scan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {filteredMedicines.map(med => (
                  <button
                    key={med.id}
                    onClick={() => setSelectedMedicine(med)}
                    className="bg-[#0d1b2e] p-2 md:p-6 rounded-xl md:rounded-[32px] border border-white/5 flex items-center space-x-2 md:space-x-5 hover:border-[#ffd700]/30 transition-all text-left shadow-lg group"
                  >
                    <div className="w-8 h-8 md:w-16 md:h-16 bg-[#0a1628] rounded-lg md:rounded-2xl overflow-hidden flex items-center justify-center text-[#ffd700] group-hover:scale-110 transition-transform">
                      {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" /> : <Package size={16} className="md:w-8 md:h-8" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-[10px] md:text-lg truncate uppercase">{med.name}</h3>
                      <p className="text-[8px] md:text-xs text-slate-500 font-bold uppercase">{med.location} • Stock: {med.currentStock}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1b2e] rounded-xl md:rounded-[40px] shadow-2xl overflow-hidden border border-white/5 animate-in slide-in-from-bottom-4">
              <div className="bg-[#ffd700] p-3 md:p-8 text-[#0a1628] flex justify-between items-center">
                <div>
                  <h2 className="text-xs md:text-2xl font-black uppercase tracking-tight">{selectedMedicine.name}</h2>
                  <p className="text-[8px] md:text-sm font-black uppercase opacity-70">Current Stock: {selectedMedicine.currentStock}</p>
                </div>
                <button onClick={() => setSelectedMedicine(null)} className="p-1 md:p-3 hover:bg-black/5 rounded-full"><X size={16} className="md:w-8 md:h-8" /></button>
              </div>

              <div className="p-4 md:p-10 space-y-6 md:space-y-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest">{t.quantity}</span>
                  <div className="flex items-center space-x-4 md:space-x-8">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-sm md:text-xl font-black">-</button>
                    <span className="text-xl md:text-4xl font-black text-[#ffd700] w-10 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedMedicine.currentStock, quantity + 1))} className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-sm md:text-xl font-black">+</button>
                  </div>
                </div>

                <button onClick={addToCart} className="w-full bg-[#ffd700] text-[#0a1628] py-3 md:py-6 rounded-xl md:rounded-[32px] text-xs md:text-lg font-black uppercase shadow-xl flex items-center justify-center space-x-2">
                  <ShoppingCart size={16} className="md:w-6 md:h-6" />
                  <span>Add to Selection</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#0d1b2e] rounded-2xl md:rounded-[40px] border border-white/5 p-4 md:p-8 space-y-4 md:space-y-8 h-fit lg:sticky lg:top-8 shadow-2xl">
           <h3 className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <ShoppingCart size={16} className="text-[#ffd700]"/> Selection Summary
           </h3>
           <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
             {externalCart.map(item => (
               <div key={item.medicine.id} className="flex items-center justify-between bg-[#0a1628] p-3 md:p-5 rounded-xl border border-white/5 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-[#0d1b2e] overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={item.medicine.imageUrl || `https://picsum.photos/seed/${item.medicine.id}/100/100`} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-black uppercase text-[10px] md:text-sm truncate">{item.medicine.name}</p>
                        <p className="text-slate-500 font-bold uppercase text-[8px] md:text-[10px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <button onClick={() => setExternalCart(externalCart.filter(c => c.medicine.id !== item.medicine.id))} className="text-red-500/30 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition-all">
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
             {externalCart.length === 0 && (
               <div className="py-12 text-center">
                  <Package className="mx-auto text-slate-800 w-12 h-12 mb-2" />
                  <p className="text-slate-600 font-black uppercase text-[8px] md:text-xs">No items selected</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0d1b2e] w-full max-w-2xl rounded-2xl md:rounded-[48px] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-4 md:p-8 bg-[#ffd700] text-[#0a1628] flex justify-between items-center">
              <h2 className="text-sm md:text-2xl font-black uppercase">Final Verification</h2>
              <button onClick={() => { setShowConfirmModal(false); setAuthError(''); }}><X size={24} /></button>
            </div>
            
            <div className="p-6 md:p-12 space-y-8 md:space-y-12">
              <div className="space-y-6">
                 {/* Visual Vehicle Selection */}
                 <div className="space-y-3">
                   <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase ml-2 flex items-center gap-1">
                     <Truck size={14}/> {t.vehicle} <span className="text-red-500">*</span>
                   </label>
                   <div className="grid grid-cols-2 gap-2 md:gap-4">
                     {settings.vehicles.map(v => (
                       <button
                         key={v}
                         onClick={() => setAuthData({...authData, vehicle: v})}
                         className={`flex items-center gap-2 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-3xl border-2 transition-all text-left ${
                           authData.vehicle === v 
                           ? 'bg-[#ffd700] border-[#ffd700] text-[#0a1628] shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                           : 'bg-[#0a1628] border-white/5 text-slate-400 hover:border-white/20'
                         }`}
                       >
                         <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${authData.vehicle === v ? 'bg-black/10' : 'bg-white/5'}`}>
                           <Ambulance size={16} className="md:w-6 md:h-6" />
                         </div>
                         <span className="text-[9px] md:text-sm font-black uppercase leading-tight">{v}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><UserIcon size={12}/> Your Full Name</label>
                     <input type="text" value={authData.fullName} onChange={e => setAuthData({...authData, fullName: e.target.value})} className="w-full p-3 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-xs md:text-lg focus:border-[#ffd700] outline-none" placeholder="Enter full name for validation" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><Hash size={12}/> {t.incidentNumber}</label>
                     <input type="text" value={authData.incidentNumber} onChange={e => setAuthData({...authData, incidentNumber: e.target.value})} className="w-full p-3 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-xs md:text-lg focus:border-[#ffd700] outline-none" placeholder="e.g. 12345/24" />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><ShieldCheck size={12}/> Username</label>
                     <input type="text" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="w-full p-3 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-xs md:text-lg focus:border-[#ffd700] outline-none" placeholder="Username" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><Lock size={12}/> Password</label>
                     <input type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full p-3 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-xs md:text-lg focus:border-[#ffd700] outline-none" placeholder="••••••••" />
                   </div>
                 </div>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2 text-[10px] md:text-sm font-black uppercase animate-shake">
                  <AlertCircle size={18}/> {authError}
                </div>
              )}
              
              <button onClick={handleFinalize} className="w-full bg-[#ffd700] text-[#0a1628] py-4 md:py-8 rounded-xl md:rounded-[32px] font-black uppercase text-xs md:text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                <Check size={24}/> {t.finalizeWithdrawal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;
