import { Bar } from 'react-chartjs-2';
import { baseScales, baseTooltip } from './chartSetup';
import type { SeriesPoint } from '../../types/analytics';

interface BarSeriesChartProps {
  data: SeriesPoint[];
  color: string;
  valueFormatter?: (value: number) => string;
}

export default function BarSeriesChart({ data, color, valueFormatter }: BarSeriesChartProps) {
  return (
    <Bar
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: color,
            borderRadius: 4,
            maxBarThickness: 24,
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
