import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiFileText, FiUsers } from 'react-icons/fi';
import { listAppointments } from '../../api/appointments';
import StatCard from '../../components/StatCard';
import { useLanguage } from '../../context/LanguageContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [myPatients, setMyPatients] = useState(0);
  const [pendingToday, setPendingToday] = useState(0);

  useEffect(() => {
    listAppointments({ date: todayIso(), per_page: 100 }).then((res) => {
      setTodaysAppointments(res.meta.total);
      setPendingToday(res.data.filter((a) => a.status === 'pending').length);
    });

    listAppointments({ per_page: 300 }).then((res) => {
      const distinctPatients = new Set(res.data.map((a) => a.patient.id));
      setMyPatients(distinctPatients.size);
    });
  }, []);

  return (
    <div className="row g-3">
      <StatCard label={t('todays_appointments')} value={todaysAppointments} icon={FiCalendar} tone="amber" />
      <StatCard label={t('my_patients')} value={myPatients} icon={FiUsers} tone="teal" />
      <StatCard label={t('pending_patients')} value={pendingToday} icon={FiClock} tone="blue" />
      <StatCard label={t('recent_treatments')} value={0} icon={FiFileText} tone="violet" />
    </div>
  );
}
