import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';
import {
  IconDashboard,
  IconProductos,
  IconCategorias,
  IconProveedores,
  IconKardex,
  IconUsuarios,
  IconLogout,
} from '../Icons/Icons';

const menuItems = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: IconDashboard },
  { ruta: '/productos', etiqueta: 'Productos', icono: IconProductos },
  { ruta: '/categorias', etiqueta: 'Categorías', icono: IconCategorias },
  { ruta: '/proveedores', etiqueta: 'Proveedores', icono: IconProveedores },
  { ruta: '/kardex', etiqueta: 'Kardex / Movimientos', icono: IconKardex },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: IconUsuarios },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const nombre = user?.nombre || 'Usuario';
  const rol = user?.rol || 'Almacenero';
  const inicial = nombre.charAt(0).toUpperCase();

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo-badge" aria-hidden="true">S</div>
          <div className="sidebar__brand-text">
            <h2>SENATI Inventario</h2>
            <p>Sistema de Inventario</p>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {menuItems.map((item) => {
            const Icon = item.icono;

            return (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.etiqueta}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__user-row">
            <div className="sidebar__avatar" aria-hidden="true">{inicial}</div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{nombre}</span>
              <span className="sidebar__user-role">{rol}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__logout-btn"
            onClick={logout}
          >
            <IconLogout size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <div className="sidebar__footer">
          Laboratorio #9 — SENATI
        </div>
      </aside>
    </>
  );
}
