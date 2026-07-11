import type { ComponentType } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone?: 'teal' | 'blue' | 'amber' | 'pink' | 'violet' | 'cyan';
}

const TONES: Record<NonNullable<StatCardProps['tone']>, { bg: string; fg: string }> = {
  teal: { bg: '#e6f7f5', fg: '#0d9488' },
  blue: { bg: '#e8f0fe', fg: '#2563eb' },
  amber: { bg: '#fef3e2', fg: '#d97706' },
  pink: { bg: '#fce7f3', fg: '#db2777' },
  violet: { bg: '#f1e8fe', fg: '#7c3aed' },
  cyan: { bg: '#e2f6fb', fg: '#0891b2' },
};

export default function StatCard({ label, value, icon: Icon, tone = 'teal' }: StatCardProps) {
  const colors = TONES[tone];

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card shadow-soft h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <span className="stat-icon" style={{ background: colors.bg, color: colors.fg }}>
            <Icon />
          </span>
          <div>
            <div className="text-muted-soft small">{label}</div>
            <div className="fs-4 fw-bold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
