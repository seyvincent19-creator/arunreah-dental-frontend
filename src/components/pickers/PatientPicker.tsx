import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { listPatients } from '../../api/patients';
import type { Patient } from '../../types/patient';
import { useLanguage } from '../../context/LanguageContext';

interface PatientPickerProps {
  value: { id: number; label: string } | null;
  onChange: (patient: { id: number; label: string } | null) => void;
  isInvalid?: boolean;
}

export default function PatientPicker({ value, onChange, isInvalid }: PatientPickerProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      listPatients({ search: query, per_page: 6 }).then((res) => setResults(res.data));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (value) {
    return (
      <div className="d-flex align-items-center justify-content-between border rounded-2 px-3 py-2 bg-light">
        <span className="fw-medium">{value.label}</span>
        <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => onChange(null)}>
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative" ref={containerRef}>
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0 text-muted">
          <FiSearch />
        </span>
        <input
          className={`form-control border-start-0 ${isInvalid ? 'is-invalid' : ''}`}
          placeholder={`${t('patients')}...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="list-group position-absolute w-100 shadow-soft mt-1" style={{ zIndex: 1050 }}>
          {results.map((patient) => (
            <button
              key={patient.id}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => {
                onChange({ id: patient.id, label: `${patient.full_name} (${patient.patient_code})` });
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
            >
              <div className="fw-medium">{patient.full_name}</div>
              <div className="text-muted-soft small">
                {patient.patient_code} · {patient.phone}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
