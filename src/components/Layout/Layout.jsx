import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { TopbarActionProvider } from './TopbarAction';
import './Layout.css';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <TopbarActionProvider>
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
    </TopbarActionProvider>
  );
}
