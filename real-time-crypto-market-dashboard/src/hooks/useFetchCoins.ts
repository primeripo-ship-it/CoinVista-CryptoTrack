/**
 * Custom hook for fetching and auto-refreshing coin data
 * Fetches top 50 coins every 10 seconds
 */
import { useEffect, useRef, useCallback } from 'react';
import { useCryptoStore } from '../store/useCryptoStore';
import { fetchTopCoins } from '../services/api';

const REFRESH_INTERVAL = 10000; // 10 seconds

export function useFetchCoins() {
  const { currency, setCoins, setLoading, setError, checkAlerts } = useCryptoStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const data = await fetchTopCoins(currency);
      setCoins(data);

      // Check price alerts on each data update
      const triggered = checkAlerts(data);
      if (triggered.length > 0) {
        triggered.forEach((alert) => {
          // Show browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🔔 Price Alert: ${alert.coinName}`, {
              body: `Price is now ${alert.direction} ${alert.targetPrice}`,
            });
          }
        });
      }

      isFirstLoad.current = false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      // Don't set loading false on rate limit - keep showing stale data
      if (message.includes('Rate limited')) {
        console.warn('Rate limited, will retry...');
      }
    } finally {
      setLoading(false);
    }
  }, [currency, setCoins, setLoading, setError, checkAlerts]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh
    intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  return { refetch: fetchData };
}
