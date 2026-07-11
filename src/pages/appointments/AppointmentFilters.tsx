import { useEffect, useState } from 'react';
import { listDoctors } from '../../api/doctors';
import SearchInput from '../../components/ui/SearchInput';
import { useLanguage } from '../../context/LanguageContext';
import type { Doctor } from '../../types/doctor';
import type { AppointmentStatus } from '../../types/appointment';

export interface AppointmentFilterValues {
  search: string;
  status: AppointmentStatus | '';
  doctorId: number | '';
  date: string;
}

interface AppointmentFiltersProps {
  value: AppointmentFilterValues;
  onChange: (value: AppointmentFilterValues) => void;
  showDoctorFilter: boolean;
}

export default function AppointmentFilters({ value, onChange, showDoctorFilter }: AppointmentFiltersProps) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (showDoctorFilter) {
      listDoctors({ per_page: 100 }).then((res) => setDoctors(res.data));
    }
  }, [showDoctorFilter]);

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <SearchInput
        value={value.search}
        onChange={(search) => onChange({ ...value, search })}
        placeholder={`${t('patients')}...`}
      />

      <input
        type="date"
        className="form-control form-control-sm w-auto"
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
      />

      <select
        className="form-select form-select-sm w-auto"
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as AppointmentStatus | '' })}
      >
        <option value="">{t('all_statuses')}</option>
        <option value="pending">{t('pending')}</option>
        <option value="confirmed">{t('confirmed')}</option>
        <option value="completed">{t('completed')}</option>
        <option value="cancelled">{t('cancelled')}</option>
      </select>

      {showDoctorFilter && (
        <select
          className="form-select form-select-sm w-auto"
          value={value.doctorId}
          onChange={(e) => onChange({ ...value, doctorId: e.target.value ? Number(e.target.value) : '' })}
        >
          <option value="">{t('all_doctors')}</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.doctor_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
