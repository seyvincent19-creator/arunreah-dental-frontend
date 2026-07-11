import { useEffect, useState } from 'react';
import { FiClipboard, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { createTreatment, deleteTreatment, listTreatments, updateTreatment } from '../../api/treatments';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Treatment, TreatmentPayload } from '../../types/treatment';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import TreatmentFormModal from './TreatmentFormModal';

export default function TreatmentList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin' || user?.role.name === 'doctor';
  const canDelete = user?.role.name === 'admin';

  const [response, setResponse] = useState<PaginatedResponse<Treatment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTreatments = async () => {
    setIsLoading(true);
    try {
      const data = await listTreatments({ page, search: search || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchTreatments();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingTreatment(null);
    setIsModalOpen(true);
  };

  const openEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: TreatmentPayload) => {
    setIsSubmitting(true);
    try {
      if (editingTreatment) {
        await updateTreatment(editingTreatment.id, payload);
      } else {
        await createTreatment(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchTreatments();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (treatment: Treatment) => {
    const confirmed = await confirmDelete(treatment.patient.full_name);
    if (!confirmed) return;

    try {
      await deleteTreatment(treatment.id);
      notifySuccess(t('deleted_successfully'));
      fetchTreatments();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_treatments')}
        subtitle={t('manage_treatments_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_treatment')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white py-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`${t('patients')}...`} />
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('treatment_date')}</th>
                <th>{t('patients')}</th>
                <th>{t('doctors')}</th>
                <th>{t('diagnosis')}</th>
                <th>{t('next_visit_date')}</th>
                {(canManage || canDelete) && <th className="text-end">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                response?.data.map((treatment) => (
                  <tr key={treatment.id}>
                    <td className="text-muted-soft">{treatment.treatment_date}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={treatment.patient.full_name} size={32} />
                        <span className="fw-medium">{treatment.patient.full_name}</span>
                      </div>
                    </td>
                    <td>{treatment.doctor.doctor_name}</td>
                    <td className="text-truncate" style={{ maxWidth: 220 }}>
                      {treatment.diagnosis}
                    </td>
                    <td className="text-muted-soft">{treatment.next_visit_date ?? '—'}</td>
                    {(canManage || canDelete) && (
                      <td className="text-end">
                        {canManage && (
                          <button
                            className="btn btn-sm btn-light me-1"
                            title={t('edit')}
                            onClick={() => openEdit(treatment)}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-sm btn-light text-danger"
                            title={t('delete')}
                            onClick={() => handleDelete(treatment)}
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
            <EmptyState icon={<FiClipboard />} title={t('no_treatments_found')} />
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

      <TreatmentFormModal
        isOpen={isModalOpen}
        treatment={editingTreatment}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
