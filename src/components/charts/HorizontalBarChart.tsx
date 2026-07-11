import { Bar } from 'react-chartjs-2';
import { AXIS_TEXT_COLOR, GRID_COLOR, baseTooltip } from './chartSetup';
import type { SeriesPoint } from '../../types/analytics';

interface HorizontalBarChartProps {
  data: SeriesPoint[];
  color: string;
}

export default function HorizontalBarChart({ data, color }: HorizontalBarChartProps) {
  return (
    <Bar
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: color,
            borderRadius: 4,
            maxBarThickness: 18,
          },
        ],
      }}
      options={{
        indexAxis: 'y' as const,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: baseTooltip,
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: GRID_COLOR },
            ticks: { color: AXIS_TEXT_COLOR, font: { size: 11 }, precision: 0 },
          },
          y: {
            grid: { display: false },
            ticks: { color: AXIS_TEXT_COLOR, font: { size: 11 } },
          },
        },
      }}
    />
  );
}
