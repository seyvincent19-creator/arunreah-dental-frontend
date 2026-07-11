import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import type { Invoice, PaymentPayload } from '../../types/invoice';

interface RecordPaymentModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function RecordPaymentModal({
  isOpen,
  invoice,
  isSubmitting,
  onClose,
  onSubmit,
}: RecordPaymentModalProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentPayload>({
    defaultValues: { amount: 0, payment_method: 'cash', payment_date: todayIso(), reference_no: '', note: '' },
  });

  useEffect(() => {
    if (isOpen && invoice) {
      reset({
        amount: invoice.balance_due,
        payment_method: 'cash',
        payment_date: todayIso(),
        reference_no: '',
        note: '',
      });
    }
  }, [isOpen, invoice, reset]);

  const formId = 'record-payment-form';

  if (!invoice) return null;

  return (
    <Modal
      title={`${t('record_payment')} · ${invoice.invoice_number}`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('record_payment')}
          </button>
        </>
      }
    >
      <div className="alert alert-light border d-flex justify-content-between mb-3">
        <span className="text-muted-soft">{t('balance_due')}</span>
        <span className="fw-bold">${invoice.balance_due.toFixed(2)}</span>
      </div>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">{t('amount')}</label>
            <input
              type="number"
              step="0.01"
              min={0.01}
              max={invoice.balance_due}
              className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
              {...register('amount', { required: true, valueAsNumber: true, min: 0.01, max: invoice.balance_due })}
            />
            {errors.amount && <div className="invalid-feedback">{t('this_field_is_required')}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('payment_method')}</label>
            <select className="form-select" {...register('payment_method', { required: true })}>
              <option value="cash">{t('cash')}</option>
              <option value="card">{t('card')}</option>
              <option value="bank_transfer">{t('bank_transfer')}</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('date')}</label>
            <input
              type="date"
              max={todayIso()}
              className="form-control"
              {...register('payment_date', { required: true })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">{t('reference_no')}</label>
            <input className="form-control" {...register('reference_no')} />
          </div>

          <div className="col-12">
            <label className="form-label">{t('note')}</label>
            <textarea className="form-control" rows={2} {...register('note')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
