import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="layout-main-wrapper">
        <Topbar
          onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
