import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Mail, Plus, Edit, Trash2, DollarSign, Clock, Calendar, X } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  workingHours: string;
  hireDate: string;
  status: 'active' | 'inactive';
  profileImage?: string;
  emergencyContact?: string;
  address?: string;
}

interface StaffEditorProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}

const StaffEditor: React.FC<StaffEditorProps> = ({ staff, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<StaffMember>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Bartender',
    department: 'Bar',
    salary: 35000,
    workingHours: 'Part-time',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    emergencyContact: '',
    address: ''
  });

  React.useEffect(() => {
    if (staff) {
      setFormData(staff);
    } else {
      setFormData({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Bartender',
        department: 'Bar',
        salary: 35000,
        workingHours: 'Part-time',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        emergencyContact: '',
        address: ''
      });
    }
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStaff = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    onSave(updatedStaff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Bartender">Bartender</option>
                  <option value="Security">Security</option>
                  <option value="DJ">DJ</option>
                  <option value="Server">Server</option>
                  <option value="Manager">Manager</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Host">Host</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="Bar">Bar</option>
                  <option value="Security">Security</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Service">Service</option>
                  <option value="Management">Management</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Front of House">Front of House</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Annual Salary ($) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours *</label>
                <select
                  className="form-select"
                  value={formData.workingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
                >
                  <option value="Full-time">Full-time (40+ hrs/week)</option>
                  <option value="Part-time">Part-time (20-39 hrs/week)</option>
                  <option value="Casual">Casual (0-19 hrs/week)</option>
                  <option value="Contract">Contract</option>
                  <option value="Weekend Only">Weekend Only</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Hire Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.hireDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street, City, State"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                className="form-input"
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="Name and phone number"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {staff ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffManager: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showStaffEditor, setShowStaffEditor] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // Super admin sees all staff across all clubs
      const data = await apiClient.getStaff(user?.userType === 'super_admin' ? undefined : user?.clubId);
      setStaff(data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      // Mock data for demonstration
      setStaff([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@nightclub.com',
          phone: '+1 555-0101',
          role: 'Bartender',
          department: 'Bar',
          salary: 35000,
          workingHours: 'Full-time',
          hireDate: '2024-01-15',
          status: 'active',
          profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          emergencyContact: 'Jane Doe +1 555-0199',
          address: '123 Main St, City'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@nightclub.com',
          phone: '+1 555-0102',
          role: 'Security',
          department: 'Security',
          salary: 40000,
          workingHours: 'Full-time',
          hireDate: '2024-02-20',
          status: 'active',
          profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          emergencyContact: 'Mike Johnson +1 555-0299'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.w@nightclub.com',
          phone: '+1 555-0103',
          role: 'DJ',
          department: 'Entertainment',
          salary: 45000,
          workingHours: 'Part-time',
          hireDate: '2023-11-10',
          status: 'inactive',
          address: '456 Music Ave, City'
        },
        // Additional staff for super admin view
        ...(user?.userType === 'super_admin' ? [
          {
            id: '4',
            firstName: 'Emma',
            lastName: 'Davis',
            email: 'emma.d@electricnights.com',
            phone: '+1 555-0104',
            role: 'Manager',
            department: 'Management',
            salary: 55000,
            workingHours: 'Full-time',
            hireDate: '2024-03-01',
            status: 'active' as const,
            profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
            emergencyContact: 'Tom Davis +1 555-0399'
          },
          {
            id: '5',
            firstName: 'Carlos',
            lastName: 'Martinez',
            email: 'carlos.m@neondreams.com',
            phone: '+1 555-0105',
            role: 'Bartender',
            department: 'Bar',
            salary: 38000,
            workingHours: 'Full-time',
            hireDate: '2024-04-10',
            status: 'active' as const,
            address: '789 Club St, City'
          }
        ] : [])
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowStaffEditor(true);
  };

  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setShowStaffEditor(true);
  };

  const handleSaveStaff = (staff: StaffMember) => {
    if (selectedStaff) {
      setStaff(prev => prev.map(s => s.id === staff.id ? staff : s));
    } else {
      setStaff(prev => [...prev, staff]);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner"></div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Staff Management</h2>
          <p className="card-subtitle">Manage your club staff members and their roles</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={handleCreateStaff}>
            <span>+</span>
            Add Staff Member
          </button>
          <button className="btn btn-secondary" style={{ marginLeft: '12px' }}>
            <Mail size={16} />
            Send Invitations
          </button>
        </div>

        <div className="search-filter-container">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#64748b' 
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="bartender">Bartender</option>
            <option value="security">Security</option>
            <option value="dj">DJ</option>
            <option value="server">Server</option>
            <option value="manager">Manager</option>
          </select>
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={member.firstName}
                        lastName={member.lastName}
                        imageUrl={member.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {member.email}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {member.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{member.role}</td>
                  <td>{member.department}</td>
                  <td>${member.salary.toLocaleString()}</td>
                  <td>{member.workingHours}</td>
                  <td>
                    <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>{new Date(member.hireDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleEditStaff(member)}
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleDeleteStaff(member.id)} /* Keep as is */
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffEditor
        staff={selectedStaff}
        isOpen={showStaffEditor}
        onClose={() => setShowStaffEditor(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
};

export default StaffManager;