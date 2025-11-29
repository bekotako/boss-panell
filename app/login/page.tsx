"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, UserPlus, LogIn, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

// --- DİL SÖZLÜĞÜ ---
const DICTIONARY: any = {
  tr: {
    welcome: "Boss Panel",
    subtitle_in: "Tekrar Hoş Geldiniz",
    subtitle_up: "Profesyonel Hesap Oluştur",
    email: "E-Posta Adresi",
    pass: "Şifre",
    pass_rep: "Şifre Tekrar",
    btn_login: "Giriş Yap",
    btn_signup: "Hesap Oluştur",
    switch_to_up: "Hesabın yok mu? Hemen kayıt ol",
    switch_to_in: "Zaten hesabın var mı? Giriş yap",
    or: "veya",
    footer: "© 2025 Boss Panel Inc. Güvenli & Şifreli.",
    err_match: "Şifreler uyuşmuyor!",
    err_len: "En az 6 karakter olmalı.",
    err_upper: "En az 1 büyük harf (A-Z).",
    err_num: "En az 1 rakam (0-9).",
    err_sym: "En az 1 sembol (!@#$).",
    success_create: "Hesap oluşturuldu! Giriş yapılıyor...",
    success_mail: "Kayıt başarılı! Lütfen e-postanızı kontrol edin.",
    err_cred: "Hatalı e-posta veya şifre."
  },
  en: {
    welcome: "Boss Panel",
    subtitle_in: "Welcome Back",
    subtitle_up: "Create Professional Account",
    email: "Email Address",
    pass: "Password",
    pass_rep: "Confirm Password",
    btn_login: "Login",
    btn_signup: "Create Account",
    switch_to_up: "No account? Sign up now",
    switch_to_in: "Already have an account? Login",
    or: "or",
    footer: "© 2025 Boss Panel Inc. Secure & Encrypted.",
    err_match: "Passwords do not match!",
    err_len: "Min 6 characters required.",
    err_upper: "Min 1 uppercase letter (A-Z).",
    err_num: "Min 1 number (0-9).",
    err_sym: "Min 1 symbol (!@#$).",
    success_create: "Account created! Logging in...",
    success_mail: "Registration successful! Please check your email.",
    err_cred: "Invalid email or password."
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('tr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | 'warning'>('error');

  // --- BAŞLANGIÇTA DİL YÜKLE ---
  useEffect(() => {
    const savedLang = localStorage.getItem('appLang');
    if (savedLang && ['tr', 'en'].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  const t = DICTIONARY[lang];

  // --- DİL DEĞİŞTİRME ---
  const toggleLang = (l: string) => {
    setLang(l);
    localStorage.setItem('appLang', l);
    setMsg(''); // Dil değişince eski mesajı sil
  };

  // --- ŞİFRE KONTROLÜ ---
  const validatePassword = (pass: string) => {
    if (pass.length < 6) return t.err_len;
    if (!/[A-Z]/.test(pass)) return t.err_upper;
    if (!/[0-9]/.test(pass)) return t.err_num;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return t.err_sym;
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (isSignUp) {
        if (password !== confirmPassword) {
            setMsgType('warning'); setMsg(t.err_match); setLoading(false); return;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
            setMsgType('warning'); setMsg(passwordError); setLoading(false); return;
        }
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsgType('success');
        setMsg(t.success_create);
        if(data.session) setTimeout(() => router.push('/'), 1500);
        else setMsg(t.success_mail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); 
        router.refresh();
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg(error.message.includes("Invalid login") ? t.err_cred : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-4 relative overflow-hidden font-sans">
      
      {/* DİL BUTONLARI (SAĞ ÜST) */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button onClick={() => toggleLang('tr')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'tr' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>TR</button>
        <button onClick={() => toggleLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>EN</button>
      </div>

      {/* Arka Plan Efektleri */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700/50 relative z-10 transition-all duration-500 ease-in-out">
        
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition duration-300">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t.welcome}
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {isSignUp ? t.subtitle_up : t.subtitle_in}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.email}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-white placeholder:text-slate-600"
                placeholder="user@example.com" required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.pass}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-white placeholder:text-slate-600"
                placeholder="••••••••" required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="animate-fade-in-down">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.pass_rep}</label>
                <div className="relative group">
                <CheckCircle2 className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-green-400 transition" size={20} />
                <input 
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 p-3.5 bg-slate-800/50 border rounded-xl focus:ring-2 outline-none transition text-white placeholder:text-slate-600 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500'}`}
                    placeholder="••••••••" required
                />
                </div>
            </div>
          )}

          {msg && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${msgType === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : msgType === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               <div className="mt-0.5">
                 {msgType === 'warning' ? <AlertCircle size={16} /> : msgType === 'success' ? <ShieldCheck size={16} /> : <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>}
               </div>
               <span>{msg}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? t.btn_signup : t.btn_login)}
            {!loading && (isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />)}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">{t.or}</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>
          <button onClick={() => { setIsSignUp(!isSignUp); setMsg(''); setConfirmPassword(''); }} className="mt-2 text-sm text-slate-400 hover:text-white transition font-medium flex items-center justify-center gap-2 mx-auto hover:underline decoration-indigo-500 decoration-2 underline-offset-4">
            {isSignUp ? t.switch_to_in : t.switch_to_up} <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-600">{t.footer}</div>
      </div>
    </div>
  );
}