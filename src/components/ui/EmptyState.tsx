import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="text-center py-5">
      <div className="fs-1 text-muted-soft mb-2">{icon}</div>
      <div className="fw-semibold">{title}</div>
      {message && <div className="text-muted-soft small">{message}</div>}
    </div>
  );
}
