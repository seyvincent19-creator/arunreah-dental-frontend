import { useLanguage } from '../../context/LanguageContext';
import type { InvoiceStatus } from '../../types/invoice';

const STYLES: Record<InvoiceStatus, string> = {
  unpaid: 'text-bg-danger-subtle text-danger-emphasis',
  partial: 'text-bg-warning-subtle text-warning-emphasis',
  paid: 'text-bg-success-subtle text-success-emphasis',
  cancelled: 'text-bg-secondary-subtle text-secondary-emphasis',
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useLanguage();

  return <span className={`badge rounded-pill fw-medium ${STYLES[status]}`}>{t(status)}</span>;
}
