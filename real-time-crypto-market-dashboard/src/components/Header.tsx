/**
 * Header Component
 * Contains: Logo, search bar, theme toggle, currency selector, watchlist toggle
 */
import React from 'react';
import { useCryptoStore } from '../store/useCryptoStore';
import { timeAgo } from '../utils/formatters';

export const Header: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    currency,
    setCurrency,
    searchQuery,
    setSearchQuery,
    showWatchlistOnly,
    setShowWatchlistOnly,
    watchlist,
    lastUpdated,
    selectedCoinId,
    setSelectedCoinId,
  } = useCryptoStore();

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        darkMode
          ? 'bg-gray-900/90 border-gray-800'
          : 'bg-white/90 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => setSelectedCoinId(null)}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className={`text-lg font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                CryptoTrack
              </h1>
              {lastUpdated && (
                <p className="text-[10px] text-gray-500 leading-none">
                  Updated {timeAgo(lastUpdated)}
                </p>
              )}
            </div>
          </button>

          {/* Search bar - hidden on mobile when detail view is open */}
          <div className={`flex-1 max-w-md ${selectedCoinId ? 'hidden sm:block' : ''}`}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm transition-all ${
                  darkMode
                    ? 'bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-750 border border-gray-700 focus:border-blue-500'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white border border-gray-200 focus:border-blue-500'
                } outline-none`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Watchlist toggle */}
            <button
              onClick={() => {
                setShowWatchlistOnly(!showWatchlistOnly);
                setSelectedCoinId(null);
              }}
              className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all hidden sm:flex items-center gap-1.5 ${
                showWatchlistOnly
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  : darkMode
                  ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
              title="Watchlist"
            >
              <svg className="w-4 h-4" fill={showWatchlistOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="hidden md:inline">
                {showWatchlistOnly ? 'All' : 'Watchlist'}
              </span>
              {watchlist.length > 0 && (
                <span className={`text-xs px-1.5 rounded-full ${
                  showWatchlistOnly
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'usd' | 'bdt')}
              className={`px-2 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 border border-gray-700'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <option value="usd">🇺🇸 USD</option>
              <option value="bdt">🇧🇩 BDT</option>
            </select>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-750 border border-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
