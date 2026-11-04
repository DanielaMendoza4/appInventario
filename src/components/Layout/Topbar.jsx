import { useLocation } from 'react-router-dom';
import './Topbar.css';
import { TopbarActionSlot } from './TopbarAction';
import { IconMenu } from '../Icons/Icons';

const PAGE_META = {
  '/dashboard': {
    titulo: 'Dashboard',
    subtitulo: 'Resumen general del inventario',
  },
  '/productos': {
    titulo: 'Productos',
    subtitulo: 'Gestiona el catálogo de productos',
  },
  '/categorias': {
    titulo: 'Categorías',
    subtitulo: 'Organiza los productos por familia',
  },
  '/proveedores': {
    titulo: 'Proveedores',
    subtitulo: 'Directorio de empresas proveedoras',
  },
  '/kardex': {
    titulo: 'Kardex / Movimientos',
    subtitulo: 'Historial de entradas, salidas y ajustes',
  },
  '/usuarios': {
    titulo: 'Usuarios',
    subtitulo: 'Administra el acceso al sistema',
  },
};

export default function Topbar({ onToggleMenu }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || {
    titulo: 'Sistema de Inventario',
    subtitulo: 'SENATI',
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu-toggle"
          onClick={onToggleMenu}
          aria-label="Abrir menú de navegación"
        >
          <IconMenu size={20} />
        </button>

        <div className="topbar__heading">
          <h1 className="topbar__title">{meta.titulo}</h1>
          {meta.subtitulo && (
            <p className="topbar__subtitle">{meta.subtitulo}</p>
          )}
        </div>
      </div>

      <TopbarActionSlot />
    </header>
  );
}
