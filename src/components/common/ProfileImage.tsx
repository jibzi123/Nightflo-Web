import React from 'react';

interface ProfileImageProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getColorFromName = (firstName: string, lastName: string): string => {
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a855f7', // Violet
    '#22c55e', // Green
    '#eab308', // Yellow
    '#dc2626', // Red-600
    '#0891b2'  // Sky
  ];
  
  const nameHash = (firstName + lastName).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[nameHash % colors.length];
};

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  firstName, 
  lastName, 
  imageUrl, 
  size = 'md',
  className = '' 
}) => {
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return { width: '24px', height: '24px', fontSize: '10px' };
      case 'lg':
        return { width: '48px', height: '48px', fontSize: '18px' };
      default:
        return { width: '32px', height: '32px', fontSize: '14px' };
    }
  };

  const gradientColor = getColorFromName(firstName, lastName);
  const sizeStyles = getSizeStyles(size);

  return (
    <div
      style={{
        ...sizeStyles,
        backgroundColor: gradientColor,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
      className={`profile-image ${className}`}
    >
      {!imageUrl && getInitials(firstName, lastName)}
    </div>
  );
};

export default ProfileImage;