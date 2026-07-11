import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const DoctorList = lazy(() => import('./pages/doctors/DoctorList'));
const PatientList = lazy(() => import('./pages/patients/PatientList'));
const AppointmentList = lazy(() => import('./pages/appointments/AppointmentList'));
const CalendarView = lazy(() => import('./pages/appointments/CalendarView'));
const Queue = lazy(() => import('./pages/queue/Queue'));
const TreatmentList = lazy(() => import('./pages/treatments/TreatmentList'));
const MedicineList = lazy(() => import('./pages/medicines/MedicineList'));
const PrescriptionList = lazy(() => import('./pages/prescriptions/PrescriptionList'));
const InvoiceList = lazy(() => import('./pages/invoices/InvoiceList'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

function RouteFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/doctors" element={<DoctorList />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']} />}>
              <Route path="/patients" element={<PatientList />} />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/calendar" element={<CalendarView />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
              <Route path="/queue" element={<Queue />} />
              <Route path="/invoices" element={<InvoiceList />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor']} />}>
              <Route path="/treatments" element={<TreatmentList />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'pharmacist']} />}>
              <Route path="/prescriptions" element={<PrescriptionList />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']} />}>
              <Route path="/medicines" element={<MedicineList />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
