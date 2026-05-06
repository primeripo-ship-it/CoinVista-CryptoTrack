/**
 * FilterBar Component
 * Displays: market stats summary + filter buttons (All / Gainers / Losers)
 */
import React from 'react';
import { useCryptoStore, FilterMode } from '../store/useCryptoStore';
import { formatMarketCap } from '../utils/formatters';
import { convertPrice, getCurrencySymbol } from '../services/api';

export const FilterBar: React.FC = () => {
  const { darkMode, coins, filterMode, setFilterMode, currency, showWatchlistOnly, setShowWatchlistOnly, watchlist } = useCryptoStore();

  // Calculate market stats
  const totalMarketCap = coins.reduce((sum, c) => sum + c.market_cap, 0);
  const totalVolume = coins.reduce((sum, c) => sum + c.total_volume, 0);
  const gainersCount = coins.filter((c) => c.price_change_percentage_24h > 0).length;
  const losersCount = coins.filter((c) => c.price_change_percentage_24h < 0).length;
  const sym = getCurrencySymbol(currency);

  const filters: { label: string; value: FilterMode; icon: string }[] = [
    { label: 'All Coins', value: 'all', icon: '📊' },
    { label: `Gainers (${gainersCount})`, value: 'gainers', icon: '📈' },
    { label: `Losers (${losersCount})`, value: 'losers', icon: '📉' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Market Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Market Cap', value: formatMarketCap(convertPrice(totalMarketCap, currency), sym), icon: '💰' },
          { label: '24h Volume', value: formatMarketCap(convertPrice(totalVolume, currency), sym), icon: '📊' },
          { label: 'Gainers', value: `${gainersCount} coins`, icon: '🟢', color: 'text-green-500' },
          { label: 'Losers', value: `${losersCount} coins`, icon: '🔴', color: 'text-red-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-3 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{stat.icon}</span>
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-sm font-bold ${stat.color || (darkMode ? 'text-white' : 'text-gray-900')}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterMode(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterMode === f.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : darkMode
                ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <span className="mr-1.5">{f.icon}</span>
            {f.label}
          </button>
        ))}

        {/* Mobile watchlist toggle */}
        <button
          onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          className={`sm:hidden px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            showWatchlistOnly
              ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
              : darkMode
              ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
        >
          ⭐ Watchlist ({watchlist.length})
        </button>
      </div>
    </div>
  );
};
