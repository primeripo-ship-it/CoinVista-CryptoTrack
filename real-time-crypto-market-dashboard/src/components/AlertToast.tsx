/**
 * AlertToast Component
 * Shows triggered price alerts as toast notifications
 */
import React, { useEffect, useState } from 'react';
import { useCryptoStore, PriceAlert } from '../store/useCryptoStore';

interface ToastItem {
  alert: PriceAlert;
  visible: boolean;
}

export const AlertToast: React.FC = () => {
  const { alerts, darkMode } = useCryptoStore();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  // Watch for newly triggered alerts
  useEffect(() => {
    const triggered = alerts.filter((a) => a.triggered && !shownIds.has(a.id));
    if (triggered.length > 0) {
      const newToasts = triggered.map((alert) => ({ alert, visible: true }));
      setToasts((prev) => [...prev, ...newToasts]);
      setShownIds((prev) => {
        const next = new Set(prev);
        triggered.forEach((a) => next.add(a.id));
        return next;
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) =>
            triggered.some((a) => a.id === t.alert.id) ? { ...t, visible: false } : t
          )
        );
      }, 5000);

      // Remove from DOM after animation
      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((t) => !triggered.some((a) => a.id === t.alert.id))
        );
      }, 5500);
    }
  }, [alerts, shownIds]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.alert.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-500 max-w-sm ${
            toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          } ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-sm font-bold">{toast.alert.coinName}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Price went {toast.alert.direction} ${toast.alert.targetPrice.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
