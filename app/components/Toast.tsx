'use client';

import { ReactNode, useState, useCallback, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
};

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType, duration?: number) => void;
}>({ toast: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100001] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => {
          const colors =
            t.type === 'success'
              ? 'bg-green-500 text-white'
              : t.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-orange-500 text-white';

          const icons =
            t.type === 'success'
              ? '🔥'
              : t.type === 'error'
              ? '⚠️'
              : '🚑';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto animate-in slide-in-from-top duration-300 ${colors} px-6 py-3 rounded-full shadow-2xl border border-white/20 font-black italic uppercase text-[10px] tracking-widest max-w-[95vw] break-words`}
              onClick={() => dismiss(t.id)}
            >
              {icons} {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
