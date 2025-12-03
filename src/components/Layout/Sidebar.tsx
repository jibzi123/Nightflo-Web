import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  Users, 
  UserCheck, 
  Target, 
  DollarSign, 
  Settings, 
  RotateCcw, 
  QrCode,
  Star,
  FileText,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  isCollapsed,
  isMobileOpen,
  onToggle,
}) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'bookings', label: 'Bookings', icon: Users },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'staff', label: 'Staff', icon: UserCheck },
      { id: 'promoters', label: 'Promoters', icon: Target },
      // { id: 'financial', label: 'Financial', icon: DollarSign },
    ];

    if (user?.userType === 'super_admin') {
      baseItems.splice(1, 0, { id: 'clubs', label: 'Clubs', icon: Building2 });
      baseItems.push({ id: 'users', label: 'Users', icon: UserCheck });
      baseItems.push({ id: 'compliance', label: 'Compliance', icon: FileText });
      baseItems.push({ id: 'subscriptions', label: 'Subscriptions', icon: CreditCard });
      baseItems.push({ id: 'packages', label: 'Packages', icon: Target });
    }

    if (user?.userType === 'CLUB_OWNER') {
      baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
      baseItems.push({ id: 'reviews', label: 'Reviews', icon: Star });
      baseItems.push({ id: 'refunds', label: 'Refunds', icon: RotateCcw });
    }

    if (user?.userType === 'super_admin') {
      baseItems.push({ id: 'reviews', label: 'Reviews', icon: Star });
      baseItems.push({ id: 'refunds', label: 'Refunds', icon: RotateCcw });
    }

    if (user?.userType === 'door_team') {
      baseItems.push({ id: 'qr-scan', label: 'QR Scanner', icon: QrCode });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay active" onClick={onToggle} />}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{
            width: '32px',
            height: '32px',
            background: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px 0 rgba(59, 130, 246, 0.25)'
          }}>
            NF
          </div>
          <div className="sidebar-title">NightFlo Portal</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {menuItems.map((item) => (
              <a
                key={item.id}
                href="#"
                className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onModuleChange(item.id);
                  if (window.innerWidth <= 768) {
                    onToggle();
                  }
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;