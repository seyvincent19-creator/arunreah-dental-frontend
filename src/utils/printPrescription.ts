import type { Prescription } from '../types/prescription';

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

export function printPrescription(prescription: Prescription) {
  const win = window.open('', '_blank', 'width=520,height=700');
  if (!win) return;

  const patientName = escapeHtml(prescription.patient.full_name);
  const patientCode = escapeHtml(prescription.patient.patient_code);
  const doctorName = escapeHtml(prescription.doctor.doctor_name);
  const note = prescription.note ? escapeHtml(prescription.note) : '';

  const rows = prescription.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.medicine_name)}</td>
          <td>${escapeHtml(item.dosage)}</td>
          <td>${escapeHtml(item.frequency)}</td>
          <td>${escapeHtml(item.duration)}</td>
          <td>${item.quantity} ${escapeHtml(item.unit)}</td>
          <td>${item.instruction ? escapeHtml(item.instruction) : '-'}</td>
        </tr>`,
    )
    .join('');

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Prescription - ${patientCode}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .sub { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
          th { color: #6b7280; text-transform: uppercase; font-size: 11px; }
          .meta td { border: none; padding: 3px 0; }
          .meta td.label { color: #6b7280; width: 30%; }
        </style>
      </head>
      <body>
        <h1>Arunreah Dental Clinic</h1>
        <div class="sub">Prescription</div>
        <table class="meta">
          <tr><td class="label">Patient</td><td>${patientName} (${patientCode})</td></tr>
          <tr><td class="label">Doctor</td><td>${doctorName}</td></tr>
          <tr><td class="label">Date</td><td>${prescription.prescription_date}</td></tr>
          ${note ? `<tr><td class="label">Note</td><td>${note}</td></tr>` : ''}
        </table>
        <table>
          <thead>
            <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Qty</th><th>Instruction</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
