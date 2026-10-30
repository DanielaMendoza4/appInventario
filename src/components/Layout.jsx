import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// Las opciones del menú viven en una lista: para agregar una vista solo se agrega una línea
const menu = [
  { ruta: '/', etiqueta: 'Inicio (Dashboard)' },
  { ruta: '/productos', etiqueta: 'Productos' },
  { ruta: '/categorias', etiqueta: 'Categorías' },
  { ruta: '/proveedores', etiqueta: 'Proveedores' },
  { ruta: '/kardex', etiqueta: 'Kardex / Movimientos' },
];

export default function Layout() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="container-fluid p-0">
      {/* Barra superior: solo se ve en pantallas pequeñas */}
      <header className="bg-dark text-white d-flex justify-content-between align-items-center p-3 d-lg-none">
        <span className="fw-bold">SENATI - Inventario</span>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setAbierto(!abierto)}
        >
          Menú
        </button>
      </header>

      <div className="row g-0 min-vh-100">
        {/* Menú lateral: oculto en pantallas pequeñas hasta pulsar "Menú" */}
        <aside className={`col-12 col-lg-2 bg-dark text-white p-3 ${abierto ? '' : 'd-none'} d-lg-block`}>
          <h5 className="d-none d-lg-block mb-4">SENATI - Sistema de Inventario</h5>
          <nav className="nav nav-pills flex-column gap-1">
            {menu.map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                end={item.ruta === '/'}
                onClick={() => setAbierto(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-white'}`}
              >
                {item.etiqueta}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Aquí se muestra la vista elegida */}
        <main className="col-12 col-lg-10 bg-light p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}