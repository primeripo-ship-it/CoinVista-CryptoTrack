/**
 * CryptoTrack — Real-Time Crypto Market Dashboard
 *
 * A production-ready cryptocurrency market tracker with:
 * - Live top 50 crypto table (auto-refresh every 10s)
 * - Search & filter (gainers/losers)
 * - Interactive price charts (24H, 7D, 30D) via Chart.js
 * - Watchlist with localStorage persistence
 * - Dark/Light mode toggle
 * - Price alerts with notifications
 * - Multi-currency support (USD/BDT)
 * - Responsive design (mobile + desktop)
 *
 * API: CoinGecko Free API
 * State Management: Zustand
 * Charts: Chart.js + react-chartjs-2
 */
import React, { useEffect } from 'react';
import { useCryptoStore } from './store/useCryptoStore';
import { useFetchCoins } from './hooks/useFetchCoins';
import { Header } from './components/Header';
import { MarqueeStrip } from './components/MarqueeStrip';
import { FilterBar } from './components/FilterBar';
import { CryptoTable } from './components/CryptoTable';
import { CoinDetail } from './components/CoinDetail';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { AlertToast } from './components/AlertToast';

const App: React.FC = () => {
  const { darkMode, loading, error, coins, selectedCoinId } = useCryptoStore();

  // Initialize data fetching with auto-refresh every 10 seconds
  useFetchCoins();

  // Apply dark mode class to document for global styling
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'bg-gray-950 text-white'
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Price alert toast notifications */}
      <AlertToast />

      {/* Scrolling ticker strip */}
      {coins.length > 0 && !selectedCoinId && <MarqueeStrip />}

      {/* Sticky header with search, controls */}
      <Header />

      {/* Error/rate-limit banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
            error.includes('Rate limited')
              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            <span>{error.includes('Rate limited') ? '⏳' : '⚠️'}</span>
            <span>{error}</span>
            {error.includes('Rate limited') && (
              <span className="text-xs opacity-70">• Showing cached data</span>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      {loading && coins.length === 0 ? (
        /* Show skeleton loader on initial load */
        <LoadingSkeleton />
      ) : selectedCoinId ? (
        /* Detailed coin view with chart */
        <CoinDetail />
      ) : (
        /* Main market table view */
        <>
          <FilterBar />
          <CryptoTable />

          {/* Footer */}
          <footer className={`max-w-7xl mx-auto px-4 py-8 mt-4 border-t ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  CryptoTrack
                </span>
              </div>
              <p className={`text-xs text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Market data powered by CoinGecko • Auto-refreshes every 10 seconds • Not financial advice
              </p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Live
                </span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
