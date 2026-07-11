import { useEffect, useState } from 'react';
import { listMedicines } from '../../api/medicines';
import type { Medicine } from '../../types/medicine';

interface MedicineSelectProps {
  value: number | '';
  onChange: (medicineId: number) => void;
  isInvalid?: boolean;
}

export default function MedicineSelect({ value, onChange, isInvalid }: MedicineSelectProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    listMedicines({ per_page: 200, status: 'active' }).then((res) => setMedicines(res.data));
  }, []);

  return (
    <select
      className={`form-select form-select-sm ${isInvalid ? 'is-invalid' : ''}`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="">—</option>
      {medicines.map((medicine) => (
        <option key={medicine.id} value={medicine.id}>
          {medicine.medicine_name} ({medicine.quantity} {medicine.unit} in stock)
        </option>
      ))}
    </select>
  );
}
