import api from './axios';
import type { Invoice, InvoicePayload, InvoiceStatus, InvoiceSummary, PaymentPayload } from '../types/invoice';
import type { PaginatedResponse } from '../types/pagination';

export interface InvoiceListParams {
  page?: number;
  per_page?: number;
  search?: string;
  patient_id?: number;
  status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
}

export const listInvoices = (params: InvoiceListParams) =>
  api.get<PaginatedResponse<Invoice>>('/invoices', { params }).then((res) => res.data);

export const fetchInvoiceSummary = () => api.get<InvoiceSummary>('/invoices/summary').then((res) => res.data);

export const createInvoice = (payload: InvoicePayload) =>
  api.post<{ invoice: Invoice }>('/invoices', payload).then((res) => res.data.invoice);

export const updateInvoice = (id: number, payload: Partial<InvoicePayload>) =>
  api.put<{ invoice: Invoice }>(`/invoices/${id}`, payload).then((res) => res.data.invoice);

export const deleteInvoice = (id: number) => api.delete(`/invoices/${id}`).then((res) => res.data);

export const recordPayment = (invoiceId: number, payload: PaymentPayload) =>
  api.post<{ invoice: Invoice }>(`/invoices/${invoiceId}/payments`, payload).then((res) => res.data.invoice);

export const deletePayment = (invoiceId: number, paymentId: number) =>
  api.delete<{ invoice: Invoice }>(`/invoices/${invoiceId}/payments/${paymentId}`).then((res) => res.data.invoice);
