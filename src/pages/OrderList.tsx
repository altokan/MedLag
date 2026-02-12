
import React, { useState, useMemo } from 'react';
import { ShoppingCart, CheckCircle, X, Trash2, AlertTriangle, Package, Calendar, Printer, Table, Mail, Download, Clock, Info, Check } from 'lucide-react';
import { OrderItem, OrderStatus, Medicine, Role, AppSettings, User } from '../types';

interface OrderListProps {
  t: any;
  orders: OrderItem[];
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  role: Role;
  onDeliveryComplete: (order: OrderItem, qty: number, expiry: string, minStock: number) => void;
  currentUser: User;
  settings: AppSettings;
}

const OrderList: React.FC<OrderListProps> = ({ t, orders, setOrders, medicines, setMedicines, role, onDeliveryComplete, currentUser, settings }) => {
  const [deliveryModal, setDeliveryModal] = useState<OrderItem | null>(null);
  const [orderQtyModal, setOrderQtyModal] = useState<OrderItem | null>(null);
  const [deliveryData, setDeliveryData] = useState({ quantity: 0, expiryDate: '', minStock: 10 });
  const [requestedQty, setRequestedQty] = useState<number>(0);

  const lowStockMedicines = useMemo(() => medicines.filter(m => m.currentStock <= m.minStock), [medicines]);

  const updateStatus = (id: string, status: OrderStatus, qty?: number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, quantity: qty ?? o.quantity } : o));
  };

  const handleOpenDelivery = (order: OrderItem) => {
    const med = medicines.find(m => m.id === order.medicineId);
    if (med) {
      setDeliveryData({
        quantity: order.quantity || med.piecesPerBox * 2,
        expiryDate: med.expiryDate,
        minStock: med.minStock
      });
    }
    setDeliveryModal(order);
  };

  const handleDelivery = () => {
    if (!deliveryModal || !deliveryData.expiryDate || deliveryData.quantity <= 0) return;
    onDeliveryComplete(deliveryModal, deliveryData.quantity, deliveryData.expiryDate, deliveryData.minStock);
    setDeliveryModal(null);
  };

  const handleConfirmOrderQty = () => {
    if (orderQtyModal) {
      updateStatus(orderQtyModal.id, OrderStatus.ORDERED, requestedQty);
      setOrderQtyModal(null);
    }
  };

  // Export Functions
  const exportOrders = (format: 'pdf' | 'excel' | 'email') => {
    const data = orders.filter(o => o.status !== OrderStatus.DELIVERED);
    if (data.length === 0) return alert("No active orders to export.");

    if (format === 'excel') {
      let csv = "Item,Status,Requested At,Suggested Qty\n";
      data.forEach(o => { csv += `${o.medicineName},${o.status},${new Date(o.requestedAt).toLocaleDateString()},${o.quantity || 'N/A'}\n`; });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'pdf') {
       const printWindow = window.open('', '_blank');
       if (!printWindow) return;
       const content = data.map(o => `<tr><td>${o.medicineName}</td><td>${o.status}</td><td>${o.quantity || '---'}</td><td>${new Date(o.requestedAt).toLocaleDateString()}</td></tr>`).join('');
       printWindow.document.write(`
         <html>
           <head><title>Procurement List</title><style>body{font-family:sans-serif;padding:30px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}</style></head>
           <body><h1>Order List - ${settings.appName}</h1><p>Date: ${new Date().toLocaleString()}</p><table><thead><tr><th>Item</th><th>Status</th><th>Qty</th><th>Date</th></tr></thead><tbody>${content}</tbody></table></body>
         </html>
       `);
       printWindow.document.close();
       printWindow.print();
    } else if (format === 'email') {
       const body = data.map(o => `- ${o.medicineName} (${o.status}) Qty: ${o.quantity || 'N/A'}`).join('\n');
       window.location.href = `mailto:${settings.supervisorEmail}?subject=Order Request - ${settings.appName}&body=${encodeURIComponent("Please order the following items:\n\n" + body)}`;
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ORDERED: return 'bg-blue-600/10 text-blue-400 border-blue-500/20';
      case OrderStatus.IN_PROGRESS: return 'bg-amber-600/10 text-amber-400 border-amber-500/20';
      default: return 'bg-red-600/10 text-red-500 border-red-500/20';
    }
  };

  return (
    <div className="space-y-3 md:space-y-8 animate-in fade-in duration-500 pb-12 px-1 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">{t.orders}</h1>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Procurement & Stock Replenishment</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => exportOrders('pdf')} className="p-2 md:px-4 md:py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all"><Printer size={18}/></button>
            <button onClick={() => exportOrders('excel')} className="p-2 md:px-4 md:py-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"><Table size={18}/></button>
            <button onClick={() => exportOrders('email')} className="p-2 md:px-4 md:py-3 bg-accent text-[#0a1628] rounded-xl shadow-lg active:scale-90 transition-all"><Mail size={18}/></button>
        </div>
      </header>

      <div className="space-y-2 md:space-y-4">
        {orders.length > 0 ? orders.map(order => (
          <div key={order.id} className="bg-[#0d1b2e] p-2.5 md:p-8 rounded-xl md:rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center space-x-2 md:space-x-6">
              <div className={`p-1.5 md:p-4 rounded-lg md:rounded-2xl ${getStatusStyle(order.status)} border group-hover:scale-110 transition-transform`}>
                <ShoppingCart size={14} className="md:w-8 md:h-8" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[10px] md:text-xl font-black text-white truncate uppercase">{order.medicineName}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] md:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${getStatusStyle(order.status)}`}>{order.status}</span>
                  <span className="text-[8px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date(order.requestedAt).toLocaleDateString()}</span>
                  {order.quantity && <span className="bg-[#ffd700]/10 text-[#ffd700] text-[8px] md:text-xs px-2 py-0.5 rounded-full font-black">Target: {order.quantity}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 md:gap-3">
              <button 
                onClick={() => { setRequestedQty(order.quantity || 0); setOrderQtyModal(order); }}
                className={`px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-2xl text-[8px] md:text-xs font-black uppercase transition-all shadow-md ${order.status === OrderStatus.ORDERED ? 'bg-blue-600 text-white' : 'bg-[#0a1628] text-slate-500'}`}
              >
                Ordered
              </button>
              <button 
                onClick={() => updateStatus(order.id, OrderStatus.IN_PROGRESS)}
                className={`px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-2xl text-[8px] md:text-xs font-black uppercase transition-all shadow-md ${order.status === OrderStatus.IN_PROGRESS ? 'bg-amber-600 text-white' : 'bg-[#0a1628] text-slate-500'}`}
              >
                Processing
              </button>
              <button onClick={() => handleOpenDelivery(order)} className="px-3 md:px-8 py-1.5 md:py-3 rounded-lg md:rounded-2xl text-[8px] md:text-sm font-black uppercase bg-[#ffd700] text-[#0a1628] shadow-lg active:scale-95 transition-all">
                Delivered
              </button>
              {role === 'admin' && <button onClick={() => setOrders(prev => prev.filter(o => o.id !== order.id))} className="p-1.5 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={12} className="md:w-6 md:h-6" /></button>}
            </div>
          </div>
        )) : (
          <div className="bg-[#0d1b2e] p-10 md:p-24 rounded-2xl md:rounded-[64px] border border-dashed border-white/5 text-center space-y-2">
            <div className="w-10 h-10 md:w-24 md:h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={20} className="md:w-12 md:h-12" /></div>
            <p className="text-slate-600 font-black uppercase text-[8px] md:text-sm">Supply chain is stable</p>
          </div>
        )}
      </div>

      {/* Order Qty Modal (تم الطلب) */}
      {orderQtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="bg-[#0d1b2e] w-full max-w-sm rounded-[32px] border border-white/10 shadow-3xl p-6 md:p-10 space-y-6">
              <h2 className="text-white font-black uppercase tracking-tight text-lg">Mark as Ordered</h2>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Quantity Ordered</label>
                 <input type="number" value={requestedQty} onChange={e=>setRequestedQty(parseInt(e.target.value)||0)} className="w-full bg-[#0a1628] border border-white/10 p-4 rounded-xl text-white font-black outline-none focus:border-accent" />
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setOrderQtyModal(null)} className="flex-1 py-3 bg-white/5 text-slate-500 rounded-xl font-black uppercase text-[10px]">Cancel</button>
                 <button onClick={handleConfirmOrderQty} className="flex-1 py-3 bg-accent text-[#0a1628] rounded-xl font-black uppercase text-[10px] shadow-lg">Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* Delivery Modal (تم التوصيل) */}
      {deliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1b2e] w-full max-w-lg rounded-xl md:rounded-[48px] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in">
            <div className="p-4 md:p-10 bg-[#ffd700] flex justify-between items-center text-[#0a1628]">
              <div className="flex items-center gap-3">
                 <Package size={24}/>
                 <h2 className="text-sm md:text-2xl font-black uppercase tracking-tight">Stock Delivery</h2>
              </div>
              <button onClick={() => setDeliveryModal(null)}><X size={16} className="md:w-8 md:h-8" /></button>
            </div>
            <div className="p-6 md:p-12 space-y-6 md:space-y-8">
              <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><Info size={24}/></div>
                 <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-tight">Details pre-filled from historical drug profile. Review before confirming.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Quantity Received</label>
                   <input type="number" value={deliveryData.quantity} onChange={e=>setDeliveryData({...deliveryData, quantity: parseInt(e.target.value)||0})} className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-3xl text-white font-black text-xs md:text-2xl" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">New Expiry Date</label>
                   <input type="date" value={deliveryData.expiryDate} onChange={e=>setDeliveryData({...deliveryData, expiryDate: e.target.value})} className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-3xl text-white font-black text-xs md:text-2xl" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Min Stock Threshold</label>
                   <input type="number" value={deliveryData.minStock} onChange={e=>setDeliveryData({...deliveryData, minStock: parseInt(e.target.value)||0})} className="w-full p-3 md:p-6 bg-[#0a1628] border border-white/5 rounded-xl md:rounded-3xl text-white font-black text-xs md:text-2xl" />
                </div>
              </div>
              <button onClick={handleDelivery} className="w-full bg-[#ffd700] text-[#0a1628] py-4 md:py-8 rounded-xl md:rounded-3xl font-black uppercase text-xs md:text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                 <Check size={24}/> Commit to Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
