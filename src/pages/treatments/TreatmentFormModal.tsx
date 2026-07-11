import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import DoctorSelect from '../../components/pickers/DoctorSelect';
import PatientPicker from '../../components/pickers/PatientPicker';
import { listAppointments } from '../../api/appointments';
import { useLanguage } from '../../context/LanguageContext';
import type { Appointment } from '../../types/appointment';
import type { Treatment, TreatmentPayload } from '../../types/treatment';

interface TreatmentFormModalProps {
  isOpen: boolean;
  treatment: Treatment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TreatmentPayload) => void;
}

interface FormValues {
  patient: { id: number; label: string } | null;
  doctor_id: number | '';
  appointment_id: number | '';
  diagnosis: string;
  treatment: string;
  treatment_note: string;
  treatment_date: string;
  next_visit_date: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyValues: FormValues = {
  patient: null,
  doctor_id: '',
  appointment_id: '',
  diagnosis: '',
  treatment: '',
  treatment_note: '',
  treatment_date: todayIso(),
  next_visit_date: '',
};

export default function TreatmentFormModal({
  isOpen,
  treatment,
  isSubmitting,
  onClose,
  onSubmit,
}: TreatmentFormModalProps) {
  const { t } = useLanguage();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: emptyValues });

  const selectedPatient = watch('patient');

  useEffect(() => {
    if (!isOpen) return;

    if (treatment) {
      reset({
        patient: { id: treatment.patient.id, label: `${treatment.patient.full_name} (${treatment.patient.patient_code})` },
        doctor_id: treatment.doctor.id,
        appointment_id: treatment.appointment_id ?? '',
        diagnosis: treatment.diagnosis,
        treatment: treatment.treatment,
        treatment_note: treatment.treatment_note ?? '',
        treatment_date: treatment.treatment_date,
        next_visit_date: treatment.next_visit_date ?? '',
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, treatment, reset]);

  useEffect(() => {
    if (!selectedPatient) {
      setPatientAppointments([]);
      return;
    }

    listAppointments({ patient_id: selectedPatient.id, per_page: 20 }).then((res) => {
      setPatientAppointments(res.data.filter((a) => a.status !== 'cancelled'));
    });
  }, [selectedPatient]);

  const handleAppointmentSelect = (appointmentId: number | '') => {
    setValue('appointment_id', appointmentId);
    const appointment = patientAppointments.find((a) => a.id === appointmentId);
    if (appointment) {
      setValue('doctor_id', appointment.doctor.id);
      setValue('treatment_date', appointment.appointment_date);
    }
  };

  const submit = (values: FormValues) => {
    if (!values.patient || !values.doctor_id) return;

    onSubmit({
      patient_id: values.patient.id,
      doctor_id: values.doctor_id,
      appointment_id: values.appointment_id || null,
      diagnosis: values.diagnosis,
      treatment: values.treatment,
      treatment_note: values.treatment_note || null,
      treatment_date: values.treatment_date,
      next_visit_date: values.next_visit_date || null,
    });
  };

  const formId = 'treatment-form';

  return (
    <Modal
      title={treatment ? t('edit_treatment') : t('add_treatment')}
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

          {selectedPatient && patientAppointments.length > 0 && (
            <div className="col-12">
              <label className="form-label">{t('link_appointment_optional')}</label>
              <select
                className="form-select"
                value={watch('appointment_id')}
                onChange={(e) => handleAppointmentSelect(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">{t('no_appointment')}</option>
                {patientAppointments.map((appt) => (
                  <option key={appt.id} value={appt.id}>
                    {appt.appointment_date} {appt.appointment_time.slice(0, 5)} · {appt.doctor.doctor_name} ·{' '}
                    {appt.purpose} ({t(appt.status)})
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label className="form-label">{t('treatment_date')}</label>
            <input
              type="date"
              className={`form-control ${errors.treatment_date ? 'is-invalid' : ''}`}
              max={todayIso()}
              {...register('treatment_date', { required: true })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">{t('next_visit_date')}</label>
            <input type="date" className="form-control" {...register('next_visit_date')} />
          </div>

          <div className="col-12">
            <label className="form-label">{t('diagnosis')}</label>
            <textarea
              className={`form-control ${errors.diagnosis ? 'is-invalid' : ''}`}
              rows={2}
              {...register('diagnosis', { required: true })}
            />
            {errors.diagnosis && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">{t('treatment_performed')}</label>
            <textarea
              className={`form-control ${errors.treatment ? 'is-invalid' : ''}`}
              rows={2}
              {...register('treatment', { required: true })}
            />
            {errors.treatment && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">{t('treatment_note')}</label>
            <textarea className="form-control" rows={2} {...register('treatment_note')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
