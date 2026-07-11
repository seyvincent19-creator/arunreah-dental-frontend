import { useEffect, useState } from 'react';
import { FiCheckCircle, FiEdit2, FiFileText, FiPlus, FiPrinter, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import {
  createPrescription,
  deletePrescription,
  dispensePrescription,
  listPrescriptions,
  updatePrescription,
} from '../../api/prescriptions';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Prescription, PrescriptionPayload } from '../../types/prescription';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import { printPrescription } from '../../utils/printPrescription';
import PrescriptionFormModal from './PrescriptionFormModal';

export default function PrescriptionList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin' || user?.role.name === 'doctor';
  const canDelete = user?.role.name === 'admin';
  const canDispense = user?.role.name === 'admin' || user?.role.name === 'pharmacist';

  const [response, setResponse] = useState<PaginatedResponse<Prescription> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const data = await listPrescriptions({ page, search: search || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchPrescriptions();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingPrescription(null);
    setIsModalOpen(true);
  };

  const openEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: PrescriptionPayload) => {
    if (payload.items.length === 0) {
      notifyError(t('at_least_one_item_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPrescription) {
        await updatePrescription(editingPrescription.id, payload);
      } else {
        await createPrescription(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchPrescriptions();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prescription: Prescription) => {
    const confirmed = await confirmDelete(prescription.patient.full_name);
    if (!confirmed) return;

    try {
      await deletePrescription(prescription.id);
      notifySuccess(t('deleted_successfully'));
      fetchPrescriptions();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  const handleDispense = async (prescription: Prescription) => {
    const result = await Swal.fire({
      icon: 'question',
      title: t('dispense'),
      text: t('dispense_confirm'),
      showCancelButton: true,
      confirmButtonText: t('dispense'),
      confirmButtonColor: '#0d9488',
    });
    if (!result.isConfirmed) return;

    try {
      await dispensePrescription(prescription.id);
      notifySuccess(t('saved_successfully'));
      fetchPrescriptions();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_prescriptions')}
        subtitle={t('manage_prescriptions_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_prescription')}
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
                <th>{t('prescription_date')}</th>
                <th>{t('patients')}</th>
                <th>{t('doctors')}</th>
                <th>{t('items')}</th>
                <th>{t('status')}</th>
                <th className="text-end">{t('actions')}</th>
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
                response?.data.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="text-muted-soft">{prescription.prescription_date}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={prescription.patient.full_name} size={32} />
                        <span className="fw-medium">{prescription.patient.full_name}</span>
                      </div>
                    </td>
                    <td>{prescription.doctor.doctor_name}</td>
                    <td className="text-muted-soft small">
                      {prescription.items.map((item) => item.medicine_name).join(', ')}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill fw-medium ${
                          prescription.status === 'dispensed'
                            ? 'text-bg-success-subtle text-success-emphasis'
                            : 'text-bg-warning-subtle text-warning-emphasis'
                        }`}
                      >
                        {t(prescription.status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {canDispense && prescription.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-light text-success"
                            title={t('dispense')}
                            onClick={() => handleDispense(prescription)}
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        {canManage && prescription.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-light"
                            title={t('edit')}
                            onClick={() => openEdit(prescription)}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-sm btn-light text-danger"
                            title={t('delete')}
                            onClick={() => handleDelete(prescription)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-light text-muted-soft"
                          title={t('print')}
                          onClick={() => printPrescription(prescription)}
                        >
                          <FiPrinter />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && response?.data.length === 0 && (
            <EmptyState icon={<FiFileText />} title={t('no_prescriptions_found')} />
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

      <PrescriptionFormModal
        isOpen={isModalOpen}
        prescription={editingPrescription}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
