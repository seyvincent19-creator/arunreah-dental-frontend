import { useEffect, useState } from 'react';
import { FiEdit2, FiEye, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  createInvoice,
  deleteInvoice,
  deletePayment,
  listInvoices,
  recordPayment as recordPaymentApi,
  updateInvoice,
} from '../../api/invoices';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import InvoiceStatusBadge from '../../components/ui/InvoiceStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Invoice, InvoicePayload, InvoiceStatus, PaymentPayload } from '../../types/invoice';
import type { PaginatedResponse } from '../../types/pagination';
import { confirmDelete, notifyError, notifySuccess } from '../../utils/confirm';
import InvoiceDetailModal from './InvoiceDetailModal';
import InvoiceFormModal from './InvoiceFormModal';
import RecordPaymentModal from './RecordPaymentModal';
import Swal from 'sweetalert2';

export default function InvoiceList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin' || user?.role.name === 'receptionist';
  const canDelete = user?.role.name === 'admin';

  const [response, setResponse] = useState<PaginatedResponse<Invoice> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await listInvoices({ page, search: search || undefined, status: status || undefined });
      setResponse(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchInvoices();
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const openCreate = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const openEdit = (invoice: Invoice) => {
    if (invoice.status !== 'unpaid') {
      notifyError(t('cannot_edit_invoice_with_payments'));
      return;
    }
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleSubmit = async (payload: InvoicePayload) => {
    setIsSubmitting(true);
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, payload);
      } else {
        await createInvoice(payload);
      }
      setIsFormOpen(false);
      notifySuccess(t('saved_successfully'));
      fetchInvoices();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    const confirmed = await confirmDelete(invoice.invoice_number);
    if (!confirmed) return;

    try {
      await deleteInvoice(invoice.id);
      notifySuccess(t('deleted_successfully'));
      fetchInvoices();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    }
  };

  const handleRecordPayment = async (payload: PaymentPayload) => {
    if (!paymentInvoice) return;

    setIsPaymentSubmitting(true);
    try {
      const updated = await recordPaymentApi(paymentInvoice.id, payload);
      setPaymentInvoice(null);
      setDetailInvoice(updated);
      notifySuccess(t('saved_successfully'));
      fetchInvoices();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('something_went_wrong');
      notifyError(message);
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleVoidPayment = async (invoice: Invoice, paymentId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: t('void_payment'),
      text: t('void_payment_confirm'),
      showCancelButton: true,
      confirmButtonText: t('void_payment'),
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;

    try {
      const updated = await deletePayment(invoice.id, paymentId);
      setDetailInvoice(updated);
      notifySuccess(t('saved_successfully'));
      fetchInvoices();
    } catch {
      notifyError(t('something_went_wrong'));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('manage_invoices')}
        subtitle={t('manage_invoices_subtitle')}
        action={
          canManage && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus /> {t('add_invoice')}
            </button>
          )
        }
      />

      <div className="card shadow-soft">
        <div className="card-header bg-white d-flex flex-wrap gap-2 align-items-center py-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`${t('patients')}...`} />
          <select
            className="form-select form-select-sm w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | '')}
          >
            <option value="">{t('all_statuses')}</option>
            <option value="unpaid">{t('unpaid')}</option>
            <option value="partial">{t('partial')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>{t('invoice_number')}</th>
                <th>{t('patients')}</th>
                <th>{t('invoice_date')}</th>
                <th>{t('total')}</th>
                <th>{t('balance_due')}</th>
                <th>{t('status')}</th>
                <th className="text-end">{t('actions')}</th>
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
                response?.data.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="text-muted-soft">{invoice.invoice_number}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={invoice.patient.full_name} size={32} />
                        <span className="fw-medium">{invoice.patient.full_name}</span>
                      </div>
                    </td>
                    <td className="text-muted-soft">{invoice.invoice_date}</td>
                    <td>${invoice.total_amount.toFixed(2)}</td>
                    <td>${invoice.balance_due.toFixed(2)}</td>
                    <td>
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light"
                          title={t('view_details')}
                          onClick={() => setDetailInvoice(invoice)}
                        >
                          <FiEye />
                        </button>
                        {canManage && invoice.status === 'unpaid' && (
                          <button
                            className="btn btn-sm btn-light"
                            title={t('edit')}
                            onClick={() => openEdit(invoice)}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-sm btn-light text-danger"
                            title={t('delete')}
                            onClick={() => handleDelete(invoice)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && response?.data.length === 0 && (
            <EmptyState icon={<FiFileText />} title={t('no_invoices_found')} />
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

      <InvoiceFormModal
        isOpen={isFormOpen}
        invoice={editingInvoice}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <InvoiceDetailModal
        isOpen={!!detailInvoice}
        invoice={detailInvoice}
        onClose={() => setDetailInvoice(null)}
        onRecordPayment={(invoice) => setPaymentInvoice(invoice)}
        onVoidPayment={handleVoidPayment}
      />

      <RecordPaymentModal
        isOpen={!!paymentInvoice}
        invoice={paymentInvoice}
        isSubmitting={isPaymentSubmitting}
        onClose={() => setPaymentInvoice(null)}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}
