import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import PharmacistDashboard from './PharmacistDashboard';

const dashboardByRole = {
  admin: AdminDashboard,
  doctor: DoctorDashboard,
  receptionist: ReceptionistDashboard,
  pharmacist: PharmacistDashboard,
};

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const RoleDashboard = dashboardByRole[user.role.name];

  return <RoleDashboard />;
}
