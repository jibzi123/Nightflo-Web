import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { Club } from '../../types/api';
import ClubEditor from './ClubEditor';
import { Edit, Plus, Eye, Search, Building2, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import '../../styles/components.css';

interface ExtendedClub extends Club {
  ownerName: string;
  revenue: number;
}

interface StatusChangeModalProps {
  isOpen: boolean;
  clubName: string;
  newStatus: 'active' | 'suspended' | 'inactive';
  onConfirm: (sendNotification: boolean) => void;
  onCancel: () => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ 
  isOpen, 
  clubName, 
  newStatus, 
  onConfirm, 
  onCancel 
}) => {
  const [sendNotification, setSendNotification] = useState(true);
  const [message, setMessage] = useState('');


  const getStatusMessage = () => {
    switch (newStatus) {
      case 'suspended':
        return 'permanently suspend';
      case 'inactive':
        return 'temporarily suspend';
      case 'active':
        return 'activate';
      default:
        return 'change status of';
    }
  };

  const getDefaultMessage = () => {
    switch (newStatus) {
      case 'suspended':
        return 'Club operations have been permanently suspended due to policy violations.';
      case 'inactive':
        return 'Club operations have been temporarily paused for review.';
      case 'active':
        return 'Club has been approved and is now active for operations.';
      default:
        return '';
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setMessage(getDefaultMessage());
    }
  }, [isOpen, newStatus]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Confirm Status Change</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '20px', color: '#495057' }}>
            Are you sure you want to <strong>{getStatusMessage()}</strong> <strong>{clubName}</strong>?
          </p>
          
          <div style={{ 
            padding: '16px', 
            background: newStatus === 'suspended' ? '#fef2f2' : newStatus === 'inactive' ? '#fff8e6' : '#f0f9ff',
            borderRadius: '8px',
            border: `1px solid ${newStatus === 'suspended' ? '#fecaca' : newStatus === 'inactive' ? '#fde68a' : '#bae6fd'}`,
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              color: newStatus === 'suspended' ? '#dc2626' : newStatus === 'inactive' ? '#d97706' : '#0369a1',
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              {newStatus === 'suspended' && 'Permanent Suspension'}
              {newStatus === 'inactive' && 'Temporary Suspension'}
              {newStatus === 'active' && 'Club Activation'}
            </h4>
            <p style={{ 
              color: newStatus === 'suspended' ? '#dc2626' : newStatus === 'inactive' ? '#d97706' : '#0369a1',
              fontSize: '12px', 
              margin: 0 
            }}>
              {newStatus === 'suspended' && 'This will permanently disable the club and prevent all operations.'}
              {newStatus === 'inactive' && 'This will temporarily pause club operations until reactivated.'}
              {newStatus === 'active' && 'This will restore full club operations and access.'}
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">
              Message/Reason for Status Change
              {sendNotification && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <textarea
              className="form-input form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Enter reason for ${getStatusMessage()}ing this club...`}
              rows={3}
              style={{ fontSize: '12px' }}
            />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {sendNotification 
                ? 'This message will be included in the email notification to the club administrator.'
                : 'This message will be saved for internal records only.'
              }
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              id="sendNotification"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              style={{ accentColor: '#405189' }}
            />
            <label htmlFor="sendNotification" style={{ color: '#495057', fontSize: '14px' }}>
              Send email notification to club administrator
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className={`btn ${newStatus === 'suspended' ? 'btn-danger' : newStatus === 'inactive' ? 'btn-warning' : 'btn-success'}`}
            onClick={() => onConfirm(sendNotification, message)}
          >
            Confirm {newStatus === 'suspended' ? 'Suspension' : newStatus === 'inactive' ? 'Deactivation' : 'Activation'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClubManager: React.FC = () => {
  const [clubs, setClubs] = useState<ExtendedClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    clubId: string;
    clubName: string;
    newStatus: 'active' | 'suspended' | 'inactive';
  }>({
    isOpen: false,
    clubId: '',
    clubName: '',
    newStatus: 'active'
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getClubs();
      // Extend clubs with additional data
      const extendedClubs: ExtendedClub[] = data.map((club: Club) => ({
        ...club,
        ownerName: getOwnerName(club.id),
        revenue: getClubRevenue(club.id)
      }));
      setClubs(extendedClubs);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      // Mock data for demonstration
      setClubs([
        {
          id: '1',
          name: 'Club Paradise',
          address: '123 Party Street, NYC',
          phone: '+1 555-0401',
          email: 'info@clubparadise.com',
          capacity: 500,
          status: 'active',
          createdAt: '2024-01-01',
          ownerName: 'John Smith',
          revenue: 125000
        },
        {
          id: '2',
          name: 'Neon Nights',
          address: '456 Dance Avenue, LA',
          phone: '+1 555-0402',
          email: 'contact@neonnights.com',
          capacity: 800,
          status: 'active',
          createdAt: '2024-02-15',
          ownerName: 'Sarah Johnson',
          revenue: 98000
        },
        {
          id: '3',
          name: 'Electric Dreams',
          address: '789 Music Boulevard, Miami',
          phone: '+1 555-0403',
          email: 'hello@electricdreams.com',
          capacity: 600,
          status: 'inactive',
          createdAt: '2024-03-10',
          ownerName: 'Mike Rodriguez',
          revenue: 67000
        },
        {
          id: '4',
          name: 'Midnight Lounge',
          address: '321 Club Street, Chicago',
          phone: '+1 555-0404',
          email: 'info@midnightlounge.com',
          capacity: 300,
          status: 'suspended',
          createdAt: '2024-04-05',
          ownerName: 'Lisa Chen',
          revenue: 45000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getOwnerName = (clubId: string): string => {
    // Mock owner names - in real app, this would come from API
    const owners: Record<string, string> = {
      '1': 'John Smith',
      '2': 'Sarah Johnson',
      '3': 'Mike Rodriguez',
      '4': 'Lisa Chen'
    };
    return owners[clubId] || 'Unknown Owner';
  };

  const getClubRevenue = (clubId: string): number => {
    // Mock revenue data - in real app, this would come from API
    const revenues: Record<string, number> = {
      '1': 125000,
      '2': 98000,
      '3': 67000,
      '4': 45000
    };
    return revenues[clubId] || 0;
  };

  const handleEditClub = (club: Club) => {
    setSelectedClub(club);
    setIsEditorOpen(true);
  };

  const handleAddClub = () => {
    setSelectedClub(null);
    setIsEditorOpen(true);
  };

  const handleSaveClub = (club: Club) => {
    if (selectedClub) {
      // Update existing club
      setClubs(prev => prev.map(c => c.id === club.id ? { ...c, ...club } : c));
    } else {
      // Add new club
      const newClub: ExtendedClub = {
        ...club,
        ownerName: 'New Owner',
        revenue: 0
      };
      setClubs(prev => [...prev, newClub]);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedClub(null);
  };

  const handleStatusChange = (clubId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    const club = clubs.find(c => c.id === clubId);
    if (!club) return;

    setStatusChangeModal({
      isOpen: true,
      clubId,
      clubName: club.name,
      newStatus
    });
  };

  const confirmStatusChange = async (sendNotification: boolean, message?: string) => {
    const { clubId, newStatus } = statusChangeModal;
    
    try {
      // Update club status
      setClubs(prev => prev.map(club => 
        club.id === clubId ? { ...club, status: newStatus } : club
      ));

      if (sendNotification) {
        // Mock email notification - in real app, this would call API
        const club = clubs.find(c => c.id === clubId);
        console.log(`Sending email notification to ${club?.email} about status change to ${newStatus}. Message: ${message}`);
        
        // Show success message
        alert(`Club status updated successfully. ${sendNotification ? 'Email notification with your message sent to club administrator.' : ''}`);
      } else {
        alert('Club status updated successfully. Message saved for internal records.');
      }
    } catch (error) {
      console.error('Failed to update club status:', error);
      alert('Failed to update club status. Please try again.');
    }

    setStatusChangeModal({ isOpen: false, clubId: '', clubName: '', newStatus: 'active' });
  };

  const cancelStatusChange = () => {
    setStatusChangeModal({ isOpen: false, clubId: '', clubName: '', newStatus: 'active' });
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'suspended': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  // Calculate stats
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(c => c.status === 'active').length;
  const pendingApproval = clubs.filter(c => c.status === 'inactive').length;
  const totalRevenue = clubs.reduce((sum, club) => sum + club.revenue, 0);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      {/* Stats Tiles */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Clubs</span>
            <Building2 size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{totalClubs}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>All registered clubs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Clubs</span>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">{activeClubs}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>Currently operational</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Approval</span>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value">{pendingApproval}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>Awaiting activation</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Revenue</span>
            <DollarSign size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>Combined network revenue</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Club Management</h2>
          <p className="card-subtitle">Manage all nightclubs in your network</p>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleAddClub}>
            <Plus size={16} />
            Add New Club
          </button>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-container">
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#fff' 
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by club name, owner, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
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
                <th>Club Name</th>
                <th>Owner Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Capacity</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClubs.map((club) => (
                <tr key={club.id}>
                  <td style={{ fontWeight: '600', color: '#1e293b' }}>{club.name}</td>
                  <td>{club.ownerName}</td>
                  <td>{club.address}</td>
                  <td>{club.phone}</td>
                  <td>{club.email}</td>
                  <td>{club.capacity.toLocaleString()}</td>
                  <td style={{ fontWeight: '600', color: '#10b981' }}>
                    ${club.revenue.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(club.status)}`}>
                      {club.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditClub(club)}
                      >
                        <Eye size={10} />
                        View
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditClub(club)}
                      >
                        <Edit size={10} />
                        Edit
                      </button>
                      <select
                        value={club.status}
                        onChange={(e) => handleStatusChange(club.id, e.target.value as any)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClubs.length === 0 && (
          <div className="empty-state">
            <Building2 size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Clubs Found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first club'
              }
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={handleAddClub}>
                Add First Club
              </button>
            )}
          </div>
        )}
      </div>

      <ClubEditor
        club={selectedClub}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSaveClub}
      />

      <StatusChangeModal
        isOpen={statusChangeModal.isOpen}
        clubName={statusChangeModal.clubName}
        newStatus={statusChangeModal.newStatus}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />
    </div>
  );
};

export default ClubManager;