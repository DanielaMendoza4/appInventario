import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import {
  IconDashboard,
  IconProductos,
  IconCategorias,
  IconProveedores,
  IconKardex,
  IconUsuarios,
  IconConfiguracion,
} from '../Icons/Icons';

const menuItems = [
  { ruta: '/dashboard', etiqueta: 'Inicio (Dashboard)', icono: IconDashboard },
  { ruta: '/productos', etiqueta: 'Productos', icono: IconProductos },
  { ruta: '/categorias', etiqueta: 'Categorías', icono: IconCategorias },
  { ruta: '/proveedores', etiqueta: 'Proveedores', icono: IconProveedores },
  { ruta: '/kardex', etiqueta: 'Kardex / Movimientos', icono: IconKardex },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: IconUsuarios },
  { ruta: '/configuracion', etiqueta: 'Configuración', icono: IconConfiguracion, deshabilitado: true },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo-badge">S</div>
          <div className="sidebar__brand-text">
            <h2>SENATI</h2>
            <p>Sistema de Inventario</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          {menuItems.map((item) => {
            const Icon = item.icono;

            if (item.deshabilitado) {
              return (
                <div key={item.etiqueta} className="sidebar__link sidebar__link--disabled" title="Próximamente">
                  <Icon size={18} />
                  <span>{item.etiqueta}</span>
                  <span className="sidebar__disabled-tag">Inactivo</span>
                </div>
              );
            }

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

        <div className="sidebar__footer">
          Laboratorio #9 — SENATI
        </div>
      </aside>
    </>
  );
}
