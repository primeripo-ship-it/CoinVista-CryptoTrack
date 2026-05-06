/**
 * PriceChart Component
 * Interactive price chart using Chart.js via react-chartjs-2
 * Features: hover tooltips, gradient fill, responsive
 */
import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCryptoStore } from '../store/useCryptoStore';
import { formatChartDate } from '../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface PriceChartProps {
  data: [number, number][]; // [timestamp, price]
  isPositive: boolean;
  period: string;
  currencySymbol: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  isPositive,
  period,
  currencySymbol,
}) => {
  const { darkMode } = useCryptoStore();
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Sample data points for performance
  const sampledData = useMemo(() => {
    const maxPoints = 200;
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  const labels = useMemo(
    () => sampledData.map(([ts]) => formatChartDate(ts, period)),
    [sampledData, period]
  );

  const prices = useMemo(
    () => sampledData.map(([, price]) => price),
    [sampledData]
  );

  const color = isPositive ? '#22c55e' : '#ef4444';
  const colorRgb = isPositive ? '34, 197, 94' : '239, 68, 68';

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        data: prices,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return `rgba(${colorRgb}, 0.1)`;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `rgba(${colorRgb}, 0.2)`);
          gradient.addColorStop(1, `rgba(${colorRgb}, 0)`);
          return gradient;
        },
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: darkMode ? '#1f2937' : '#ffffff',
        pointHoverBorderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 12, weight: 'normal' as const },
        bodyFont: { size: 14, weight: 'bold' as const },
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => {
            const val = item.parsed?.y ?? 0;
            if (val >= 1) return `${currencySymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return `${currencySymbol}${val.toFixed(8)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#6b7280' : '#9ca3af',
          font: { size: 10 },
          maxRotation: 0,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: darkMode ? '#1f293780' : '#f3f4f680',
        },
        ticks: {
          color: darkMode ? '#6b7280' : '#9ca3af',
          font: { size: 10 },
          maxTicksLimit: 6,
          callback: (value) => {
            const num = Number(value);
            if (num >= 1000) return `${currencySymbol}${(num / 1000).toFixed(1)}k`;
            if (num >= 1) return `${currencySymbol}${num.toFixed(2)}`;
            return `${currencySymbol}${num.toFixed(6)}`;
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-[300px] sm:h-[400px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
