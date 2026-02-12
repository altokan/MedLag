
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Package, Calendar, QrCode, X, MapPin, Box, Camera, Upload, CheckCircle2, AlertCircle, PlusCircle, Check, Minus, AlertTriangle, Zap, History, Sun, Info, Hash } from 'lucide-react';
import { Medicine, Role, User } from '../types';

interface InventoryProps {
  t: any;
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  role: Role;
  onUpdateCartQty: (med: Medicine, delta: number) => void;
  cart: {medicine: Medicine, quantity: number}[];
  onNavigateToWithdrawal: () => void;
  currentUser: User;
  onDispose?: (med: Medicine, auditorName: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ t, medicines, setMedicines, role, onUpdateCartQty, cart, onNavigateToWithdrawal, currentUser, onDispose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [entryMode, setEntryMode] = useState<'single' | 'box'>('box');
  const [numBoxes, setNumBoxes] = useState<number>(0);
  const [pcsPerBox, setPcsPerBox] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scanningTarget, setScanningTarget] = useState<'barcode' | 'serial' | 'search' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    location: '',
    barcode: '',
    serialNumber: '',
    minStock: 10,
    currentStock: 0,
    piecesPerBox: 1,
    expiryDate: '',
    imageUrl: ''
  });

  const canAdd = currentUser.permissions?.addMedicine || role === 'admin';
  const getCartQty = (medId: string) => cart.find(i => i.medicine.id === medId)?.quantity || 0;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: any = null;

    const startScanner = async () => {
      try {
        setScannerError(null);
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        const track = stream.getVideoTracks()[0];
        if (track && (track.getCapabilities() as any).torch) {
          (track as any).applyConstraints({ advanced: [{ torch: flashOn }] });
        }

        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'code_128', 'code_39', 'data_matrix']
          });

          interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                handleScanSuccess(barcodes[0].rawValue);
                stopScanner();
              }
            }
          }, 400);
        }
      } catch (err) {
        setScannerError("Camera access denied");
      }
    };

    if (scanningTarget) startScanner();
    else stopScanner();

    return () => stopScanner();

    function stopScanner() {
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  }, [scanningTarget, flashOn]);

  const handleScanSuccess = (code: string) => {
      setScanSuccess(true);
      if (window.navigator.vibrate) window.navigator.vibrate(150);
      
      setTimeout(() => {
          setScanSuccess(false);
          if (scanningTarget === 'barcode') {
              handleAutoFill(code);
          } else if (scanningTarget === 'serial') {
              setFormData(prev => ({ ...prev, serialNumber: code }));
          } else if (scanningTarget === 'search') {
              setBarcodeSearch(code);
          }
          setScanningTarget(null);
      }, 600);
  };

  const handleAutoFill = (barcode: string) => {
    const historicalMed = medicines.find(m => m.barcode === barcode);
    if (historicalMed) {
      setFormData({
        ...formData,
        name: historicalMed.name,
        location: historicalMed.location,
        barcode: barcode,
        serialNumber: historicalMed.serialNumber || '',
        minStock: historicalMed.minStock,
        imageUrl: historicalMed.imageUrl,
        piecesPerBox: historicalMed.piecesPerBox,
        currentStock: 0
      });
      setPcsPerBox(historicalMed.piecesPerBox);
    } else {
      setFormData(prev => ({ ...prev, barcode }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.barcode || !formData.expiryDate || !formData.minStock) {
      alert("Please fill all mandatory fields");
      return;
    }
    
    if(!confirm(t.confirmSave)) return;

    const calculatedStock = entryMode === 'box' ? numBoxes * pcsPerBox : formData.currentStock || 0;
    const existingMed = medicines.find(m => m.barcode === formData.barcode);
    
    const finalData: Medicine = {
      ...(formData as Medicine),
      id: existingMed ? existingMed.id : (editingMed ? editingMed.id : Math.random().toString(36).substr(2, 9)),
      currentStock: existingMed ? (existingMed.currentStock + calculatedStock) : (editingMed ? formData.currentStock! : calculatedStock),
      piecesPerBox: pcsPerBox,
    };

    if (existingMed || editingMed) {
       setMedicines(prev => prev.map(m => m.id === (existingMed?.id || editingMed?.id) ? finalData : m));
    } else {
       setMedicines(prev => [...prev, finalData]);
    }
    setIsModalOpen(false);
    resetForm();
    alert("Asset Record Saved Successfully");
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', barcode: '', serialNumber: '', minStock: 10, currentStock: 0, piecesPerBox: 1, expiryDate: '', imageUrl: '' });
    setNumBoxes(0); setPcsPerBox(1); setEntryMode('box');
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between px-1 md:px-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">{t.inventory}</h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Digital Stock Vault</p>
        </div>
        {canAdd && (
          <button onClick={() => { resetForm(); setEditingMed(null); setIsModalOpen(true); }} className="bg-accent text-[#0a1628] p-3 md:p-5 rounded-xl md:rounded-3xl shadow-lg active:scale-90 transition-all">
            <Plus className="w-5 h-5 md:w-8 md:h-8" strokeWidth={3} />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div className="relative group">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-accent transition-colors" />
          <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 md:pl-14 pr-6 py-3 md:py-5 bg-[#0d1b2e] border border-white/5 rounded-xl md:rounded-2xl text-xs md:text-base text-white focus:border-accent outline-none shadow-inner transition-all" />
        </div>
        <div className="relative group">
          <QrCode className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-accent w-4 h-4 md:w-5 md:h-5 group-focus-within:scale-110 transition-transform" />
          <input type="text" placeholder={t.searchBarcode} value={barcodeSearch} onChange={(e) => setBarcodeSearch(e.target.value)} className="w-full pl-10 md:pl-14 pr-12 md:pr-16 py-3 md:py-5 bg-[#0d1b2e] border border-white/5 rounded-xl md:rounded-2xl text-xs md:text-base text-white focus:border-accent outline-none shadow-inner transition-all" />
          <button onClick={() => setScanningTarget('search')} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-accent hover:scale-110 active:scale-75 transition-all"><Camera size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:gap-4">
        {medicines.filter(m => (m.name.toLowerCase().includes(searchTerm.toLowerCase())) && (m.barcode.includes(barcodeSearch) || (m.serialNumber && m.serialNumber.includes(barcodeSearch)))).map(med => {
          const cartQty = getCartQty(med.id);
          const expired = new Date(med.expiryDate) < new Date();
          return (
            <div key={med.id} className={`bg-[#0d1b2e] rounded-xl md:rounded-[32px] border flex items-center p-2.5 md:p-6 space-x-3 md:space-x-6 shadow-md hover:bg-white/5 transition-colors active:scale-[0.99] ${expired ? 'border-red-500/30' : 'border-white/5'}`}>
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg md:rounded-2xl bg-[#0a1628] overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                <img src={med.imageUrl || `https://picsum.photos/seed/${med.id}/200/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs md:text-xl font-black text-white truncate uppercase tracking-tight">{med.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[9px] md:text-xs font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full ${med.currentStock <= med.minStock ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600/20 text-emerald-500'}`}>
                    {med.currentStock} Units
                  </span>
                  <span className={`text-[8px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                    <Calendar size={12}/> {med.expiryDate}
                  </span>
                  {med.serialNumber && (
                    <span className="text-[8px] md:text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Hash size={10}/> {med.serialNumber}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-3">
                {cartQty > 0 ? (
                  <div className="flex items-center bg-[#0a1628] rounded-xl border border-accent/20 overflow-hidden shadow-lg animate-in zoom-in-95">
                    <button onClick={() => onUpdateCartQty(med, -1)} className="p-2 md:p-4 text-white hover:bg-white/5 transition-colors active:scale-75"><Minus size={16}/></button>
                    <span className="px-3 md:px-6 font-black text-accent">{cartQty}</span>
                    <button onClick={() => onUpdateCartQty(med, 1)} className="p-2 md:p-4 text-white hover:bg-white/5 transition-colors active:scale-75"><Plus size={16}/></button>
                  </div>
                ) : (
                  !expired && med.currentStock > 0 && (
                    <button onClick={() => onUpdateCartQty(med, 1)} className="p-2 md:p-4 bg-emerald-600 text-white rounded-lg md:rounded-2xl active:scale-90 hover:brightness-110 shadow-lg flex items-center gap-2 transition-all">
                       <PlusCircle size={20}/>
                       <span className="hidden md:inline font-black text-[10px] uppercase">{t.withdrawal}</span>
                    </button>
                  )
                )}
                <button onClick={() => { setEditingMed(med); setFormData(med); setIsModalOpen(true); }} className="p-2 md:p-4 text-slate-500 hover:text-white transition-all"><Edit2 size={16}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {scanningTarget && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
           <div className={`w-full max-w-xl aspect-video md:aspect-[16/10] bg-black rounded-[40px] overflow-hidden relative border-4 transition-all duration-300 shadow-[0_0_60px_rgba(255,215,0,0.25)] ${scanSuccess ? 'border-emerald-500 scale-105 shadow-emerald-500/20' : 'border-accent/40'}`}>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-10 left-10 w-14 h-14 border-l-4 border-t-4 border-accent rounded-tl-2xl"></div>
                 <div className="absolute top-10 right-10 w-14 h-14 border-r-4 border-t-4 border-accent rounded-tr-2xl"></div>
                 <div className="absolute bottom-10 left-10 w-14 h-14 border-l-4 border-b-4 border-accent rounded-bl-2xl"></div>
                 <div className="absolute bottom-10 right-10 w-14 h-14 border-r-4 border-b-4 border-accent rounded-br-2xl"></div>
                 <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_20px_rgba(255,215,0,1)] animate-scanner-line ${scanSuccess ? 'via-emerald-500 shadow-emerald-500' : ''}`}></div>
                 <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 bg-accent text-[#0a1628] px-6 py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl animate-pulse">
                       <Zap size={14} className="fill-current"/> {t.scanning}: {scanningTarget.toUpperCase()}
                    </div>
                 </div>
                 {scanSuccess && (
                     <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-200">
                        <div className="bg-emerald-500 p-6 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                           <Check size={80} className="text-white" strokeWidth={4} />
                        </div>
                     </div>
                 )}
              </div>
              <div className="absolute bottom-6 right-6 flex flex-col gap-4 pointer-events-auto">
                 <button 
                   onClick={() => setFlashOn(!flashOn)} 
                   className={`p-5 rounded-full transition-all border-2 shadow-2xl active:scale-90 ${flashOn ? 'bg-accent text-[#0a1628] border-accent scale-110' : 'bg-black/60 text-white border-white/20'}`}
                 >
                    <Sun size={24} />
                 </button>
              </div>
           </div>
           <button onClick={() => setScanningTarget(null)} className="mt-12 bg-red-600/10 text-red-500 border-2 border-red-500/30 px-12 py-5 rounded-[24px] font-black uppercase text-xs md:text-sm flex items-center gap-4 active:scale-95 transition-all">
             <X size={20}/> {t.abortScan}
           </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#0d1b2e] w-full max-w-lg rounded-[40px] shadow-2xl border border-white/10 overflow-hidden my-auto relative animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-10 bg-accent text-[#0a1628] flex justify-between items-center"><h2 className="font-black uppercase text-sm md:text-2xl tracking-tight">{editingMed ? t.edit : t.addMedicine}</h2><button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={28} /></button></div>
            <div className="p-8 md:p-14 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2">Asset Visualization</label><div className="flex items-center gap-6"><div className="w-24 h-24 md:w-40 md:h-40 bg-[#0a1628] rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">{formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Package className="text-slate-800 w-10 h-10" />}<button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Camera size={32} /></button></div><div className="flex-1 space-y-3"><button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-black uppercase text-[10px] md:text-xs flex items-center justify-center gap-2"><Upload size={16} /> Asset Photo</button></div><input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" /></div></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2"><label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">{t.fullName} *</label><input type="text" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-4 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" /></div>
                <div className="col-span-1">
                  <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2"><QrCode size={12}/> {t.gtinBarcode} *</label>
                  <div className="relative group">
                    <input type="text" value={formData.barcode || ''} onChange={e=>setFormData({...formData, barcode: e.target.value})} className="w-full p-4 md:p-6 pr-14 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" />
                    <button onClick={() => setScanningTarget('barcode')} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent p-2 bg-white/5 rounded-xl hover:bg-white/10 active:scale-75 transition-all"><Camera size={22} /></button>
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2"><Hash size={12}/> {t.serialNumber}</label>
                  <div className="relative group">
                    <input type="text" value={formData.serialNumber || ''} onChange={e=>setFormData({...formData, serialNumber: e.target.value})} className="w-full p-4 md:p-6 pr-14 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" placeholder={t.optional} />
                    <button onClick={() => setScanningTarget('serial')} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent p-2 bg-white/5 rounded-xl hover:bg-white/10 active:scale-75 transition-all"><Camera size={22} /></button>
                  </div>
                </div>
                <div className="col-span-2"><label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">{t.location}</label><input type="text" value={formData.location || ''} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-4 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" /></div>
                <div className="col-span-2"><label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">{t.expiryDate} *</label><input type="date" value={formData.expiryDate || ''} onChange={e=>setFormData({...formData, expiryDate: e.target.value})} className="w-full p-4 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" /></div>
                <div className="col-span-2"><label className="text-[10px] md:text-xs font-black text-slate-500 uppercase ml-2 tracking-widest">{t.minStockAlert} *</label><input type="number" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: parseInt(e.target.value)||10})} className="w-full p-4 md:p-6 bg-[#0a1628] rounded-2xl border border-white/5 text-white text-sm md:text-xl outline-none focus:border-accent transition-all" /></div>
              </div>
              <button onClick={handleSave} className="w-full bg-accent text-[#0a1628] py-5 md:py-10 rounded-3xl md:rounded-[48px] font-black uppercase text-sm md:text-2xl shadow-xl mt-6 active:scale-95 transition-all flex items-center justify-center gap-4"><CheckCircle2 size={24} />{editingMed ? t.save : t.addMedicine}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
