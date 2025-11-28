"use client";
import { useState, useEffect } from 'react';
import { 
  PieChart, Wallet, ArrowUp, ArrowDown, History, 
  BookOpen, Settings, LayoutDashboard, Target, Brain, Save, Trash2, RefreshCw, Lock, Filter, FileText, Moon, Sun, Download, Printer, Globe
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { marked } from 'marked';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- DİL SÖZLÜĞÜ (TAM KAPSAMLI) ---
const DICTIONARY: any = {
  tr: {
    menu: { dashboard: "Genel Durum", debts: "Borç/Alacak", ai: "AI Asistan", goals: "Hedefler", history: "Geçmiş", guide: "Rehber", settings: "Ayarlar" },
    dash: { title: "Genel Durum", income: "Gelirler", expense: "Giderler", net: "Net Durum", quickAdd: "Hızlı İşlem", lastTrans: "Son İşlemler", noData: "Veri yok.", processRec: "Sabitleri İşle" },
    filter: { all: "Tümü", income: "Sadece Gelir", expense: "Sadece Gider", dateNew: "En Yeni", dateOld: "En Eski" },
    cats: { general: "Genel", sales: "Satış", market: "Market", bill: "Fatura", staff: "Personel", other: "Diğer" },
    form: { desc: "Açıklama", amount: "Tutar", save: "Kaydet", cat: "Kategori", date: "Tarih" },
    debts: { title: "Borç & Alacak Defteri", new: "Yeni Kayıt", person: "Kişi Adı", type: "Tür", receivable: "Alacak (+)", payable: "Borç (-)", date: "Vade Tarihi" },
    goals: { title: "Hedef Takibi", current: "Mevcut Durum", target: "Hedeflenen", set: "Hedefi Ayarla" },
    ai: { title: "Finansal Otopilot", btnAnalyze: "Otomatik Analiz Başlat", waiting: "Yapay zeka verilerinizi inceliyor...", warning: "Lütfen Ayarlar'dan API Anahtarı girin.", intro: "Groq (Llama 3) yapay zekası, harcamalarınızı analiz ederek size özel tasarruf ve yatırım tavsiyeleri verir." },
    guide: { 
      title: "Kullanım Rehberi", 
      sec1: "Boss Panel Nedir?", text1: "Boss Panel, verilerinizi cihazınızda saklayan güvenli bir finans aracıdır.",
      sec2: "Veri Güvenliği", text2: "Verileriniz %100 yerel depolamada saklanır. Sunucuya gitmez.",
      sec3: "AI Analizi", text3: "Ayarlar'dan Groq API anahtarı girerek ücretsiz analiz alabilirsiniz.",
      sec4: "Yasal Uyarı", text4: "Yatırım tavsiyesi değildir. Veri yedeklemesi kullanıcı sorumluluğundadır."
    },
    settings: { title: "Ayarlar", lang: "Dil Seçimi", key: "API Anahtarı", security: "Güvenlik (PIN)", reset: "Sıfırla", rates: "Kurlar (1 Birim = ? TL)", recurring: "Sabit Gider Şablonları", exportTitle: "Raporlama", fetchLive: "Canlı Kur Çek" },
    secureLogin: "Güvenli Giriş", login: "Giriş"
  },
  en: {
    menu: { dashboard: "Dashboard", debts: "Debts/Credit", ai: "AI Assistant", goals: "Goals", history: "History", guide: "Guide", settings: "Settings" },
    dash: { title: "Overview", income: "Income", expense: "Expense", net: "Net Balance", quickAdd: "Quick Add", lastTrans: "Recent Transactions", noData: "No data.", processRec: "Process Recurring" },
    filter: { all: "All", income: "Income Only", expense: "Expense Only", dateNew: "Newest", dateOld: "Oldest" },
    cats: { general: "General", sales: "Sales", market: "Market", bill: "Bills", staff: "Staff", other: "Other" },
    form: { desc: "Description", amount: "Amount", save: "Save", cat: "Category", date: "Date" },
    debts: { title: "Debts & Credits", new: "New Record", person: "Person Name", type: "Type", receivable: "Receivable (+)", payable: "Payable (-)", date: "Due Date" },
    goals: { title: "Goal Tracking", current: "Current", target: "Target", set: "Set Goal" },
    ai: { title: "Financial Autopilot", btnAnalyze: "Start Auto-Analysis", waiting: "AI analyzing...", warning: "Enter API Key in Settings.", intro: "AI analyzes expenses and gives advice." },
    guide: { 
      title: "User Guide", 
      sec1: "What is Boss Panel?", text1: "A secure local financial tool.",
      sec2: "Data Security", text2: "Data stored locally. No servers involved.",
      sec3: "AI Analysis", text3: "Get free analysis with Groq API key.",
      sec4: "Legal", text4: "Not financial advice. User is responsible for backups."
    },
    settings: { title: "Settings", lang: "Language", key: "API Key", security: "Security (PIN)", reset: "Reset", rates: "Rates (1 Unit = ? TRY)", recurring: "Recurring Templates", exportTitle: "Reporting", fetchLive: "Fetch Live" },
    secureLogin: "Secure Login", login: "Login"
  }
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // --- STATE ---
  const [lang, setLang] = useState('tr');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [recurringItems, setRecurringItems] = useState<any[]>([]);
  const [rates, setRates] = useState({ USD: 34, EUR: 36, GBP: 42 });
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [apiKey, setApiKey] = useState('');
  const [pin, setPin] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  // AI & Filtreler
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('newest');

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [currency, setCurrency] = useState('TRY');
  const [dateVal, setDateVal] = useState('');

  // Borç & Sabit Form
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState('alacak');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtCurrency, setDebtCurrency] = useState('TRY');
  const [debtDate, setDebtDate] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recAmount, setRecAmount] = useState('');

  // --- INIT ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const tr = JSON.parse(localStorage.getItem('transactions') || '[]');
        const db = JSON.parse(localStorage.getItem('debts') || '[]');
        const rc = JSON.parse(localStorage.getItem('recurring') || '[]');
        const rt = JSON.parse(localStorage.getItem('rates') || '{"USD":34,"EUR":36,"GBP":42}');
        const mt = JSON.parse(localStorage.getItem('monthlyTarget') || '10000');
        const k = localStorage.getItem('groqApiKey') || '';
        const p = localStorage.getItem('userPin') || '';
        let l = localStorage.getItem('appLang') || 'tr';
        const th = localStorage.getItem('theme') || 'light';

        if (!['tr', 'en'].includes(l)) l = 'en'; // Varsayılan İngilizce

        setTransactions(tr); setDebts(db); setRecurringItems(rc); setRates(rt); setMonthlyTarget(Number(mt)); setApiKey(k); setPin(p); setLang(l); setTheme(th);
        
        if (p) setIsLocked(true);
        if (th === 'dark') document.documentElement.classList.add('dark');
        
        setDateVal(new Date().toISOString().split('T')[0]);
      } catch (e) { console.error("Data error", e); }
      setIsLoaded(true);
    }
  }, []);

  const t = DICTIONARY[lang] || DICTIONARY['en']; // Sözlük Kısayolu

  // --- HELPERS ---
  const saveToLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
  const convertToTry = (amt: number, curr: string) => curr === 'TRY' ? amt : amt * (rates[curr as keyof typeof rates] || 1);
  
  const toggleLang = (l: string) => { 
    setLang(l); 
    localStorage.setItem('appLang', l); 
    // State değiştiği için React otomatik yeniden render edecek ve dil değişecek.
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if(newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // --- ACTIONS ---
  const addTransaction = () => {
    if (!desc || !amount) return alert(lang === 'tr' ? "Eksik bilgi" : "Missing info");
    const newItem = { id: Date.now(), date: new Date(dateVal).toLocaleDateString(lang==='tr'?'tr-TR':'en-US'), desc, category, amount: parseFloat(amount), currency };
    const updated = [newItem, ...transactions];
    setTransactions(updated); saveToLocal('transactions', updated);
    setDesc(''); setAmount('');
  };
  const deleteTransaction = (id: number) => { if(confirm(lang === 'tr' ? "Silinsin mi?" : "Delete?")) { const u = transactions.filter(t => t.id !== id); setTransactions(u); saveToLocal('transactions', u); } };

  const addDebt = () => {
    if(!debtName || !debtAmount) return alert(lang === 'tr' ? "Eksik bilgi" : "Missing info");
    const newDebt = { 
      id: Date.now(), 
      name: debtName, 
      type: debtType, 
      amount: parseFloat(debtAmount), 
      currency: debtCurrency, 
      date: debtDate ? new Date(debtDate).toLocaleDateString() : new Date().toLocaleDateString() 
    };
    const updated = [...debts, newDebt];
    setDebts(updated); saveToLocal('debts', updated);
    setDebtName(''); setDebtAmount('');
  };
  const deleteDebt = (id: number) => { const u = debts.filter(d => d.id !== id); setDebts(u); saveToLocal('debts', u); };

  const addRecurring = () => { if(!recDesc || !recAmount) return; const u = [...recurringItems, {id:Date.now(), desc:recDesc, amount:parseFloat(recAmount)}]; setRecurringItems(u); saveToLocal('recurring', u); setRecDesc(''); setRecAmount(''); };
  const deleteRecurring = (id: number) => { const u = recurringItems.filter(r => r.id !== id); setRecurringItems(u); saveToLocal('recurring', u); };
  const applyRecurring = () => {
    if(recurringItems.length === 0) return alert(lang === 'tr' ? "Şablon yok." : "No templates.");
    if(!confirm(lang === 'tr' ? "Sabit giderler eklensin mi?" : "Apply recurring?")) return;
    const newTrans = recurringItems.map(r => ({ id: Date.now()+Math.random(), date: new Date().toLocaleDateString(lang==='tr'?'tr-TR':'en-US'), desc: r.desc, category: 'bill', amount: r.amount, currency: 'TRY' }));
    const updated = [...newTrans, ...transactions];
    setTransactions(updated); saveToLocal('transactions', updated);
    alert(lang === 'tr' ? "İşlendi!" : "Done!");
  };

  // --- AI ---
  const runAutoPilot = async () => {
    if (!apiKey) return alert(t.ai.warning);
    setLoadingAI(true); setAiResult('');
    const inc = transactions.reduce((acc, t) => t.amount > 0 ? acc + convertToTry(t.amount, t.currency) : acc, 0);
    const exp = transactions.reduce((acc, t) => t.amount < 0 ? acc + Math.abs(convertToTry(t.amount, t.currency)) : acc, 0);
    const recent = transactions.slice(0, 5).map(x => `${x.desc}: ${x.amount}`).join(', ');
    
    // DİLE GÖRE PROMPT
    const prompt = lang === 'tr' 
      ? `Analiz et: Gelir ${inc}, Gider ${exp}. İşlemler: ${recent}. Finansal tavsiye ver.`
      : `Analyze: Income ${inc}, Expense ${exp}. Trans: ${recent}. Give financial advice.`;
    
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      setAiResult(data.choices?.[0]?.message?.content || "Error");
    } catch { setAiResult("API Error"); } finally { setLoadingAI(false); }
  };

  // --- CHART & FILTER ---
  const totalIncome = transactions.reduce((acc, t) => t.amount > 0 ? acc + convertToTry(t.amount, t.currency) : acc, 0);
  const totalExpense = transactions.reduce((acc, t) => t.amount < 0 ? acc + Math.abs(convertToTry(t.amount, t.currency)) : acc, 0);
  const netProfit = totalIncome - totalExpense;
  const chartData = { labels: [t.dash.income, t.dash.expense], datasets: [{ data: [totalIncome, totalExpense], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }] };

  // Filter
  let filteredTransactions = [...transactions];
  if(filterType === 'income') filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
  if(filterType === 'expense') filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
  if(sortType === 'newest') filteredTransactions.sort((a,b) => b.id - a.id); else filteredTransactions.sort((a,b) => a.id - b.id);

  // Lock Screen
  if (isLoaded && isLocked) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white flex-col">
      <Lock size={48} className="mb-4 text-indigo-500" /><h2 className="text-2xl font-bold mb-4">{t.settings.security}</h2>
      <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="text-black text-center text-2xl p-2 rounded mb-4 w-32" maxLength={4} />
      <button onClick={() => pinInput === pin ? setIsLocked(false) : alert("Error")} className="bg-indigo-600 px-6 py-2 rounded font-bold">{t.login}</button>
    </div>
  );

  if (!isLoaded) return <div className="flex h-screen items-center justify-center bg-gray-50"><RefreshCw className="animate-spin mr-2"/> Loading...</div>;

  // --- EXTRAS ---
  const exportToExcel = () => {
    if (transactions.length === 0) return alert(lang === 'tr' ? "Veri yok" : "No data");
    let csvContent = "\uFEFFDate;Category;Desc;Amount;Currency\n";
    transactions.forEach(t => {
      const safeDesc = t.desc.replace(/;/g, " ");
      const displayCat = DICTIONARY[lang].cats[t.category] || t.category;
      csvContent += `${t.date};${displayCat};${safeDesc};${t.amount};${t.currency}\n`;
    });
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csvContent], {type:'text/csv;charset=utf-8;'})); link.download="Report.csv"; link.click();
  };

  const printReport = () => {
    if (transactions.length === 0) return alert("No data");
    const tbody = document.getElementById('printTableBody');
    if(tbody) {
      tbody.innerHTML = '';
      transactions.forEach(t => {
        const displayCat = DICTIONARY[lang].cats[t.category] || t.category;
        tbody.innerHTML += `<tr class="border-b"><td class="p-2 border-r">${t.date}</td><td class="p-2 border-r">${displayCat}</td><td class="p-2 border-r">${t.desc}</td><td class="p-2 text-right font-bold">${t.amount} ${t.currency}</td></tr>`;
      });
      document.getElementById('printIncome')!.innerText = totalIncome.toLocaleString() + " TL";
      document.getElementById('printExpense')!.innerText = totalExpense.toLocaleString() + " TL";
      document.getElementById('printNet')!.innerText = netProfit.toLocaleString() + " TL";
      document.getElementById('printDate')!.innerText = new Date().toLocaleDateString();
      window.print();
    }
  };

  async function fetchLiveRates() {
    const btn = document.getElementById('btnFetchRates'); if(btn) btn.innerHTML = '...';
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/TRY'); const data = await res.json();
        const newRates = { USD: parseFloat((1/data.rates.USD).toFixed(2)), EUR: parseFloat((1/data.rates.EUR).toFixed(2)), GBP: parseFloat((1/data.rates.GBP).toFixed(2)) };
        setRates(newRates); saveToLocal('rates', newRates); alert(lang==='tr'?"Güncellendi":"Updated");
    } catch(e) { alert("Error"); } finally { if(btn) btn.innerHTML = t.settings.fetchLive; }
  }
  const saveRates = () => { saveToLocal('rates', rates); alert(lang==='tr'?"Kaydedildi":"Saved"); };
  const saveApiAndPin = () => { saveToLocal('groqApiKey', apiKey); if(pin.length===4) { saveToLocal('userPin', pin); savedPin=pin; } alert("Saved"); };
  const resetData = () => { if(confirm("Reset?")) { localStorage.clear(); window.location.reload(); } };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-slate-900 dark:text-gray-100 overflow-hidden font-sans">
      
      {/* YAZDIRMA ALANI */}
      <div id="printArea" className="hidden">
        <div className="text-center mb-8 border-b pb-4 mt-8"><h1 className="text-3xl font-bold mb-2">REPORT</h1><p id="printDate"></p></div>
        <div className="grid grid-cols-3 gap-4 mb-8 text-center"><div className="border p-4"><p>INCOME</p><p id="printIncome" className="font-bold"></p></div><div className="border p-4"><p>EXPENSE</p><p id="printExpense" className="font-bold"></p></div><div className="border p-4"><p>NET</p><p id="printNet" className="font-bold"></p></div></div>
        <table className="w-full text-left border-collapse border"><thead><tr class="bg-gray-100"><th class="border p-2">Date</th><th class="border p-2">Cat</th><th class="border p-2">Desc</th><th class="border p-2">Amount</th></tr></thead><tbody id="printTableBody"></tbody></table>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40 flex flex-col`}>
        <div className="p-6 text-center border-b border-gray-200 dark:border-slate-700 hidden md:block">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">BOSS v32</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Multilingual</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <MenuButton icon={<PieChart size={20} />} label={t.menu.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <MenuButton icon={<Brain size={20} />} label={t.menu.ai} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <MenuButton icon={<Wallet size={20} />} label={t.menu.debts} active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} />
            <MenuButton icon={<Target size={20} />} label={t.menu.goals} active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
            <MenuButton icon={<History size={20} />} label={t.menu.history} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <MenuButton icon={<BookOpen size={20} />} label={t.menu.guide} active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} />
            <MenuButton icon={<Settings size={20} />} label={t.menu.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="p-4 border-t flex justify-center gap-2">
            <button onClick={()=>toggleLang('tr')} className={`px-3 py-1 rounded text-xs font-bold ${lang==='tr'?'bg-indigo-600 text-white':'bg-gray-200 dark:bg-slate-700'}`}>TR</button>
            <button onClick={()=>toggleLang('en')} className={`px-3 py-1 rounded text-xs font-bold ${lang==='en'?'bg-indigo-600 text-white':'bg-gray-200 dark:bg-slate-700'}`}>EN</button>
            <button onClick={toggleTheme} className="px-2 py-1 rounded bg-gray-200 dark:bg-slate-700 text-black dark:text-white">{theme==='light'?<Moon size={14}/>:<Sun size={14}/>}</button>
        </div>
      </aside>

      {/* MOBİL BUTON */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-slate-800 p-4 shadow z-50 flex justify-between items-center border-b dark:border-slate-700">
        <h1 className="text-xl font-bold text-indigo-600">BOSS</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2"><LayoutDashboard /></button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 transition-all">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t.dash.title}</h2>
                <button onClick={applyRecurring} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"><RefreshCw size={16}/> {t.dash.processRec}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard title={t.dash.income} value={`${totalIncome.toLocaleString()} ₺`} color="green" icon={<ArrowUp />} />
              <StatsCard title={t.dash.expense} value={`${totalExpense.toLocaleString()} ₺`} color="red" icon={<ArrowDown />} />
              <StatsCard title={t.dash.net} value={`${netProfit.toLocaleString()} ₺`} color="blue" icon={<Wallet />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm h-fit">
                <h3 className="text-lg font-bold mb-4">{t.dash.quickAdd}</h3>
                <div className="space-y-4">
                  <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.form.desc} className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" />
                  <div className="flex gap-2">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-1/2 p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl">
                        {Object.keys(t.cats).map(k => <option key={k} value={k}>{t.cats[k]}</option>)}
                    </select>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-1/4 p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl"><option>TRY</option><option>USD</option><option>EUR</option><option>GBP</option></select>
                    <input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} className="w-1/4 p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" />
                  </div>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t.form.amount} className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" />
                  <button onClick={addTransaction} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl">{t.form.save}</button>
                </div>
              </div>
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                <div className="h-64 w-full flex justify-center"><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{t.dash.lastTrans}</h3>
                  <div className="flex gap-2">
                      <select onChange={(e)=>setFilterType(e.target.value)} className="p-2 text-sm border rounded dark:bg-slate-700 dark:text-white"><option value="all">{t.filter.all}</option><option value="income">{t.filter.income}</option><option value="expense">{t.filter.expense}</option></select>
                      <select onChange={(e)=>setSortType(e.target.value)} className="p-2 text-sm border rounded dark:bg-slate-700 dark:text-white"><option value="newest">{t.filter.dateNew}</option><option value="oldest">{t.filter.dateOld}</option></select>
                  </div>
              </div>
              <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-slate-700 uppercase text-xs text-gray-500 dark:text-gray-400"><tr><th className="p-3">Info</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{filteredTransactions.map((t: any) => (<tr key={t.id} className="border-b dark:border-slate-700"><td className="p-3"><div>{t.desc}</div><div className="text-xs text-gray-500">{t.date} - {t.cats ? t.cats[t.category] : t.category}</div></td><td className={`p-3 text-right font-bold ${t.amount>0?'text-green-500':'text-red-500'}`}>{t.amount} {t.currency}</td><td className="p-3 text-right"><button onClick={()=>deleteTransaction(t.id)}><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
            </div>
          </div>
        )}

        {/* DEBTS */}
        {activeTab === 'debts' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm h-fit">
                    <h3 className="font-bold mb-4">{t.debts.new}</h3>
                    <div className="space-y-4">
                        <input type="text" value={debtName} onChange={(e)=>setDebtName(e.target.value)} placeholder={t.debts.person} className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" />
                        <select value={debtType} onChange={(e)=>setDebtType(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl"><option value="alacak">{t.debts.receivable}</option><option value="borc">{t.debts.payable}</option></select>
                        <div className="flex gap-2"><input type="number" value={debtAmount} onChange={(e)=>setDebtAmount(e.target.value)} placeholder={t.form.amount} className="w-2/3 p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" /><select value={debtCurrency} onChange={(e)=>setDebtCurrency(e.target.value)} className="w-1/3 p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl"><option>TRY</option><option>USD</option><option>EUR</option></select></div>
                        <input type="date" value={debtDate} onChange={(e)=>setDebtDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white border dark:border-slate-600 rounded-xl" />
                        <button onClick={addDebt} className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold">{t.form.save}</button>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm"><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-slate-700 uppercase text-xs text-gray-500 dark:text-gray-400"><tr><th className="p-3">{t.debts.person}</th><th className="p-3">{t.debts.type}</th><th className="p-3">{t.form.amount}</th><th className="p-3">Sil</th></tr></thead><tbody>{debts.map(d=><tr key={d.id} className="border-b dark:border-slate-700"><td className="p-3">{d.name}</td><td className="p-3">{d.type}</td><td className="p-3">{d.amount} {d.currency}</td><td className="p-3"><button onClick={()=> {const u=debts.filter(x=>x.id!==d.id); setDebts(u); saveToLocal('debts',u)}}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>
            </div>
        )}

        {/* AI */}
        {activeTab === 'ai' && (
            <div className="animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-center">
                <Brain size={64} className="mx-auto text-indigo-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">{t.ai.title}</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{t.ai.intro}</p>
                <button onClick={runAutoPilot} disabled={loadingAI} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition font-bold text-lg flex items-center gap-3 mx-auto disabled:opacity-50">{loadingAI ? <RefreshCw className="animate-spin"/> : <Brain />} {loadingAI ? '...' : t.ai.btnAnalyze}</button>
                {aiResult && <div className="mt-8 text-left max-w-3xl mx-auto bg-gray-50 dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-700 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(aiResult) }} />}
            </div>
        )}

        {/* GOALS */}
        {activeTab === 'goals' && (
            <div className="animate-fade-in bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-xl mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center">{t.goals.title}</h2>
                <div className="flex justify-between mb-2"><span>{t.goals.target}: {monthlyTarget.toLocaleString()} ₺</span><span>{t.goals.current}: {netProfit.toLocaleString()} ₺</span></div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-6 mb-8 relative"><div className="bg-blue-600 h-6 rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.max((netProfit/monthlyTarget)*100, 0), 100)}%` }}></div></div>
                <label className="block mb-2 text-sm text-gray-500">{t.goals.set}:</label>
                <input type="range" min="1000" max="100000" step="500" value={monthlyTarget} onChange={(e) => {setMonthlyTarget(Number(e.target.value)); saveToLocal('monthlyTarget', e.target.value)}} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                <input type="number" value={monthlyTarget} onChange={(e) => {setMonthlyTarget(Number(e.target.value)); saveToLocal('monthlyTarget', e.target.value)}} className="w-full mt-4 p-3 bg-gray-50 dark:bg-slate-700 border rounded-xl text-center font-bold dark:text-white" />
            </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
            <div className="animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold mb-6">{t.menu.history}</h2>
                <table className="w-full text-left"><thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 uppercase text-xs"><tr><th className="p-3">{t.form.date}</th><th className="p-3">{t.form.cat}</th><th className="p-3">{t.form.desc}</th><th className="p-3">{t.form.amount}</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id} className="border-b dark:border-slate-700"><td className="p-3">{t.date}</td><td className="p-3">{t.category}</td><td className="p-3">{t.desc}</td><td className="p-3">{t.amount} {t.currency}</td></tr>)}</tbody></table>
            </div>
        )}

        {/* GUIDE */}
        {activeTab === 'guide' && (
            <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border-l-4 border-indigo-500">
                    <h2 className="text-2xl font-bold mb-4">{t.guide.title}</h2>
                    <p className="mb-4">{t.guide.text1}</p>
                    <h3 className="font-bold mt-4 mb-2">{t.guide.sec2}</h3>
                    <p>{t.guide.text2}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><Brain className="text-orange-500"/> {t.guide.sec3}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.guide.text3}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                        <h3 className="font-bold mb-2">{t.guide.sec4}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.guide.text4}</p>
                    </div>
                </div>
            </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4">{t.settings.key} (Groq)</h3>
                    <div className="flex gap-2"><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="gsk_..." className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white" /><button onClick={() => {saveToLocal('groqApiKey', apiKey); alert("OK")}} className="bg-green-600 text-white px-4 rounded-lg"><Save size={18}/></button></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
                    <h3 className="font-bold mb-4">{t.settings.recurring}</h3>
                    <div className="flex gap-2 mb-4"><input placeholder="Kira" value={recDesc} onChange={(e)=>setRecDesc(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white"/><input placeholder="-5000" value={recAmount} onChange={(e)=>setRecAmount(e.target.value)} type="number" className="w-24 p-2 border rounded dark:bg-slate-700 dark:text-white"/><button onClick={addRecurring} className="bg-indigo-600 text-white px-4 rounded">+</button></div>
                    <ul>{recurringItems.map(r=><li key={r.id} className="flex justify-between text-sm p-2 border-b dark:border-slate-700"><span>{r.desc} ({r.amount})</span><button onClick={()=>deleteRecurring(r.id)} className="text-red-500">x</button></li>)}</ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4">{t.settings.rates}</h3>
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center"><label>USD:</label><input type="number" value={rates.USD} onChange={(e)=>setRates({...rates, USD: parseFloat(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white"/></div>
                        <div className="flex gap-2 items-center"><label>EUR:</label><input type="number" value={rates.EUR} onChange={(e)=>setRates({...rates, EUR: parseFloat(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white"/></div>
                        <button onClick={()=>{saveToLocal('rates', rates); fetchLiveRates()}} className="w-full bg-yellow-600 text-white p-2 rounded mt-2 flex justify-center items-center gap-2"><RefreshCw size={16}/> {t.settings.fetchLive}</button>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4">{t.settings.exportTitle}</h3>
                    <div className="flex gap-2">
                        <button onClick={exportToExcel} className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Download size={16}/> Excel</button>
                        <button onClick={printReport} className="flex-1 bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Printer size={16}/> PDF</button>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4">{t.settings.security}</h3>
                    <div className="flex gap-2"><input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="PIN" /><button onClick={() => {saveToLocal('userPin', pin); alert("OK")}} className="bg-blue-600 text-white px-4 rounded-lg"><Lock size={18}/></button></div>
                    <button onClick={resetData} className="w-full mt-4 border border-red-500 text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">{t.settings.reset}</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

function MenuButton({ icon, label, active, onClick }: any) {
  return <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>{icon} <span className="ml-3">{label}</span></button>;
}

function StatsCard({ title, value, color, icon }: any) {
  const colors: any = { green: "from-green-500 to-emerald-700", red: "from-red-500 to-rose-700", blue: "from-blue-500 to-indigo-700" };
  return <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-2xl shadow-lg text-white transform transition hover:-translate-y-1`}><div className="flex justify-between items-center"><div><p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p><h3 className="text-3xl font-bold mt-1">{value}</h3></div><div className="bg-white/20 p-3 rounded-full text-white">{icon}</div></div></div>;
}