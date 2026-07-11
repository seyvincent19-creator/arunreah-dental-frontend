import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import DoctorSelect from '../../components/pickers/DoctorSelect';
import PatientPicker from '../../components/pickers/PatientPicker';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment, AppointmentPayload } from '../../types/appointment';

interface AppointmentFormModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AppointmentPayload) => void;
  defaultDate?: string;
}

interface FormValues {
  patient: { id: number; label: string } | null;
  doctor_id: number | '';
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  remark: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function AppointmentFormModal({
  isOpen,
  appointment,
  isSubmitting,
  onClose,
  onSubmit,
  defaultDate,
}: AppointmentFormModalProps) {
  const { t } = useLanguage();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      patient: null,
      doctor_id: '',
      appointment_date: defaultDate ?? todayIso(),
      appointment_time: '',
      purpose: '',
      remark: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (appointment) {
      reset({
        patient: {
          id: appointment.patient.id,
          label: `${appointment.patient.full_name} (${appointment.patient.patient_code})`,
        },
        doctor_id: appointment.doctor.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time.slice(0, 5),
        purpose: appointment.purpose,
        remark: appointment.remark ?? '',
      });
    } else {
      reset({
        patient: null,
        doctor_id: '',
        appointment_date: defaultDate ?? todayIso(),
        appointment_time: '',
        purpose: '',
        remark: '',
      });
    }
  }, [isOpen, appointment, defaultDate, reset]);

  const submit = (values: FormValues) => {
    if (!values.patient || !values.doctor_id) return;

    onSubmit({
      patient_id: values.patient.id,
      doctor_id: values.doctor_id,
      appointment_date: values.appointment_date,
      appointment_time: values.appointment_time,
      purpose: values.purpose,
      remark: values.remark || null,
    });
  };

  const formId = 'appointment-form';

  return (
    <Modal
      title={appointment ? t('edit_appointment') : t('add_appointment')}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">{t('patients')}</label>
            <Controller
              name="patient"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PatientPicker value={field.value} onChange={field.onChange} isInvalid={!!errors.patient} />
              )}
            />
            {errors.patient && <div className="text-danger small mt-1">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('doctors')}</label>
            <Controller
              name="doctor_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DoctorSelect value={field.value} onChange={field.onChange} isInvalid={!!errors.doctor_id} />
              )}
            />
            {errors.doctor_id && <div className="invalid-feedback d-block">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">{t('date')}</label>
            <input
              type="date"
              className={`form-control ${errors.appointment_date ? 'is-invalid' : ''}`}
              min={todayIso()}
              {...register('appointment_date', { required: true })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">{t('time')}</label>
            <input
              type="time"
              className={`form-control ${errors.appointment_time ? 'is-invalid' : ''}`}
              {...register('appointment_time', { required: true })}
            />
          </div>

          <div className="col-12">
            <label className="form-label">{t('purpose')}</label>
            <input
              className={`form-control ${errors.purpose ? 'is-invalid' : ''}`}
              {...register('purpose', { required: true })}
            />
            {errors.purpose && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">{t('remark')}</label>
            <textarea className="form-control" rows={2} {...register('remark')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
