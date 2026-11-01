import './Badge.css';

export default function Badge({ tipo, children }) {
  const normalizado = (tipo || children || '').toString().toLowerCase().trim();
  let variante = 'neutral';

  if (normalizado === 'entrada' || normalizado === 'activo') {
    variante = normalizado;
  } else if (normalizado === 'salida' || normalizado === 'danger') {
    variante = 'salida';
  } else if (normalizado === 'ajuste' || normalizado === 'warning') {
    variante = 'ajuste';
  } else if (normalizado === 'inactivo') {
    variante = 'inactivo';
  } else if (normalizado === 'stock-bajo') {
    variante = 'stock-bajo';
  }

  return (
    <span className={`badge badge--${variante}`}>
      {children}
    </span>
  );
}
