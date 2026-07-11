export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'cancelled';
export type InvoiceItemType = 'treatment' | 'medicine' | 'other';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export interface InvoiceItem {
  id: number;
  item_type: InvoiceItemType;
  treatment_id: number | null;
  medicine_id: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Payment {
  id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_no: string | null;
  note: string | null;
  received_by: string | null;
  created_at: string;
}

export interface InvoicePatientSummary {
  id: number;
  patient_code: string;
  full_name: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  note: string | null;
  patient: InvoicePatientSummary;
  items: InvoiceItem[];
  payments: Payment[];
  created_by: string | null;
  created_at: string;
}

export interface InvoiceItemPayload {
  item_type: InvoiceItemType;
  treatment_id?: number | null;
  medicine_id?: number | null;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoicePayload {
  patient_id: number;
  invoice_date: string;
  discount_amount?: number;
  note?: string | null;
  items: InvoiceItemPayload[];
}

export interface PaymentPayload {
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_no?: string | null;
  note?: string | null;
}

export interface InvoiceSummary {
  monthly_income: number;
  unpaid_count: number;
  partial_count: number;
}
