import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import type { Doctor, DoctorPayload } from '../../types/doctor';

interface DoctorFormModalProps {
  isOpen: boolean;
  doctor: Doctor | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: DoctorPayload) => void;
}

const emptyValues: DoctorPayload = {
  doctor_name: '',
  gender: 'male',
  specialization: '',
  phone: '',
  email: '',
  status: 'active',
};

export default function DoctorFormModal({
  isOpen,
  doctor,
  isSubmitting,
  onClose,
  onSubmit,
}: DoctorFormModalProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorPayload>({ defaultValues: emptyValues });

  useEffect(() => {
    if (isOpen) {
      reset(
        doctor
          ? {
              doctor_name: doctor.doctor_name,
              gender: doctor.gender,
              specialization: doctor.specialization,
              phone: doctor.phone,
              email: doctor.email,
              status: doctor.status,
            }
          : emptyValues,
      );
    }
  }, [isOpen, doctor, reset]);

  const formId = 'doctor-form';

  return (
    <Modal
      title={doctor ? t('edit_doctor') : t('add_doctor')}
      isOpen={isOpen}
      onClose={onClose}
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
          <div className="col-12">
            <label className="form-label">{t('full_name')}</label>
            <input
              className={`form-control ${errors.doctor_name ? 'is-invalid' : ''}`}
              {...register('doctor_name', { required: true })}
            />
            {errors.doctor_name && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('gender')}</label>
            <select className="form-select" {...register('gender', { required: true })}>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('specialization')}</label>
            <input
              className={`form-control ${errors.specialization ? 'is-invalid' : ''}`}
              {...register('specialization', { required: true })}
            />
            {errors.specialization && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
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
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email', { required: true })}
            />
            {errors.email && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('status')}</label>
            <select className="form-select" {...register('status')}>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
