import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import type { Medicine, MedicinePayload } from '../../types/medicine';

interface MedicineFormModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MedicinePayload) => void;
}

const emptyValues: MedicinePayload = {
  medicine_name: '',
  category: '',
  unit: '',
  quantity: 0,
  purchase_price: 0,
  selling_price: 0,
  expiry_date: '',
  status: 'active',
};

export default function MedicineFormModal({
  isOpen,
  medicine,
  isSubmitting,
  onClose,
  onSubmit,
}: MedicineFormModalProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicinePayload>({ defaultValues: emptyValues });

  useEffect(() => {
    if (!isOpen) return;

    reset(
      medicine
        ? {
            medicine_name: medicine.medicine_name,
            category: medicine.category,
            unit: medicine.unit,
            quantity: medicine.quantity,
            purchase_price: medicine.purchase_price,
            selling_price: medicine.selling_price,
            expiry_date: medicine.expiry_date,
            status: medicine.status,
          }
        : emptyValues,
    );
  }, [isOpen, medicine, reset]);

  const formId = 'medicine-form';

  return (
    <Modal
      title={medicine ? t('edit_medicine') : t('add_medicine')}
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
            <label className="form-label">{t('medicine_name')}</label>
            <input
              className={`form-control ${errors.medicine_name ? 'is-invalid' : ''}`}
              {...register('medicine_name', { required: true })}
            />
            {errors.medicine_name && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('category')}</label>
            <input
              className={`form-control ${errors.category ? 'is-invalid' : ''}`}
              {...register('category', { required: true })}
            />
            {errors.category && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('unit')}</label>
            <input
              className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
              placeholder="Tablet, Bottle, Box..."
              {...register('unit', { required: true })}
            />
            {errors.unit && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('quantity')}</label>
            <input
              type="number"
              min={0}
              className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
              {...register('quantity', { required: true, valueAsNumber: true, min: 0 })}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('purchase_price')}</label>
            <input
              type="number"
              step="0.01"
              min={0}
              className={`form-control ${errors.purchase_price ? 'is-invalid' : ''}`}
              {...register('purchase_price', { required: true, valueAsNumber: true, min: 0 })}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">{t('selling_price')}</label>
            <input
              type="number"
              step="0.01"
              min={0}
              className={`form-control ${errors.selling_price ? 'is-invalid' : ''}`}
              {...register('selling_price', { required: true, valueAsNumber: true, min: 0 })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('expiry_date')}</label>
            <input
              type="date"
              className={`form-control ${errors.expiry_date ? 'is-invalid' : ''}`}
              {...register('expiry_date', { required: true })}
            />
            {errors.expiry_date && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
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
