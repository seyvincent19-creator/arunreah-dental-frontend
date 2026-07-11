import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiEdit2, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { createMedicine, deleteMedicine, listMedicines, updateMedicine } from '../../api/medicines';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Medicine, MedicinePayload } from '../../types/medicine';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import MedicineFormModal from './MedicineFormModal';

const LOW_STOCK_THRESHOLD = 20;

export default function MedicineList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin';

  const [response, setResponse] = useState<PaginatedResponse<Medicine> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await listMedicines({ page, search: search || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchMedicines();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const openEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: MedicinePayload) => {
    setIsSubmitting(true);
    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, payload);
      } else {
        await createMedicine(payload);
      }
      setIsModalOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchMedicines();
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (medicine: Medicine) => {
    const confirmed = await confirmDelete(medicine.medicine_name);
    if (!confirmed) return;

    try {
      await deleteMedicine(medicine.id);
      notifySuccess(t('deleted_successfully'));
      fetchMedicines();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_medicines')}
        subtitle={t('manage_medicines_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_medicine')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white py-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`${t('medicines')}...`} />
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('medicine_code')}</th>
                <th>{t('medicine_name')}</th>
                <th>{t('category')}</th>
                <th>{t('quantity')}</th>
                <th>{t('selling_price')}</th>
                <th>{t('expiry_date')}</th>
                <th>{t('status')}</th>
                {canManage && <th className="text-end">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                response?.data.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="text-muted-soft">{medicine.medicine_code}</td>
                    <td className="fw-medium">{medicine.medicine_name}</td>
                    <td>{medicine.category}</td>
                    <td>
                      <span
                        className={`d-inline-flex align-items-center gap-1 ${
                          medicine.quantity <= LOW_STOCK_THRESHOLD ? 'text-danger fw-semibold' : ''
                        }`}
                      >
                        {medicine.quantity <= LOW_STOCK_THRESHOLD && <FiAlertTriangle title={t('low_stock')} />}
                        {medicine.quantity} {medicine.unit}
                      </span>
                    </td>
                    <td>${medicine.selling_price.toFixed(2)}</td>
                    <td className="text-muted-soft">{medicine.expiry_date}</td>
                    <td>
                      <StatusBadge status={medicine.status} />
                    </td>
                    {canManage && (
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light me-1"
                          title={t('edit')}
                          onClick={() => openEdit(medicine)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-light text-danger"
                          title={t('delete')}
                          onClick={() => handleDelete(medicine)}
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
            <EmptyState icon={<FiPackage />} title={t('no_medicines_found')} />
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

      <MedicineFormModal
        isOpen={isModalOpen}
        medicine={editingMedicine}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
