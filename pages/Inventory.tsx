
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Package, Calendar, QrCode, X, Camera, Sun, Info, Image as ImageIcon, Box, Lock, ShieldCheck, Check, AlertTriangle, Upload, ArrowLeftRight, FileText } from 'lucide-react';
import { Medicine, Role, User, AppSettings, DeletionLog } from '../types';

interface InventoryProps {
  t: any;
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  role: Role;
  onUpdateCartQty: (med: Medicine, delta: number) => void;
  cart: {medicine: Medicine, quantity: number}[];
  onNavigateToWithdrawal: () => void;
  currentUser: User;
  settings: AppSettings;
  onLoggedDeletion: (log: DeletionLog) => void;
  prefilledData: Medicine | null;
  onPrefillHandled: () => void;
  onSaveSuccess: (med: Medicine) => void;
}

const Inventory: React.FC<InventoryProps> = ({ t, medicines, setMedicines, role, onUpdateCartQty, currentUser, settings, onLoggedDeletion, prefilledData, onPrefillHandled, onSaveSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  
  const [scanningTarget, setScanningTarget] = useState<'serial' | 'search' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '', location: '', serialNumber: '', minStock: 5, currentStock: 0, piecesPerBox: 1, expiryDate: '', imageUrl: '', notes: ''
  });
  const [qtyMode, setQtyMode] = useState<'boxes' | 'units'>('units');
  const [boxCount, setBoxCount] = useState(0);
  const [piecesPerBox, setPiecesPerBox] = useState(1);
  const [singleUnits, setSingleUnits] = useState(0);

  // Deletion Security
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<Medicine | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (prefilledData) {
      setEditingMed(prefilledData);
      setFormData(prefilledData);
      setQtyMode('units');
      setSingleUnits(prefilledData.currentStock);
      setPiecesPerBox(prefilledData.piecesPerBox || 1);
      setIsModalOpen(true);
      onPrefillHandled();
    }
  }, [prefilledData, onPrefillHandled]);

  const canEdit = currentUser.permissions?.addMedicine || role === 'admin';
  const canDelete = currentUser.permissions?.deleteMedicine || role === 'admin';

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: any = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        const track = stream.getVideoTracks()[0];
        if (track && (track.getCapabilities() as any).torch) (track as any).applyConstraints({ advanced: [{ torch: flashOn }] });

        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'code_128', 'code_39', 'code_93', 'data_matrix', 'upc_a']
          });
          interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) { handleScanSuccess(barcodes[0].rawValue); stopScanner(); }
              } catch (e) { }
            }
          }, 150); 
        }
      } catch (err) { }
    };
    if (scanningTarget) startScanner();
    else stopScanner();
    return () => stopScanner();
    function stopScanner() { if (interval) clearInterval(interval); if (stream) stream.getTracks().forEach(track => track.stop()); }
  }, [scanningTarget, flashOn]);

  const handleScanSuccess = (code: string) => {
      setScanSuccess(true);
      if (window.navigator.vibrate) window.navigator.vibrate(100);
      setTimeout(() => {
          setScanSuccess(false);
          if (scanningTarget === 'search') setBarcodeSearch(code);
          else if (scanningTarget === 'serial') setFormData(prev => ({ ...prev, serialNumber: code }));
          setScanningTarget(null);
      }, 500);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return;
    if (deletePassword !== currentUser.password) {
      setDeleteError(t.authFailed || "Authentication Failed");
      return;
    }
    const log: DeletionLog = { 
        id: Math.random().toString(36).substr(2, 9), 
        medicineName: deleteConfirmModal.name, 
        quantity: deleteConfirmModal.currentStock, 
        deletedBy: currentUser.fullName || currentUser.username, 
        timestamp: new Date().toISOString() 
    };
    onLoggedDeletion(log);
    setMedicines(prev => prev.filter(m => m.id !== deleteConfirmModal.id));
    setDeleteConfirmModal(null);
    setDeletePassword('');
    setDeleteError('');
    alert("Asset successfully removed from inventory");
  };

  const handleSave = () => {
    if (!formData.name || !formData.expiryDate) return alert("Required fields missing!");
    const totalCurrentStock = qtyMode === 'boxes' ? (boxCount * piecesPerBox) : singleUnits;

    const finalData: Medicine = {
      ...formData as Medicine,
      currentStock: totalCurrentStock,
      piecesPerBox: piecesPerBox,
      barcode: formData.barcode || 'N/A',
      id: editingMed ? editingMed.id : Math.random().toString(36).substr(2, 9),
    };

    onSaveSuccess(finalData); 
    setIsModalOpen(false);
    setEditingMed(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const filteredMedicines = medicines.filter(m => 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (m.serialNumber && m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))) && 
    (m.barcode.includes(barcodeSearch) || (m.serialNumber && m.serialNumber.includes(barcodeSearch)))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-1 md:px-0">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{t.inventory}</h1></div>
        {canEdit && (
          <button onClick={() => { setEditingMed(null); setFormData({ name: '', serialNumber: '', location: '', minStock: 5, currentStock: 0, piecesPerBox: 1, expiryDate: '', imageUrl: '', notes: '' }); setBoxCount(0); setPiecesPerBox(1); setSingleUnits(0); setQtyMode('units'); setIsModalOpen(true); }} className="bg-accent text-[#0a1628] p-3.5 md:p-4 rounded-2xl shadow-lg active:scale-95 transition-all">
            <Plus size={24} strokeWidth={4} />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-6 py-3.5 bg-[#0d1b2e] border border-white/10 rounded-2xl text-white outline-none focus:border-accent text-sm" /></div>
        <div className="relative group"><QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} /><input type="text" placeholder={t.searchBarcode} value={barcodeSearch} onChange={(e) => setBarcodeSearch(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-[#0d1b2e] border border-white/10 rounded-2xl text-white outline-none focus:border-accent text-sm" /><button onClick={() => setScanningTarget('search')} className="absolute right-4 top-1/2 -translate-y-1/2 text-accent p-1"><Camera size={18} /></button></div>
      </div>

      <div className="space-y-2.5">
        {filteredMedicines.map(med => (
          <div key={med.id} className="bg-[#0d1b2e] p-3 md:p-4 rounded-[28px] border border-white/5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0a1628] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 flex-shrink-0">
                 <img src={med.imageUrl || `https://picsum.photos/seed/${med.id}/200/200`} className="w-full h-full object-cover" alt={med.name} />
              </div>
              <div className="flex-1 min-w-0">
                 <h3 className="text-white font-black uppercase text-xs md:text-lg truncate">{med.name}</h3>
                 <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1">
                    <span className={`text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full ${med.currentStock <= med.minStock ? 'bg-orange-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-500'}`}>{med.currentStock} Units</span>
                    <span className="text-slate-500 font-bold text-[8px] md:text-[10px] uppercase">{med.expiryDate}</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-1 px-1">
               {med.notes && (
                 <div className="group relative">
                   <FileText size={16} className="text-slate-600 hover:text-accent cursor-help mx-2" />
                   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-navy-800 border border-white/10 rounded-xl text-[9px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                     <p className="uppercase text-accent mb-1 border-b border-white/5 pb-1">{t.notes}</p>
                     {med.notes}
                   </div>
                 </div>
               )}
               <div className="flex items-center gap-1">
                  <button onClick={() => onUpdateCartQty(med, 1)} className="p-2.5 md:p-3 bg-accent/10 text-accent hover:bg-accent hover:text-[#0a1628] rounded-xl transition-all" title="Withdraw Item"><Plus size={16} strokeWidth={4}/></button>
                  {canEdit && <button onClick={() => { setEditingMed(med); setFormData(med); setPiecesPerBox(med.piecesPerBox); setSingleUnits(med.currentStock); setIsModalOpen(true); }} className="p-2.5 md:p-3 text-slate-500 hover:text-white"><Edit2 size={16}/></button>}
                  {canDelete && <button onClick={() => setDeleteConfirmModal(med)} className="p-2.5 md:p-3 text-red-500/30 hover:text-red-500"><Trash2 size={16}/></button>}
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
           <div className="bg-[#0d1b2e] w-full max-w-xl my-auto rounded-[32px] md:rounded-[40px] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in">
              <div className="p-5 md:p-6 bg-accent text-[#0a1628] flex justify-between items-center font-black uppercase relative">
                 <h2 className="text-sm md:text-base">{editingMed ? t.edit : t.addMedicine}</h2>
                 <button onClick={() => { setIsModalOpen(false); setEditingMed(null); }} className="hover:scale-110 transition-transform p-1 bg-black/10 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-5 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t.photo}</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0a1628] rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                            {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-slate-800" />}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] border border-white/5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/5"><Camera size={14} className="text-accent" /> {t.photo}</button>
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] border border-white/5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/5"><Upload size={14} className="text-blue-500" /> {t.chooseFile}</button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <InputGroup label={`${t.itemName} *`} value={formData.name || ''} onChange={v => setFormData({...formData, name: v})} />
                    
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.serialNumber}</label>
                       <div className="relative">
                         <input value={formData.serialNumber || ''} onChange={e=>setFormData({...formData, serialNumber: e.target.value})} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/10 text-white font-black outline-none focus:border-accent text-sm" />
                         <button onClick={()=>setScanningTarget('serial')} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent p-2"><Camera size={18}/></button>
                       </div>
                    </div>

                    <InputGroup label={t.location} value={formData.location || ''} onChange={v => setFormData({...formData, location: v})} />

                    <div className="bg-[#0a1628] p-5 md:p-6 rounded-[32px] border border-white/5 space-y-4 shadow-inner">
                        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-3 gap-3">
                           <h3 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Box size={14}/> {t.quantity}</h3>
                           <div className="flex bg-[#0d1b2e] p-1 rounded-xl border border-white/5">
                              <button onClick={() => setQtyMode('boxes')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${qtyMode === 'boxes' ? 'bg-accent text-[#0a1628]' : 'text-slate-500'}`}>{t.unitBox}</button>
                              <button onClick={() => setQtyMode('units')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${qtyMode === 'units' ? 'bg-accent text-[#0a1628]' : 'text-slate-500'}`}>Units</button>
                           </div>
                        </div>

                        {qtyMode === 'boxes' ? (
                          <div className="grid grid-cols-2 gap-4">
                             <InputGroup label="Box Count" type="number" value={boxCount} onChange={v => setBoxCount(parseInt(v)||0)} />
                             <InputGroup label="Units/Box" type="number" value={piecesPerBox} onChange={v => setPiecesPerBox(parseInt(v)||1)} />
                          </div>
                        ) : (
                          <InputGroup label={t.totalUnits} type="number" value={singleUnits} onChange={v => setSingleUnits(parseInt(v)||0)} />
                        )}
                        <p className="text-center text-[10px] font-black text-slate-500 uppercase">{t.totalUnits}: <span className="text-accent">{qtyMode === 'boxes' ? boxCount * piecesPerBox : singleUnits} Units</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <InputGroup label={t.minStock} type="number" value={formData.minStock} onChange={v => setFormData({...formData, minStock: parseInt(v)||5})} />
                       <InputGroup label={t.expiryDate} type="date" value={formData.expiryDate || ''} onChange={v => setFormData({...formData, expiryDate: v})} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.notes}</label>
                      <textarea 
                        value={formData.notes || ''} 
                        onChange={e => setFormData({...formData, notes: e.target.value})} 
                        className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/10 text-white font-medium outline-none focus:border-accent text-sm min-h-[100px]"
                        placeholder="Add special instructions or dosage notes..."
                      />
                    </div>
                 </div>
                 <button onClick={handleSave} className="w-full bg-accent text-[#0a1628] py-5 rounded-[24px] font-black uppercase shadow-xl active:scale-95 transition-all">{t.saveChanges}</button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
           <div className="bg-[#0d1b2e] w-full max-w-md rounded-[32px] border border-red-500/20 shadow-3xl overflow-hidden">
              <div className="p-6 bg-red-600 text-white flex justify-between items-center">
                 <h2 className="text-lg font-black uppercase tracking-tight">Security Verification</h2>
                 <button onClick={() => { setDeleteConfirmModal(null); setDeletePassword(''); setDeleteError(''); }}><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="text-center space-y-2">
                    <p className="text-white font-black uppercase text-sm">Delete {deleteConfirmModal.name}?</p>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">This action will be logged in the permanent audit trail.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t.password}</label>
                    <input 
                        type="password"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                        className="w-full p-4 bg-[#0a1628] border border-white/10 rounded-xl text-white font-black outline-none focus:border-red-600 text-center"
                        placeholder="••••••••"
                    />
                 </div>
                 {deleteError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{deleteError}</p>}
                 <button 
                    onClick={handleConfirmDelete}
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-600/10 active:scale-95 transition-all"
                 >
                    Confirm Permanent Removal
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/10 text-white font-black outline-none focus:border-accent text-sm" />
  </div>
);

export default Inventory;
