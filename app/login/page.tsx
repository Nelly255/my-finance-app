'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Mail, Loader2, Moon, Sun, 
  ShieldCheck, ArrowRight, X, Check, AlertCircle 
} from 'lucide-react';

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

// --- MAIN LOGIN PAGE ---
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // 1. Handle System Theme Detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 2. Auto-hide Toast after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 3. Passwordless Auth Logic
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setNotification({ msg: error.message, type: 'error' });
      setLoading(false);
    } else {
      setNotification({ msg: 'Access link sent to your inbox', type: 'success' });
      setLoading(false);
    }
  };

  const glassClass = "backdrop-blur-[40px] rounded-[3.5rem] border shadow-2xl transition-all duration-700 " + 
    "dark:bg-zinc-900/40 dark:border-white/10 dark:text-white " + 
    "bg-white/60 border-black/5 text-zinc-900";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-700 dark:bg-[#050505] bg-[#f8f9fa]">
      
      {/* Elegant Notification Pop-up */}
      {notification && (
        <Toast 
          message={notification.msg} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className={`w-full max-w-md p-12 ${glassClass}`}>
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 text-indigo-500 dark:text-indigo-400">Identity Verification</h1>
          <p className="text-3xl font-black tracking-tighter uppercase text-center">Secure Ledger</p>
          <p className="text-[10px] font-medium opacity-30 mt-1 uppercase tracking-widest text-center">Passwordless Entry System</p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" size={18} />
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-16 pr-8 py-5 rounded-[2.2rem] text-[11px] font-bold outline-none border transition-all
                dark:bg-white/5 dark:border-white/5 dark:text-white dark:focus:border-indigo-500/50
                bg-black/5 border-black/5 text-zinc-900 focus:border-indigo-500/50 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <span>Request Access</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t dark:border-white/5 border-black/5 flex flex-col items-center gap-4">
          <p className="text-[9px] font-medium opacity-40 text-center leading-relaxed max-w-[200px] uppercase tracking-tighter">
            An encrypted authentication link will be sent to your inbox.
          </p>
          
          <div className="w-full flex justify-between items-center px-2 pt-4">
            <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest flex items-center gap-2">
              {systemTheme === 'dark' ? <Moon size={12}/> : <Sun size={12}/>}
              System Sync
            </p>
            <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
              v2.1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}