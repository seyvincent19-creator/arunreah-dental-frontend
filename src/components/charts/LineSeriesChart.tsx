import { Line } from 'react-chartjs-2';
import { baseScales, baseTooltip, withAlpha } from './chartSetup';
import type { SeriesPoint } from '../../types/analytics';

interface LineSeriesChartProps {
  data: SeriesPoint[];
  color: string;
  valueFormatter?: (value: number) => string;
}

export default function LineSeriesChart({ data, color, valueFormatter }: LineSeriesChartProps) {
  return (
    <Line
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            borderColor: color,
            backgroundColor: withAlpha(color, 0.1),
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...baseTooltip,
            callbacks: valueFormatter ? { label: (ctx) => valueFormatter(ctx.parsed.y ?? 0) } : undefined,
          },
        },
        scales: baseScales,
      }}
    />
  );
}
