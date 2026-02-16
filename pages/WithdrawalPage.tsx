
import React, { useState, useRef, useEffect } from 'react';
import { Search, QrCode, Camera, Check, X, User as UserIcon, Package, Trash2, ShieldCheck, Lock, AlertCircle, ShoppingCart, Truck, Ambulance, Hash } from 'lucide-react';
import { Medicine, Withdrawal, User, AppSettings } from '../types';

interface WithdrawalPageProps {
  t: any;
  medicines: Medicine[];
  user: User;
  users: User[];
  onComplete: (withdrawals: Withdrawal[]) => void;
  prefilledMed?: Medicine | null;
  onPrefillHandled?: () => void;
  settings: AppSettings;
  cart: {medicine: Medicine, quantity: number}[];
  setCart: React.Dispatch<React.SetStateAction<{medicine: Medicine, quantity: number}[]>>;
}

const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ t, medicines, user, users, onComplete, prefilledMed, onPrefillHandled, settings, cart, setCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authData, setAuthData] = useState({ fullName: '', username: '', password: '', vehicle: '', incidentNumber: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (prefilledMed) {
      setSelectedMedicine(prefilledMed);
      setQuantity(1);
      if (onPrefillHandled) onPrefillHandled();
    }
  }, [prefilledMed]);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.barcode && m.barcode.includes(searchTerm)) ||
    (m.serialNumber && m.serialNumber.includes(searchTerm))
  );

  const addToCart = () => {
    if (!selectedMedicine) return;
    if (quantity <= 0 || quantity > selectedMedicine.currentStock) {
      alert("Invalid quantity: Cannot withdraw more than available stock.");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.medicine.id === selectedMedicine.id);
      if (existing) {
        const total = existing.quantity + quantity;
        if (total > selectedMedicine.currentStock) {
            alert(`Cannot add more. Total selection (${total}) exceeds current stock (${selectedMedicine.currentStock}).`);
            return prev;
        }
        return prev.map(i => i.medicine.id === selectedMedicine.id 
          ? { ...i, quantity: total } 
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
      setAuthError("Selection Required: Please select a vehicle");
      return;
    }
    if (!authData.fullName || authData.fullName.trim().toLowerCase() !== user.fullName?.trim().toLowerCase()) {
      setAuthError("Identity mismatch: Full Name must match your profile exactly.");
      return;
    }
    if (!authData.username || !authData.password) {
        setAuthError("Auth Required: Username and Access Key are mandatory.");
        return;
    }
    
    const verifiedUser = users.find(u => u.username === authData.username && u.password === authData.password);
    if (!verifiedUser || verifiedUser.id !== user.id) {
      setAuthError("Verification Failed: Invalid username or password");
      return;
    }

    const signature = "SIG_" + Math.random().toString(36).substr(2, 9);
    const results: Withdrawal[] = cart.map(item => ({
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

  return (
    <div className="space-y-3 md:space-y-8 animate-in fade-in duration-500 pb-12 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <h1 className="text-xl md:text-4xl font-black text-white tracking-tight uppercase">{t.withdrawal}</h1>
        {cart.length > 0 && (
          <button 
            onClick={() => { setAuthError(''); setShowConfirmModal(true); }}
            className="bg-[#ffd700] text-[#0a1628] px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm shadow-xl flex items-center gap-2 animate-bounce"
          >
            <Check size={18}/> {t.finalizeWithdrawal} ({cart.length})
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!selectedMedicine ? (
            <div className="space-y-3 md:space-y-6">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-40 py-6 bg-[#0d1b2e] border border-white/5 rounded-3xl text-xl text-white outline-none focus:border-[#ffd700]/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {filteredMedicines.map(med => (
                  <button
                    key={med.id}
                    onClick={() => { setSelectedMedicine(med); setQuantity(1); }}
                    className="bg-[#0d1b2e] p-6 rounded-[32px] border border-white/5 flex items-center space-x-5 hover:border-[#ffd700]/30 transition-all text-left shadow-lg group"
                  >
                    <div className="w-16 md:w-20 h-16 md:h-20 bg-[#0a1628] rounded-2xl overflow-hidden flex items-center justify-center text-[#ffd700] group-hover:scale-110 transition-transform">
                      {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" /> : <Package size={32} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-lg truncate uppercase">{med.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{med.location} • Stock: <span className="text-accent">{med.currentStock}</span></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1b2e] rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-white/5 animate-in slide-in-from-bottom-4 max-w-lg mx-auto">
              <div className="bg-[#ffd700] p-5 md:p-8 text-[#0a1628] flex justify-between items-center">
                <div className="min-w-0 pr-4">
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight truncate">{selectedMedicine.name}</h2>
                  <p className="text-[9px] md:text-sm font-black uppercase opacity-70">Available Stock: {selectedMedicine.currentStock}</p>
                </div>
                <button onClick={() => setSelectedMedicine(null)} className="p-2 md:p-3 hover:bg-black/5 rounded-full transition-transform active:scale-75 flex-shrink-0"><X size={24} /></button>
              </div>

              <div className="p-6 md:p-10 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <span className="text-sm md:text-xl font-black text-slate-400 uppercase tracking-widest">Select Quantity</span>
                  <div className="flex items-center space-x-6 md:space-x-8">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl font-black active:scale-90">-</button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={e => setQuantity(Math.min(selectedMedicine.currentStock, Math.max(1, parseInt(e.target.value)||1)))}
                      className="text-2xl md:text-4xl font-black text-[#ffd700] bg-transparent border-none w-16 md:w-20 text-center outline-none" 
                    />
                    <button onClick={() => setQuantity(Math.min(selectedMedicine.currentStock, quantity + 1))} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl font-black active:scale-90">+</button>
                  </div>
                </div>

                <button onClick={addToCart} className="w-full bg-[#ffd700] text-[#0a1628] py-5 md:py-8 rounded-2xl md:rounded-[32px] text-sm md:text-lg font-black uppercase shadow-xl flex items-center justify-center space-x-2 md:space-x-3 active:scale-95 transition-all">
                  <ShoppingCart size={20} />
                  <span>Add to Selection</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#0d1b2e] rounded-[32px] md:rounded-[40px] border border-white/5 p-6 md:p-8 space-y-6 md:space-y-8 h-fit lg:sticky lg:top-8 shadow-2xl">
           <h3 className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <ShoppingCart size={14} className="text-[#ffd700]"/> Selection Summary
           </h3>
           <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
             {cart.map(item => (
               <div key={item.medicine.id} className="flex items-center justify-between bg-[#0a1628] p-4 md:p-5 rounded-2xl border border-white/5 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0d1b2e] overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={item.medicine.imageUrl || `https://picsum.photos/seed/${item.medicine.id}/100/100`} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-black uppercase text-[10px] md:text-sm truncate">{item.medicine.name}</p>
                        <p className="text-slate-500 font-bold uppercase text-[8px] md:text-[10px]">Qty: <span className="text-accent">{item.quantity}</span></p>
                    </div>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.medicine.id !== item.medicine.id))} className="text-red-500/30 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition-all">
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
             {cart.length === 0 && (
               <div className="py-10 md:py-12 text-center">
                  <Package className="mx-auto text-slate-800 w-10 h-10 md:w-12 md:h-12 mb-2" />
                  <p className="text-slate-600 font-black uppercase text-[10px]">Queue is empty</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0d1b2e] w-full max-w-2xl rounded-[32px] md:rounded-[48px] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-6 md:p-8 bg-[#ffd700] text-[#0a1628] flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Mission Verification</h2>
              <button onClick={() => { setShowConfirmModal(false); setAuthError(''); }} className="p-1 hover:bg-black/5 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="p-8 md:p-12 space-y-10 md:space-y-12">
              <div className="space-y-6">
                 <div className="space-y-3">
                   <label className="text-[10px] md:text-sm font-black text-slate-500 uppercase ml-2 flex items-center gap-1">
                     <Truck size={12}/> Destination Operational Unit <span className="text-red-500">*</span>
                   </label>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                     {settings.vehicles.map(v => (
                       <button
                         key={v}
                         onClick={() => setAuthData({...authData, vehicle: v})}
                         className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-left ${
                           authData.vehicle === v 
                           ? 'bg-[#ffd700] border-[#ffd700] text-[#0a1628] shadow-accent/20 shadow-lg' 
                           : 'bg-[#0a1628] border-white/5 text-slate-400 hover:border-white/20'
                         }`}
                       >
                         <Ambulance size={16} />
                         <span className="text-[9px] md:text-xs font-black uppercase">{v}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><UserIcon size={12}/> Authorized Full Name <span className="text-red-500">*</span></label>
                     <input type="text" value={authData.fullName} onChange={e => setAuthData({...authData, fullName: e.target.value})} className="w-full p-4 md:p-5 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-sm md:text-lg focus:border-[#ffd700] outline-none transition-all" placeholder="Legal full name" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 flex items-center gap-1"><Hash size={12}/> Incident Number (Ref)</label>
                     <input type="text" value={authData.incidentNumber} onChange={e => setAuthData({...authData, incidentNumber: e.target.value})} className="w-full p-4 md:p-5 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-sm md:text-lg focus:border-[#ffd700] outline-none" placeholder="e.g. 24/8812" />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div className="space-y-1.5">
                     <label className="text-[9px] md:text-[10px] font-black text-accent uppercase ml-2 flex items-center gap-1"><ShieldCheck size={12}/> Username <span className="text-red-500">*</span></label>
                     <input type="text" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="w-full p-4 md:p-5 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-sm md:text-lg focus:border-[#ffd700] outline-none" placeholder="ID" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] md:text-[10px] font-black text-accent uppercase ml-2 flex items-center gap-1"><Lock size={12}/> Access Key <span className="text-red-500">*</span></label>
                     <input type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full p-4 md:p-5 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-sm md:text-lg focus:border-red-600 outline-none" placeholder="••••" />
                   </div>
                 </div>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase animate-shake">
                  <AlertCircle size={18}/> {authError}
                </div>
              )}
              
              <button onClick={handleFinalize} className="w-full bg-[#ffd700] text-[#0a1628] py-6 md:py-8 rounded-2xl md:rounded-[32px] font-black uppercase text-base md:text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4 hover:brightness-110">
                <Check size={24}/> Finalize Mission Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;
