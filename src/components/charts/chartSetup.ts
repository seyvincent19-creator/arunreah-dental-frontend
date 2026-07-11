import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip);

export const GRID_COLOR = '#eef0f3';
export const AXIS_TEXT_COLOR = '#6b7280';

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const baseScales = {
  x: {
    grid: { display: false },
    ticks: { color: AXIS_TEXT_COLOR, font: { size: 11 } },
  },
  y: {
    beginAtZero: true,
    grid: { color: GRID_COLOR },
    ticks: { color: AXIS_TEXT_COLOR, font: { size: 11 }, precision: 0 },
  },
};

export const baseTooltip = {
  backgroundColor: '#111827',
  padding: 8,
  cornerRadius: 6,
  displayColors: false,
  titleFont: { size: 12, weight: 'normal' as const },
  bodyFont: { size: 12, weight: 'bold' as const },
};
