import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, activeModule, onModuleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="layout">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        onToggle={handleMenuToggle}
      />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header title={title} onMenuToggle={handleMenuToggle} />
        
        <main className="content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;