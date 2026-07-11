import { FiPrinter, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/ui/Modal';
import InvoiceStatusBadge from '../../components/ui/InvoiceStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Invoice } from '../../types/invoice';
import { printInvoice } from '../../utils/printInvoice';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onVoidPayment: (invoice: Invoice, paymentId: number) => void;
}

export default function InvoiceDetailModal({
  isOpen,
  invoice,
  onClose,
  onRecordPayment,
  onVoidPayment,
}: InvoiceDetailModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = user?.role.name === 'admin' || user?.role.name === 'receptionist';
  const canVoidPayment = user?.role.name === 'admin';

  if (!invoice) return null;

  return (
    <Modal
      title={invoice.invoice_number}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>
            {t('close')}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => printInvoice(invoice)}
          >
            <FiPrinter /> {t('print')}
          </button>
          {canManage && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button type="button" className="btn btn-primary" onClick={() => onRecordPayment(invoice)}>
              {t('record_payment')}
            </button>
          )}
        </>
      }
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div className="fw-semibold">{invoice.patient.full_name}</div>
          <div className="text-muted-soft small">
            {invoice.patient.patient_code} · {invoice.invoice_date}
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="table-responsive mb-3">
        <table className="table table-modern table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>{t('description')}</th>
              <th>{t('quantity')}</th>
              <th>{t('unit_price')}</th>
              <th>{t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td>${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column align-items-end mb-4">
        <div className="d-flex justify-content-between" style={{ width: 220 }}>
          <span className="text-muted-soft">{t('subtotal')}</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between" style={{ width: 220 }}>
          <span className="text-muted-soft">{t('discount')}</span>
          <span>-${invoice.discount_amount.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold" style={{ width: 220 }}>
          <span>{t('total')}</span>
          <span>${invoice.total_amount.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between text-success" style={{ width: 220 }}>
          <span>{t('amount_paid')}</span>
          <span>${invoice.amount_paid.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold text-danger" style={{ width: 220 }}>
          <span>{t('balance_due')}</span>
          <span>${invoice.balance_due.toFixed(2)}</span>
        </div>
      </div>

      <h6 className="fw-semibold mb-2">{t('payment_history')}</h6>
      {invoice.payments.length === 0 ? (
        <p className="text-muted-soft small">{t('no_invoices_found')}</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {invoice.payments.map((payment) => (
            <div key={payment.id} className="d-flex justify-content-between align-items-center border rounded-2 p-2">
              <div>
                <div className="fw-medium">
                  ${payment.amount.toFixed(2)} · {t(payment.payment_method)}
                </div>
                <div className="text-muted-soft small">
                  {payment.payment_date} {payment.received_by ? `· ${payment.received_by}` : ''}
                  {payment.reference_no ? ` · ${payment.reference_no}` : ''}
                </div>
              </div>
              {canVoidPayment && (
                <button
                  className="btn btn-sm btn-light text-danger"
                  title={t('void_payment')}
                  onClick={() => onVoidPayment(invoice, payment.id)}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
