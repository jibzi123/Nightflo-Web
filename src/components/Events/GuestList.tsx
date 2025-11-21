import React, { useState } from 'react';
import { Event } from '../../types/api';
import { Users, Search, Download, UserPlus, X, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';
import { apiClient } from '../../services/apiClient';

interface GuestListProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketType: string;
  quantity: number;
  totalPaid: number;
  bookingDate: string;
  status: 'confirmed' | 'checked_in' | 'no_show';
  invitedBy?: string;
  profileImage?: string;
  specialRequests?: string;
}

const GuestList: React.FC<GuestListProps> = ({ event, isOpen, onClose }) => {
  const [ticketFilter, setTicketFilter] = useState('all');

  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [loading, setLoading] = useState(false);


  React.useEffect(() => {
    const fetchGuests = async () => {
      if (!event) return;
      try {
        setLoading(true);

        // mimic mobile logic
        const pendingRes = await apiClient.getBookingsByStatus(event.id, "pending");
        const verifiedRes = await apiClient.getBookingsByStatus(event.id, "verified");

        // merge data into guests state
        const allGuests = [
          ...(pendingRes.payLoad ?? []).map((g: any) => ({
            id: g.id,
            firstName: g.bookedBy?.firstName || "",
            lastName: g.bookedBy?.lastName || "",
            email: g.bookedBy?.email || "",
            phone: g.bookedBy?.phoneNumber || "",
            ticketType: g.ticketType?.name || "General",
            quantity: g.quantity ?? 1,
            totalPaid: g.totalPaid ?? 0,
            bookingDate: g.bookingDate,
            status: "confirmed", // default for pending
            invitedBy: g.invitedBy?.fullName,
            profileImage: g.bookedBy?.imageUrl,
            specialRequests: g.specialRequests,
          })),
          ...(verifiedRes.payLoad ?? []).map((g: any) => ({
            id: g.id,
            firstName: g.bookedBy?.firstName || "",
            lastName: g.bookedBy?.lastName || "",
            email: g.bookedBy?.email || "",
            phone: g.bookedBy?.phoneNumber || "",
            ticketType: g.ticketType?.name || "General",
            quantity: g.quantity ?? 1,
            totalPaid: g.totalPaid ?? 0,
            bookingDate: g.bookingDate,
            status: "checked_in", // for verified
            invitedBy: g.invitedBy?.fullName,
            profileImage: g.bookedBy?.imageUrl,
            specialRequests: g.specialRequests,
          })),
        ];

        setGuests(allGuests);
      } catch (err) {
        console.error("Failed to load guest list:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && event) fetchGuests();
  }, [isOpen, event]);

  const handleStatusChange = (guestId: string, newStatus: 'confirmed' | 'checked_in' | 'no_show') => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, status: newStatus } : guest
    ));
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    const matchesTicket = ticketFilter === 'all' || guest.ticketType === ticketFilter;
    
    return matchesSearch && matchesStatus && matchesTicket;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-warning';
      case 'checked_in': return 'badge-success';
      case 'no_show': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const totalRevenue = guests.reduce((sum, guest) => sum + guest.totalPaid, 0);
  const checkedInCount = guests.filter(g => g.status === 'checked_in').length;

  if (!isOpen || !event) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1200px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Guest List - {event.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Stats */}
          <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Guests</span> {/* Keep as is */}
                <Users style={{ color: '#405189' }} size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{guests.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Checked In</span> {/* Keep as is */}
                <UserCheck style={{ color: '#20c997' }} size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{checkedInCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Revenue</span> {/* Keep as is */}
                <DollarSign style={{ color: '#ffc107' }} size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>${totalRevenue}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Check-in Rate</span> {/* Keep as is */}
                <TrendingUp style={{ color: '#405189' }} size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>
                {Math.round((checkedInCount / guests.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="search-filter-container" style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
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
                placeholder="Search guests..."
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
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="no_show">No Show</option>
            </select>
            
            <select
              className="filter-select"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
            >
              <option value="all">All Tickets</option>
              <option value="VIP">VIP</option>
              <option value="General">General</option>
              <option value="Early Bird">Early Bird</option>
            </select>

            <button className="btn btn-secondary">
              <Download size={16} />
              Export List
            </button>
          </div>

          {/* Guest Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Ticket Type</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Invited By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ProfileImage 
                          firstName={guest.firstName}
                          lastName={guest.lastName}
                          imageUrl={guest.profileImage}
                          size="sm"
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {guest.email}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {guest.phone}
                          </div>
                          {guest.specialRequests && (
                            <div style={{ fontSize: '11px', color: '#3b82f6', fontStyle: 'italic' }}>
                              {guest.specialRequests}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{guest.ticketType}</td>
                    <td>{guest.quantity}</td>
                    <td>${guest.totalPaid}</td>
                    <td>
                      {guest.invitedBy ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {guest.invitedBy}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Direct purchase
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(guest.status)}`}>
                        {guest.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <select
                        value={guest.status}
                        onChange={(e) => handleStatusChange(guest.id, e.target.value as any)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGuests.length === 0 && (
            <div className="empty-state">
              <Users size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
              <div className="empty-state-title">No Guests Found</div>
              <div className="empty-state-description">
                {searchTerm || statusFilter !== 'all' || ticketFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No guests have booked tickets for this event yet'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestList;