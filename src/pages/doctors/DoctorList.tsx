import { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiUserCheck } from 'react-icons/fi';
import { createDoctor, deleteDoctor, listDoctors, updateDoctor } from '../../api/doctors';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Doctor, DoctorPayload } from '../../types/doctor';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import DoctorFormModal from './DoctorFormModal';

export default function DoctorList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin';

  const [response, setResponse] = useState<PaginatedResponse<Doctor> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await listDoctors({ page, search: search || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchDoctors();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: DoctorPayload) => {
    setIsSubmitting(true);
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
      } else {
        await createDoctor(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchDoctors();
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    const confirmed = await confirmDelete(doctor.doctor_name);
    if (!confirmed) return;

    try {
      await deleteDoctor(doctor.id);
      notifySuccess(t('deleted_successfully'));
      fetchDoctors();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_doctors')}
        subtitle={t('manage_doctors_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_doctor')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`${t('doctors')}...`} />
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('doctor_code')}</th>
                <th>{t('name')}</th>
                <th>{t('specialization')}</th>
                <th>{t('phone')}</th>
                <th>{t('email')}</th>
                <th>{t('status')}</th>
                {canManage && <th className="text-end">{t('actions')}</th>}
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
                response?.data.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="text-muted-soft">{doctor.doctor_code}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={doctor.doctor_name} size={34} />
                        <span className="fw-medium">{doctor.doctor_name}</span>
                      </div>
                    </td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.email}</td>
                    <td>
                      <StatusBadge status={doctor.status} />
                    </td>
                    {canManage && (
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light me-1"
                          title={t('edit')}
                          onClick={() => openEdit(doctor)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-light text-danger"
                          title={t('delete')}
                          onClick={() => handleDelete(doctor)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && response?.data.length === 0 && (
            <EmptyState icon={<FiUserCheck />} title={t('no_doctors_found')} />
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

      <DoctorFormModal
        isOpen={isModalOpen}
        doctor={editingDoctor}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
