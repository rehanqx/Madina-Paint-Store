'use client';

import React, { createContext, useState, useCallback, useMemo } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
  }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container Element */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Internal Toast Container to display toasts stacked in the top-right corner
function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Item with animations and color coding
function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const { id, message, type } = toast;

  // Icon and Color configuration
  const config = {
    success: {
      bg: 'bg-emerald-600 border-emerald-700',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-600 border-red-700',
      icon: '⚠',
    },
    warning: {
      bg: 'bg-amber-500 border-amber-600',
      icon: '⚡',
    },
    info: {
      bg: 'bg-blue-600 border-blue-700',
      icon: 'ℹ',
    },
  }[type];

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border text-white font-semibold shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in ${config.bg}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg bg-white/20 w-6 h-6 flex items-center justify-center rounded-full select-none font-bold">
          {config.icon}
        </span>
        <span className="text-sm leading-normal">{message}</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white text-lg font-light focus:outline-none cursor-pointer px-1 rounded hover:bg-white/10 transition"
        aria-label="Close Notification"
      >
        &times;
      </button>
    </div>
  );
}
