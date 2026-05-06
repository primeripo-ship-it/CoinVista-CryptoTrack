/**
 * MarqueeStrip Component
 * Scrolling ticker at the top showing top movers
 */
import React, { useMemo } from 'react';
import { useCryptoStore } from '../store/useCryptoStore';
import { formatPrice, formatPercentage } from '../utils/formatters';
import { convertPrice, getCurrencySymbol } from '../services/api';

export const MarqueeStrip: React.FC = () => {
  const { coins, darkMode, currency, setSelectedCoinId } = useCryptoStore();
  const sym = getCurrencySymbol(currency);

  // Get top 10 coins for the ticker
  const tickerCoins = useMemo(() => {
    return coins.slice(0, 15);
  }, [coins]);

  if (tickerCoins.length === 0) return null;

  // Duplicate for seamless loop
  const allCoins = [...tickerCoins, ...tickerCoins];

  return (
    <div
      className={`overflow-hidden border-b ${
        darkMode ? 'bg-gray-900/80 border-gray-800/50' : 'bg-white/80 border-gray-200/50'
      }`}
    >
      <div
        className="flex items-center gap-6 py-2 px-4 animate-marquee whitespace-nowrap"
        style={{
          animation: 'marquee 40s linear infinite',
        }}
      >
        {allCoins.map((coin, idx) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <button
              key={`${coin.id}-${idx}`}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity`}
            >
              <img src={coin.image} alt="" className="w-4 h-4 rounded-full" />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {coin.symbol.toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {formatPrice(convertPrice(coin.current_price, currency), sym)}
              </span>
              <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(coin.price_change_percentage_24h)}
              </span>
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
