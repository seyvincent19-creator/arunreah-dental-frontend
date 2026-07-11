import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export default function ChartCard({ title, children, isLoading, isEmpty, emptyMessage }: ChartCardProps) {
  return (
    <div className="col-md-6">
      <div className="card shadow-soft h-100">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">{title}</h6>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 220 }}>
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : isEmpty ? (
            <div
              className="d-flex justify-content-center align-items-center text-muted-soft small"
              style={{ height: 220 }}
            >
              {emptyMessage ?? 'No data available'}
            </div>
          ) : (
            <div style={{ height: 220 }}>{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
