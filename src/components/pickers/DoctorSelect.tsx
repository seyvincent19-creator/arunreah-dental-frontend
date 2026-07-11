import { useEffect, useState } from 'react';
import { listDoctors } from '../../api/doctors';
import type { Doctor } from '../../types/doctor';

interface DoctorSelectProps {
  value: number | '';
  onChange: (doctorId: number) => void;
  isInvalid?: boolean;
}

export default function DoctorSelect({ value, onChange, isInvalid }: DoctorSelectProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    listDoctors({ per_page: 100, status: 'active' }).then((res) => setDoctors(res.data));
  }, []);

  return (
    <select
      className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="">—</option>
      {doctors.map((doctor) => (
        <option key={doctor.id} value={doctor.id}>
          {doctor.doctor_name} · {doctor.specialization}
        </option>
      ))}
    </select>
  );
}
