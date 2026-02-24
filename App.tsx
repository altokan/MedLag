
import React, { useState, useCallback } from 'react';
import Input from './components/Input';
import Button from './components/Button';
import { CurrencyType } from './types';
import { CONVERSION_RATE } from './constants';

const App: React.FC = () => {
  const [oldAmount, setOldAmount] = useState<string>('');
  const [convertedNew, setConvertedNew] = useState<number | null>(null);

  const [itemPrice, setItemPrice] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paidCurrency, setPaidCurrency] = useState<CurrencyType>(CurrencyType.NEW);
  const [changeResult, setChangeResult] = useState<{
    amount: number | null;
    error: string | null;
  }>({ amount: null, error: null });

  const handleConvert = useCallback(() => {
    const val = parseFloat(oldAmount);
    if (isNaN(val) || val < 0) {
      setConvertedNew(null);
      return;
    }
    const result = val / CONVERSION_RATE;
    setConvertedNew(Number(result.toFixed(2)));
  }, [oldAmount]);

  const handleCalculateChange = useCallback(() => {
    const price = parseFloat(itemPrice);
    const paid = parseFloat(paidAmount);

    if (isNaN(price) || isNaN(paid) || price < 0 || paid < 0) {
      setChangeResult({ amount: null, error: "يرجى إدخال أرقام صحيحة" });
      return;
    }

    const paidInNew = paidCurrency === CurrencyType.OLD ? paid / CONVERSION_RATE : paid;
    const change = paidInNew - price;

    if (change < 0) {
      setChangeResult({ amount: null, error: "المبلغ غير كافٍ" });
    } else {
      setChangeResult({ amount: Number(change.toFixed(2)), error: null });
    }
  }, [itemPrice, paidAmount, paidCurrency]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <header className="text-center py-10 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-xl">
        <h1 className="text-4xl font-bold text-[#8b6b00] mb-2">محول الليرة</h1>
        <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full mb-3"></div>
        <p className="text-[#5d4a13] font-medium opacity-80">الجيل الجديد من حسابات العملة السورية</p>
      </header>

      {/* Module 1: Conversion */}
      <section className="glass-card p-8 rounded-[2rem] transition-all hover:shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span className="bg-[#fcf5e5] p-2 rounded-xl text-[#d4af37]">🔄</span>
          تحويل العملة
        </h2>
        
        <div className="space-y-6">
          <Input 
            label="المبلغ القديم" 
            value={oldAmount} 
            onChange={setOldAmount}
            placeholder="أدخل المبلغ هنا..."
          />
          
          <button 
            onClick={handleConvert}
            className="w-full py-4 bg-[#d4af37] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#b8860b] active:scale-[0.98] transition-all"
          >
            تـحـويـل لـلـجـديـد
          </button>

          {convertedNew !== null && (
            <div className="result-box p-6 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
              <p className="text-white/80 text-sm mb-1">المبلغ الجديد</p>
              <p className="text-4xl font-bold">
                {convertedNew.toLocaleString()} <span className="text-base font-normal">ليرة جديدة</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Module 2: Change Calculator */}
      <section className="glass-card p-8 rounded-[2rem] transition-all hover:shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span className="bg-[#e8f5e9] p-2 rounded-xl text-[#2e7d32]">⚖️</span>
          حساب الباقي
        </h2>

        <div className="space-y-6">
          <Input 
            label="سعر السلعة (بالجديدة)" 
            value={itemPrice} 
            onChange={setItemPrice}
            placeholder="0.00"
          />

          <Input 
            label="المبلغ الذي دفعته" 
            value={paidAmount} 
            onChange={setPaidAmount}
            placeholder="0.00"
          />

          <div className="flex flex-col gap-3">
            <span className="text-gray-600 font-bold text-sm mr-1">نوع العملة المدفوعة:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaidCurrency(CurrencyType.NEW)}
                className={`py-4 rounded-2xl border-2 transition-all font-bold ${
                  paidCurrency === CurrencyType.NEW 
                    ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-lg scale-[1.02]' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-[#2e7d32]/30'
                }`}
              >
                ليرة جديدة
              </button>
              <button
                onClick={() => setPaidCurrency(CurrencyType.OLD)}
                className={`py-4 rounded-2xl border-2 transition-all font-bold ${
                  paidCurrency === CurrencyType.OLD 
                    ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-lg scale-[1.02]' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-[#2e7d32]/30'
                }`}
              >
                ليرة قديمة
              </button>
            </div>
          </div>

          <button 
            onClick={handleCalculateChange}
            className="w-full py-4 bg-[#2e7d32] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#1b5e20] active:scale-[0.98] transition-all"
          >
            احـسـب الـبـاقـي
          </button>

          {changeResult.error && (
            <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-200">
              <p className="text-red-600 font-bold">{changeResult.error}</p>
            </div>
          )}

          {changeResult.amount !== null && !changeResult.error && (
            <div className="bg-[#2e7d32] p-6 rounded-2xl text-center text-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">
              <p className="text-white/80 text-sm mb-1 uppercase">الباقي لك هو</p>
              <p className="text-4xl font-bold">
                {changeResult.amount.toLocaleString()} <span className="text-base font-normal">ليرة جديدة</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Card */}
      <footer className="bg-white/50 backdrop-blur-md p-5 rounded-2xl text-center text-[#5d4a13] text-sm border border-white shadow-sm">
        <p className="font-bold">١ ليرة جديدة = ١٠٠ ليرة قديمة</p>
        <p className="text-[10px] mt-1 opacity-50">تم التصميم بلمسة فنية سورية 🇸🇾</p>
        <p className="text-[10px] opacity-40 mt-0.5">Designed & developed by Amjad Altokan</p>
      </footer>
    </div>
  );
};

export default App;
