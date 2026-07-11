import { FiCheck, FiCheckCircle, FiEdit2, FiLogIn, FiPrinter, FiXCircle } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment } from '../../types/appointment';

interface AppointmentActionsProps {
  appointment: Appointment;
  canManage: boolean;
  canComplete: boolean;
  onEdit?: (appointment: Appointment) => void;
  onApprove: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onCheckIn: (appointment: Appointment) => void;
  onPrint: (appointment: Appointment) => void;
}

export default function AppointmentActions({
  appointment,
  canManage,
  canComplete,
  onEdit,
  onApprove,
  onCancel,
  onComplete,
  onCheckIn,
  onPrint,
}: AppointmentActionsProps) {
  const { t } = useLanguage();
  const isOpen = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <div className="d-flex justify-content-end gap-1">
      {canManage && appointment.status === 'pending' && (
        <button className="btn btn-sm btn-light text-primary" title={t('approve')} onClick={() => onApprove(appointment)}>
          <FiCheck />
        </button>
      )}

      {canManage && appointment.status === 'confirmed' && !appointment.checked_in_at && (
        <button className="btn btn-sm btn-light text-info" title={t('check_in')} onClick={() => onCheckIn(appointment)}>
          <FiLogIn />
        </button>
      )}

      {canComplete && isOpen && (
        <button
          className="btn btn-sm btn-light text-success"
          title={t('complete')}
          onClick={() => onComplete(appointment)}
        >
          <FiCheckCircle />
        </button>
      )}

      {canManage && onEdit && isOpen && (
        <button className="btn btn-sm btn-light" title={t('edit')} onClick={() => onEdit(appointment)}>
          <FiEdit2 />
        </button>
      )}

      {canManage && isOpen && (
        <button className="btn btn-sm btn-light text-danger" title={t('cancel')} onClick={() => onCancel(appointment)}>
          <FiXCircle />
        </button>
      )}

      <button className="btn btn-sm btn-light text-muted-soft" title={t('print')} onClick={() => onPrint(appointment)}>
        <FiPrinter />
      </button>
    </div>
  );
}
