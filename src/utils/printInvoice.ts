import type { Invoice } from '../types/invoice';

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

export function printInvoice(invoice: Invoice) {
  const win = window.open('', '_blank', 'width=520,height=700');
  if (!win) return;

  const patientName = escapeHtml(invoice.patient.full_name);
  const patientCode = escapeHtml(invoice.patient.patient_code);
  const note = invoice.note ? escapeHtml(invoice.note) : '';

  const rows = invoice.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td>${item.quantity}</td>
          <td>$${item.unit_price.toFixed(2)}</td>
          <td>$${item.amount.toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Invoice - ${invoice.invoice_number}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .sub { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
          th { color: #6b7280; text-transform: uppercase; font-size: 11px; }
          .meta td { border: none; padding: 3px 0; }
          .meta td.label { color: #6b7280; width: 30%; }
          .totals td { border: none; padding: 3px 0; text-align: right; }
          .totals td.label { color: #6b7280; }
          .totals tr.grand td { font-weight: bold; font-size: 15px; border-top: 1px solid #111827; padding-top: 6px; }
        </style>
      </head>
      <body>
        <h1>Arunreah Dental Clinic</h1>
        <div class="sub">Invoice ${invoice.invoice_number}</div>
        <table class="meta">
          <tr><td class="label">Patient</td><td>${patientName} (${patientCode})</td></tr>
          <tr><td class="label">Date</td><td>${invoice.invoice_date}</td></tr>
          <tr><td class="label">Status</td><td>${invoice.status}</td></tr>
          ${note ? `<tr><td class="label">Note</td><td>${note}</td></tr>` : ''}
        </table>
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <table class="totals">
          <tr><td class="label">Subtotal</td><td>$${invoice.subtotal.toFixed(2)}</td></tr>
          <tr><td class="label">Discount</td><td>-$${invoice.discount_amount.toFixed(2)}</td></tr>
          <tr class="grand"><td class="label">Total</td><td>$${invoice.total_amount.toFixed(2)}</td></tr>
          <tr><td class="label">Paid</td><td>$${invoice.amount_paid.toFixed(2)}</td></tr>
          <tr><td class="label">Balance Due</td><td>$${invoice.balance_due.toFixed(2)}</td></tr>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
