import { useLanguage } from '../../context/LanguageContext';
import type { AppointmentStatus } from '../../types/appointment';

const STYLES: Record<AppointmentStatus, string> = {
  pending: 'text-bg-warning-subtle text-warning-emphasis',
  confirmed: 'text-bg-info-subtle text-info-emphasis',
  completed: 'text-bg-success-subtle text-success-emphasis',
  cancelled: 'text-bg-secondary-subtle text-secondary-emphasis',
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export default function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const { t } = useLanguage();

  return <span className={`badge rounded-pill fw-medium ${STYLES[status]}`}>{t(status)}</span>;
}
