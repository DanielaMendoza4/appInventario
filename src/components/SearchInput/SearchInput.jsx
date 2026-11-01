import './SearchInput.css';
import { IconSearch, IconCross } from '../Icons/Icons';

export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="search-input-wrapper">
      <span className="search-input__icon">
        <IconSearch size={16} />
      </span>
      <input
        type="text"
        className="search-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange('')}
          title="Limpiar búsqueda"
          aria-label="Limpiar búsqueda"
        >
          <IconCross size={14} />
        </button>
      )}
    </div>
  );
}
