import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiFlag, FiUserCheck } from 'react-icons/fi';
import { listAppointments } from '../../api/appointments';
import StatCard from '../../components/StatCard';
import { useLanguage } from '../../context/LanguageContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ReceptionistDashboard() {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({ total: 0, pending: 0, checkedIn: 0, completed: 0 });

  useEffect(() => {
    listAppointments({ date: todayIso(), per_page: 100 }).then((res) => {
      setCounts({
        total: res.meta.total,
        pending: res.data.filter((a) => a.status === 'pending').length,
        checkedIn: res.data.filter((a) => a.checked_in_at && a.status !== 'completed').length,
        completed: res.data.filter((a) => a.status === 'completed').length,
      });
    });
  }, []);

  return (
    <div className="row g-3">
      <StatCard label={t('todays_queue')} value={counts.total} icon={FiUserCheck} tone="teal" />
      <StatCard label={t('pending_appointment')} value={counts.pending} icon={FiClock} tone="amber" />
      <StatCard label={t('checked_in')} value={counts.checkedIn} icon={FiCheckCircle} tone="blue" />
      <StatCard label={t('completed')} value={counts.completed} icon={FiFlag} tone="violet" />
    </div>
  );
}
