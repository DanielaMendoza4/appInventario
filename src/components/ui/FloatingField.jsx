import './FloatingField.css';

export default function FloatingField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  trailing,
  className = '',
  ...inputProps
}) {
  return (
    <div className={`ui-field ${className}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="ui-field__input"
        {...inputProps}
      />
      <label htmlFor={id} className="ui-field__label">
        {label}
      </label>
      {trailing && <div className="ui-field__trailing">{trailing}</div>}
    </div>
  );
}
