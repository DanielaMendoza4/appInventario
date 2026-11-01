import { useLocation } from 'react-router-dom';
import './Topbar.css';
import { useAuth } from '../../context/AuthContext';
import { IconMenu, IconLogout } from '../Icons/Icons';

const titulosRutas = {
  '/dashboard': 'Panel Principal',
  '/productos': 'Catálogo de Productos',
  '/categorias': 'Gestión de Categorías',
  '/proveedores': 'Directorio de Proveedores',
  '/kardex': 'Kardex de Movimientos',
  '/usuarios': 'Administración de Usuarios',
};

export default function Topbar({ onToggleMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const tituloActual = titulosRutas[location.pathname] || 'Sistema de Inventario';
  const inicial = (user?.nombre || 'U').charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu-toggle"
          onClick={onToggleMenu}
          aria-label="Abrir menú"
        >
          <IconMenu size={20} />
        </button>
        <span className="topbar__title">{tituloActual}</span>
      </div>

      <div className="topbar__right">
        <div className="topbar__user-info">
          <div className="topbar__avatar">{inicial}</div>
          <div className="topbar__user-details">
            <span className="topbar__user-name">{user?.nombre || 'Usuario'}</span>
            <span className="topbar__user-role">{user?.rol || 'Almacenero'}</span>
          </div>
        </div>

        <button
          type="button"
          className="topbar__logout-btn"
          onClick={logout}
          title="Cerrar sesión"
        >
          <IconLogout size={15} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
