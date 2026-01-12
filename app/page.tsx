'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Trash2, TrendingUp, TrendingDown, Settings2, User, Sun, Moon, 
  Target, Sparkles, Timer, AlertCircle, LogOut, ChevronDown, Check, 
  Activity, Clock, Coins, Camera, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- ELEGANT TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[5000] animate-in fade-in slide-in-from-top duration-500 px-4 w-full max-w-fit">
    <div className={`px-6 py-4 rounded-[2.5rem] backdrop-blur-2xl border flex items-center gap-3 shadow-2xl transition-all ${
      type === 'success' 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    }`}>
      <div className={`p-1.5 rounded-full ${type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
        {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">{message}</p>
      <button onClick={onClose} className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors opacity-40 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  </div>
);

export default function FinanceDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [currency, setCurrency] = useState<'TSh' | 'USD'>('TSh');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [intelView, setIntelView] = useState<'expense' | 'income'>('expense');
  const [chartAnimate, setChartAnimate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(''); 
  const [newCategory, setNewCategory] = useState('General'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expenseCategories = ['General', 'Food', 'Transport', 'Rent', 'Utilities', 'Subscription', 'Health', 'Shopping', 'Emergency', 'Fun'];
  const incomeCategories = ['Salary', 'Side Hustle', 'Gift', 'Investment', 'Bonus', 'Freelance'];

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); 
      } else { 
        setUser(user); 
        fetchTransactions(); 
      }
    };
    checkUser();
    
    const savedTheme = localStorage.getItem('nelly_theme');
    if (savedTheme) setTheme(savedTheme as any);
    const savedCurrency = localStorage.getItem('nelly_currency');
    if (savedCurrency) setCurrency(savedCurrency as any);

    setTimeout(() => setChartAnimate(true), 500);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  // Auto-hide Toast after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function fetchTransactions() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', firstDayOfMonth)
      .lte('created_at', lastDayOfMonth)
      .order('created_at', { ascending: false });
      
    if (data) setTransactions(data);
  }

  const handleUploadProfile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '0', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: finalUrl }
      });

      if (updateError) throw updateError;
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setNotification({ msg: 'Identity Updated', type: 'success' });
    } catch (error: any) {
      setNotification({ msg: 'Security Policy Violation', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat().format(Number(num));
  };

  const handleSave = async () => {
    if (!newName || !newAmount || !user) return;
    triggerHaptic();
    const numericAmount = parseFloat(newAmount.replace(/\D/g, ''));
    const finalAmount = entryType === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const { error } = await supabase.from('transactions').insert([{ 
      item_name: `${newCategory}: ${newName}`, 
      amount: finalAmount, 
      type: entryType,
      user_id: user.id
    }]);
    if (!error) { 
      setNewName(''); 
      setNewAmount(''); 
      setIsModalOpen(false); 
      setNotification({ msg: 'Entry Secured', type: 'success' });
      fetchTransactions(); 
    } else {
      setNotification({ msg: 'Verification Failed', type: 'error' });
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
        setNotification({ msg: 'Record Purged', type: 'success' });
        fetchTransactions();
    } else {
        setNotification({ msg: 'Action Denied', type: 'error' });
    }
  }

  // Calculations
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthlyTarget = totalIncome || 0; 
  const netBalance = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const dailyBurnRef = monthlyTarget > 0 ? (monthlyTarget / 30) : 0;
  const runwayDays = netBalance > 0 && dailyBurnRef > 0 ? Math.floor(netBalance / dailyBurnRef) : 0;

  const todayExpense = Math.abs(transactions
    .filter(t => t.amount < 0 && new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.amount, 0));
  
  const isOverBurn = todayExpense > dailyBurnRef && dailyBurnRef > 0;

  const trendData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayNet = transactions
        .filter(t => t.created_at.split('T')[0] === date)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return { date, value: dayNet };
    });
  }, [transactions]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    const filtered = intelView === 'expense' ? transactions.filter(t => t.amount < 0) : transactions.filter(t => t.amount > 0);
    filtered.forEach(t => {
      const cat = t.item_name.split(':')[0] || 'General';
      stats[cat] = (stats[cat] || 0) + Math.abs(t.amount);
    });
    const total = filtered.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    return Object.entries(stats).map(([name, value]) => ({ 
      name, value, percent: total > 0 ? (value / total) * 100 : 0 
    })).sort((a, b) => b.value - a.value);
  }, [transactions, intelView]);

  if (!mounted || !user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url;
  const glassClass = theme === 'dark' 
    ? "bg-zinc-900/40 border border-white/10 backdrop-blur-[40px] rounded-[2.5rem] text-white shadow-2xl" 
    : "bg-white/60 border border-black/5 backdrop-blur-[40px] rounded-[2.5rem] text-zinc-900 shadow-lg";

  return (
    <div className={`min-h-screen transition-all duration-700 pb-44 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f8f9fa]'}`}>
      
      {/* ADDED: Toast Notification UI */}
      {notification && (
        <Toast 
          message={notification.msg} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadProfile} />
      
      <header className="max-w-5xl mx-auto p-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer group transition-all ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-white shadow-sm'}`}
          >
            {uploading ? <Loader2 className="animate-spin text-indigo-500" size={20}/> : avatarUrl ? (
                <img src={avatarUrl} alt="profile" className="h-full w-full object-cover" />
            ) : <User className="text-indigo-500" size={24} />}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{displayName} Ledger</h1>
            <p className={`text-sm font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Workspace</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`md:col-span-8 p-12 ${glassClass} relative overflow-hidden group`}>
            <Sparkles className="absolute top-8 right-8 text-indigo-500/10" size={40} />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Monthly Balance</p>
            <h2 className={`text-6xl font-bold tracking-tighter transition-all ${privacyMode ? 'blur-2xl' : ''}`}>
              <span className="text-2xl font-light opacity-30 mr-2">{currency}</span>
              {netBalance.toLocaleString()}
            </h2>
          </div>
          <div className={`md:col-span-4 p-10 flex flex-col justify-center ${glassClass} transition-colors ${runwayDays < 5 ? 'border-rose-500/40' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 opacity-50"><Timer size={12}/> Daily Runway</p>
              <h3 className={`text-5xl font-black tracking-tighter ${runwayDays < 5 ? 'text-rose-500' : ''}`}>{runwayDays}<span className="text-sm uppercase ml-2 opacity-40">Days</span></h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-8 ${glassClass} border-indigo-500/20 bg-indigo-500/5`}>
                <div className="flex items-center gap-2 mb-4 text-indigo-400"><Target size={14}/><span className="text-[9px] font-black uppercase tracking-widest">Month Revenue</span></div>
                <p className="text-2xl font-bold tracking-tight">{currency} {monthlyTarget.toLocaleString()}</p>
            </div>
            <div className={`p-8 ${glassClass} border-amber-500/20 bg-amber-500/5`}>
                <div className="flex items-center gap-2 mb-4 text-amber-500"><Timer size={14}/><span className="text-[9px] font-black uppercase tracking-widest">Weekly Limit</span></div>
                <p className="text-2xl font-bold tracking-tight">{currency} {Math.round(monthlyTarget / 4).toLocaleString()}</p>
            </div>
            <div className={`p-8 transition-all duration-500 ${glassClass} ${isOverBurn ? 'border-rose-600 bg-rose-600/10 animate-pulse' : 'border-rose-400/20 bg-rose-400/5'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 ${isOverBurn ? 'text-rose-600' : 'text-rose-400'}`}>
                        <AlertCircle size={14}/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Daily Burn</span>
                    </div>
                </div>
                <p className={`text-2xl font-bold tracking-tight ${isOverBurn ? 'text-rose-600' : ''}`}>{currency} {Math.round(dailyBurnRef).toLocaleString()}</p>
            </div>
        </div>

        <div className={`p-8 ${glassClass}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 opacity-40">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'long' })} Ledger</span>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-4 rounded-[1.8rem] border transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {t.amount > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{t.item_name.split(': ')[1] || t.item_name}</p>
                      <p className="text-[8px] font-bold opacity-30 uppercase">{t.item_name.split(': ')[0]} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs font-black ${t.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{t.amount > 0 ? '+' : ''}{Math.abs(t.amount).toLocaleString()}</p>
                    <button onClick={() => deleteTransaction(t.id)} className="opacity-10 hover:opacity-100 hover:text-rose-500 transition-all p-1"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em] italic">No Entries This Month</div>
            )}
          </div>
        </div>

        <div className={`p-8 ${glassClass}`}>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Month Breakdown</h3>
                <div className={`flex p-1 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-black/5 border-black/5'}`}>
                    <button onClick={() => setIntelView('expense')} className={`px-4 py-2 text-[9px] font-black rounded-lg transition-all ${intelView === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>BURN</button>
                    <button onClick={() => setIntelView('income')} className={`px-4 py-2 text-[9px] font-black rounded-lg transition-all ${intelView === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>REVENUE</button>
                </div>
            </div>
            {categoryStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {categoryStats.map((stat) => (
                      <div key={stat.name}>
                          <div className="flex justify-between items-center text-[9px] font-black uppercase mb-3">
                              <span className="opacity-50">{stat.name}</span>
                              <span>{currency} {stat.value.toLocaleString()}</span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                              <div className={`h-full transition-all duration-1000 ${intelView === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${stat.percent}%` }} />
                          </div>
                      </div>
                  ))}
              </div>
            ) : (
              <p className="text-[10px] font-bold opacity-20 uppercase tracking-widest text-center py-10 italic">Waiting for data...</p>
            )}
        </div>

        <div className={`p-8 ${glassClass}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 opacity-40">
                <Activity size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recent Fiscal Flow</span>
            </div>
          </div>
          <div className="h-32 flex items-center gap-3 px-2">
            {trendData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-center h-full gap-2">
                <div 
                  className={`w-full rounded-xl transition-all duration-1000 ease-out ${d.value >= 0 ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`} 
                  style={{ height: chartAnimate ? `${Math.max(10, Math.min(85, (Math.abs(d.value) / (monthlyTarget || 100000)) * 100))}%` : '0%' }} 
                />
                <span className="text-[8px] font-bold opacity-20">{d.date.split('-')[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-fit px-6 pointer-events-none">
        <div className={`flex items-center gap-4 p-3 px-6 rounded-[2.5rem] border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[60px] transition-all duration-500 pointer-events-auto ${
          theme === 'dark' ? 'bg-zinc-900/40 border-white/20' : 'bg-white/70 border-black/10'
        }`}>
          <button onClick={() => { const n = theme === 'dark' ? 'light' : 'dark'; setTheme(n); localStorage.setItem('nelly_theme', n); }} className={`p-4 rounded-2xl transition-all active:scale-75 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-zinc-900'}`}>
            {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Record</button>
          <button onClick={() => setIsSettingsOpen(true)} className={`p-4 rounded-2xl transition-all active:scale-75 ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-zinc-900'}`}>
            <Settings2 size={20}/>
          </button>
        </div>
      </div>

      {isSettingsOpen && (
          <div className="fixed inset-0 z-[2000] flex justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
              <div className={`relative w-80 h-full p-10 border-l animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-black/5 text-zinc-900'}`}>
                  <div className="flex justify-between items-center mb-12">
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-indigo-500">System Config</h2>
                      <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-6">
                      <div className={`p-6 border rounded-[2rem] space-y-4 ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <div className="h-20 w-20 rounded-full border-2 border-indigo-500/20 overflow-hidden relative">
                                {avatarUrl ? <img src={avatarUrl} key={avatarUrl} className="h-full w-full object-cover" alt="avatar" /> : <User className="h-full w-full p-4 opacity-20" />}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                                {uploading ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
                                Update Photo
                            </button>
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Coins size={12}/> Global Currency</p>
                        <div className="grid grid-cols-2 gap-2">
                           {['TSh', 'USD'].map((curr) => (
                             <button key={curr} onClick={() => { setCurrency(curr as any); localStorage.setItem('nelly_currency', curr); }} className={`py-3 rounded-xl text-[10px] font-black transition-all ${currency === curr ? 'bg-indigo-600 text-white shadow-lg' : 'bg-black/20 text-slate-400'}`}>{curr}</button>
                           ))}
                        </div>
                      </div>

                      <div className={`p-6 border rounded-[2rem] space-y-4 ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Privacy Controls</p>
                        <button onClick={() => setPrivacyMode(!privacyMode)} className="w-full flex justify-between items-center text-[10px] font-black uppercase">
                            <span>Mask Balances</span>
                            <div className={`h-6 w-12 rounded-full transition-all flex items-center px-1 ${privacyMode ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                <div className={`h-4 w-4 bg-white rounded-full transition-all ${privacyMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </button>
                      </div>
                      <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="w-full p-6 border border-rose-500/20 rounded-[2rem] text-[10px] font-black uppercase text-rose-500 flex items-center justify-between bg-rose-500/5 hover:bg-rose-500/10">Sign Out <LogOut size={14}/></button>
                  </div>
              </div>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[1000] p-4">
          <div className={`w-full max-w-sm rounded-[3.5rem] p-10 border shadow-2xl animate-in zoom-in-95 duration-200 ${
            theme === 'dark' ? 'bg-zinc-950/90 border-white/10 text-white' : 'bg-white/95 border-black/5 text-zinc-900'
          }`}>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-[11px] font-black uppercase text-indigo-500 tracking-widest">Secure Entry</h2>
                <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-zinc-900'}`}><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className={`flex p-1 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-black/5 border-black/5'}`}>
                <button onClick={() => {setEntryType('expense'); setNewCategory('General');}} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black transition-all ${entryType === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>EXPENSE</button>
                <button onClick={() => {setEntryType('income'); setNewCategory('Salary');}} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black transition-all ${entryType === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>INCOME</button>
              </div>
              <div className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex justify-between items-center w-full border rounded-[2.5rem] p-4 px-6 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-black/5 border-black/5 text-zinc-900 hover:bg-black/10'}`}>
                    {newCategory}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-2 z-[1100] max-h-64 overflow-y-auto rounded-[2rem] border shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-black/10 text-zinc-900'}`}>
                      {(entryType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                        <div key={cat} onClick={() => {setNewCategory(cat); setIsDropdownOpen(false);}} className="flex items-center justify-between p-4 px-6 rounded-[1.5rem] text-[10px] font-bold uppercase cursor-pointer hover:bg-indigo-600 hover:text-white transition-colors">{cat}{newCategory === cat && <Check size={14} />}</div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="text" placeholder="What is this for?" value={newName} onChange={(e) => setNewName(e.target.value)} className={`w-full border rounded-[2.5rem] p-4 px-6 text-[11px] font-bold outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20' : 'bg-black/5 border-black/5 text-zinc-900 placeholder:text-black/20'}`} />
                <div className={`relative flex items-center border-b mt-4 mb-6 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                  <span className={`text-lg font-black opacity-30 mr-3 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{currency}</span>
                  <input type="text" inputMode="numeric" placeholder="0" value={formatWithCommas(newAmount)} onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))} className={`w-full bg-transparent text-4xl font-black text-right outline-none py-4 ${theme === 'dark' ? 'text-white placeholder:text-white/10' : 'text-zinc-900 placeholder:text-black/10'}`} />
                </div>
              </div>
              <button onClick={handleSave} className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${entryType === 'expense' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>Confirm Entry</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(128, 128, 128, 0.2) transparent; }
      `}</style>
    </div>
  );
}