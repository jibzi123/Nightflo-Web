import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Target, Percent } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  isAssigned: boolean;
  profileImage?: string;
}

interface Promoter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commissionRate: number;
  salesTarget?: number;
  isAssigned: boolean;
  profileImage?: string;
}

interface EventStaffManagerProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventStaffManager: React.FC<EventStaffManagerProps> = ({ eventId, eventName, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'promoters'>('staff');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteType, setInviteType] = useState<'staff' | 'promoter'>('staff');

  useEffect(() => {
    if (isOpen) {
      fetchStaffAndPromoters();
    }
  }, [isOpen]);

  const fetchStaffAndPromoters = async () => {
    // Mock data
    setStaff([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@club.com',
        role: 'Bartender',
        phone: '+1 555-0101',
        isAssigned: true,
        profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@club.com',
        role: 'Security',
        phone: '+1 555-0102',
        isAssigned: false
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.w@club.com',
        role: 'DJ',
        phone: '+1 555-0103',
        isAssigned: true
      }
    ]);

    setPromoters([
      {
        id: '1',
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@promoter.com',
        phone: '+1 555-0201',
        commissionRate: 15,
        salesTarget: 100,
        isAssigned: true,
        profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      {
        id: '2',
        firstName: 'David',
        lastName: 'Rodriguez',
        email: 'david.r@promoter.com',
        phone: '+1 555-0202',
        commissionRate: 12,
        salesTarget: 75,
        isAssigned: false
      }
    ]);
  };

  const toggleStaffAssignment = (staffId: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId ? { ...s, isAssigned: !s.isAssigned } : s
    ));
  };

  const togglePromoterAssignment = (promoterId: string) => {
    setPromoters(prev => prev.map(p => 
      p.id === promoterId ? { ...p, isAssigned: !p.isAssigned } : p
    ));
  };

  const updatePromoterCommission = (promoterId: string, rate: number, target?: number) => {
    setPromoters(prev => prev.map(p => 
      p.id === promoterId ? { ...p, commissionRate: rate, salesTarget: target } : p
    ));
  };

  const handleInvite = (type: 'staff' | 'promoter') => {
    setInviteType(type);
    setShowInviteForm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Staff & Promoters - {eventName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`modal-tab-button ${activeTab === 'staff' ? 'active' : ''}`}
          >
            <Users size={16} />
            Staff ({staff.filter(s => s.isAssigned).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promoters')}
            className={`modal-tab-button ${activeTab === 'promoters' ? 'active' : ''}`}
          >
            <Target size={16} />
            Promoters ({promoters.filter(p => p.isAssigned).length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'staff' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  Event Staff Assignment
                </h3>
                <button className="btn btn-primary" onClick={() => handleInvite('staff')}>
                  <Mail size={16} />
                  Invite New Staff
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
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
                            </div>
                          </div>
                        </td>
                        <td>{member.role}</td>
                        <td>{member.phone}</td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={member.isAssigned}
                              onChange={() => toggleStaffAssignment(member.id)}
                              style={{ accentColor: '#405189' }}
                            />
                            <span style={{ color: '#1e293b', fontSize: '13px' }}>
                              {member.isAssigned ? 'Assigned' : 'Available'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'promoters' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  Event Promoters Assignment
                </h3>
                <button className="btn btn-primary" onClick={() => handleInvite('promoter')}>
                  <Mail size={16} />
                  Invite New Promoter
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Promoter</th>
                      <th>Commission</th>
                      <th>Sales Target</th>
                      <th>Contact</th>
                      <th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoters.map((promoter) => (
                      <tr key={promoter.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ProfileImage 
                              firstName={promoter.firstName}
                              lastName={promoter.lastName}
                              imageUrl={promoter.profileImage}
                              size="sm"
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {promoter.firstName} {promoter.lastName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {promoter.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              value={promoter.commissionRate}
                              onChange={(e) => updatePromoterCommission(promoter.id, parseFloat(e.target.value) || 0, promoter.salesTarget)}
                              style={{
                                width: '60px',
                                padding: '4px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                              min="0"
                              max="100"
                              step="0.5"
                            />
                            <Percent size={14} style={{ color: '#64748b' }} />
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={promoter.salesTarget || ''}
                            onChange={(e) => updatePromoterCommission(promoter.id, promoter.commissionRate, parseInt(e.target.value) || undefined)}
                            placeholder="No target"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                            min="0"
                          />
                        </td>
                        <td>{promoter.phone}</td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={promoter.isAssigned}
                              onChange={() => togglePromoterAssignment(promoter.id)}
                              style={{ accentColor: '#405189' }}
                            />
                            <span style={{ color: '#1e293b', fontSize: '13px' }}>
                              {promoter.isAssigned ? 'Assigned' : 'Available'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            Save Assignments
          </button>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Invite New {inviteType === 'staff' ? 'Staff Member' : 'Promoter'}</h2>
              <button className="modal-close" onClick={() => setShowInviteForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" placeholder="John" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="john.doe@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" placeholder="+1 555-0100" />
              </div>
              {inviteType === 'staff' && (
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select">
                    <option value="bartender">Bartender</option>
                    <option value="security">Security</option>
                    <option value="dj">DJ</option>
                    <option value="server">Server</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              )}
              {inviteType === 'promoter' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Commission Rate (%)</label>
                    <input type="number" className="form-input" placeholder="15" min="0" max="100" step="0.5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sales Target (Optional)</label>
                    <input type="number" className="form-input" placeholder="100" min="0" />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowInviteForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                <Mail size={16} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStaffManager;