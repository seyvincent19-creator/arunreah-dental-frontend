import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import MedicineSelect from '../../components/pickers/MedicineSelect';
import PatientPicker from '../../components/pickers/PatientPicker';
import { listTreatments } from '../../api/treatments';
import { useLanguage } from '../../context/LanguageContext';
import type { Treatment } from '../../types/treatment';
import type { Prescription, PrescriptionPayload } from '../../types/prescription';
import { notifyError } from '../../utils/confirm';

interface PrescriptionFormModalProps {
  isOpen: boolean;
  prescription: Prescription | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PrescriptionPayload) => void;
}

interface ItemFormValue {
  medicine_id: number | '';
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
  quantity: number;
}

interface FormValues {
  patient: { id: number; label: string } | null;
  treatment_id: number | '';
  prescription_date: string;
  note: string;
  items: ItemFormValue[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyItem: ItemFormValue = {
  medicine_id: '',
  dosage: '',
  frequency: '',
  duration: '',
  instruction: '',
  quantity: 1,
};

const emptyValues: FormValues = {
  patient: null,
  treatment_id: '',
  prescription_date: todayIso(),
  note: '',
  items: [{ ...emptyItem }],
};

export default function PrescriptionFormModal({
  isOpen,
  prescription,
  isSubmitting,
  onClose,
  onSubmit,
}: PrescriptionFormModalProps) {
  const { t } = useLanguage();
  const [patientTreatments, setPatientTreatments] = useState<Treatment[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: emptyValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const selectedPatient = watch('patient');

  useEffect(() => {
    if (!isOpen) return;

    if (prescription) {
      reset({
        patient: { id: prescription.patient.id, label: `${prescription.patient.full_name} (${prescription.patient.patient_code})` },
        treatment_id: prescription.treatment_id,
        prescription_date: prescription.prescription_date,
        note: prescription.note ?? '',
        items: prescription.items.map((item) => ({
          medicine_id: item.medicine_id,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instruction: item.instruction ?? '',
          quantity: item.quantity,
        })),
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, prescription, reset]);

  useEffect(() => {
    if (!selectedPatient) {
      setPatientTreatments([]);
      return;
    }

    listTreatments({ patient_id: selectedPatient.id, per_page: 20 }).then((res) => setPatientTreatments(res.data));
  }, [selectedPatient]);

  const submit = (values: FormValues) => {
    if (!values.patient || !values.treatment_id) return;

    const treatment = patientTreatments.find((tr) => tr.id === values.treatment_id) ?? prescription;
    const doctorId = treatment?.doctor.id;

    if (!doctorId) {
      notifyError(t('select_treatment'));
      return;
    }

    onSubmit({
      patient_id: values.patient.id,
      treatment_id: values.treatment_id,
      doctor_id: doctorId,
      prescription_date: values.prescription_date,
      note: values.note || null,
      items: values.items
        .filter((item) => item.medicine_id)
        .map((item) => ({
          medicine_id: item.medicine_id as number,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instruction: item.instruction || null,
          quantity: item.quantity,
        })),
    });
  };

  const formId = 'prescription-form';

  return (
    <Modal
      title={prescription ? t('edit_prescription') : t('add_prescription')}
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
          <div className="col-md-7">
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

          <div className="col-md-5">
            <label className="form-label">{t('prescription_date')}</label>
            <input
              type="date"
              className={`form-control ${errors.prescription_date ? 'is-invalid' : ''}`}
              max={todayIso()}
              {...register('prescription_date', { required: true })}
            />
          </div>

          {selectedPatient && (
            <div className="col-12">
              <label className="form-label">{t('select_treatment')}</label>
              {patientTreatments.length === 0 ? (
                <div className="text-muted-soft small">{t('no_treatments_for_patient')}</div>
              ) : (
                <select
                  className={`form-select ${errors.treatment_id ? 'is-invalid' : ''}`}
                  {...register('treatment_id', { required: true, valueAsNumber: true })}
                >
                  <option value="">—</option>
                  {patientTreatments.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.treatment_date} · {tr.doctor.doctor_name} · {tr.diagnosis}
                    </option>
                  ))}
                </select>
              )}
              {errors.treatment_id && <div className="invalid-feedback d-block">{t('this_field_is_required')}</div>}
            </div>
          )}

          <div className="col-12">
            <label className="form-label">{t('note')}</label>
            <textarea className="form-control" rows={2} {...register('note')} />
          </div>
        </div>

        <label className="form-label fw-semibold">{t('items')}</label>
        <div className="d-flex flex-column gap-2 mb-2">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-2 p-2">
              <div className="row g-2 align-items-center">
                <div className="col-md-4">
                  <Controller
                    name={`items.${index}.medicine_id`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: selectField }) => (
                      <MedicineSelect
                        value={selectField.value}
                        onChange={selectField.onChange}
                        isInvalid={!!errors.items?.[index]?.medicine_id}
                      />
                    )}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder={t('dosage')}
                    {...register(`items.${index}.dosage`, { required: true })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder={t('frequency')}
                    {...register(`items.${index}.frequency`, { required: true })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder={t('duration')}
                    {...register(`items.${index}.duration`, { required: true })}
                  />
                </div>
                <div className="col-md-1">
                  <input
                    type="number"
                    min={1}
                    className="form-control form-control-sm"
                    placeholder={t('quantity')}
                    {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })}
                  />
                </div>
                <div className="col-md-1 text-end">
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
                <div className="col-12">
                  <input
                    className="form-control form-control-sm"
                    placeholder={t('instruction')}
                    {...register(`items.${index}.instruction`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => append({ ...emptyItem })}>
          <FiPlus /> {t('add_item')}
        </button>
      </form>
    </Modal>
  );
}
