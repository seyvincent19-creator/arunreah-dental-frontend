import { useEffect, useState } from 'react';
import { FiClipboard, FiEdit2, FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import { createPatient, deletePatient, listPatients, updatePatient } from '../../api/patients';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Patient, PatientPayload } from '../../types/patient';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import MedicalRecordModal from '../medical-record/MedicalRecordModal';
import PatientFormModal from './PatientFormModal';

export default function PatientList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canEdit = user?.role.name === 'admin' || user?.role.name === 'receptionist';
  const canDelete = user?.role.name === 'admin';
  const canViewHistory = user?.role.name === 'admin' || user?.role.name === 'doctor';

  const [response, setResponse] = useState<PaginatedResponse<Patient> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await listPatients({ page, search: search || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchPatients();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: PatientPayload) => {
    setIsSubmitting(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
      } else {
        await createPatient(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchPatients();
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (patient: Patient) => {
    const confirmed = await confirmDelete(patient.full_name);
    if (!confirmed) return;

    try {
      await deletePatient(patient.id);
      notifySuccess(t('deleted_successfully'));
      fetchPatients();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_patients')}
        subtitle={t('manage_patients_subtitle')}
        action={
          canEdit && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_patient')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`${t('patients')}...`} />
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('patient_code')}</th>
                <th>{t('name')}</th>
                <th>{t('gender')}</th>
                <th>{t('phone')}</th>
                <th>{t('blood_group')}</th>
                <th>{t('status')}</th>
                {(canEdit || canDelete || canViewHistory) && <th className="text-end">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                response?.data.map((patient) => (
                  <tr key={patient.id}>
                    <td className="text-muted-soft">{patient.patient_code}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={patient.full_name} size={34} />
                        <div>
                          <div className="fw-medium">{patient.full_name}</div>
                          {patient.age !== null && (
                            <div className="text-muted-soft small">{patient.age} yrs</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-capitalize">{t(patient.gender)}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.blood_group ?? '—'}</td>
                    <td>
                      <StatusBadge status={patient.status} />
                    </td>
                    {(canEdit || canDelete || canViewHistory) && (
                      <td className="text-end">
                        {canViewHistory && (
                          <button
                            className="btn btn-sm btn-light me-1"
                            title={t('view_history')}
                            onClick={() => setHistoryPatientId(patient.id)}
                          >
                            <FiClipboard />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            className="btn btn-sm btn-light me-1"
                            title={t('edit')}
                            onClick={() => openEdit(patient)}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-sm btn-light text-danger"
                            title={t('delete')}
                            onClick={() => handleDelete(patient)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && response?.data.length === 0 && (
            <EmptyState icon={<FiUsers />} title={t('no_patients_found')} />
          )}
        </div>

        {response && (
          <div className="card-body pt-0">
            <Pagination
              currentPage={response.meta.current_page}
              lastPage={response.meta.last_page}
              total={response.meta.total}
              perPage={response.meta.per_page}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <PatientFormModal
        isOpen={isModalOpen}
        patient={editingPatient}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <MedicalRecordModal
        isOpen={historyPatientId !== null}
        patientId={historyPatientId}
        onClose={() => setHistoryPatientId(null)}
      />
    </div>
  );
}
