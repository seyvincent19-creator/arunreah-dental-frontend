import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
      <div>
        <h4 className="page-title mb-1">{title}</h4>
        {subtitle && <p className="text-muted-soft mb-0">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
