
import React, { useState } from 'react';
import { ShoppingCart, Package, Truck, Check, Trash2, X, Calendar, Printer, Table, Mail } from 'lucide-react';
import { OrderItem, OrderStatus, Medicine, Role, AppSettings, User } from '../types';

interface OrderListProps {
  t: any;
  orders: OrderItem[];
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  role: Role;
  onDeliveryComplete: (orderId: string, receivedQty: number, expiryDate: string) => void;
  currentUser: User;
  settings: AppSettings;
}

const OrderList: React.FC<OrderListProps> = ({ t, orders, setOrders, onDeliveryComplete, settings }) => {
  const [deliveryModal, setDeliveryModal] = useState<OrderItem | null>(null);
  const [receivedQty, setReceivedQty] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this order request from the list?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const confirmDelivery = () => {
    if (!expiryDate) {
      alert("Expiry Date is mandatory for delivery confirmation.");
      return;
    }
    if (deliveryModal) {
      onDeliveryComplete(deliveryModal.id, receivedQty, expiryDate);
      setDeliveryModal(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ORDERED: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case OrderStatus.IN_PROGRESS: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case OrderStatus.DELIVERED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Export functions
  const exportToExcel = () => {
    let csv = "Medicine,Status,Requested At\n";
    orders.forEach(o => { csv += `"${o.medicineName}","${o.status}","${new Date(o.requestedAt).toLocaleDateString()}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const sendByEmail = () => {
    const subject = `Order List Update - ${settings.appName}`;
    const orderText = orders.map(o => `- ${o.medicineName} (${o.status})`).join('%0A');
    window.location.href = `mailto:${settings.supervisorEmail}?subject=${subject}&body=Current%20Procurement%20List:%0A${orderText}`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 px-1">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">{t.orders}</h1>
          <p className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Supply Chain</p>
        </div>
        <div className="flex gap-2">
           <button onClick={exportToExcel} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><Table size={18}/></button>
           <button onClick={sendByEmail} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20"><Mail size={18}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-[#0d1b2e] p-5 rounded-[32px] border border-white/5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
               <div className="flex-1 min-w-0">
                  <h3 className="text-white font-black uppercase text-sm truncate">{order.medicineName}</h3>
                  <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
               </div>
               <button onClick={() => handleDelete(order.id)} className="p-2 text-red-500/20 hover:text-red-500 transition-colors">
                  <Trash2 size={16}/>
               </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <button onClick={() => handleUpdateStatus(order.id, OrderStatus.ORDERED)} className={`p-2 rounded-xl text-[8px] font-black uppercase border transition-all ${order.status === OrderStatus.ORDERED ? 'bg-orange-500 text-white' : 'bg-[#0a1628] text-slate-600'}`}>📦 Order</button>
               <button onClick={() => handleUpdateStatus(order.id, OrderStatus.IN_PROGRESS)} className={`p-2 rounded-xl text-[8px] font-black uppercase border transition-all ${order.status === OrderStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-[#0a1628] text-slate-600'}`}>🚚 Progress</button>
               <button onClick={() => setDeliveryModal(order)} className="p-2 rounded-xl text-[8px] font-black uppercase border bg-emerald-600 text-white shadow-lg active:scale-95">✅ Receive</button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-10">
             <ShoppingCart size={64} className="mx-auto mb-2" />
             <p className="font-black uppercase text-xs tracking-widest">Supply list is cleared</p>
          </div>
        )}
      </div>

      {deliveryModal && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
           <div className="bg-[#0d1b2e] w-full max-w-sm my-8 rounded-[40px] border border-white/10 animate-in zoom-in">
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center sticky top-0 z-10">
                 <h2 className="text-lg font-black uppercase">Final Receipt</h2>
                 <button onClick={() => setDeliveryModal(null)} className="p-1 hover:bg-black/10 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="text-center">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Confirm stock receipt for:</p>
                    <p className="text-white font-black uppercase text-lg">{deliveryModal.medicineName}</p>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Quantity Received</label>
                       <input type="number" value={receivedQty} onChange={e => setReceivedQty(parseInt(e.target.value)||0)} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-white/5 text-white font-black text-xl outline-none focus:border-emerald-600 text-center" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-emerald-500 uppercase ml-2 flex items-center gap-1"><Calendar size={12}/> Expiry Date *</label>
                       <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-4 bg-[#0a1628] rounded-2xl border border-emerald-600/20 text-white font-black text-lg outline-none focus:border-emerald-600 text-center" />
                    </div>
                 </div>
                 <button onClick={confirmDelivery} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Update Tactical Stock</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
