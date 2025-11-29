"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  PieChart, Wallet, ArrowUp, ArrowDown, History, 
  BookOpen, Settings, LayoutDashboard, Target, Brain, Save, Trash2, RefreshCw, Lock, Filter, FileText, Moon, Sun, Download, Printer, LogOut, WifiOff
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { marked } from 'marked';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DICTIONARY: any = {
  tr: {
    menu: { dashboard: "Genel Durum", debts: "Borç/Alacak", ai: "AI Asistan", goals: "Hedefler", history: "Geçmiş", guide: "Rehber", settings: "Ayarlar" },
    dash: { title: "Genel Durum", income: "Gelirler", expense: "Giderler", net: "Net Durum", quickAdd: "Hızlı İşlem", lastTrans: "Son İşlemler", noData: "Veri yok.", processRec: "Sabitleri İşle" },
    filter: { all: "Tümü", income: "Sadece Gelir", expense: "Sadece Gider", dateNew: "En Yeni", dateOld: "En Eski" },
    cats: { general: "Genel", sales: "Satış", market: "Market", bill: "Fatura", staff: "Personel", other: "Diğer" },
    form: { desc: "Açıklama", amount: "Tutar", save: "Kaydet", cat: "Kategori", date: "Tarih" },
    debts: { title: "Borç & Alacak Defteri", new: "Yeni Kayıt", person: "Kişi Adı", type: "Tür", receivable: "Alacak (+)", payable: "Borç (-)", date: "Vade Tarihi" },
    goals: { title: "Hedef Takibi", current: "Mevcut Durum", target: "Hedeflenen", set: "Hedefi Ayarla" },
    ai: { title: "Finansal Otopilot", btnAnalyze: "Otomatik Analiz Başlat", waiting: "Yapay zeka verilerinizi inceliyor...", warning: "Sunucu hatası.", intro: "Groq (Llama 3) yapay zekası, harcamalarınızı analiz ederek size özel tasarruf ve yatırım tavsiyeleri verir. (Otomatik Bağlantı)" },
    guide: { title: "Kullanım Rehberi", sec1:"Sistem", text1:"Verileriniz bulutta saklanır.", sec2:"Güvenlik", text2:"Sadece siz erişebilirsiniz." },
    settings: { title: "Ayarlar", lang: "Dil Seçimi", security: "Güvenlik (PIN)", reset: "Verileri Sıfırla", rates: "Kurlar (1 Birim = ? TL)", recurring: "Sabit Gider Şablonları", exportTitle: "Raporlama", fetchLive: "Canlı Kur Çek" },
    logout: "Çıkış Yap", loginTitle: "Güvenli Bağlantı Kuruluyor..."
  },
  en: {
    menu: { dashboard: "Dashboard", debts: "Debts/Credit", ai: "AI Assistant", goals: "Goals", history: "History", guide: "Guide", settings: "Settings" },
    dash: { title: "Overview", income: "Income", expense: "Expense", net: "Net Balance", quickAdd: "Quick Add", lastTrans: "Recent Transactions", noData: "No data.", processRec: "Process Recurring" },
    filter: { all: "All", income: "Income Only", expense: "Expense Only", dateNew: "Newest", dateOld: "Oldest" },
    cats: { general: "General", sales: "Sales", market: "Market", bill: "Bills", staff: "Staff", other: "Other" },
    form: { desc: "Description", amount: "Amount", save: "Save", cat: "Category", date: "Date" },
    debts: { title: "Debts & Credits", new: "New Record", person: "Person Name", type: "Type", receivable: "Receivable (+)", payable: "Payable (-)", date: "Due Date" },
    goals: { title: "Goal Tracking", current: "Current", target: "Target", set: "Set Goal" },
    ai: { title: "Financial Autopilot", btnAnalyze: "Start Auto-Analysis", waiting: "AI analyzing...", warning: "Server error.", intro: "AI analyzes expenses and gives personalized advice. (Auto Connected)" },
    guide: { title: "User Guide", sec1:"System", text1:"Data is stored in cloud.", sec2:"Security", text2:"Only you can access." },
    settings: { title: "Settings", lang: "Language", security: "Security (PIN)", reset: "Reset Data", rates: "Rates (1 Unit = ? TRY)", recurring: "Recurring Templates", exportTitle: "Reporting", fetchLive: "Fetch Live" },
    logout: "Logout", loginTitle: "Establishing Secure Connection..."
  }
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const [lang, setLang] = useState('tr');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [recurringItems, setRecurringItems] = useState<any[]>([]);
  const [rates, setRates] = useState({ USD: 34, EUR: 36, GBP: 42 });
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [pin, setPin] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('newest');

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Genel');
  const [currency, setCurrency] = useState('TRY');
  const [dateVal, setDateVal] = useState('');

  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState('alacak');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtCurrency, setDebtCurrency] = useState('TRY');
  const [debtDate, setDebtDate] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recAmount, setRecAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      setUser(session.user);

      if (typeof window !== 'undefined') {
        const l = localStorage.getItem('appLang') || 'tr';
        const th = localStorage.getItem('theme') || 'light';
        const mt = localStorage.getItem('monthlyTarget') || '10000';
        const p = localStorage.getItem('userPin') || '';
        const r = JSON.parse(localStorage.getItem('rates') || '{"USD":34,"EUR":36,"GBP":42}');
        const rec = JSON.parse(localStorage.getItem('recurring') || '[]');

        setLang(l); setTheme(th); setMonthlyTarget(Number(mt)); setRates(r); setRecurringItems(rec); setPin(p);
        if (th === 'dark') document.documentElement.classList.add('dark');
        if (p) setIsLocked(true);
        setDateVal(new Date().toISOString().split('T')[0]);
      }
      await fetchData(session.user.id);
      setIsLoading(false);
    };
    init();
  }, [router]);

  const fetchData = async (userId: string) => {
    const { data: tData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (tData) setTransactions(tData);
    const { data: dData } = await supabase.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (dData) setDebts(dData);
  };

  const t = DICTIONARY[lang] || DICTIONARY['en'];
  const saveToLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
  const convertToTry = (amt: number, curr: string) => curr === 'TRY' ? amt : amt * (rates[curr as keyof typeof rates] || 1);
  const toggleLang = (l: string) => { setLang(l); localStorage.setItem('appLang', l); };
  const toggleTheme = () => { const n = theme === 'light' ? 'dark' : 'light'; setTheme(n); localStorage.setItem('theme', n); if(n === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.replace('/login'); };

  // ACTIONS
  const addTransaction = async () => {
    if (!desc || !amount) return alert("Eksik bilgi");
    const dateFormatted = new Date(dateVal).toLocaleDateString(lang==='tr'?'tr-TR':'en-US');
    const newItem = { id: Date.now(), date: dateFormatted, description: desc, category, amount: parseFloat(amount), currency, user_id: user?.id };
    setTransactions([newItem, ...transactions]); 
    await supabase.from('transactions').insert([{ user_id: user.id, date: dateFormatted, description: desc, category, amount: parseFloat(amount), currency }]);
    setDesc(''); setAmount('');
  };
  const deleteTransaction = async (id: number) => { if(!confirm("Sil?")) return; setTransactions(transactions.filter(t => t.id !== id)); await supabase.from('transactions').delete().eq('id', id); };

  const addDebt = async () => {
    if(!debtName || !debtAmount) return alert("Eksik bilgi");
    const dDate = debtDate ? new Date(debtDate).toLocaleDateString() : new Date().toLocaleDateString();
    const newDebt = { id: Date.now(), name: debtName, type: debtType, amount: parseFloat(debtAmount), currency: debtCurrency, date: dDate, user_id: user?.id };
    setDebts([...debts, newDebt]); 
    await supabase.from('debts').insert([{ user_id: user.id, name: debtName, type: debtType, amount: parseFloat(debtAmount), currency: debtCurrency, date: dDate }]);
    setDebtName(''); setDebtAmount('');
  };
  const deleteDebt = async (id: number) => { if(!confirm("Sil?")) return; setDebts(debts.filter(d => d.id !== id)); await supabase.from('debts').delete().eq('id', id); };

  const addRecurring = () => { if(!recDesc || !recAmount) return; const u = [...recurringItems, {id:Date.now(), desc:recDesc, amount:parseFloat(recAmount)}]; setRecurringItems(u); saveToLocal('recurring', u); setRecDesc(''); setRecAmount(''); };
  const deleteRecurring = (id: number) => { const u = recurringItems.filter(r => r.id !== id); setRecurringItems(u); saveToLocal('recurring', u); };
  const applyRecurring = async () => {
    if(recurringItems.length === 0) return alert("Şablon yok."); if(!confirm("Eklensin mi?")) return;
    const newTrans = recurringItems.map(r => ({ user_id: user.id, date: new Date().toLocaleDateString(), description: r.desc, category: 'Fatura', amount: r.amount, currency: 'TRY' }));
    setTransactions([...newTrans, ...transactions]);
    await supabase.from('transactions').insert(newTrans);
    alert("İşlendi!");
  };

  // --- AI (SUNUCU TARAFLI) ---
  const runAutoPilot = async () => {
    setLoadingAI(true); setAiResult('');
    
    const inc = transactions.reduce((a,t)=>t.amount>0?a+convertToTry(t.amount,t.currency):a,0);
    const exp = transactions.reduce((a,t)=>t.amount<0?a+Math.abs(convertToTry(t.amount,t.currency)):a,0);
    const recent = transactions.slice(0, 5).map(x => `${x.description}: ${x.amount}`).join(', ');
    
    const prompt = lang === 'tr' 
      ? `Analiz et: Gelir ${inc}, Gider ${exp}. İşlemler: ${recent}. Finansal tavsiye ver.`
      : `Analyze: Income ${inc}, Expense ${exp}. Trans: ${recent}. Give financial advice.`;
    
    try {
      // API Key Gerekmiyor, direkt bizim endpoint'e atıyoruz
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setAiResult(data.choices?.[0]?.message?.content || "Cevap alınamadı.");
    } catch (e: any) { 
      setAiResult("Hata: " + e.message); 
    } finally { 
      setLoadingAI(false); 
    }
  };

  // --- CHART & FILTER ---
  const totalIncome = transactions.reduce((acc, t) => t.amount > 0 ? acc + convertToTry(t.amount, t.currency) : acc, 0);
  const totalExpense = transactions.reduce((acc, t) => t.amount < 0 ? acc + Math.abs(convertToTry(t.amount, t.currency)) : acc, 0);
  const netProfit = totalIncome - totalExpense;
  const chartData = { labels: [t.dash.income, t.dash.expense], datasets: [{ data: [totalIncome, totalExpense], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }] };

  let filteredTransactions = [...transactions];
  if(filterType === 'income') filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
  if(filterType === 'expense') filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
  if(sortType === 'newest') filteredTransactions.sort((a,b) => b.id - a.id); else filteredTransactions.sort((a,b) => a.id - b.id);

  const slider = document.getElementById("targetSlider"); const input = document.getElementById("targetInput"); const display = document.getElementById("modalTargetDisplay");
  if(slider && input && display) { slider.oninput = function() { input.value = (this as HTMLInputElement).value; display.innerText = parseInt((this as HTMLInputElement).value).toLocaleString() + " TL"; }; input.oninput = function() { slider.value = (this as HTMLInputElement).value; display.innerText = parseInt((this as HTMLInputElement).value).toLocaleString() + " TL"; }; }
  function openModal() { document.getElementById('targetModal')?.classList.remove('hidden'); } function closeModal() { document.getElementById('targetModal')?.classList.add('hidden'); }
  function saveTarget() { if(document.getElementById('targetInput')) { const val = (document.getElementById('targetInput') as HTMLInputElement).value; setMonthlyTarget(Number(val)); saveToLocal('monthlyTarget', val); closeModal(); } }

  async function fetchLiveRates() { const btn=document.getElementById('btnFetchRates'); if(btn) btn.innerHTML='...'; try { const res=await fetch('https://api.exchangerate-api.com/v4/latest/TRY'); const data=await res.json(); const r = { USD: parseFloat((1/data.rates.USD).toFixed(2)), EUR: parseFloat((1/data.rates.EUR).toFixed(2)), GBP: parseFloat((1/data.rates.GBP).toFixed(2)) }; setRates(r); saveToLocal('rates', r); alert("OK"); } catch{ alert("Err"); } finally { if(btn) btn.innerHTML=t.settings.fetchLive; } }
  function saveRates() { saveToLocal('rates', rates); alert("OK"); }
  function savePin() { if(pin.length===4) { saveToLocal('userPin', pin); alert("OK"); } else alert("4 haneli!"); }
  
  function generateReport(type: string) {
    if(transactions.length===0) return alert("No Data");
    if(type === 'csv') { const csv = "\uFEFFDate;Category;Desc;Amount\n" + transactions.map(t => `${t.date};${t.category};${t.description};${t.amount} ${t.currency}`).join('\n'); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'})); link.download="Report.csv"; link.click(); }
    else { const tbody = document.getElementById('printTableBody'); if(tbody) { tbody.innerHTML = transactions.map(t => `<tr><td class="border p-2">${t.date}</td><td class="border p-2">${t.category}</td><td class="border p-2">${t.description}</td><td class="border p-2 text-right">${t.amount} ${t.currency}</td></tr>`).join(''); window.print(); } }
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white flex-col"><RefreshCw className="animate-spin mb-4" size={48} /><h2 className="text-2xl font-bold">{t.loginTitle}</h2></div>;
  if (isLocked) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white flex-col"><Lock size={48} className="mb-4 text-indigo-500" /><h2 className="text-2xl font-bold mb-4">{t.settings.security}</h2><input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="text-black text-center text-2xl p-2 rounded mb-4 w-32" maxLength={4} /><button onClick={() => pinInput === pin ? setIsLocked(false) : alert("Error")} className="bg-indigo-600 px-6 py-2 rounded font-bold">{t.login}</button></div>;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-slate-900 dark:text-gray-100 overflow-hidden font-sans">
      <div id="printArea" className="hidden"><h1 className="text-3xl font-bold mb-4 text-center">REPORT</h1><table className="w-full text-left border-collapse border"><thead><tr class="bg-gray-100"><th class="border p-2">Date</th><th class="border p-2">Cat</th><th class="border p-2">Desc</th><th class="border p-2">Amt</th></tr></thead><tbody id="printTableBody"></tbody></table></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40 flex flex-col`}>
        <div className="p-6 text-center border-b border-gray-200 dark:border-slate-700 hidden md:block"><h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">BOSS v38</h1><p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Auto AI</p></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <MenuButton icon={<PieChart size={20} />} label={t.menu.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <MenuButton icon={<Wallet size={20} />} label={t.menu.debts} active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} />
            <MenuButton icon={<Brain size={20} />} label={t.menu.ai} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <MenuButton icon={<Target size={20} />} label={t.menu.goals} active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
            <MenuButton icon={<History size={20} />} label={t.menu.history} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <MenuButton icon={<BookOpen size={20} />} label={t.menu.guide} active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} />
            <MenuButton icon={<Settings size={20} />} label={t.menu.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl hover:bg-red-50 text-red-600 transition font-medium mt-4"><LogOut size={20} /> <span className="ml-3">{t.logout}</span></button>
        </nav>
        <div className="p-4 border-t flex justify-center gap-2"><button onClick={()=>toggleLang('tr')} className="px-2 py-1 text-xs font-bold bg-gray-200 dark:bg-slate-700 rounded">TR</button><button onClick={()=>toggleLang('en')} className="px-2 py-1 text-xs font-bold bg-gray-200 dark:bg-slate-700 rounded">EN</button><button onClick={toggleTheme} className="px-2 py-1 rounded bg-gray-200 dark:bg-slate-700">{theme==='light'?<Moon size={14}/>:<Sun size={14}/>}</button></div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-slate-800 p-4 shadow z-50 flex justify-between items-center border-b dark:border-slate-700"><h1 className="text-xl font-bold text-indigo-600">BOSS</h1><button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><LayoutDashboard /></button></div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 transition-all">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">{t.dash.title}</h2><button onClick={applyRecurring} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"><RefreshCw size={16}/> {t.dash.processRec}</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><StatsCard title={t.dash.income} value={`${totalIncome.toLocaleString()} ₺`} color="green" icon={<ArrowUp />} /><StatsCard title={t.dash.expense} value={`${totalExpense.toLocaleString()} ₺`} color="red" icon={<ArrowDown />} /><StatsCard title={t.dash.net} value={`${netProfit.toLocaleString()} ₺`} color="blue" icon={<Wallet />} /></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm"><h3 className="font-bold mb-4">{t.dash.quickAdd}</h3><div className="space-y-4"><input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder={t.form.desc} className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" /><div className="flex gap-2"><select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-1/2 p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600"><option>Genel</option><option>Satış</option><option>Market</option><option>Fatura</option></select><select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="w-1/4 p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600"><option>TRY</option><option>USD</option><option>EUR</option></select><input type="date" value={dateVal} onChange={(e)=>setDateVal(e.target.value)} className="w-1/4 p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" /></div><input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder={t.form.amount} className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" /><button onClick={addTransaction} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">{t.form.save}</button></div></div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex justify-center items-center"><div className="h-64 w-full max-w-md"><Doughnut data={chartData} options={{maintainAspectRatio:false}} /></div></div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm overflow-x-auto"><div className="flex justify-between mb-4"><h3 className="font-bold">{t.dash.lastTrans}</h3><div className="flex gap-2"><select onChange={(e)=>setFilterType(e.target.value)} className="p-1 text-xs border rounded dark:bg-slate-700"><option value="all">{t.filter.all}</option><option value="income">{t.filter.income}</option><option value="expense">{t.filter.expense}</option></select><select onChange={(e)=>setSortType(e.target.value)} className="p-1 text-xs border rounded dark:bg-slate-700"><option value="newest">{t.filter.dateNew}</option><option value="oldest">{t.filter.dateOld}</option></select></div></div><table className="w-full text-left min-w-[500px]"><thead className="bg-gray-50 dark:bg-slate-700 text-xs uppercase"><tr><th className="p-3">{t.form.date}</th><th className="p-3">{t.form.desc}</th><th className="p-3 text-right">{t.form.amount}</th><th className="p-3 text-right">Sil</th></tr></thead><tbody>{filteredTransactions.slice(0,10).map((t:any)=><tr key={t.id} className="border-b dark:border-slate-700"><td className="p-3">{t.date}</td><td className="p-3">{t.description}</td><td className={`p-3 text-right font-bold ${t.amount>0?'text-green-500':'text-red-500'}`}>{t.amount} {t.currency}</td><td className="p-3 text-right"><button onClick={()=>deleteTransaction(t.id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>
          </div>
        )}
        {activeTab === 'debts' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in"><div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm h-fit"><h3 className="font-bold mb-4">{t.debts.new}</h3><div className="space-y-4"><input value={debtName} onChange={(e)=>setDebtName(e.target.value)} placeholder={t.debts.person} className="w-full p-3 border rounded-xl dark:bg-slate-700" /><select value={debtType} onChange={(e)=>setDebtType(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-700"><option value="alacak">{t.debts.receivable}</option><option value="borc">{t.debts.payable}</option></select><div className="flex gap-2 mb-4"><input type="number" value={debtAmount} onChange={(e)=>setDebtAmount(e.target.value)} placeholder={t.form.amount} className="w-2/3 p-3 border rounded-xl dark:bg-slate-700" /><select value={debtCurrency} onChange={(e)=>setDebtCurrency(e.target.value)} className="w-1/3 p-3 border rounded-xl dark:bg-slate-700"><option>TRY</option><option>USD</option><option>EUR</option></select></div><button onClick={addDebt} className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold">{t.form.save}</button></div></div><div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm overflow-x-auto"><table className="w-full text-left min-w-[500px]"><thead className="bg-gray-50 dark:bg-slate-700 text-xs uppercase"><tr><th className="p-3">{t.debts.person}</th><th className="p-3">{t.debts.type}</th><th className="p-3">{t.form.amount}</th><th className="p-3">Sil</th></tr></thead><tbody>{debts.map((d:any)=><tr key={d.id} className="border-b dark:border-slate-700"><td className="p-3">{d.name}</td><td className="p-3">{d.type}</td><td className="p-3 font-bold">{d.amount} {d.currency}</td><td className="p-3"><button onClick={()=>deleteDebt(d.id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></div>}
        {activeTab === 'ai' && <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl text-center animate-fade-in"><Brain size={64} className="mx-auto text-indigo-500 mb-4"/><h2 className="text-2xl font-bold mb-4">{t.ai.title}</h2><p className="text-gray-500 mb-6 max-w-md mx-auto">{t.ai.intro}</p><button onClick={runAutoPilot} disabled={loadingAI} className="bg-orange-600 text-white px-6 py-2 rounded-xl">{loadingAI ? '...' : t.ai.btnAnalyze}</button>{aiResult && <div className="mt-4 prose dark:prose-invert text-left mx-auto max-w-3xl" dangerouslySetInnerHTML={{__html:marked.parse(aiResult)}}/>}</div>}
        {activeTab === 'goals' && <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-xl mx-auto mt-10 animate-fade-in"><h2 className="text-2xl font-bold mb-6 text-center">{t.goals.title}</h2><div className="flex justify-between mb-2"><span>{t.goals.target}: {monthlyTarget.toLocaleString()}</span><span>{t.goals.current}: {netProfit.toLocaleString()}</span></div><div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-6 mb-8 relative"><div className="bg-blue-600 h-6 rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.max((netProfit/monthlyTarget)*100,0),100)}%` }}></div></div><button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded w-full">{t.goals.set}</button></div>}
        {activeTab === 'history' && <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm animate-fade-in"><h2 className="text-2xl font-bold mb-6">{t.menu.history}</h2><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 uppercase text-xs"><tr><th className="p-3">{t.form.date}</th><th className="p-3">{t.form.cat}</th><th className="p-3">{t.form.desc}</th><th className="p-3">{t.form.amount}</th></tr></thead><tbody>{transactions.map((t:any)=><tr key={t.id} className="border-b dark:border-slate-700"><td className="p-3">{t.date}</td><td className="p-3">{t.category}</td><td className="p-3">{t.description}</td><td className="p-3">{t.amount} {t.currency}</td></tr>)}</tbody></table></div>}
        {activeTab === 'guide' && <div className="space-y-6 max-w-4xl mx-auto animate-fade-in"><div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border-l-4 border-indigo-500"><h2 className="text-2xl font-bold mb-4">{t.guide.title}</h2><p className="mb-4">{t.guide.text1}</p><h3 className="font-bold mt-4 mb-2">{t.guide.sec2}</h3><p>{t.guide.text2}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"><h3 className="font-bold mb-2 flex items-center gap-2"><Brain className="text-orange-500"/> {t.guide.sec3}</h3><p className="text-sm text-gray-600 dark:text-gray-300">{t.guide.text3}</p></div><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500"><h3 className="font-bold mb-2">{t.guide.sec4}</h3><p className="text-sm text-gray-600 dark:text-gray-300">{t.guide.text4}</p></div></div></div>}
        {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500"><h3 className="font-bold mb-4">{t.settings.recurring}</h3><div className="flex gap-2 mb-4"><input placeholder="Kira" value={recDesc} onChange={(e)=>setRecDesc(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700"/><input placeholder="-5000" value={recAmount} onChange={(e)=>setRecAmount(e.target.value)} type="number" className="w-24 p-2 border rounded dark:bg-slate-700"/><button onClick={addRecurring} className="bg-indigo-600 text-white px-4 rounded">+</button></div><ul>{recurringItems.map((r:any)=><li key={r.id} className="flex justify-between text-sm p-2 border-b dark:border-slate-700"><span>{r.desc} ({r.amount})</span><button onClick={()=>deleteRecurring(r.id)} className="text-red-500">x</button></li>)}</ul></div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm"><h3 className="font-bold mb-4">{t.settings.rates}</h3><div className="flex gap-2"><button onClick={fetchLiveRates} id="btnFetchRates" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">{t.settings.fetchLive}</button><button onClick={saveRates} className="flex-1 bg-yellow-600 text-white py-2 rounded-lg text-sm">{t.form.save}</button></div></div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm"><h3 className="font-bold mb-4">{t.settings.exportTitle}</h3><div className="flex gap-2"><button onClick={()=>generateReport('csv')} className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Download size={16}/> Excel</button><button onClick={()=>generateReport('print')} className="flex-1 bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Printer size={16}/> PDF</button></div></div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm"><h3 className="font-bold mb-4">{t.settings.security}</h3><div className="flex gap-2"><input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} maxLength={4} className="w-full p-2 border rounded-lg dark:bg-slate-700" placeholder="PIN"/><button onClick={savePin} className="bg-blue-600 text-white px-4 rounded-lg"><Lock/></button></div></div>
            </div>
        )}
      </main>
      <div id="targetModal" class="fixed inset-0 bg-black bg-opacity-70 z-50 hidden flex items-center justify-center p-4 no-print"><div className="bg-white dark:bg-darkCard p-6 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold mb-4 text-center dark:text-white">{t.goals.set}</h2><div className="flex justify-between mb-2 dark:text-white"><span id="modalTargetDisplay">10,000 TL</span></div><input type="range" min="1000" max="100000" step="500" id="targetSlider" class="slider w-full mb-4"/><input type="number" id="targetInput" class="w-full p-2 border rounded-lg mb-4 text-center font-bold" placeholder="10000"/><div className="flex gap-2"><button onClick={saveTarget} class="flex-1 bg-blue-600 text-white py-2 rounded-lg">{t.form.save}</button><button onClick={closeModal} class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">{t.cancel}</button></div></div></div>
    </div>
  );
}

function MenuButton({ icon, label, active, onClick }: any) { return <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>{icon} <span className="ml-3">{label}</span></button>; }
function StatsCard({ title, value, color, icon }: any) { const c={green:"from-green-500 to-emerald-700", red:"from-red-500 to-rose-700", blue:"from-blue-500 to-indigo-700"}; return <div className={`bg-gradient-to-br ${c[color as keyof typeof c]} p-6 rounded-2xl shadow-lg text-white transform transition hover:-translate-y-1`}><div className="flex justify-between"><div><p className="text-white/80 text-sm font-medium uppercase">{title}</p><h3 className="text-3xl font-bold mt-1">{value}</h3></div><div className="bg-white/20 p-3 rounded-full">{icon}</div></div></div>; }