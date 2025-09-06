import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { User } from '../../types/auth';
import { Search, Filter, Edit, Eye, Plus, Lock } from 'lucide-react';
import '../../styles/components.css';

interface ExtendedUser extends User {
  clubName?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  hireDate?: string;
}

interface UserEditorProps {
  user: ExtendedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: ExtendedUser) => void;
}

const UserEditor: React.FC<UserEditorProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ExtendedUser>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'club_staff',
    permissions: [],
    status: 'active',
    phone: '',
    clubId: '',
    clubName: '',
    hireDate: new Date().toISOString().split('T')[0]
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'club_staff',
        permissions: [],
        status: 'active',
        phone: '',
        clubId: '',
        clubName: '',
        hireDate: new Date().toISOString().split('T')[0]
      });
    }
    setNewPassword('');
    setConfirmPassword('');
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const updatedUser = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    
    onSave(updatedUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Edit User' : 'Create New User'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555-0100"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                >
                  <option value="club_staff">Club Staff</option>
                  <option value="CLUB_OWNER">Club Owner</option>
                  <option value="door_team">Door Team</option>
                  <option value="event_promoter">Event Promoter</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Club Assignment</label>
              <select
                className="form-select"
                value={formData.clubId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clubId: e.target.value }))}
              >
                <option value="">No Club Assignment</option>
                <option value="1">Club Paradise</option>
                <option value="2">Electric Nights</option>
                <option value="3">Neon Dreams</option>
              </select>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(99, 102, 241, 0.2)', paddingTop: '24px', marginTop: '24px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Password Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={user ? 'Leave blank to keep current' : 'Enter password'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [showUserEditor, setShowUserEditor] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setUsers([
        {
          id: '1',
          email: 'john.doe@nightclub.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLUB_OWNER',
          permissions: ['manage_club', 'view_reports'],
          status: 'active',
          phone: '+1 555-0101',
          clubId: '1',
          clubName: 'Club Paradise',
          lastLogin: '2025-01-20T10:30:00Z',
          hireDate: '2024-01-15'
        },
        {
          id: '2',
          email: 'sarah.manager@nightclub.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'club_staff',
          permissions: ['manage_events', 'view_customers'],
          status: 'active',
          phone: '+1 555-0102',
          clubId: '1',
          clubName: 'Club Paradise',
          lastLogin: '2025-01-19T15:45:00Z',
          hireDate: '2024-02-20'
        },
        {
          id: '3',
          email: 'mike.security@nightclub.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'door_team',
          permissions: ['scan_tickets', 'manage_entry'],
          status: 'active',
          phone: '+1 555-0103',
          clubId: '1',
          clubName: 'Club Paradise',
          lastLogin: '2025-01-18T22:00:00Z',
          hireDate: '2024-03-10'
        },
        {
          id: '4',
          email: 'lisa.promoter@nightclub.com',
          firstName: 'Lisa',
          lastName: 'Chen',
          role: 'event_promoter',
          permissions: ['create_events', 'manage_promotions'],
          status: 'active',
          phone: '+1 555-0104',
          clubId: '2',
          clubName: 'Electric Nights',
          lastLogin: '2025-01-17T14:20:00Z',
          hireDate: '2024-04-05'
        },
        {
          id: '5',
          email: 'alex.bartender@nightclub.com',
          firstName: 'Alex',
          lastName: 'Rodriguez',
          role: 'club_staff',
          permissions: ['manage_bar', 'view_inventory'],
          status: 'inactive',
          phone: '+1 555-0105',
          clubId: '2',
          clubName: 'Electric Nights',
          lastLogin: '2025-01-10T20:15:00Z',
          hireDate: '2024-05-12'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowUserEditor(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserEditor(true);
  };

  const handleSaveUser = (user: ExtendedUser) => {
    if (selectedUser) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      setUsers(prev => [...prev, user]);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.clubName && user.clubName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin': return 'badge-danger';
      case 'CLUB_OWNER': return 'badge-warning';
      case 'event_promoter': return 'badge-info';
      case 'door_team': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'suspended': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">User Management</h2>
          <p className="card-subtitle">Manage all users across your nightclub network</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <button className="btn btn-primary" onClick={handleCreateUser}>
            <Plus size={16} />
            Add New User
          </button>
        </div>

        <div className="search-filter-container">
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#64748b' 
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name, email, or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '48px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="CLUB_OWNER">Club Owner</option>
            <option value="club_staff">Club Staff</option>
            <option value="door_team">Door Team</option>
            <option value="event_promoter">Event Promoter</option>
          </select>
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Club</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {user.email}
                      </div>
                      {user.phone && (
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{user.clubName || 'No Assignment'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditUser(user)} /* Keep as is */
                      >
                        <Eye size={10} />
                        View
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit size={10} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-warning" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditUser(user)}
                      >
                        <Lock size={10} />
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No Users Found</div>
            <div className="empty-state-description">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first user'
              }
            </div>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={handleCreateUser}>
                Create First User
              </button>
            )}
          </div>
        )}
      </div>

      <UserEditor
        user={selectedUser}
        isOpen={showUserEditor}
        onClose={() => setShowUserEditor(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManager;