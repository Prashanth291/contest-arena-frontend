'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/lib/types';
import styles from './Toast.module.css';

// ── Global toast state (singleton pattern) ────────────

type ToastListener = (toasts: ToastType[]) => void;

let toasts: ToastType[] = [];
let listeners: ToastListener[] = [];

function notifyListeners() {
  listeners.forEach(l => l([...toasts]));
}

export function toast(message: string, type: ToastVariant = 'info', duration = 4000) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastType = { id, type, message, duration };
  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
}

export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

// Convenience methods
toast.success = (msg: string, duration?: number) => toast(msg, 'success', duration);
toast.error = (msg: string, duration?: number) => toast(msg, 'error', duration);
toast.info = (msg: string, duration?: number) => toast(msg, 'info', duration);
toast.warning = (msg: string, duration?: number) => toast(msg, 'warning', duration);

// ── Icon map ──────────────────────────────────────────

const icons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// ── Toast Container Component ─────────────────────────

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter(l => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {currentToasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type]}`}
            role="alert"
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.message}>{t.message}</span>
            <button
              className={styles.close}
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
