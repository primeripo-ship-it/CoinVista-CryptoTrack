/**
 * CoinGecko API Service
 * Free tier: ~10-30 calls/minute
 * We use caching to stay within limits
 */

import { CoinData } from '../store/useCryptoStore';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 8000; // 8 seconds cache

async function cachedFetch<T>(url: string, cacheDuration = CACHE_DURATION): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited. Data will refresh shortly.');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data as T;
}

/**
 * Fetch top 50 coins with market data
 */
export async function fetchTopCoins(currency: string = 'usd'): Promise<CoinData[]> {
  const url = `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h&locale=en`;
  return cachedFetch<CoinData[]>(url);
}

/**
 * Fetch detailed coin data
 */
export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string; small: string; thumb: string };
  description: { en: string };
  market_data: {
    current_price: { usd: number; bdt: number };
    market_cap: { usd: number; bdt: number };
    total_volume: { usd: number; bdt: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number; bdt: number };
    atl: { usd: number; bdt: number };
  };
  market_cap_rank: number;
}

export async function fetchCoinDetail(coinId: string): Promise<CoinDetail> {
  const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  return cachedFetch<CoinDetail>(url, 15000);
}

/**
 * Fetch price chart data for a coin
 */
export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function fetchCoinChart(
  coinId: string,
  currency: string = 'usd',
  days: string = '1'
): Promise<ChartData> {
  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
  return cachedFetch<ChartData>(url, 30000);
}

/**
 * Fetch trending coins
 */
export interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number;
    price_btc: number;
  };
}

export async function fetchTrending(): Promise<{ coins: TrendingCoin[] }> {
  const url = `${BASE_URL}/search/trending`;
  return cachedFetch<{ coins: TrendingCoin[] }>(url, 60000);
}

/**
 * Exchange rate for BDT conversion
 * We'll use a fixed approximate rate and update periodically
 */
export const BDT_RATE = 121.5; // Approximate USD to BDT rate

export function convertPrice(priceUsd: number, currency: string): number {
  if (currency === 'bdt') return priceUsd * BDT_RATE;
  return priceUsd;
}

export function getCurrencySymbol(currency: string): string {
  if (currency === 'bdt') return '৳';
  return '$';
}
