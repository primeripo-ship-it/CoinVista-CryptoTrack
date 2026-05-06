/**
 * CoinDetail Component
 * Shows detailed view when a coin is selected
 * Features: interactive price chart (1H/24H/7D), stats, price alerts
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useCryptoStore } from '../store/useCryptoStore';
import { fetchCoinDetail, fetchCoinChart, CoinDetail as CoinDetailType, ChartData, convertPrice, getCurrencySymbol } from '../services/api';
import { formatPrice, formatPercentage, formatMarketCap, formatSupply } from '../utils/formatters';
import { PriceChart } from './PriceChart';
import { PriceAlertForm } from './PriceAlertForm';

type ChartPeriod = '1' | '7' | '30';

export const CoinDetail: React.FC = () => {
  const { selectedCoinId, setSelectedCoinId, darkMode, currency, watchlist, toggleWatchlist, coins } = useCryptoStore();
  const [detail, setDetail] = useState<CoinDetailType | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);

  const sym = getCurrencySymbol(currency);
  const isWatchlisted = selectedCoinId ? watchlist.includes(selectedCoinId) : false;

  // Get live price from coins array for real-time updates
  const liveCoin = coins.find((c) => c.id === selectedCoinId);

  const fetchDetail = useCallback(async () => {
    if (!selectedCoinId) return;
    try {
      setLoading(true);
      const [detailData, chart] = await Promise.all([
        fetchCoinDetail(selectedCoinId),
        fetchCoinChart(selectedCoinId, currency, chartPeriod),
      ]);
      setDetail(detailData);
      setChartData(chart);
    } catch (err) {
      console.error('Failed to fetch coin detail:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCoinId, currency, chartPeriod]);

  const fetchChartOnly = useCallback(async (period: ChartPeriod) => {
    if (!selectedCoinId) return;
    try {
      setChartLoading(true);
      const chart = await fetchCoinChart(selectedCoinId, currency, period);
      setChartData(chart);
    } catch (err) {
      console.error('Failed to fetch chart:', err);
    } finally {
      setChartLoading(false);
    }
  }, [selectedCoinId, currency]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handlePeriodChange = (period: ChartPeriod) => {
    setChartPeriod(period);
    fetchChartOnly(period);
  };

  if (!selectedCoinId) return null;

  if (loading && !detail) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            <div className="space-y-2">
              <div className={`h-6 w-40 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className={`h-4 w-20 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
          </div>
          <div className={`h-80 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const currentPrice = liveCoin ? liveCoin.current_price : detail.market_data.current_price.usd;
  const priceChange24h = liveCoin ? liveCoin.price_change_percentage_24h : detail.market_data.price_change_percentage_24h;
  const isPositive = priceChange24h >= 0;

  const stats = [
    { label: 'Market Cap', value: formatMarketCap(convertPrice(liveCoin?.market_cap || detail.market_data.market_cap.usd, currency), sym) },
    { label: '24h Volume', value: formatMarketCap(convertPrice(liveCoin?.total_volume || detail.market_data.total_volume.usd, currency), sym) },
    { label: 'Circulating Supply', value: formatSupply(detail.market_data.circulating_supply, detail.symbol) },
    { label: 'Total Supply', value: formatSupply(detail.market_data.total_supply, detail.symbol) },
    { label: 'Max Supply', value: formatSupply(detail.market_data.max_supply, detail.symbol) },
    { label: 'All-Time High', value: formatPrice(convertPrice(detail.market_data.ath.usd, currency), sym) },
    { label: 'All-Time Low', value: formatPrice(convertPrice(detail.market_data.atl.usd, currency), sym) },
    { label: '7d Change', value: formatPercentage(detail.market_data.price_change_percentage_7d) },
    { label: '30d Change', value: formatPercentage(detail.market_data.price_change_percentage_30d) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => setSelectedCoinId(null)}
        className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
          darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Market
      </button>

      {/* Coin header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={detail.image.large}
            alt={detail.name}
            className="w-14 h-14 rounded-2xl"
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {detail.name}
              </h2>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase ${
                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                {detail.symbol}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
              }`}>
                Rank #{detail.market_cap_rank}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatPrice(convertPrice(currentPrice, currency), sym)}
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
                  isPositive
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                <svg
                  className={`w-3.5 h-3.5 ${isPositive ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {formatPercentage(priceChange24h)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Watchlist button */}
          <button
            onClick={() => toggleWatchlist(selectedCoinId)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isWatchlisted
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                : darkMode
                ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill={isWatchlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {isWatchlisted ? 'Watching' : 'Watch'}
          </button>

          {/* Alert button */}
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showAlertForm
                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                : darkMode
                ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            🔔 Alert
          </button>
        </div>
      </div>

      {/* Alert form */}
      {showAlertForm && (
        <PriceAlertForm
          coinId={selectedCoinId}
          coinName={detail.name}
          currentPrice={currentPrice}
          onClose={() => setShowAlertForm(false)}
        />
      )}

      {/* Chart section */}
      <div className={`rounded-2xl border p-4 sm:p-6 mb-6 ${
        darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        {/* Period selector */}
        <div className="flex items-center gap-2 mb-4">
          {([
            { label: '24H', value: '1' as ChartPeriod },
            { label: '7D', value: '7' as ChartPeriod },
            { label: '30D', value: '30' as ChartPeriod },
          ]).map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                chartPeriod === p.value
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
          {chartLoading && (
            <div className="ml-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Chart */}
        {chartData && (
          <PriceChart
            data={chartData.prices}
            isPositive={isPositive}
            period={chartPeriod}
            currencySymbol={sym}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => {
          const isPercentStat = stat.label.includes('Change');
          const statValue = stat.value;
          const isStatPositive = isPercentStat && statValue.startsWith('+');
          const isStatNegative = isPercentStat && statValue.startsWith('-');

          return (
            <div
              key={stat.label}
              className={`p-4 rounded-xl border ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700/50'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.label}
              </p>
              <p className={`text-sm font-bold ${
                isStatPositive ? 'text-green-500'
                  : isStatNegative ? 'text-red-500'
                  : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {statValue}
              </p>
            </div>
          );
        })}
      </div>

      {/* Description */}
      {detail.description.en && (
        <div className={`mt-6 p-6 rounded-2xl border ${
          darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            About {detail.name}
          </h3>
          <div
            className={`text-sm leading-relaxed prose-sm max-w-none ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
            dangerouslySetInnerHTML={{
              __html: detail.description.en.split('. ').slice(0, 5).join('. ') + '.',
            }}
          />
        </div>
      )}
    </div>
  );
};
