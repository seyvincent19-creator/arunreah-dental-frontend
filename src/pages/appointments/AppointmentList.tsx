import { useEffect, useState } from 'react';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import {
  approveAppointment,
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  createAppointment,
  listAppointments,
  updateAppointment,
} from '../../api/appointments';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import AppointmentStatusBadge from '../../components/ui/AppointmentStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment, AppointmentPayload } from '../../types/appointment';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import { printAppointment } from '../../utils/printAppointment';
import AppointmentActions from './AppointmentActions';
import AppointmentFilters from './AppointmentFilters';
import type { AppointmentFilterValues } from './AppointmentFilters';
import AppointmentFormModal from './AppointmentFormModal';
import Swal from 'sweetalert2';

export default function AppointmentList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDoctor = user?.role.name === 'doctor';
  const canManage = user?.role.name === 'admin' || user?.role.name === 'receptionist';

  const [response, setResponse] = useState<PaginatedResponse<Appointment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AppointmentFilterValues>({
    search: '',
    status: '',
    doctorId: '',
    date: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await listAppointments({
        page,
        search: filters.search || undefined,
        status: filters.status || undefined,
        doctor_id: filters.doctorId || undefined,
        date: filters.date || undefined,
      });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchAppointments();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openCreate = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: AppointmentPayload) => {
    setIsSubmitting(true);
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, payload);
      } else {
        await createAppointment(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchAppointments();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (appointment: Appointment) => {
    try {
      await approveAppointment(appointment.id);
      notifySuccess(t('saved_successfully'));
      fetchAppointments();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  const handleCheckIn = async (appointment: Appointment) => {
    try {
      await checkInAppointment(appointment.id);
      notifySuccess(t('saved_successfully'));
      fetchAppointments();
    } catch {
      notifyError(t('something_went_wrong'));
    }
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

    try {
      await completeAppointment(appointment.id, result.value || undefined);
      notifySuccess(t('saved_successfully'));
      fetchAppointments();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    const confirmed = await confirmDelete(appointment.patient.full_name);
    if (!confirmed) return;

    try {
      await cancelAppointment(appointment.id);
      notifySuccess(t('saved_successfully'));
      fetchAppointments();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_appointments')}
        subtitle={t('manage_appointments_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_appointment')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white py-3">
          <AppointmentFilters value={filters} onChange={setFilters} showDoctorFilter={!isDoctor} />
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('time')}</th>
                <th>{t('patients')}</th>
                <th>{t('doctors')}</th>
                <th>{t('purpose')}</th>
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
                response?.data.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="text-muted-soft">{appointment.appointment_date}</td>
                    <td className="text-muted-soft">{appointment.appointment_time.slice(0, 5)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={appointment.patient.full_name} size={32} />
                        <span className="fw-medium">{appointment.patient.full_name}</span>
                      </div>
                    </td>
                    <td>{appointment.doctor.doctor_name}</td>
                    <td>{appointment.purpose}</td>
                    <td>
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td>
                      <AppointmentActions
                        appointment={appointment}
                        canManage={canManage}
                        canComplete={canManage || isDoctor}
                        onEdit={openEdit}
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

          {!isLoading && response?.data.length === 0 && (
            <EmptyState icon={<FiCalendar />} title={t('no_appointments_found')} />
          )}
        </div>

        {response && (
          <div className="card-body pt-0">
            <Pagination
              currentPage={response.meta.current_page}
              lastPage={response.meta.last_page}
              total={response.meta.total}
              perPage={response.meta.per_page}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <AppointmentFormModal
        isOpen={isModalOpen}
        appointment={editingAppointment}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
