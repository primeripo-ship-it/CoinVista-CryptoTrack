/**
 * Number and date formatting utilities
 */

/**
 * Format large numbers with abbreviations (K, M, B, T)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Format price based on value magnitude
 */
export function formatPrice(price: number, symbol: string = '$'): string {
  if (price >= 1) {
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) {
    return `${symbol}${price.toFixed(4)}`;
  }
  return `${symbol}${price.toFixed(8)}`;
}

/**
 * Format percentage change
 */
export function formatPercentage(pct: number | null): string {
  if (pct === null || pct === undefined) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Format market cap
 */
export function formatMarketCap(cap: number, symbol: string = '$'): string {
  return `${symbol}${formatCompactNumber(cap)}`;
}

/**
 * Format volume
 */
export function formatVolume(vol: number, symbol: string = '$'): string {
  return `${symbol}${formatCompactNumber(vol)}`;
}

/**
 * Format supply
 */
export function formatSupply(supply: number | null, coinSymbol: string): string {
  if (supply === null || supply === undefined) return '∞';
  return `${formatCompactNumber(supply)} ${coinSymbol.toUpperCase()}`;
}

/**
 * Time ago formatter
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * Format date for charts
 */
export function formatChartDate(timestamp: number, days: string): string {
  const date = new Date(timestamp);
  if (days === '1' || days === '0.0416') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === '7') {
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
