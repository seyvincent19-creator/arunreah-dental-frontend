import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiLogIn, FiUserCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
import {
  approveAppointment,
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  listAppointments,
} from '../../api/appointments';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/StatCard';
import AppointmentStatusBadge from '../../components/ui/AppointmentStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment } from '../../types/appointment';
import { notifyError, notifySuccess } from '../../utils/confirm';
import { printAppointment } from '../../utils/printAppointment';
import AppointmentActions from '../appointments/AppointmentActions';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Queue() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDoctor = user?.role.name === 'doctor';
  const canManage = user?.role.name === 'admin' || user?.role.name === 'receptionist';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await listAppointments({ date: todayIso(), per_page: 100 });
      setAppointments(res.data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)),
    [appointments],
  );

  const counts = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      checkedIn: appointments.filter((a) => a.checked_in_at && a.status !== 'completed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
    }),
    [appointments],
  );

  const handleApprove = async (appointment: Appointment) => {
    await approveAppointment(appointment.id);
    notifySuccess(t('saved_successfully'));
    fetchQueue();
  };

  const handleCheckIn = async (appointment: Appointment) => {
    await checkInAppointment(appointment.id);
    notifySuccess(t('saved_successfully'));
    fetchQueue();
  };

  const handleComplete = async (appointment: Appointment) => {
    const result = await Swal.fire({
      title: t('complete_appointment'),
      input: 'textarea',
      inputPlaceholder: t('add_remark_optional'),
      showCancelButton: true,
      confirmButtonText: t('complete'),
      confirmButtonColor: '#0d9488',
    });
    if (!result.isConfirmed) return;
    await completeAppointment(appointment.id, result.value || undefined);
    notifySuccess(t('saved_successfully'));
    fetchQueue();
  };

  const handleCancel = async (appointment: Appointment) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: t('cancel_appointment_confirm'),
      showCancelButton: true,
      confirmButtonText: t('yes_cancel'),
      cancelButtonText: t('no'),
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    await cancelAppointment(appointment.id);
    notifySuccess(t('saved_successfully'));
    fetchQueue();
  };

  return (
    <div>
      <PageHeader title={t('todays_queue')} subtitle={t('todays_queue_subtitle')} />

      <div className="row g-3 mb-4">
        <StatCard label={t('todays_queue')} value={counts.total} icon={FiUserCheck} tone="teal" />
        <StatCard label={t('pending_appointment')} value={counts.pending} icon={FiClock} tone="amber" />
        <StatCard label={t('checked_in')} value={counts.checkedIn} icon={FiLogIn} tone="blue" />
        <StatCard label={t('completed')} value={counts.completed} icon={FiCheckCircle} tone="violet" />
      </div>

      <div className="card shadow-soft">
        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('time')}</th>
                <th>{t('patients')}</th>
                <th>{t('doctors')}</th>
                <th>{t('purpose')}</th>
                <th>{t('check_in')}</th>
                <th>{t('status')}</th>
                <th className="text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                sorted.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="fw-medium">{appointment.appointment_time.slice(0, 5)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={appointment.patient.full_name} size={32} />
                        <span>{appointment.patient.full_name}</span>
                      </div>
                    </td>
                    <td>{appointment.doctor.doctor_name}</td>
                    <td>{appointment.purpose}</td>
                    <td className="text-muted-soft small">
                      {appointment.checked_in_at
                        ? new Date(appointment.checked_in_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : t('not_checked_in')}
                    </td>
                    <td>
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td>
                      <AppointmentActions
                        appointment={appointment}
                        canManage={canManage}
                        canComplete={canManage || isDoctor}
                        onApprove={handleApprove}
                        onCancel={handleCancel}
                        onComplete={handleComplete}
                        onCheckIn={handleCheckIn}
                        onPrint={printAppointment}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && sorted.length === 0 && (
            <EmptyState icon={<FiUserCheck />} title={t('no_appointments_found')} />
          )}
        </div>
      </div>
    </div>
  );
}
