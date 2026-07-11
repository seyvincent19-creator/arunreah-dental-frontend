import type { ComponentType } from 'react';
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import { NavLink, Outlet } from 'react-router-dom';
import Swal from 'sweetalert2';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { RoleName } from '../types/auth';
import type { TranslationKey } from '../i18n/dictionary';

interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: ComponentType<{ className?: string }>;
}

const navByRole: Record<RoleName, NavItem[]> = {
  admin: [
    { to: '/dashboard', labelKey: 'dashboard', icon: FiGrid },
    { to: '/doctors', labelKey: 'doctors', icon: FiUserCheck },
    { to: '/patients', labelKey: 'patients', icon: FiUsers },
    { to: '/appointments', labelKey: 'appointments', icon: FiClipboard },
    { to: '/calendar', labelKey: 'calendar', icon: FiCalendar },
    { to: '/treatments', labelKey: 'treatments', icon: FiActivity },
    { to: '/prescriptions', labelKey: 'prescriptions', icon: FiFileText },
    { to: '/medicines', labelKey: 'medicines', icon: FiPackage },
    { to: '/invoices', labelKey: 'billing', icon: FiCreditCard },
    { to: '/reports', labelKey: 'reports', icon: FiBarChart2 },
  ],
  doctor: [
    { to: '/dashboard', labelKey: 'dashboard', icon: FiGrid },
    { to: '/patients', labelKey: 'patients', icon: FiUsers },
    { to: '/appointments', labelKey: 'appointments', icon: FiClipboard },
    { to: '/calendar', labelKey: 'calendar', icon: FiCalendar },
    { to: '/treatments', labelKey: 'treatments', icon: FiActivity },
    { to: '/prescriptions', labelKey: 'prescriptions', icon: FiFileText },
    { to: '/reports', labelKey: 'reports', icon: FiBarChart2 },
  ],
  receptionist: [
    { to: '/dashboard', labelKey: 'dashboard', icon: FiGrid },
    { to: '/patients', labelKey: 'patients', icon: FiUsers },
    { to: '/appointments', labelKey: 'appointments', icon: FiClipboard },
    { to: '/calendar', labelKey: 'calendar', icon: FiCalendar },
    { to: '/queue', labelKey: 'queue', icon: FiUserCheck },
    { to: '/invoices', labelKey: 'billing', icon: FiCreditCard },
  ],
  pharmacist: [
    { to: '/dashboard', labelKey: 'dashboard', icon: FiGrid },
    { to: '/prescriptions', labelKey: 'prescriptions', icon: FiFileText },
    { to: '/medicines', labelKey: 'medicines', icon: FiPackage },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t('logout'),
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('logout'),
      confirmButtonColor: '#0d9488',
    });

    if (result.isConfirmed) {
      await logout();
    }
  };

  const navItems = navByRole[user.role.name];

  return (
    <div className="d-flex vh-100">
      <aside className="app-sidebar d-flex flex-column p-3">
        <div className="d-flex align-items-center gap-2 mb-4 px-1">
          <span className="brand-mark">A</span>
          <span className="brand">{t('clinic_name')}</span>
        </div>
        <nav className="d-flex flex-column gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="app-topbar d-flex justify-content-between align-items-center px-4 py-2">
          <span className="text-muted-soft text-capitalize fw-medium">{user.role.label}</span>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select form-select-sm w-auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'km')}
            >
              <option value="en">EN</option>
              <option value="km">KH</option>
            </select>
            <div className="d-flex align-items-center gap-2">
              <Avatar name={user.name} size={34} />
              <span className="fw-medium">{user.name}</span>
            </div>
            <button
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
              onClick={handleLogout}
            >
              <FiLogOut /> {t('logout')}
            </button>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
