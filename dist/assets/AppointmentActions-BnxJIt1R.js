import{C as e,E as t,M as n,P as r,d as i,f as a,i as o,y as s}from"./index-BW7-GjCJ.js";function c(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function l(e){let t=window.open(``,`_blank`,`width=480,height=640`);if(!t)return;let n=c(e.patient.full_name),r=c(e.patient.patient_code),i=c(e.doctor.doctor_name),a=c(e.doctor.specialization),o=c(e.purpose),s=e.remark?c(e.remark):``;t.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Appointment Slip - ${e.patient.patient_code}</title>
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
          <tr><td class="label">Patient</td><td>${n} (${r})</td></tr>
          <tr><td class="label">Doctor</td><td>${i} - ${a}</td></tr>
          <tr><td class="label">Date</td><td>${e.appointment_date}</td></tr>
          <tr><td class="label">Time</td><td>${e.appointment_time.slice(0,5)}</td></tr>
          <tr><td class="label">Purpose</td><td>${o}</td></tr>
          <tr><td class="label">Status</td><td><span class="badge">${e.status}</span></td></tr>
          ${s?`<tr><td class="label">Remark</td><td>${s}</td></tr>`:``}
        </table>
      </body>
    </html>
  `),t.document.close(),t.focus(),t.print()}var u=r();function d({appointment:r,canManage:c,canComplete:l,onEdit:d,onApprove:f,onCancel:p,onComplete:m,onCheckIn:h,onPrint:g}){let{t:_}=o(),v=r.status===`pending`||r.status===`confirmed`;return(0,u.jsxs)(`div`,{className:`d-flex justify-content-end gap-1`,children:[c&&r.status===`pending`&&(0,u.jsx)(`button`,{className:`btn btn-sm btn-light text-primary`,title:_(`approve`),onClick:()=>f(r),children:(0,u.jsx)(i,{})}),c&&r.status===`confirmed`&&!r.checked_in_at&&(0,u.jsx)(`button`,{className:`btn btn-sm btn-light text-info`,title:_(`check_in`),onClick:()=>h(r),children:(0,u.jsx)(e,{})}),l&&v&&(0,u.jsx)(`button`,{className:`btn btn-sm btn-light text-success`,title:_(`complete`),onClick:()=>m(r),children:(0,u.jsx)(a,{})}),c&&d&&v&&(0,u.jsx)(`button`,{className:`btn btn-sm btn-light`,title:_(`edit`),onClick:()=>d(r),children:(0,u.jsx)(s,{})}),c&&v&&(0,u.jsx)(`button`,{className:`btn btn-sm btn-light text-danger`,title:_(`cancel`),onClick:()=>p(r),children:(0,u.jsx)(n,{})}),(0,u.jsx)(`button`,{className:`btn btn-sm btn-light text-muted-soft`,title:_(`print`),onClick:()=>g(r),children:(0,u.jsx)(t,{})})]})}export{l as n,d as t};