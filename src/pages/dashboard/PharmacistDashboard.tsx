import { useEffect, useState } from 'react';
import { FiBarChart2, FiBox, FiFileText, FiPackage } from 'react-icons/fi';
import { listMedicines } from '../../api/medicines';
import { listPrescriptions } from '../../api/prescriptions';
import StatCard from '../../components/StatCard';
import { useLanguage } from '../../context/LanguageContext';

export default function PharmacistDashboard() {
  const { t } = useLanguage();
  const [pendingPrescriptions, setPendingPrescriptions] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    listPrescriptions({ status: 'pending', per_page: 1 }).then((res) => setPendingPrescriptions(res.meta.total));
    listMedicines({ per_page: 1 }).then((res) => setTotalMedicines(res.meta.total));
    listMedicines({ low_stock: true, per_page: 1 }).then((res) => setLowStockCount(res.meta.total));
  }, []);

  return (
    <div className="row g-3">
      <StatCard label={t('view_prescription')} value={pendingPrescriptions} icon={FiFileText} tone="teal" />
      <StatCard label={t('dispense_medicines')} value={pendingPrescriptions} icon={FiPackage} tone="blue" />
      <StatCard label={t('medicine_inventory')} value={totalMedicines} icon={FiBox} tone="amber" />
      <StatCard label={t('stock_report')} value={lowStockCount} icon={FiBarChart2} tone="violet" />
    </div>
  );
}
