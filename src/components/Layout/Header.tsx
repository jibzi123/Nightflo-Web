import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileImage from '../common/ProfileImage';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      
      <div className="header-actions">
        {user && (
          <div className="user-info">
            {/* <ProfileImage 
              firstName={user.firstName} 
              lastName={user.lastName}
              size="sm"
            />
            <div className="user-details">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role">{user.role.replace('_', ' ')}</div>
            </div> */}
          </div>
        )}
        
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;