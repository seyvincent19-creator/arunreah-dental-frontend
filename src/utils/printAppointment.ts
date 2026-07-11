import type { Appointment } from '../types/appointment';

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

export function printAppointment(appointment: Appointment) {
  const win = window.open('', '_blank', 'width=480,height=640');
  if (!win) return;

  const patientName = escapeHtml(appointment.patient.full_name);
  const patientCode = escapeHtml(appointment.patient.patient_code);
  const doctorName = escapeHtml(appointment.doctor.doctor_name);
  const specialization = escapeHtml(appointment.doctor.specialization);
  const purpose = escapeHtml(appointment.purpose);
  const remark = appointment.remark ? escapeHtml(appointment.remark) : '';

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Appointment Slip - ${appointment.patient.patient_code}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .sub { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          td.label { color: #6b7280; width: 40%; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #e6f7f5; color: #0d9488; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Arunreah Dental Clinic</h1>
        <div class="sub">Appointment Slip</div>
        <table>
          <tr><td class="label">Patient</td><td>${patientName} (${patientCode})</td></tr>
          <tr><td class="label">Doctor</td><td>${doctorName} - ${specialization}</td></tr>
          <tr><td class="label">Date</td><td>${appointment.appointment_date}</td></tr>
          <tr><td class="label">Time</td><td>${appointment.appointment_time.slice(0, 5)}</td></tr>
          <tr><td class="label">Purpose</td><td>${purpose}</td></tr>
          <tr><td class="label">Status</td><td><span class="badge">${appointment.status}</span></td></tr>
          ${remark ? `<tr><td class="label">Remark</td><td>${remark}</td></tr>` : ''}
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
