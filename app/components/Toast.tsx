// components/Toast.tsx
import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
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
        <button 
          onClick={onClose} 
          className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors opacity-40 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};