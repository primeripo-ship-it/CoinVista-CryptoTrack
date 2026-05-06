/**
 * PriceAlertForm Component
 * Allows users to set price alerts for a coin
 * Stored in localStorage, checked on each data refresh
 */
import React, { useState } from 'react';
import { useCryptoStore } from '../store/useCryptoStore';
import { formatPrice } from '../utils/formatters';

interface PriceAlertFormProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
  onClose: () => void;
}

export const PriceAlertForm: React.FC<PriceAlertFormProps> = ({
  coinId,
  coinName,
  currentPrice,
  onClose,
}) => {
  const { darkMode, addAlert, alerts, removeAlert } = useCryptoStore();
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const coinAlerts = alerts.filter((a) => a.coinId === coinId && !a.triggered);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    addAlert({ coinId, coinName, targetPrice: price, direction });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    setTargetPrice(currentPrice.toString());
  };

  return (
    <div className={`mb-6 rounded-2xl border p-4 sm:p-6 ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🔔 Price Alerts for {coinName}
        </h3>
        <button onClick={onClose} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-4">
        <div className="flex-1">
          <label className={`text-xs font-medium block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Alert when price goes
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            className={`w-full px-3 py-2 rounded-xl text-sm outline-none ${
              darkMode
                ? 'bg-gray-700 text-white border border-gray-600'
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          >
            <option value="above">📈 Above</option>
            <option value="below">📉 Below</option>
          </select>
        </div>
        <div className="flex-1">
          <label className={`text-xs font-medium block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Target Price (USD)
          </label>
          <input
            type="number"
            step="any"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter price..."
            className={`w-full px-3 py-2 rounded-xl text-sm outline-none ${
              darkMode
                ? 'bg-gray-700 text-white border border-gray-600'
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Set Alert
        </button>
      </form>

      <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Current price: {formatPrice(currentPrice)}. Alerts are checked every 10 seconds.
      </p>

      {/* Active alerts */}
      {coinAlerts.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Active Alerts:
          </p>
          {coinAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-white'
              }`}
            >
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {alert.direction === 'above' ? '📈' : '📉'}{' '}
                {alert.direction} {formatPrice(alert.targetPrice)}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-red-400 hover:text-red-500 text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
