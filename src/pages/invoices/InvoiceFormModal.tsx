import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import PatientPicker from '../../components/pickers/PatientPicker';
import { listTreatments } from '../../api/treatments';
import { listMedicines } from '../../api/medicines';
import { useLanguage } from '../../context/LanguageContext';
import type { Treatment } from '../../types/treatment';
import type { Medicine } from '../../types/medicine';
import type { Invoice, InvoiceItemType, InvoicePayload } from '../../types/invoice';

interface InvoiceFormModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: InvoicePayload) => void;
}

interface ItemFormValue {
  item_type: InvoiceItemType;
  treatment_id: number | '';
  medicine_id: number | '';
  description: string;
  quantity: number;
  unit_price: number;
}

interface FormValues {
  patient: { id: number; label: string } | null;
  invoice_date: string;
  discount_amount: number;
  note: string;
  items: ItemFormValue[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyItem: ItemFormValue = {
  item_type: 'other',
  treatment_id: '',
  medicine_id: '',
  description: '',
  quantity: 1,
  unit_price: 0,
};

const emptyValues: FormValues = {
  patient: null,
  invoice_date: todayIso(),
  discount_amount: 0,
  note: '',
  items: [{ ...emptyItem }],
};

export default function InvoiceFormModal({ isOpen, invoice, isSubmitting, onClose, onSubmit }: InvoiceFormModalProps) {
  const { t } = useLanguage();
  const [patientTreatments, setPatientTreatments] = useState<Treatment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: emptyValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const selectedPatient = watch('patient');
  const items = watch('items');

  useEffect(() => {
    listMedicines({ per_page: 200, status: 'active' }).then((res) => setMedicines(res.data));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (invoice) {
      reset({
        patient: { id: invoice.patient.id, label: `${invoice.patient.full_name} (${invoice.patient.patient_code})` },
        invoice_date: invoice.invoice_date,
        discount_amount: invoice.discount_amount,
        note: invoice.note ?? '',
        items: invoice.items.map((item) => ({
          item_type: item.item_type,
          treatment_id: item.treatment_id ?? '',
          medicine_id: item.medicine_id ?? '',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, invoice, reset]);

  useEffect(() => {
    if (!selectedPatient) {
      setPatientTreatments([]);
      return;
    }
    listTreatments({ patient_id: selectedPatient.id, per_page: 20 }).then((res) => setPatientTreatments(res.data));
  }, [selectedPatient]);

  const handleTreatmentSelect = (index: number, treatmentId: number | '') => {
    setValue(`items.${index}.treatment_id`, treatmentId);
    const treatment = patientTreatments.find((tr) => tr.id === treatmentId);
    if (treatment) {
      setValue(`items.${index}.description`, treatment.treatment);
    }
  };

  const handleMedicineSelect = (index: number, medicineId: number | '') => {
    setValue(`items.${index}.medicine_id`, medicineId);
    const medicine = medicines.find((m) => m.id === medicineId);
    if (medicine) {
      setValue(`items.${index}.description`, medicine.medicine_name);
      setValue(`items.${index}.unit_price`, medicine.selling_price);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
  const discount = watch('discount_amount') || 0;
  const total = Math.max(subtotal - discount, 0);

  const submit = (values: FormValues) => {
    if (!values.patient) return;

    onSubmit({
      patient_id: values.patient.id,
      invoice_date: values.invoice_date,
      discount_amount: values.discount_amount || 0,
      note: values.note || null,
      items: values.items.map((item) => ({
        item_type: item.item_type,
        treatment_id: item.item_type === 'treatment' ? (item.treatment_id as number) : null,
        medicine_id: item.item_type === 'medicine' ? (item.medicine_id as number) : null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    });
  };

  const formId = 'invoice-form';

  return (
    <Modal
      title={invoice ? t('edit_invoice') : t('add_invoice')}
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
        <div className="row g-3 mb-3">
          <div className="col-md-8">
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

          <div className="col-md-4">
            <label className="form-label">{t('invoice_date')}</label>
            <input
              type="date"
              className="form-control"
              max={todayIso()}
              {...register('invoice_date', { required: true })}
            />
          </div>

          <div className="col-12">
            <label className="form-label">{t('note')}</label>
            <textarea className="form-control" rows={2} {...register('note')} />
          </div>
        </div>

        <label className="form-label fw-semibold">{t('items')}</label>
        <div className="d-flex flex-column gap-2 mb-2">
          {fields.map((field, index) => {
            const itemType = items[index]?.item_type;

            return (
              <div key={field.id} className="border rounded-2 p-2">
                <div className="row g-2 align-items-center">
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-sm"
                      {...register(`items.${index}.item_type`)}
                      onChange={(e) => {
                        setValue(`items.${index}.item_type`, e.target.value as InvoiceItemType);
                        setValue(`items.${index}.treatment_id`, '');
                        setValue(`items.${index}.medicine_id`, '');
                      }}
                    >
                      <option value="other">{t('other_charge')}</option>
                      <option value="treatment">{t('treatment_charge')}</option>
                      <option value="medicine">{t('medicine_charge')}</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    {itemType === 'treatment' && (
                      <select
                        className="form-select form-select-sm"
                        value={items[index]?.treatment_id ?? ''}
                        onChange={(e) => handleTreatmentSelect(index, e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">—</option>
                        {patientTreatments.map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {tr.treatment_date} · {tr.treatment}
                          </option>
                        ))}
                      </select>
                    )}
                    {itemType === 'medicine' && (
                      <select
                        className="form-select form-select-sm"
                        value={items[index]?.medicine_id ?? ''}
                        onChange={(e) => handleMedicineSelect(index, e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">—</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.medicine_name} (${m.selling_price.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    )}
                    {itemType === 'other' && (
                      <input
                        className="form-control form-control-sm"
                        placeholder={t('description')}
                        {...register(`items.${index}.description`, { required: true })}
                      />
                    )}
                  </div>

                  <div className="col-md-2">
                    <input
                      type="number"
                      min={1}
                      className="form-control form-control-sm"
                      placeholder={t('quantity')}
                      {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })}
                    />
                  </div>

                  <div className="col-md-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="form-control form-control-sm"
                      placeholder={t('unit_price')}
                      {...register(`items.${index}.unit_price`, { required: true, valueAsNumber: true, min: 0 })}
                    />
                  </div>

                  <div className="col-md-2 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-light text-danger"
                      title={t('remove_item')}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {(itemType === 'treatment' || itemType === 'medicine') && (
                    <div className="col-12">
                      <input
                        className="form-control form-control-sm"
                        placeholder={t('description')}
                        {...register(`items.${index}.description`, { required: true })}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 mb-3"
          onClick={() => append({ ...emptyItem })}
        >
          <FiPlus /> {t('add_charge')}
        </button>

        <div className="border-top pt-2">
          <div className="d-flex justify-content-between">
            <span className="text-muted-soft">{t('subtotal')}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted-soft">{t('discount')}</span>
            <input
              type="number"
              step="0.01"
              min={0}
              className="form-control form-control-sm w-auto text-end"
              {...register('discount_amount', { valueAsNumber: true, min: 0 })}
            />
          </div>
          <div className="d-flex justify-content-between fw-bold fs-5 mt-1">
            <span>{t('total')}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
