
import React, { useState, useMemo } from 'react';
import { Download, Mail, Trash2, FileText, ChevronDown, ChevronUp, User, Package, Clock, BarChart3, ClipboardCheck, Printer, CalendarDays, Filter, Truck, Ambulance, Table, AlertTriangle } from 'lucide-react';
import { Withdrawal, Role, Medicine, InventoryAudit, Delivery, AppSettings, User as UserType, ExpiredMedicineLog } from '../types';

interface ReportsProps {
  t: any;
  withdrawals: Withdrawal[];
  setWithdrawals: React.Dispatch<React.SetStateAction<Withdrawal[]>>;
  deliveries: Delivery[];
  disposals: ExpiredMedicineLog[];
  role: Role;
  medicines: Medicine[];
  audits?: InventoryAudit[];
  settings: AppSettings;
  currentUser: UserType;
}

const Reports: React.FC<ReportsProps> = ({ t, withdrawals, setWithdrawals, deliveries, disposals, role, medicines, audits = [], settings, currentUser }) => {
  const [reportTab, setReportTab] = useState<'withdrawals' | 'entries' | 'disposals' | 'audits'>('withdrawals');
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filterByDate = (dateString: string) => {
    if (timeFilter === 'all') return true;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    
    if (timeFilter === 'daily') return diffDays <= 1;
    if (timeFilter === 'weekly') return diffDays <= 7;
    if (timeFilter === 'monthly') return diffDays <= 30;
    if (timeFilter === 'yearly') return diffDays <= 365;
    return true;
  };

  const processedWithdrawals = useMemo(() => withdrawals.filter(w => filterByDate(w.timestamp)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [withdrawals, timeFilter]);
  const processedDeliveries = useMemo(() => deliveries.filter(d => filterByDate(d.timestamp)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [deliveries, timeFilter]);
  const processedDisposals = useMemo(() => disposals.filter(d => filterByDate(d.disposedAt)).sort((a, b) => b.disposedAt.localeCompare(a.disposedAt)), [disposals, timeFilter]);

  const generateExcelCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportTab === 'withdrawals') {
      csvContent += "Timestamp,User,Vehicle,Medicine,Quantity,Signature\n";
      processedWithdrawals.forEach(w => { csvContent += `${w.timestamp},${w.username},${w.vehicle},${w.medicineName},${w.quantity},${w.signature}\n`; });
    } else if (reportTab === 'entries') {
      csvContent += "Timestamp,User,Medicine,Quantity,Expiry\n";
      processedDeliveries.forEach(d => { csvContent += `${d.timestamp},${d.username},${d.medicineName},${d.quantity},${d.expiryDate}\n`; });
    } else if (reportTab === 'disposals') {
      csvContent += "Disposal Date,Auditor,Medicine,Barcode,Expired Date,Quantity\n";
      processedDisposals.forEach(d => { csvContent += `${d.disposedAt},${d.disposedBy},${d.medicineName},${d.barcode},${d.expiryDate},${d.quantity}\n`; });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${settings.appName}_${reportTab}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let content = '';
    let headers = '';

    if (reportTab === 'withdrawals') {
      headers = '<th>Date</th><th>User</th><th>Vehicle</th><th>Item</th><th>Qty</th><th>Sig</th>';
      content = processedWithdrawals.map(w => `<tr><td>${new Date(w.timestamp).toLocaleString()}</td><td>${w.username}</td><td>${w.vehicle}</td><td>${w.medicineName}</td><td>-${w.quantity}</td><td>${w.signature}</td></tr>`).join('');
    } else if (reportTab === 'entries') {
      headers = '<th>Date</th><th>User</th><th>Item</th><th>Qty</th><th>Expiry</th>';
      content = processedDeliveries.map(d => `<tr><td>${new Date(d.timestamp).toLocaleString()}</td><td>${d.username}</td><td>${d.medicineName}</td><td>+${d.quantity}</td><td>${d.expiryDate}</td></tr>`).join('');
    } else if (reportTab === 'disposals') {
      headers = '<th>Disposal Date</th><th>Auditor</th><th>Item</th><th>Barcode</th><th>Expired Date</th><th>Qty</th>';
      content = processedDisposals.map(d => `<tr><td>${new Date(d.disposedAt).toLocaleString()}</td><td>${d.disposedBy}</td><td>${d.medicineName}</td><td>${d.barcode}</td><td>${d.expiryDate}</td><td>${d.quantity}</td></tr>`).join('');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${settings.appName} Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; direction: ltr; }
            h1 { color: #0a1628; border-bottom: 4px solid ${settings.accentColor}; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 11px; }
            th { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${settings.appName} - ${reportTab.toUpperCase()}</h1>
          <p>Generated by: ${currentUser.fullName || currentUser.username} on ${new Date().toLocaleString()}</p>
          <table><thead><tr>${headers}</tr></thead><tbody>${content}</tbody></table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmailReport = () => {
    // التحميل التلقائي للملفات قبل فتح الإيميل
    generateExcelCSV(); 
    setTimeout(() => exportToPDF(), 500);

    const destinationEmail = settings.reportEmail || settings.supervisorEmail;
    const subject = `Inventory Report: ${reportTab} - ${new Date().toLocaleDateString()}`;
    const body = encodeURIComponent(`Hello,\n\nPlease find the attached reports (PDF and CSV) for ${settings.appName}.\n\nNote: The files have been downloaded to your computer automatically. Please attach them to this email manually.\n\nType: ${reportTab}\nGenerated by: ${currentUser.fullName || currentUser.username}`);
    
    setTimeout(() => {
      window.location.href = `mailto:${destinationEmail}?subject=${subject}&body=${body}`;
    }, 1500);
  };

  return (
    <div className="space-y-4 md:space-y-10 animate-in fade-in duration-500 pb-20 px-1 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-8">
        <div><h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">{t.reports}</h1><p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{t.generatedBy}: <span className="text-accent">{currentUser.fullName || currentUser.username}</span></p></div>
        <div className="flex gap-2">
            <button onClick={exportToPDF} className="bg-white/10 text-white p-2.5 md:px-6 md:py-4 rounded-xl flex items-center space-x-2 font-black text-[10px] uppercase border border-white/20 active:scale-95 transition-all"><Printer size={16}/><span>{t.exportPDF}</span></button>
            <button onClick={generateExcelCSV} className="bg-emerald-500/10 text-emerald-500 p-2.5 md:px-6 md:py-4 rounded-xl flex items-center space-x-2 font-black text-[10px] uppercase border border-emerald-500/20 active:scale-95 transition-all"><Table size={16}/><span>EXCEL</span></button>
            <button onClick={handleEmailReport} className="bg-accent text-[#0a1628] p-2.5 md:px-6 md:py-4 rounded-xl flex items-center space-x-2 font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"><Mail size={16}/><span>{t.emailReport}</span></button>
        </div>
      </header>
      <div className="bg-[#0d1b2e] p-2 md:p-6 rounded-[32px] border border-white/5 space-y-4">
        <div className="flex bg-[#0a1628] p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <TabBtn active={reportTab === 'withdrawals'} onClick={() => setReportTab('withdrawals')} label={t.stockOut} />
          <TabBtn active={reportTab === 'entries'} onClick={() => setReportTab('entries')} label={t.stockIn} />
          <TabBtn active={reportTab === 'disposals'} onClick={() => setReportTab('disposals')} label={t.disposalReport} />
          <TabBtn active={reportTab === 'audits'} onClick={() => setReportTab('audits')} label={t.inventoryCheck} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar"><Filter size={14} className="text-slate-600 flex-shrink-0" /><FilterBtn active={timeFilter === 'all'} onClick={() => setTimeFilter('all')} label={t.allTime} /><FilterBtn active={timeFilter === 'daily'} onClick={() => setTimeFilter('daily')} label={t.daily} /><FilterBtn active={timeFilter === 'weekly'} onClick={() => setTimeFilter('weekly')} label={t.weekly} /><FilterBtn active={timeFilter === 'monthly'} onClick={() => setTimeFilter('monthly')} label={t.monthly} /><FilterBtn active={timeFilter === 'yearly'} onClick={() => setTimeFilter('yearly')} label={t.yearly} /></div>
      </div>
      <div className="space-y-2 md:space-y-4">
        {reportTab === 'withdrawals' && processedWithdrawals.map(w => (
          <ReportItem key={w.id} icon={<Package size={16}/>} title={w.medicineName} subtitle={w.username} qty={`-${w.quantity}`} date={new Date(w.timestamp).toLocaleString()} expanded={expandedId === w.id} onToggle={() => setExpandedId(expandedId === w.id ? null : w.id)}>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4"><DetailItem label="Ref" value={w.id.toUpperCase()} /><DetailItem label={t.vehicle} value={w.vehicle || 'N/A'} icon={<Ambulance size={10}/>} /><DetailItem label="History" value={`${w.stockBefore} → ${w.stockAfter}`} /><DetailItem label="Operator" value={w.username} /><DetailItem label="Validation" value={w.signature} /></div>
          </ReportItem>
        ))}
        {reportTab === 'disposals' && processedDisposals.map(d => (
          <ReportItem key={d.id} icon={<AlertTriangle size={16} className="text-red-500"/>} title={d.medicineName} subtitle={d.disposedBy} qty={`-${d.quantity}`} date={new Date(d.disposedAt).toLocaleString()} expanded={expandedId === d.id} onToggle={() => setExpandedId(expandedId === d.id ? null : d.id)}>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4"><DetailItem label="Ref" value={d.id.toUpperCase()} /><DetailItem label="Barcode" value={d.barcode} /><DetailItem label="Expired Date" value={d.expiryDate} /><DetailItem label="Auditor" value={d.disposedBy} /></div>
          </ReportItem>
        ))}
      </div>
    </div>
  );
};
const TabBtn = ({ active, onClick, label }: any) => (<button onClick={onClick} className={`flex-1 py-2 md:py-4 px-4 rounded-xl text-[9px] md:text-sm font-black uppercase transition-all whitespace-nowrap ${active ? 'bg-accent text-[#0a1628] shadow-lg scale-105' : 'text-slate-500'}`}>{label}</button>);
const FilterBtn = ({ active, onClick, label }: any) => (<button onClick={onClick} className={`px-4 py-1.5 rounded-full text-[8px] md:text-xs font-black uppercase border whitespace-nowrap transition-all ${active ? 'bg-accent text-[#0a1628] border-accent shadow-md' : 'bg-[#0a1628] text-slate-500 border-white/10'}`}>{label}</button>);
const ReportItem = ({ icon, title, subtitle, qty, date, expanded, onToggle, children }: any) => (<div className="bg-[#0d1b2e] rounded-xl md:rounded-[32px] border border-white/5 overflow-hidden shadow-lg hover:border-white/10 transition-all"><button onClick={onToggle} className="w-full p-4 md:p-6 flex items-center justify-between text-left"><div className="flex items-center space-x-4"><div className="w-10 h-10 md:w-14 md:h-14 bg-[#0a1628] rounded-xl flex items-center justify-center text-accent">{icon}</div><div><h3 className="text-xs md:text-lg font-black text-white uppercase truncate">{title}</h3><p className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase">{subtitle} • {date}</p></div></div><div className="flex items-center space-x-4"><span className={`px-2 md:px-4 py-1 rounded text-[10px] md:text-base font-black ${qty.startsWith('-') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{qty}</span>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div></button>{expanded && <div className="p-4 md:p-8 bg-[#0a1628]/40 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2">{children}</div>}</div>);
const DetailItem = ({ label, value, icon }: any) => (<div className="bg-[#0d1b2e]/50 p-3 rounded-xl border border-white/5 shadow-inner"><p className="text-[8px] md:text-xs font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1">{icon}{label}</p><p className="text-[9px] md:text-base font-black text-white truncate">{value}</p></div>);
export default Reports;
