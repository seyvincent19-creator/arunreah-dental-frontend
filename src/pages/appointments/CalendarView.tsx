import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import {
  approveAppointment,
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  createAppointment,
  listAppointments,
  updateAppointment,
} from '../../api/appointments';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import AppointmentStatusBadge from '../../components/ui/AppointmentStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment, AppointmentPayload } from '../../types/appointment';
import { notifyError, notifySuccess } from '../../utils/confirm';
import { printAppointment } from '../../utils/printAppointment';
import Swal from 'sweetalert2';
import AppointmentActions from './AppointmentActions';
import AppointmentFormModal from './AppointmentFormModal';

const toIso = (date: Date) => date.toISOString().slice(0, 10);

function buildMonthGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

const STATUS_DOT: Record<Appointment['status'], string> = {
  pending: '#d97706',
  confirmed: '#2563eb',
  completed: '#059669',
  cancelled: '#9ca3af',
};

export default function CalendarView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDoctor = user?.role.name === 'doctor';
  const canManage = user?.role.name === 'admin' || user?.role.name === 'receptionist';

  const [monthDate, setMonthDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDefaultDate, setPendingDefaultDate] = useState<string | undefined>(undefined);

  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate]);

  const fetchMonth = async () => {
    setIsLoading(true);
    try {
      const res = await listAppointments({
        date_from: toIso(grid[0]),
        date_to: toIso(grid[grid.length - 1]),
        per_page: 300,
      });
      setAppointments(res.data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const list = map.get(appt.appointment_date) ?? [];
      list.push(appt);
      map.set(appt.appointment_date, list);
    }
    return map;
  }, [appointments]);

  const todayIso = toIso(new Date());
  const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const goPrev = () => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setMonthDate(new Date());

  const openCreateFor = (dateIso: string) => {
    setEditingAppointment(null);
    setSelectedDay(null);
    setIsModalOpen(true);
    setPendingDefaultDate(dateIso);
  };

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedDay(null);
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
      fetchMonth();
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
    await approveAppointment(appointment.id);
    notifySuccess(t('saved_successfully'));
    fetchMonth();
  };

  const handleCheckIn = async (appointment: Appointment) => {
    await checkInAppointment(appointment.id);
    notifySuccess(t('saved_successfully'));
    fetchMonth();
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
    fetchMonth();
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
    fetchMonth();
  };

  const weekdayLabels = useMemo(() => {
    const base = new Date(2026, 0, 4); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(undefined, { weekday: 'short' });
    });
  }, []);

  const selectedAppointments = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div>
      <PageHeader
        title={t('calendar')}
        subtitle={t('manage_appointments_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openCreateFor(todayIso)}>
              <FiPlus /> {t('add_appointment')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-light" title={t('previous_month')} onClick={goPrev}>
              <FiChevronLeft />
            </button>
            <span className="fw-semibold" style={{ minWidth: 160, textAlign: 'center' }}>
              {monthLabel}
            </span>
            <button className="btn btn-sm btn-light" title={t('next_month')} onClick={goNext}>
              <FiChevronRight />
            </button>
          </div>
          <button className="btn btn-sm btn-outline-primary" onClick={goToday}>
            {t('today')}
          </button>
        </div>

        <div className="p-3">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : (
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {weekdayLabels.map((label) => (
                <div key={label} className="text-center text-muted-soft small fw-semibold py-1">
                  {label}
                </div>
              ))}

              {grid.map((day) => {
                const dayIso = toIso(day);
                const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                const dayAppointments = byDay.get(dayIso) ?? [];
                const visible = dayAppointments.slice(0, 3);
                const overflow = dayAppointments.length - visible.length;

                return (
                  <button
                    key={dayIso}
                    type="button"
                    className="border rounded-2 p-2 text-start bg-white"
                    style={{
                      minHeight: 96,
                      opacity: isCurrentMonth ? 1 : 0.45,
                      outline: dayIso === todayIso ? '2px solid #0d9488' : undefined,
                    }}
                    onClick={() => setSelectedDay(dayIso)}
                  >
                    <div className="small fw-semibold mb-1">{day.getDate()}</div>
                    <div className="d-flex flex-column gap-1">
                      {visible.map((appt) => (
                        <div key={appt.id} className="small text-truncate d-flex align-items-center gap-1">
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: STATUS_DOT[appt.status],
                              flexShrink: 0,
                              display: 'inline-block',
                            }}
                          />
                          <span className="text-truncate">
                            {appt.appointment_time.slice(0, 5)} {appt.patient.full_name}
                          </span>
                        </div>
                      ))}
                      {overflow > 0 && <div className="small text-muted-soft">+{overflow} more</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={selectedDay ?? ''}
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        size="lg"
        footer={
          canManage && selectedDay ? (
            <button className="btn btn-primary" onClick={() => openCreateFor(selectedDay)}>
              {t('book_for_this_day')}
            </button>
          ) : undefined
        }
      >
        {selectedAppointments.length === 0 ? (
          <p className="text-muted-soft mb-0">{t('no_appointments_found')}</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {selectedAppointments.map((appt) => (
              <div key={appt.id} className="border rounded-2 p-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-medium">
                      {appt.appointment_time.slice(0, 5)} · {appt.patient.full_name}
                    </div>
                    <div className="text-muted-soft small">
                      {appt.doctor.doctor_name} · {appt.purpose}
                    </div>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </div>
                <div className="mt-2">
                  <AppointmentActions
                    appointment={appt}
                    canManage={canManage}
                    canComplete={canManage || isDoctor}
                    onEdit={openEdit}
                    onApprove={handleApprove}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                    onCheckIn={handleCheckIn}
                    onPrint={printAppointment}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <AppointmentFormModal
        isOpen={isModalOpen}
        appointment={editingAppointment}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        defaultDate={pendingDefaultDate}
      />
    </div>
  );
}
