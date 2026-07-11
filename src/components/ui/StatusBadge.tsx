interface StatusBadgeProps {
  status: 'active' | 'inactive' | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <span
      className={`badge rounded-pill fw-medium ${
        isActive ? 'text-bg-success-subtle text-success-emphasis' : 'text-bg-secondary-subtle text-secondary-emphasis'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
