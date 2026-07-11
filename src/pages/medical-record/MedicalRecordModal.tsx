import { useEffect, useState } from 'react';
import { FiCalendar, FiClipboard, FiFileText } from 'react-icons/fi';
import { fetchMedicalRecord } from '../../api/medicalRecord';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import AppointmentStatusBadge from '../../components/ui/AppointmentStatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import type { MedicalRecord } from '../../types/medicalRecord';
import { notifyError } from '../../utils/confirm';

interface MedicalRecordModalProps {
  isOpen: boolean;
  patientId: number | null;
  onClose: () => void;
}

export default function MedicalRecordModal({ isOpen, patientId, onClose }: MedicalRecordModalProps) {
  const { t } = useLanguage();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !patientId) {
      setRecord(null);
      return;
    }

    setIsLoading(true);
    fetchMedicalRecord(patientId)
      .then(setRecord)
      .catch(() => notifyError(t('something_went_wrong')))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patientId]);

  return (
    <Modal
      title={record ? `${t('medical_record')} · ${record.patient.full_name}` : t('medical_record')}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <button type="button" className="btn btn-light" onClick={onClose}>
          {t('close')}
        </button>
      }
    >
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      )}

      {!isLoading && record && (
        <div className="d-flex flex-column gap-4">
          <section>
            <h6 className="fw-semibold d-flex align-items-center gap-2 mb-2">
              <FiCalendar /> {t('appointment_history')}
            </h6>
            {record.appointment_history.length === 0 ? (
              <EmptyState icon={<FiCalendar />} title={t('no_appointments_found')} />
            ) : (
              <div className="table-responsive">
                <table className="table table-modern table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>{t('date')}</th>
                      <th>{t('time')}</th>
                      <th>{t('doctors')}</th>
                      <th>{t('purpose')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.appointment_history.map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.appointment_date}</td>
                        <td>{appt.appointment_time.slice(0, 5)}</td>
                        <td>{appt.doctor.doctor_name}</td>
                        <td>{appt.purpose}</td>
                        <td>
                          <AppointmentStatusBadge status={appt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h6 className="fw-semibold d-flex align-items-center gap-2 mb-2">
              <FiClipboard /> {t('treatment_history')}
            </h6>
            {record.treatment_history.length === 0 ? (
              <EmptyState icon={<FiClipboard />} title={t('no_treatments_found')} />
            ) : (
              <div className="d-flex flex-column gap-2">
                {record.treatment_history.map((tr) => (
                  <div key={tr.id} className="border rounded-2 p-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium">{tr.treatment_date}</span>
                      <span className="text-muted-soft small">{tr.doctor.doctor_name}</span>
                    </div>
                    <div className="small mt-1">
                      <strong>{t('diagnosis')}:</strong> {tr.diagnosis}
                    </div>
                    <div className="small">
                      <strong>{t('treatment_performed')}:</strong> {tr.treatment}
                    </div>
                    {tr.treatment_note && (
                      <div className="small text-muted-soft">
                        <strong>{t('treatment_note')}:</strong> {tr.treatment_note}
                      </div>
                    )}
                    {tr.next_visit_date && (
                      <div className="small text-muted-soft">
                        <strong>{t('next_visit_date')}:</strong> {tr.next_visit_date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h6 className="fw-semibold d-flex align-items-center gap-2 mb-2">
              <FiFileText /> {t('prescription_history')}
            </h6>
            {record.prescription_history.length === 0 ? (
              <EmptyState icon={<FiFileText />} title={t('no_prescriptions_found')} message={t('no_prescriptions_yet')} />
            ) : (
              <div className="d-flex flex-column gap-2">
                {record.prescription_history.map((pr) => (
                  <div key={pr.id} className="border rounded-2 p-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium">{pr.prescription_date}</span>
                      <span
                        className={`badge rounded-pill fw-medium ${
                          pr.status === 'dispensed'
                            ? 'text-bg-success-subtle text-success-emphasis'
                            : 'text-bg-warning-subtle text-warning-emphasis'
                        }`}
                      >
                        {t(pr.status)}
                      </span>
                    </div>
                    <div className="small text-muted-soft">{pr.doctor.doctor_name}</div>
                    <ul className="small mb-0 mt-1 ps-3">
                      {pr.items.map((item) => (
                        <li key={item.id}>
                          {item.medicine_name} — {item.dosage}, {item.frequency}, {item.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
