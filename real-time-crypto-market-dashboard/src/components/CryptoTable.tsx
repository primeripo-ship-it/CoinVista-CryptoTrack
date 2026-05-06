/**
 * CryptoTable Component
 * Displays the main table of cryptocurrencies with sorting
 * Features: sortable columns, sparkline, watchlist star, click to detail
 */
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useCryptoStore, CoinData, SortField } from '../store/useCryptoStore';
import { formatPrice, formatPercentage, formatMarketCap, formatVolume } from '../utils/formatters';
import { convertPrice, getCurrencySymbol } from '../services/api';
import { MiniSparkline } from './MiniSparkline';

export const CryptoTable: React.FC = () => {
  const {
    darkMode,
    coins,
    searchQuery,
    filterMode,
    sortField,
    sortDirection,
    setSort,
    currency,
    watchlist,
    toggleWatchlist,
    setSelectedCoinId,
    showWatchlistOnly,
  } = useCryptoStore();

  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const prevCoinsRef = useRef<CoinData[]>([]);

  // Track price changes for flash animation
  useEffect(() => {
    if (prevCoinsRef.current.length > 0) {
      const newFlash: Record<string, 'up' | 'down'> = {};
      coins.forEach((coin) => {
        const prev = prevPrices[coin.id];
        if (prev !== undefined && prev !== coin.current_price) {
          newFlash[coin.id] = coin.current_price > prev ? 'up' : 'down';
        }
      });
      if (Object.keys(newFlash).length > 0) {
        setFlashMap(newFlash);
        setTimeout(() => setFlashMap({}), 1000);
      }
    }
    const priceMap: Record<string, number> = {};
    coins.forEach((c) => { priceMap[c.id] = c.current_price; });
    setPrevPrices(priceMap);
    prevCoinsRef.current = coins;
  }, [coins]);

  const sym = getCurrencySymbol(currency);

  // Filter and sort coins
  const filteredCoins = useMemo(() => {
    let result = [...coins];

    // Watchlist filter
    if (showWatchlistOnly) {
      result = result.filter((c) => watchlist.includes(c.id));
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    // Gainers/Losers filter
    if (filterMode === 'gainers') {
      result = result.filter((c) => c.price_change_percentage_24h > 0);
    } else if (filterMode === 'losers') {
      result = result.filter((c) => c.price_change_percentage_24h < 0);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] ?? 0;
      let bVal = b[sortField] ?? 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [coins, searchQuery, filterMode, sortField, sortDirection, showWatchlistOnly, watchlist]);

  // Sort header component
  const SortHeader: React.FC<{
    field: SortField;
    label: string;
    className?: string;
  }> = ({ field, label, className = '' }) => (
    <button
      onClick={() => setSort(field)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
        sortField === field
          ? 'text-blue-500'
          : darkMode
          ? 'text-gray-500 hover:text-gray-300'
          : 'text-gray-400 hover:text-gray-600'
      } ${className}`}
    >
      {label}
      {sortField === field && (
        <svg
          className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
    </button>
  );

  if (filteredCoins.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {showWatchlistOnly ? 'No coins in your watchlist yet' : 'No coins found'}
        </p>
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {showWatchlistOnly ? 'Star some coins to add them here' : 'Try a different search term'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className={`rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        {/* Desktop table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <th className="px-4 py-3 text-left w-10">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></span>
                </th>
                <th className="px-2 py-3 text-left w-12">
                  <SortHeader field="market_cap_rank" label="#" />
                </th>
                <th className="px-4 py-3 text-left min-w-[180px]">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Name</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader field="current_price" label="Price" className="justify-end" />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader field="price_change_percentage_24h" label="24h %" className="justify-end" />
                </th>
                <th className="px-4 py-3 text-right hidden md:table-cell">
                  <SortHeader field="market_cap" label="Market Cap" className="justify-end" />
                </th>
                <th className="px-4 py-3 text-right hidden lg:table-cell">
                  <SortHeader field="total_volume" label="Volume (24h)" className="justify-end" />
                </th>
                <th className="px-4 py-3 text-right hidden xl:table-cell w-[140px]">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>7D Chart</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                const isWatchlisted = watchlist.includes(coin.id);
                const flash = flashMap[coin.id];

                return (
                  <tr
                    key={coin.id}
                    className={`crypto-row border-b cursor-pointer group ${
                      flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''
                    } ${
                      darkMode
                        ? 'border-gray-800/50 hover:bg-gray-800/50'
                        : 'border-gray-50 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCoinId(coin.id)}
                  >
                    {/* Watchlist star */}
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(coin.id);
                        }}
                        className={`transition-all ${
                          isWatchlisted
                            ? 'text-yellow-400 scale-110'
                            : darkMode
                            ? 'text-gray-600 hover:text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={isWatchlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </td>
                    {/* Rank */}
                    <td className={`px-2 py-3 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {coin.market_cap_rank}
                    </td>
                    {/* Name + Logo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                          loading="lazy"
                        />
                        <div>
                          <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {coin.name}
                          </p>
                          <p className={`text-xs uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className={`px-4 py-3 text-right font-semibold text-sm tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(convertPrice(coin.current_price, currency), sym)}
                    </td>
                    {/* 24h Change */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold tabular-nums ${
                          isPositive
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        <svg
                          className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </span>
                    </td>
                    {/* Market Cap */}
                    <td className={`px-4 py-3 text-right text-sm hidden md:table-cell ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatMarketCap(convertPrice(coin.market_cap, currency), sym)}
                    </td>
                    {/* Volume */}
                    <td className={`px-4 py-3 text-right text-sm hidden lg:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatVolume(convertPrice(coin.total_volume, currency), sym)}
                    </td>
                    {/* Sparkline */}
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {coin.sparkline_in_7d?.price && (
                        <MiniSparkline
                          data={coin.sparkline_in_7d.price}
                          isPositive={isPositive}
                          width={120}
                          height={40}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
