import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Calendar, Users, MapPin, DollarSign, Clock } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerImage?: string;
  eventName: string;
  clubName?: string;
  bookingType: 'ticket' | 'table';
  ticketType?: string;
  tableNumber?: string;
  tableCapacity?: number;
  quantity: number;
  totalAmount: number;
  bookingDate: string;
  eventDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  specialRequests?: string;
}

const BookingsManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'event-tickets' | 'table-bookings'>('event-tickets');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const eventBookings = [
        {
          id: '1',
          customerName: 'Alice Smith',
          customerEmail: 'alice.smith@email.com',
          customerPhone: '+1 555-0201',
          customerImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Saturday Night Fever',
          clubName: 'Club Paradise',
          bookingType: 'event-ticket',
          ticketType: 'VIP',
          quantity: 2,
          totalAmount: 150,
          bookingDate: '2025-01-15',
          eventDate: '2025-01-25',
          status: 'confirmed',
          paymentStatus: 'paid',
          specialRequests: 'Table near the DJ booth'
        },
        {
          id: '2',
          customerName: 'Bob Johnson',
          customerEmail: 'bob.johnson@email.com',
          customerPhone: '+1 555-0202',
          eventName: 'EDM Explosion',
          clubName: 'Club Paradise',
          bookingType: 'event-table',
          tableNumber: 'VIP-5',
          tableCapacity: 6,
          quantity: 1,
          totalAmount: 500,
          bookingDate: '2025-01-18',
          eventDate: '2025-02-01',
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: '3',
          customerName: 'Carol Williams',
          customerEmail: 'carol.w@email.com',
          customerPhone: '+1 555-0203',
          customerImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Hip Hop Night',
          clubName: 'Club Paradise',
          bookingType: 'event-ticket',
          ticketType: 'General',
          quantity: 4,
          totalAmount: 100,
          bookingDate: '2025-01-20',
          eventDate: '2025-01-28',
          status: 'pending',
          paymentStatus: 'pending'
        },
        // Additional bookings for super admin view
        ...(user?.userType === 'super_admin' ? [
          {
            id: '4',
            customerName: 'Daniel Kim',
            customerEmail: 'daniel.k@email.com',
            customerPhone: '+1 555-0204',
            customerImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
            eventName: 'Techno Underground',
            clubName: 'Electric Nights',
            bookingType: 'event-table',
            tableNumber: 'VIP-2',
            tableCapacity: 8,
            quantity: 1,
            totalAmount: 800,
            bookingDate: '2025-01-19',
            eventDate: '2025-01-30',
            status: 'confirmed',
            paymentStatus: 'paid'
          },
          {
            id: '5',
            customerName: 'Maria Garcia',
            customerEmail: 'maria.g@email.com',
            customerPhone: '+1 555-0205',
            eventName: 'Latin Night',
            clubName: 'Neon Dreams',
            bookingType: 'event-ticket',
            ticketType: 'Premium',
            quantity: 3,
            totalAmount: 180,
            bookingDate: '2025-01-17',
            eventDate: '2025-01-26',
            status: 'checked_in',
            paymentStatus: 'paid'
          }
        ] : [])
      ];

      // Add general table bookings (non-event)
      const generalTableBookings: Booking[] = [
        {
          id: 'gt1',
          customerName: 'Emma Thompson',
          customerEmail: 'emma.t@email.com',
          customerPhone: '+1 555-0301',
          customerImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'General Dining',
          clubName: 'Club Paradise',
          bookingType: 'general-table',
          tableNumber: 'T-12',
          tableCapacity: 4,
          quantity: 1,
          totalAmount: 200,
          bookingDate: '2025-01-22',
          eventDate: '2025-01-26',
          status: 'confirmed',
          paymentStatus: 'paid',
          specialRequests: 'Birthday celebration, need cake service'
        },
        {
          id: 'gt2',
          customerName: 'Robert Chen',
          customerEmail: 'robert.c@email.com',
          customerPhone: '+1 555-0302',
          eventName: 'Weekend Dining',
          clubName: 'Club Paradise',
          bookingType: 'general-table',
          tableNumber: 'VIP-8',
          tableCapacity: 6,
          quantity: 1,
          totalAmount: 350,
          bookingDate: '2025-01-20',
          eventDate: '2025-01-25',
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 'gt3',
          customerName: 'Sophie Williams',
          customerEmail: 'sophie.w@email.com',
          customerPhone: '+1 555-0303',
          customerImage: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Business Meeting',
          clubName: 'Electric Nights',
          bookingType: 'general-table',
          tableNumber: 'B-5',
          tableCapacity: 8,
          quantity: 1,
          totalAmount: 400,
          bookingDate: '2025-01-18',
          eventDate: '2025-01-28',
          status: 'pending',
          paymentStatus: 'pending',
          specialRequests: 'Quiet area for business discussion'
        }
      ];

      setBookings([...eventBookings, ...generalTableBookings]);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'checked_in') => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.userType === 'super_admin' && booking.clubName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClub = clubFilter === 'all' || booking.clubName === clubFilter;
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.eventDate === dateFilter;
    
    // Filter by active tab
    const matchesTab = activeTab === 'event-tickets' 
      ? booking.bookingType === 'event-ticket' || booking.bookingType === 'event-table'
      : booking.bookingType === 'general-table';
    
    return matchesSearch && matchesClub && matchesStatus && matchesDate && matchesTab;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      case 'checked_in': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'refunded': return 'badge-danger';
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
          <h2 className="card-title">Bookings Management</h2>
          <p className="card-subtitle">
            Manage event tickets and table reservations
          </p>
        </div>

        {/* Tabs */}
        <div className="modal-tabs" style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('event-tickets')}
            className={`modal-tab-button ${activeTab === 'event-tickets' ? 'active' : ''}`}
          >
            <Calendar size={16} />
            Event Bookings ({bookings.filter(b => b.bookingType === 'event-ticket' || b.bookingType === 'event-table').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table-bookings')}
            className={`modal-tab-button ${activeTab === 'table-bookings' ? 'active' : ''}`}
          >
            <MapPin size={16} />
            Table Reservations ({bookings.filter(b => b.bookingType === 'general-table').length})
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
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          {user?.userType === 'super_admin' && (
            <select
              className="filter-select"
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
            >
              <option value="all">All Clubs</option>
              <option value="Club Paradise">Club Paradise</option>
              <option value="Electric Nights">Electric Nights</option>
              <option value="Neon Dreams">Neon Dreams</option>
            </select>
          )}
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="checked_in">Checked In</option>
          </select>
          
          <input
            type="date"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>{activeTab === 'event-tickets' ? 'Event' : 'Reservation'}</th>
                {user?.userType === 'super_admin' && <th>Club</th>}
                <th>Booking Details</th>
                <th>Amount</th>
                <th>{activeTab === 'event-tickets' ? 'Event Date' : 'Reservation Date'}</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={booking.customerName.split(' ')[0]}
                        lastName={booking.customerName.split(' ')[1] || ''}
                        imageUrl={booking.customerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {booking.customerName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {booking.customerEmail}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {booking.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {activeTab === 'event-tickets' ? booking.eventName : 
                     booking.bookingType === 'general-table' ? 'Table Reservation' : booking.eventName}
                  </td>
                  {user?.userType === 'super_admin' && <td>{booking.clubName}</td>}
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {booking.bookingType === 'event-ticket' ? booking.ticketType : `Table ${booking.tableNumber}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {booking.bookingType === 'event-ticket' 
                          ? `${booking.quantity} tickets`
                          : `Capacity: ${booking.tableCapacity} people`
                        }
                      </div>
                      {booking.specialRequests && (
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {booking.specialRequests}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: '#1e293b' }}>
                    ${booking.totalAmount}
                  </td>
                  <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <select
                        value={booking.status} /* Keep as is */
                        onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="checked_in">Checked In</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Bookings Found</div>
            <div className="empty-state-description">
              {searchTerm || clubFilter !== 'all' || statusFilter !== 'all' || dateFilter
                ? 'Try adjusting your search or filter criteria'
                : activeTab === 'event-tickets' 
                  ? 'No event bookings available yet'
                  : 'No table reservations available yet'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsManager;