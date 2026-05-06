/**
 * Global state management using Zustand
 * Handles: crypto data, watchlist, theme, currency, search/filter, alerts
 */
import { create } from 'zustand';

// ============ TYPES ============

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
}

export type Currency = 'usd' | 'bdt';
export type FilterMode = 'all' | 'gainers' | 'losers';
export type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
export type SortDirection = 'asc' | 'desc';

interface CryptoStore {
  // Data
  coins: CoinData[];
  setCoins: (coins: CoinData[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  lastUpdated: number | null;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Currency
  currency: Currency;
  setCurrency: (currency: Currency) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  setSort: (field: SortField) => void;

  // Watchlist (persisted to localStorage)
  watchlist: string[];
  toggleWatchlist: (coinId: string) => void;
  isInWatchlist: (coinId: string) => boolean;

  // Detail view
  selectedCoinId: string | null;
  setSelectedCoinId: (id: string | null) => void;

  // Price Alerts
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (coins: CoinData[]) => PriceAlert[];

  // View
  showWatchlistOnly: boolean;
  setShowWatchlistOnly: (show: boolean) => void;
}

// Load persisted data from localStorage
const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore storage errors */ }
};

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  // Data
  coins: [],
  setCoins: (coins) => set({ coins, lastUpdated: Date.now(), error: null }),
  loading: true,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
  lastUpdated: null,

  // Theme - load from localStorage
  darkMode: loadFromStorage('darkMode', true),
  toggleDarkMode: () => {
    const newValue = !get().darkMode;
    saveToStorage('darkMode', newValue);
    set({ darkMode: newValue });
  },

  // Currency
  currency: loadFromStorage('currency', 'usd'),
  setCurrency: (currency) => {
    saveToStorage('currency', currency);
    set({ currency });
  },

  // Search & Filter
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  filterMode: 'all',
  setFilterMode: (filterMode) => set({ filterMode }),
  sortField: 'market_cap_rank',
  sortDirection: 'asc',
  setSort: (field) => {
    const state = get();
    if (state.sortField === field) {
      set({ sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortDirection: field === 'market_cap_rank' ? 'asc' : 'desc' });
    }
  },

  // Watchlist
  watchlist: loadFromStorage('watchlist', []),
  toggleWatchlist: (coinId) => {
    const current = get().watchlist;
    const updated = current.includes(coinId)
      ? current.filter((id) => id !== coinId)
      : [...current, coinId];
    saveToStorage('watchlist', updated);
    set({ watchlist: updated });
  },
  isInWatchlist: (coinId) => get().watchlist.includes(coinId),

  // Detail view
  selectedCoinId: null,
  setSelectedCoinId: (id) => set({ selectedCoinId: id }),

  // Price Alerts
  alerts: loadFromStorage('priceAlerts', []),
  addAlert: (alert) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      triggered: false,
      createdAt: Date.now(),
    };
    const updated = [...get().alerts, newAlert];
    saveToStorage('priceAlerts', updated);
    set({ alerts: updated });
  },
  removeAlert: (id) => {
    const updated = get().alerts.filter((a) => a.id !== id);
    saveToStorage('priceAlerts', updated);
    set({ alerts: updated });
  },
  checkAlerts: (coins) => {
    const { alerts } = get();
    const triggered: PriceAlert[] = [];
    const updated = alerts.map((alert) => {
      if (alert.triggered) return alert;
      const coin = coins.find((c) => c.id === alert.coinId);
      if (!coin) return alert;
      const shouldTrigger =
        (alert.direction === 'above' && coin.current_price >= alert.targetPrice) ||
        (alert.direction === 'below' && coin.current_price <= alert.targetPrice);
      if (shouldTrigger) {
        triggered.push({ ...alert, triggered: true });
        return { ...alert, triggered: true };
      }
      return alert;
    });
    if (triggered.length > 0) {
      saveToStorage('priceAlerts', updated);
      set({ alerts: updated });
    }
    return triggered;
  },

  // View
  showWatchlistOnly: false,
  setShowWatchlistOnly: (show) => set({ showWatchlistOnly: show }),
}));
