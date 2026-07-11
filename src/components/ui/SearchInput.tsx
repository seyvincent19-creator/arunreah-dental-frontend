import { FiSearch } from 'react-icons/fi';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="input-group" style={{ maxWidth: 320 }}>
      <span className="input-group-text bg-white border-end-0 text-muted">
        <FiSearch />
      </span>
      <input
        type="search"
        className="form-control border-start-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
