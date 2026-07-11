import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import type { Patient, PatientPayload } from '../../types/patient';

interface PatientFormModalProps {
  isOpen: boolean;
  patient: Patient | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PatientPayload) => void;
}

const emptyValues: PatientPayload = {
  national_id: '',
  full_name: '',
  gender: 'male',
  date_of_birth: '',
  phone: '',
  email: '',
  address: '',
  emergency_contact: '',
  blood_group: null,
  allergy: '',
  medical_history: '',
  status: 'active',
};

export default function PatientFormModal({
  isOpen,
  patient,
  isSubmitting,
  onClose,
  onSubmit,
}: PatientFormModalProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientPayload>({ defaultValues: emptyValues });

  useEffect(() => {
    if (isOpen) {
      reset(
        patient
          ? {
              national_id: patient.national_id ?? '',
              full_name: patient.full_name,
              gender: patient.gender,
              date_of_birth: patient.date_of_birth,
              phone: patient.phone,
              email: patient.email ?? '',
              address: patient.address ?? '',
              emergency_contact: patient.emergency_contact ?? '',
              blood_group: patient.blood_group,
              allergy: patient.allergy ?? '',
              medical_history: patient.medical_history ?? '',
              status: patient.status,
            }
          : emptyValues,
      );
    }
  }, [isOpen, patient, reset]);

  const formId = 'patient-form';

  return (
    <Modal
      title={patient ? t('edit_patient') : t('add_patient')}
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
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">{t('full_name')}</label>
            <input
              className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
              {...register('full_name', { required: true })}
            />
            {errors.full_name && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('national_id')}</label>
            <input className="form-control" {...register('national_id')} />
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('gender')}</label>
            <select className="form-select" {...register('gender', { required: true })}>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('date_of_birth')}</label>
            <input
              type="date"
              className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
              {...register('date_of_birth', { required: true })}
            />
            {errors.date_of_birth && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('blood_group')}</label>
            <select className="form-select" {...register('blood_group')}>
              <option value="">—</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('phone')}</label>
            <input
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              {...register('phone', { required: true })}
            />
            {errors.phone && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('email')}</label>
            <input type="email" className="form-control" {...register('email')} />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('emergency_contact')}</label>
            <input className="form-control" {...register('emergency_contact')} />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('status')}</label>
            <select className="form-select" {...register('status')}>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">{t('address')}</label>
            <textarea className="form-control" rows={2} {...register('address')} />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('allergy')}</label>
            <textarea className="form-control" rows={2} {...register('allergy')} />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('medical_history')}</label>
            <textarea className="form-control" rows={2} {...register('medical_history')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
