import { useEffect, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiDollarSign, FiFileText, FiUserCheck, FiUsers } from 'react-icons/fi';
import { fetchDashboardAnalytics } from '../../api/analytics';
import { listAppointments } from '../../api/appointments';
import { listDoctors } from '../../api/doctors';
import { fetchInvoiceSummary } from '../../api/invoices';
import { listPatients } from '../../api/patients';
import { listPrescriptions } from '../../api/prescriptions';
import StatCard from '../../components/StatCard';
import BarSeriesChart from '../../components/charts/BarSeriesChart';
import ChartCard from '../../components/charts/ChartCard';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import LineSeriesChart from '../../components/charts/LineSeriesChart';
import { useLanguage } from '../../context/LanguageContext';
import type { DashboardAnalytics } from '../../types/analytics';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    listPatients({ per_page: 1 }).then((res) => setTotalPatients(res.meta.total));
    listDoctors({ per_page: 1 }).then((res) => setTotalDoctors(res.meta.total));
    listAppointments({ date: todayIso(), per_page: 1 }).then((res) => setTodaysAppointments(res.meta.total));
    listAppointments({ date: todayIso(), status: 'completed', per_page: 1 }).then((res) =>
      setCompletedToday(res.meta.total),
    );
    listPrescriptions({ per_page: 1 }).then((res) => setTotalPrescriptions(res.meta.total));
    fetchInvoiceSummary().then((summary) => setMonthlyIncome(summary.monthly_income));
    fetchDashboardAnalytics()
      .then(setAnalytics)
      .finally(() => setIsAnalyticsLoading(false));
  }, []);

  return (
    <div>
      <div className="row g-3 mb-4">
        <StatCard label={t('total_patients')} value={totalPatients} icon={FiUsers} tone="teal" />
        <StatCard label={t('total_doctors')} value={totalDoctors} icon={FiUserCheck} tone="blue" />
        <StatCard label={t('todays_appointments')} value={todaysAppointments} icon={FiCalendar} tone="amber" />
        <StatCard label={t('completed_treatments')} value={completedToday} icon={FiCheckCircle} tone="violet" />
        <StatCard label={t('total_prescriptions')} value={totalPrescriptions} icon={FiFileText} tone="pink" />
        <StatCard
          label={t('monthly_income')}
          value={`$${monthlyIncome.toFixed(2)}`}
          icon={FiDollarSign}
          tone="cyan"
        />
      </div>

      <div className="row g-3">
        <ChartCard
          title={t('appointments_by_month')}
          isLoading={isAnalyticsLoading}
          isEmpty={!!analytics && analytics.appointments_by_month.every((d) => d.value === 0)}
        >
          {analytics && <BarSeriesChart data={analytics.appointments_by_month} color="#0d9488" />}
        </ChartCard>

        <ChartCard
          title={t('patient_registrations')}
          isLoading={isAnalyticsLoading}
          isEmpty={!!analytics && analytics.patient_registrations_by_month.every((d) => d.value === 0)}
        >
          {analytics && <LineSeriesChart data={analytics.patient_registrations_by_month} color="#2563eb" />}
        </ChartCard>

        <ChartCard
          title={t('medicine_stock')}
          isLoading={isAnalyticsLoading}
          isEmpty={!!analytics && analytics.medicine_stock.length === 0}
        >
          {analytics && <HorizontalBarChart data={analytics.medicine_stock} color="#d97706" />}
        </ChartCard>

        <ChartCard
          title={t('revenue')}
          isLoading={isAnalyticsLoading}
          isEmpty={!!analytics && analytics.revenue_by_month.every((d) => d.value === 0)}
        >
          {analytics && (
            <LineSeriesChart
              data={analytics.revenue_by_month}
              color="#7c3aed"
              valueFormatter={(v) => `$${v.toFixed(2)}`}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
